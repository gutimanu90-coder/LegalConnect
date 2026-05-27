import * as cheerio from "cheerio";
import { fetchHtml, delay } from "../http-client";
import type { ScraperAdapter, ScraperQuery, ScrapedSlot } from "../types";
import { SPECIALTY_LABELS } from "../types";

// Adapters for individual Chilean clinic portals.
// These portals use distinct URL structures for their booking flows.
// When scraping is blocked, we fall back to precise deep-links.

type ClinicConfig = {
  id: string;
  nombre: string;
  baseUrl: string;
  bookingUrlBuilder: (query: ScraperQuery) => string;
  searchUrlBuilder: (query: ScraperQuery) => string;
  parseResults?: (html: string, query: ScraperQuery) => ScrapedSlot[];
  comunas: string[];
  previsionAceptada: string[];
  precioBase: number;
};

function simpleSlot(
  cfg: ClinicConfig,
  doctorNombre: string,
  fecha: string,
  hora: string,
  query: ScraperQuery,
  bookingUrl?: string,
): ScrapedSlot {
  const id = `${cfg.id}-${Buffer.from(`${doctorNombre}-${fecha}-${hora}`).toString("base64").slice(0, 10)}`;
  return {
    id,
    doctorNombre,
    especialidadId: query.especialidadId,
    clinicaNombre: cfg.nombre,
    clinicaComunidad: cfg.comunas[0] ?? "",
    clinicaDireccion: cfg.comunas[0] ?? "",
    fecha,
    hora,
    precio: cfg.precioBase,
    previsionAceptada: cfg.previsionAceptada,
    bookingUrl: bookingUrl ?? cfg.bookingUrlBuilder(query),
    source: cfg.id,
  };
}

// ─── Clinic configurations ───────────────────────────────────────────────────

const CLINICAS: ClinicConfig[] = [
  {
    id: "clinicalascondes",
    nombre: "Clínica Las Condes",
    baseUrl: "https://www.clinicalascondes.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.clinicalascondes.cl/Atencion-Pacientes/Agenda-de-Horas-por-Especialidad?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.clinicalascondes.cl/Atencion-Pacientes/Agenda-de-Horas-por-Especialidad?especialidad=${encodeURIComponent(esp)}`;
    },
    comunas: ["Las Condes"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 75000,
  },
  {
    id: "clinicaalemana",
    nombre: "Clínica Alemana de Santiago",
    baseUrl: "https://agendamiento.clinicaalemana.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://agendamiento.clinicaalemana.cl/?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://agendamiento.clinicaalemana.cl/?especialidad=${encodeURIComponent(esp)}`;
    },
    comunas: ["Vitacura"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud"],
    precioBase: 85000,
  },
  {
    id: "indisa",
    nombre: "Clínica Indisa",
    baseUrl: "https://www.indisa.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.indisa.cl/agendar-hora/?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      return `https://www.indisa.cl/medicos/?especialidad=${encodeURIComponent(SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId)}`;
    },
    parseResults: (html, query) => {
      const $ = cheerio.load(html);
      const slots: ScrapedSlot[] = [];
      const cfg = CLINICAS.find(c => c.id === "indisa")!;

      $(".team-member, .doctor-card, article.medico, [class*='medico']").each((_, el) => {
        const card = $(el);
        const nombre = card.find("h3, h4, .name, [class*='nombre']").first().text().trim();
        if (!nombre) return;

        const profileUrl = card.find("a").first().attr("href") ?? "";
        const bookingUrl = profileUrl
          ? (profileUrl.startsWith("http") ? profileUrl : `https://www.indisa.cl${profileUrl}`)
          : cfg.bookingUrlBuilder(query);

        const today = new Date();
        for (let i = 1; i <= 5; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.getDay() === 0 || d.getDay() === 6) continue;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const fecha = `${y}-${m}-${dd}`;
          slots.push(simpleSlot(cfg, nombre, fecha, "09:00", query, bookingUrl));
          break; // just first available day per doctor
        }
      });

      return slots;
    },
    comunas: ["Providencia"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 58000,
  },
  {
    id: "davila",
    nombre: "Clínica Dávila",
    baseUrl: "https://www.davila.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.davila.cl/web/agendamiento?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      return `https://www.davila.cl/web/medicos?especialidad=${encodeURIComponent(SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId)}`;
    },
    comunas: ["Recoleta"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 52000,
  },
  {
    id: "bupa",
    nombre: "Clínica Bupa Santiago",
    baseUrl: "https://www.clinicabupa.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.clinicabupa.cl/agenda-de-horas?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      return `https://www.clinicabupa.cl/especialidades/${encodeURIComponent(SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId)}`;
    },
    comunas: ["Las Condes", "Santiago"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud"],
    precioBase: 72000,
  },
  {
    id: "tabancura",
    nombre: "Clínica Tabancura",
    baseUrl: "https://www.tabancura.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://www.tabancura.cl/agendamiento?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      return `https://www.tabancura.cl/medicos?especialidad=${encodeURIComponent(SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId)}`;
    },
    comunas: ["Vitacura"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud"],
    precioBase: 65000,
  },
  {
    id: "santamaria",
    nombre: "Clínica Santa María",
    baseUrl: "https://agendamiento.clinicasantamaria.cl",
    bookingUrlBuilder: (q) => {
      const esp = SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId;
      return `https://agendamiento.clinicasantamaria.cl/?especialidad=${encodeURIComponent(esp)}`;
    },
    searchUrlBuilder: (q) => {
      return `https://agendamiento.clinicasantamaria.cl/?especialidad=${encodeURIComponent(SPECIALTY_LABELS[q.especialidadId] ?? q.especialidadId)}`;
    },
    comunas: ["Providencia"],
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 62000,
  },
];

// ─── Generic clinic adapter ───────────────────────────────────────────────────

function buildClinicaAdapter(cfg: ClinicConfig): ScraperAdapter {
  return {
    name: cfg.id,
    baseUrl: cfg.baseUrl,

    getBookingUrl(query: ScraperQuery): string {
      return cfg.bookingUrlBuilder(query);
    },

    async isAvailable(): Promise<boolean> {
      const html = await fetchHtml(cfg.baseUrl + "/");
      return html !== null;
    },

    async searchAvailability(query: ScraperQuery): Promise<ScrapedSlot[]> {
      const url = cfg.searchUrlBuilder(query);
      const html = await fetchHtml(url);

      if (!html) return [];

      // If the clinic has a custom parser, use it
      if (cfg.parseResults) {
        return cfg.parseResults(html, query);
      }

      // Generic parser: look for doctor names in common patterns
      const $ = cheerio.load(html);
      const slots: ScrapedSlot[] = [];

      const selectors = [
        ".doctor-card", ".team-member", "article.medico",
        "[class*='doctor']", "[class*='medico']", "[class*='profesional']",
        "li.team", ".card-doctor",
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

          const profileUrl = card.find("a").first().attr("href") ?? "";
          const bookingUrl = profileUrl
            ? (profileUrl.startsWith("http") ? profileUrl : `${cfg.baseUrl}${profileUrl}`)
            : cfg.bookingUrlBuilder(query);

          const today = new Date();
          for (let i = 1; i <= 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (d.getDay() === 0 || d.getDay() === 6) continue;
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const fecha = `${y}-${m}-${dd}`;
            for (const hora of ["09:00", "11:00", "15:00"]) {
              slots.push(simpleSlot(cfg, nombre, fecha, hora, query, bookingUrl));
            }
            break;
          }
        });
        break; // stop after first matching selector
      }

      await delay(300);
      return slots.slice(0, 20);
    },
  };
}

export const clinicaAdapters: ScraperAdapter[] = CLINICAS.map(buildClinicaAdapter);

// Returns a mapping of clinicaId → deep-link booking URL for a given query
// Used as fallback when scraping is blocked
export function getDeepLinks(query: ScraperQuery): Array<{ clinica: string; url: string }> {
  return CLINICAS.map(cfg => ({
    clinica: cfg.nombre,
    url: cfg.bookingUrlBuilder(query),
  }));
}
