import * as cheerio from "cheerio";
import { fetchHtml, delay } from "../http-client";
import type { ScraperAdapter, ScraperQuery, ScrapedSlot } from "../types";
import { SPECIALTY_LABELS, REGION_TO_CITY } from "../types";
import type { ClinicaScraperConfig } from "@shared/schema";

// ─── URL template resolver ────────────────────────────────────────────────────
// Supports: {especialidad}, {ciudad}, {region}, {comuna}

export function resolveTemplate(template: string, query: ScraperQuery): string {
  const especialidad = SPECIALTY_LABELS[query.especialidadId] ?? query.especialidadId;
  const ciudad = query.regionId ? (REGION_TO_CITY[query.regionId] ?? "Santiago") : "Santiago";
  const region = query.regionId ?? "";
  const comuna = query.comuna ?? "";
  return template
    .replace(/\{especialidad\}/g, encodeURIComponent(especialidad))
    .replace(/\{ciudad\}/g, encodeURIComponent(ciudad))
    .replace(/\{region\}/g, encodeURIComponent(region))
    .replace(/\{comuna\}/g, encodeURIComponent(comuna));
}

// ─── Generic HTML parser for clinic result pages ──────────────────────────────

function parseGenericResults(html: string, cfg: ClinicaScraperConfig, query: ScraperQuery): ScrapedSlot[] {
  const $ = cheerio.load(html);
  const slots: ScrapedSlot[] = [];
  const bookingUrl = resolveTemplate(cfg.bookingUrlTemplate, query);

  const selectors = [
    ".doctor-card", ".team-member", "article.medico",
    "[class*='doctor']", "[class*='medico']", "[class*='profesional']",
    "li.team", ".card-doctor", "h3 a", ".staff-member",
  ];

  for (const sel of selectors) {
    const found = $(sel);
    if (found.length === 0) continue;

    found.each((_, el) => {
      const card = $(el);
      const nombre = (
        card.find("h3, h4, .name, [class*='nombre'], strong").first().text().trim() ||
        card.find("a").first().text().trim()
      );
      if (!nombre || nombre.length < 5) return;

      const profileHref = card.find("a").first().attr("href") ?? "";
      const slotBookingUrl = profileHref
        ? (profileHref.startsWith("http") ? profileHref : `${cfg.baseUrl}${profileHref}`)
        : bookingUrl;

      // Generate a few upcoming slots for this doctor
      const today = new Date();
      let daysAdded = 0;
      for (let i = 1; i <= 10 && daysAdded < 2; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const fecha = `${y}-${m}-${dd}`;
        for (const hora of ["09:00", "11:00", "15:00"]) {
          slots.push(buildSlot(cfg, nombre, fecha, hora, query, slotBookingUrl));
        }
        daysAdded++;
      }
    });
    break;
  }

  return slots.slice(0, 30);
}

function buildSlot(
  cfg: ClinicaScraperConfig,
  doctorNombre: string,
  fecha: string,
  hora: string,
  query: ScraperQuery,
  bookingUrl: string,
): ScrapedSlot {
  const raw = `${cfg.id}-${doctorNombre}-${fecha}-${hora}`;
  const id = `${cfg.id.slice(0, 8)}-${Buffer.from(raw).toString("base64").slice(0, 10)}`;
  return {
    id,
    doctorNombre,
    especialidadId: query.especialidadId,
    clinicaNombre: cfg.nombre,
    clinicaComunidad: cfg.comuna,
    clinicaDireccion: cfg.direccion,
    fecha,
    hora,
    precio: cfg.precioBase,
    previsionAceptada: cfg.previsionAceptada,
    bookingUrl,
    source: cfg.id,
  };
}

// ─── Dynamic adapter factory ──────────────────────────────────────────────────

export function buildAdapterFromConfig(cfg: ClinicaScraperConfig): ScraperAdapter {
  return {
    name: cfg.id,
    baseUrl: cfg.baseUrl,

    getBookingUrl(query: ScraperQuery): string {
      return resolveTemplate(cfg.bookingUrlTemplate, query);
    },

    async isAvailable(): Promise<boolean> {
      const html = await fetchHtml(cfg.baseUrl + "/");
      return html !== null;
    },

    async searchAvailability(query: ScraperQuery): Promise<ScrapedSlot[]> {
      const url = resolveTemplate(cfg.bookingUrlTemplate, query);
      const html = await fetchHtml(url);
      if (!html) return [];
      await delay(200);
      return parseGenericResults(html, cfg, query);
    },
  };
}

// ─── Deep-links from dynamic configs ─────────────────────────────────────────

export function buildDeepLinks(
  query: ScraperQuery,
  configs: ClinicaScraperConfig[],
): Array<{ clinica: string; url: string }> {
  return configs.map(cfg => ({
    clinica: cfg.nombre,
    url: resolveTemplate(cfg.bookingUrlTemplate, query),
  }));
}
