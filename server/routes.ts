import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { busquedaHoraSchema, reservaHoraSchema } from "@shared/schema";
import { REGIONES, COMUNAS_POR_REGION, ESPECIALIDADES } from "@shared/chile-data";

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

      const slots = await storage.searchSlots(parsed.data);
      res.json(slots);
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

  const httpServer = createServer(app);
  return httpServer;
}
