export interface ScrapedSlot {
  id: string;
  doctorNombre: string;
  especialidadId: string;
  clinicaNombre: string;
  clinicaComunidad: string;
  clinicaDireccion: string;
  fecha: string;       // YYYY-MM-DD
  hora: string;        // HH:MM
  precio: number | null;
  previsionAceptada: string[];
  bookingUrl: string;  // direct URL to complete booking on clinic's site
  source: string;      // adapter name
}

export interface ScraperQuery {
  especialidadId: string;
  regionId?: string;
  comuna?: string;
  desde?: string;
  hasta?: string;
}

export interface ScraperAdapter {
  readonly name: string;
  readonly baseUrl: string;
  searchAvailability(query: ScraperQuery): Promise<ScrapedSlot[]>;
  getBookingUrl(query: ScraperQuery): string;
  isAvailable(): Promise<boolean>;
}

export type ScraperStatus = "ok" | "blocked" | "error" | "unconfigured";

export interface AdapterResult {
  adapter: string;
  status: ScraperStatus;
  slots: ScrapedSlot[];
  error?: string;
}

// Maps our internal specialty IDs to common search terms used by Chilean sites
export const SPECIALTY_LABELS: Record<string, string> = {
  "traumatologia": "traumatólogo",
  "medicina-general": "médico general",
  "pediatria": "pediatra",
  "ginecologia": "ginecólogo",
  "cardiologia": "cardiólogo",
  "dermatologia": "dermatólogo",
  "neurologia": "neurólogo",
  "oftalmologia": "oftalmólogo",
  "otorrino": "otorrinolaringólogo",
  "urologia": "urólogo",
  "psiquiatria": "psiquiatra",
  "endocrinologia": "endocrinólogo",
  "gastroenterologia": "gastroenterólogo",
  "neumologia": "neumólogo",
  "reumatologia": "reumatólogo",
  "oncologia": "oncólogo",
  "cirugia-general": "cirujano general",
  "fisiatria": "fisiatra",
  "nutricion": "nutricionista",
  "psicologia": "psicólogo",
};

// Maps our region IDs to city names used by search sites
export const REGION_TO_CITY: Record<string, string> = {
  "RM": "Santiago",
  "V": "Valparaíso",
  "VIII": "Concepción",
  "IX": "Temuco",
  "X": "Puerto Montt",
  "VII": "Talca",
  "VI": "Rancagua",
  "II": "Antofagasta",
  "I": "Iquique",
  "IV": "La Serena",
  "III": "Copiapó",
  "XIV": "Valdivia",
  "XVI": "Chillán",
  "XII": "Punta Arenas",
  "XI": "Coyhaique",
  "XV": "Arica",
};
