import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { busquedaHoraSchema, reservaHoraSchema, insertClinicaScraperConfigSchema } from "@shared/schema";
import { REGIONES, COMUNAS_POR_REGION, ESPECIALIDADES } from "@shared/chile-data";
import { searchWithScrapers, checkAdapterAvailability, type ScrapedSlot } from "./scrapers/index";
import { buildDeepLinks } from "./scrapers/adapters/clinicas-directas";
import { fetchHtml } from "./scrapers/http-client";

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Reference data ─────────────────────────────────────────────────────────

  app.get("/api/medico/especialidades", (_req, res) => res.json(ESPECIALIDADES));
  app.get("/api/medico/regiones", (_req, res) => res.json(REGIONES));

  app.get("/api/medico/comunas/:regionId", (req, res) => {
    const comunas = COMUNAS_POR_REGION[req.params.regionId];
    if (!comunas) return res.status(404).json({ message: "Región no encontrada" });
    res.json(comunas);
  });

  app.get("/api/medico/clinicas", async (_req, res) => {
    try { res.json(await storage.getClinics()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ── Appointment search ─────────────────────────────────────────────────────

  app.get("/api/medico/buscar", async (req, res) => {
    try {
      const parsed = busquedaHoraSchema.safeParse({
        especialidadId: req.query.especialidadId,
        regionId: req.query.regionId || undefined,
        comuna: req.query.comuna || undefined,
        desde: req.query.desde || undefined,
        hasta: req.query.hasta || undefined,
      });
      if (!parsed.success) return res.status(400).json({ message: "Parámetros inválidos", errors: parsed.error.flatten() });

      const query = parsed.data;
      const configs = await storage.getScraperConfigs();

      const [mockSlots, scraperResult] = await Promise.all([
        storage.searchSlots(query),
        searchWithScrapers(query, configs).catch(() => ({ slots: [], adapterResults: [], deepLinks: [], isLive: false })),
      ]);

      const liveSlots = scraperResult.slots.map(convertScrapedSlot);
      const allSlots = deduplicateSlots([...liveSlots, ...mockSlots]);

      res.json({
        slots: allSlots,
        deepLinks: scraperResult.deepLinks,
        isLive: scraperResult.isLive,
        sources: scraperResult.adapterResults.map(r => ({
          adapter: r.adapter, status: r.status, count: r.slots.length, error: r.error,
        })),
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/medico/reservar", async (req, res) => {
    try {
      const parsed = reservaHoraSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
      const reserva = await storage.createReserva(parsed.data);
      res.status(201).json(reserva);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/medico/reserva/:id", async (req, res) => {
    try {
      const reserva = await storage.getReserva(req.params.id);
      if (!reserva) return res.status(404).json({ message: "Reserva no encontrada" });
      res.json(reserva);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/medico/deep-links", async (req, res) => {
    const { especialidadId, regionId, comuna } = req.query as Record<string, string>;
    if (!especialidadId) return res.status(400).json({ message: "especialidadId requerido" });
    const configs = await storage.getScraperConfigs();
    const links = buildDeepLinks({ especialidadId, regionId, comuna }, configs.filter(c => c.habilitada));
    res.json(links);
  });

  app.get("/api/medico/scrapers/status", async (_req, res) => {
    try {
      const configs = await storage.getScraperConfigs();
      const availability = await checkAdapterAvailability(configs);
      res.json({
        proxyConfigured: !!process.env.SCRAPER_PROXY_URL,
        adapters: availability,
        note: process.env.SCRAPER_PROXY_URL
          ? "Proxy activo — scraping en vivo habilitado"
          : "Sin proxy — configura SCRAPER_PROXY_URL para habilitar scraping desde IPs residenciales.",
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // ── Admin: scraper configurations ──────────────────────────────────────────

  app.get("/api/admin/clinicas-scraper", async (_req, res) => {
    try { res.json(await storage.getScraperConfigs()); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/admin/clinicas-scraper", async (req, res) => {
    try {
      const parsed = insertClinicaScraperConfigSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
      const cfg = await storage.createScraperConfig(parsed.data);
      res.status(201).json(cfg);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/admin/clinicas-scraper/:id", async (req, res) => {
    try {
      const cfg = await storage.getScraperConfig(req.params.id);
      if (!cfg) return res.status(404).json({ message: "Configuración no encontrada" });
      res.json(cfg);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.put("/api/admin/clinicas-scraper/:id", async (req, res) => {
    try {
      const parsed = insertClinicaScraperConfigSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
      const updated = await storage.updateScraperConfig(req.params.id, parsed.data);
      if (!updated) return res.status(404).json({ message: "Configuración no encontrada" });
      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch("/api/admin/clinicas-scraper/:id", async (req, res) => {
    try {
      const updated = await storage.updateScraperConfig(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Configuración no encontrada" });
      res.json(updated);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/admin/clinicas-scraper/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScraperConfig(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Configuración no encontrada" });
      res.status(204).send();
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Test reachability of a clinic's baseUrl
  app.get("/api/admin/clinicas-scraper/:id/test", async (req, res) => {
    try {
      const cfg = await storage.getScraperConfig(req.params.id);
      if (!cfg) return res.status(404).json({ message: "Configuración no encontrada" });
      const html = await fetchHtml(cfg.baseUrl + "/").catch(() => null);
      res.json({ reachable: html !== null, url: cfg.baseUrl });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
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
    fecha: s.fecha, hora: s.hora,
    precio: s.precio, tipoPrecio: "Particular",
    bookingUrl: s.bookingUrl, source: s.source, isLive: true,
    doctor: {
      id: `scraped-${s.source}`, nombre: s.doctorNombre,
      especialidadId: s.especialidadId, clinicaId: `scraped-${s.source}`,
      diasTrabajo: [], horasTrabajo: [],
      precioParticular: s.precio ?? 0, precioFonasa: 0,
    },
    clinica: {
      id: `scraped-${s.source}`, nombre: s.clinicaNombre,
      regionId: "RM", comuna: s.clinicaComunidad,
      direccion: s.clinicaDireccion, telefono: "",
      url: s.bookingUrl, previsionAceptada: s.previsionAceptada,
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
