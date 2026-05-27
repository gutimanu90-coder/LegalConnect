import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { busquedaHoraSchema, reservaHoraSchema } from "@shared/schema";
import { REGIONES, COMUNAS_POR_REGION, ESPECIALIDADES } from "@shared/chile-data";
import { searchWithScrapers, checkAdapterAvailability, getDeepLinks, type ScrapedSlot } from "./scrapers/index";

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Medical appointment search ─────────────────────────────────────────────

  app.get("/api/medico/especialidades", (_req, res) => {
    res.json(ESPECIALIDADES);
  });

  app.get("/api/medico/regiones", (_req, res) => {
    res.json(REGIONES);
  });

  app.get("/api/medico/comunas/:regionId", (req, res) => {
    const comunas = COMUNAS_POR_REGION[req.params.regionId];
    if (!comunas) return res.status(404).json({ message: "Región no encontrada" });
    res.json(comunas);
  });

  app.get("/api/medico/clinicas", async (_req, res) => {
    try {
      const clinicas = await storage.getClinics();
      res.json(clinicas);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Main appointment search — combines mock data + real scrapers
  app.get("/api/medico/buscar", async (req, res) => {
    try {
      const parsed = busquedaHoraSchema.safeParse({
        especialidadId: req.query.especialidadId,
        regionId: req.query.regionId || undefined,
        comuna: req.query.comuna || undefined,
        desde: req.query.desde || undefined,
        hasta: req.query.hasta || undefined,
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "Parámetros inválidos", errors: parsed.error.flatten() });
      }

      const query = parsed.data;

      // Run mock data and live scrapers in parallel
      const [mockSlots, scraperResult] = await Promise.all([
        storage.searchSlots(query),
        searchWithScrapers(query).catch(() => ({ slots: [], adapterResults: [], deepLinks: [], isLive: false })),
      ]);

      // Convert scraped slots to a unified format
      const liveSlots = scraperResult.slots.map(convertScrapedSlot);

      // Merge: live slots first (they have real availability), then mock
      const allSlots = deduplicateSlots([...liveSlots, ...mockSlots]);

      res.json({
        slots: allSlots,
        deepLinks: scraperResult.deepLinks,
        isLive: scraperResult.isLive,
        sources: scraperResult.adapterResults.map(r => ({
          adapter: r.adapter,
          status: r.status,
          count: r.slots.length,
          error: r.error,
        })),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/medico/reservar", async (req, res) => {
    try {
      const parsed = reservaHoraSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
      }
      const reserva = await storage.createReserva(parsed.data);
      res.status(201).json(reserva);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/medico/reserva/:id", async (req, res) => {
    try {
      const reserva = await storage.getReserva(req.params.id);
      if (!reserva) return res.status(404).json({ message: "Reserva no encontrada" });
      res.json(reserva);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // Deep-links only (fast, no scraping) — useful for the UI when scraping is blocked
  app.get("/api/medico/deep-links", (req, res) => {
    const { especialidadId, regionId, comuna } = req.query as Record<string, string>;
    if (!especialidadId) return res.status(400).json({ message: "especialidadId requerido" });
    const links = getDeepLinks({ especialidadId, regionId, comuna });
    res.json(links);
  });

  // Health check: which scrapers are reachable right now
  app.get("/api/medico/scrapers/status", async (_req, res) => {
    try {
      const availability = await checkAdapterAvailability();
      const proxyConfigured = !!process.env.SCRAPER_PROXY_URL;
      res.json({
        proxyConfigured,
        adapters: availability,
        note: proxyConfigured
          ? "Proxy activo — scraping en vivo habilitado"
          : "Sin proxy — scrapers activos solo desde IPs residenciales. Configura SCRAPER_PROXY_URL para habilitar.",
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function convertScrapedSlot(s: ScrapedSlot): any {
  return {
    id: s.id,
    doctorId: `scraped-${s.source}`,
    clinicaId: `scraped-${s.source}`,
    fecha: s.fecha,
    hora: s.hora,
    precio: s.precio,
    tipoPrecio: "Particular",
    bookingUrl: s.bookingUrl,
    source: s.source,
    isLive: true,
    doctor: {
      id: `scraped-${s.source}`,
      nombre: s.doctorNombre,
      especialidadId: s.especialidadId,
      clinicaId: `scraped-${s.source}`,
      diasTrabajo: [],
      horasTrabajo: [],
      precioParticular: s.precio ?? 0,
      precioFonasa: 0,
    },
    clinica: {
      id: `scraped-${s.source}`,
      nombre: s.clinicaNombre,
      regionId: "RM",
      comuna: s.clinicaComunidad,
      direccion: s.clinicaDireccion,
      telefono: "",
      url: s.bookingUrl,
      previsionAceptada: s.previsionAceptada,
      precioBase: s.precio ?? 0,
    },
  };
}

function deduplicateSlots(slots: any[]): any[] {
  const seen = new Set<string>();
  return slots.filter(s => {
    const key = `${s.doctor.nombre}-${s.fecha}-${s.hora}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
