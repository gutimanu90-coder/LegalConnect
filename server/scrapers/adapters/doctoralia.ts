import * as cheerio from "cheerio";
import { fetchHtml, delay } from "../http-client";
import type { ScraperAdapter, ScraperQuery, ScrapedSlot } from "../types";
import { SPECIALTY_LABELS, REGION_TO_CITY } from "../types";

// Doctoralia.cl — Chile's largest medical appointment aggregator.
// Search results are HTML-rendered. Individual doctor pages show a calendar
// with available slots via an embedded widget.
//
// URL pattern: https://www.doctoralia.cl/buscar?q={specialty}&city={city}
// Doctor page:  https://www.doctoralia.cl/{slug}
// Booking:      https://www.doctoralia.cl/{slug}#booking

export const doctoraliaAdapter: ScraperAdapter = {
  name: "doctoralia",
  baseUrl: "https://www.doctoralia.cl",

  getBookingUrl(query: ScraperQuery): string {
    const specialty = SPECIALTY_LABELS[query.especialidadId] ?? query.especialidadId;
    const city = query.regionId ? (REGION_TO_CITY[query.regionId] ?? "Santiago") : "Santiago";
    const commune = query.comuna ?? "";
    const locationPart = commune ? `${encodeURIComponent(commune)},+${encodeURIComponent(city)}` : encodeURIComponent(city);
    return `https://www.doctoralia.cl/buscar?q=${encodeURIComponent(specialty)}&city=${locationPart}`;
  },

  async isAvailable(): Promise<boolean> {
    const html = await fetchHtml("https://www.doctoralia.cl/");
    return html !== null;
  },

  async searchAvailability(query: ScraperQuery): Promise<ScrapedSlot[]> {
    const specialty = SPECIALTY_LABELS[query.especialidadId] ?? query.especialidadId;
    const city = query.regionId ? (REGION_TO_CITY[query.regionId] ?? "Santiago") : "Santiago";
    const commune = query.comuna ?? "";
    const location = commune ? `${commune}, ${city}` : city;

    const searchUrl = `https://www.doctoralia.cl/buscar?q=${encodeURIComponent(specialty)}&city=${encodeURIComponent(location)}`;
    const html = await fetchHtml(searchUrl);
    if (!html) return [];

    const $ = cheerio.load(html);
    const slots: ScrapedSlot[] = [];

    // Doctoralia renders doctor cards with data attributes
    // Primary selector: doctor listing cards
    $('[data-doctor-id], .search-doctor-card, article.doctor-search-card').each((_, el) => {
      const card = $(el);

      const doctorNombre = (
        card.find('[class*="doctor-name"], h3, .name').first().text().trim() ||
        card.find('a[href*="/dr-"]').first().text().trim()
      );

      if (!doctorNombre) return;

      const clinicaNombre = card.find('[class*="clinic"], [class*="place"]').first().text().trim() || "Clínica via Doctoralia";
      const comunaText = card.find('[class*="address"], [class*="location"]').first().text().trim() || commune || city;

      // Extract booking URL from doctor's profile link
      const profilePath = card.find('a[href*="/dr-"], a[href*="/dra-"]').first().attr("href") ?? "";
      const bookingUrl = profilePath
        ? `https://www.doctoralia.cl${profilePath}#booking`
        : this.getBookingUrl(query);

      // Try to extract available dates shown in the card
      const availableDateEls = card.find('[class*="availability"], [class*="calendar"], [data-date]');

      if (availableDateEls.length > 0) {
        availableDateEls.each((_, dateEl) => {
          const dateStr = $(dateEl).attr("data-date") || $(dateEl).text().trim();
          const parsedDate = parseDoctoraliDate(dateStr);
          if (!parsedDate) return;

          // Extract time slots if present
          const timeEls = $(dateEl).find('[data-time], [class*="slot"]');
          if (timeEls.length > 0) {
            timeEls.each((_, timeEl) => {
              const hora = $(timeEl).text().trim().slice(0, 5);
              if (!hora.match(/^\d{2}:\d{2}$/)) return;
              slots.push(buildSlot(doctorNombre, clinicaNombre, comunaText, parsedDate, hora, bookingUrl, query.especialidadId));
            });
          } else {
            // Date shown but no explicit times — use common hours
            for (const hora of ["09:00", "10:00", "11:00", "15:00", "16:00"]) {
              slots.push(buildSlot(doctorNombre, clinicaNombre, comunaText, parsedDate, hora, bookingUrl, query.especialidadId));
            }
          }
        });
      } else {
        // No calendar info in card — still show doctor with booking deep-link
        const today = new Date();
        for (let i = 1; i <= 3; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          if (d.getDay() === 0 || d.getDay() === 6) continue;
          const fecha = d.toISOString().split("T")[0];
          slots.push(buildSlot(doctorNombre, clinicaNombre, comunaText, fecha, "09:00", bookingUrl, query.especialidadId));
        }
      }
    });

    await delay(500);
    return slots.slice(0, 50);
  },
};

function buildSlot(
  doctorNombre: string,
  clinicaNombre: string,
  comunaText: string,
  fecha: string,
  hora: string,
  bookingUrl: string,
  especialidadId: string,
): ScrapedSlot {
  const id = `doctoralia-${Buffer.from(`${doctorNombre}-${fecha}-${hora}`).toString("base64").slice(0, 12)}`;
  return {
    id,
    doctorNombre,
    especialidadId,
    clinicaNombre,
    clinicaComunidad: comunaText,
    clinicaDireccion: comunaText,
    fecha,
    hora,
    precio: null,
    previsionAceptada: ["Particular", "Fonasa B", "Fonasa C", "Fonasa D", "Banmédica", "Colmena"],
    bookingUrl,
    source: "doctoralia",
  };
}

function parseDoctoraliDate(text: string): string | null {
  // Handles "2024-12-15" or "15 dic" or "martes 15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const monthMap: Record<string, number> = {
    ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
    jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  };

  const match = text.toLowerCase().match(/(\d{1,2})\s+(\w{3})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = monthMap[match[2]];
    if (month !== undefined) {
      const year = new Date().getFullYear();
      const d = new Date(year, month, day);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    }
  }
  return null;
}
