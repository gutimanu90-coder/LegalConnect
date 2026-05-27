import {
  type Template,
  type InsertTemplate,
  type Order,
  type InsertOrder,
  type Clinica,
  type Doctor,
  type SlotDisponible,
  type SlotConDetalles,
  type ReservaHora,
  type InsertReservaHora,
  type BusquedaHoraQuery,
} from "@shared/schema";
import { randomUUID } from "crypto";

// ─── Deterministic slot availability ─────────────────────────────────────────
function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function isSlotAvailable(doctorId: string, fecha: string, hora: string): boolean {
  return simpleHash(`${doctorId}-${fecha}-${hora}`) % 10 > 2;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const CLINICAS: Clinica[] = [
  {
    id: "clc",
    nombre: "Clínica Las Condes",
    regionId: "RM",
    comuna: "Las Condes",
    direccion: "Lo Fontecilla 441, Las Condes",
    telefono: "+56 2 2210 4000",
    url: "https://www.clinicalascondes.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "New Capital Salud", "Vida Tres", "MasVida", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 70000,
  },
  {
    id: "cal",
    nombre: "Clínica Alemana de Santiago",
    regionId: "RM",
    comuna: "Vitacura",
    direccion: "Av. Vitacura 5951, Vitacura",
    telefono: "+56 2 2210 1111",
    url: "https://www.clinicaalemana.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "New Capital Salud"],
    precioBase: 75000,
  },
  {
    id: "csm",
    nombre: "Clínica Santa María",
    regionId: "RM",
    comuna: "Providencia",
    direccion: "Av. Santa María 0500, Providencia",
    telefono: "+56 2 2913 0000",
    url: "https://www.clinicasantamaria.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 60000,
  },
  {
    id: "ucchristus",
    nombre: "Hospital Clínico UC-Christus",
    regionId: "RM",
    comuna: "Santiago",
    direccion: "Diagonal Paraguay 362, Santiago",
    telefono: "+56 2 2354 3000",
    url: "https://www.hospitalsantiagouc.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa A", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 65000,
  },
  {
    id: "bupa",
    nombre: "Clínica Bupa Santiago",
    regionId: "RM",
    comuna: "Santiago",
    direccion: "Av. Apoquindo 3990, Las Condes",
    telefono: "+56 2 2576 2000",
    url: "https://www.clinicabupa.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "New Capital Salud", "Vida Tres"],
    precioBase: 72000,
  },
  {
    id: "indisa",
    nombre: "Clínica Indisa",
    regionId: "RM",
    comuna: "Providencia",
    direccion: "Av. Santa María 1810, Providencia",
    telefono: "+56 2 2362 5555",
    url: "https://www.indisa.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 55000,
  },
  {
    id: "tab",
    nombre: "Clínica Tabancura",
    regionId: "RM",
    comuna: "Vitacura",
    direccion: "Av. Tabancura 1515, Vitacura",
    telefono: "+56 2 2216 3000",
    url: "https://www.tabancura.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud"],
    precioBase: 65000,
  },
  {
    id: "davila",
    nombre: "Clínica Dávila",
    regionId: "RM",
    comuna: "Recoleta",
    direccion: "Av. Recoleta 464, Recoleta",
    telefono: "+56 2 2730 8000",
    url: "https://www.davila.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 52000,
  },
  {
    id: "losandes",
    nombre: "Clínica Los Andes",
    regionId: "RM",
    comuna: "La Florida",
    direccion: "Av. Departamental 1990, La Florida",
    telefono: "+56 2 2286 5000",
    url: "https://www.clinicalosandes.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 48000,
  },
  {
    id: "redsaludvit",
    nombre: "RedSalud Vitacura",
    regionId: "RM",
    comuna: "Vitacura",
    direccion: "Av. Nueva Costanera 3669, Vitacura",
    telefono: "+56 2 2957 7500",
    url: "https://www.redsalud.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "New Capital Salud"],
    precioBase: 55000,
  },
  {
    id: "bicentenario",
    nombre: "Clínica Bicentenario",
    regionId: "RM",
    comuna: "Huechuraba",
    direccion: "Av. Bicentenario 3990, Huechuraba",
    telefono: "+56 2 2580 6000",
    url: "https://www.clinicabicentenario.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 50000,
  },
  {
    id: "ciudadmar",
    nombre: "Clínica Ciudad del Mar",
    regionId: "V",
    comuna: "Viña del Mar",
    direccion: "Av. Jorge Montt 1985, Viña del Mar",
    telefono: "+56 32 270 0000",
    url: "https://www.ciudaddelmar.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 50000,
  },
  {
    id: "renaca",
    nombre: "Clínica Reñaca",
    regionId: "V",
    comuna: "Viña del Mar",
    direccion: "Av. Borgoño 12345, Reñaca",
    telefono: "+56 32 283 0000",
    url: "https://www.clinicarenaca.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud"],
    precioBase: 48000,
  },
  {
    id: "concepcion",
    nombre: "Clínica Universitaria de Concepción",
    regionId: "VIII",
    comuna: "Concepción",
    direccion: "Janequeo 399, Concepción",
    telefono: "+56 41 268 6000",
    url: "https://www.clinicauniversitaria.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "Fonasa A", "Fonasa B", "Fonasa C", "Fonasa D"],
    precioBase: 45000,
  },
  {
    id: "redsaludprov",
    nombre: "RedSalud Providencia",
    regionId: "RM",
    comuna: "Providencia",
    direccion: "Av. Providencia 2205, Providencia",
    telefono: "+56 2 2957 7600",
    url: "https://www.redsalud.cl",
    previsionAceptada: ["Particular", "Banmédica", "Colmena", "Cruz Blanca", "Consalud", "New Capital Salud"],
    precioBase: 53000,
  },
];

const DOCTORS: Doctor[] = [
  // Traumatología
  {
    id: "d-trau-01",
    nombre: "Dr. Alejandro Morales Soto",
    especialidadId: "traumatologia",
    clinicaId: "clc",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"],
    precioParticular: 80000,
    precioFonasa: 32000,
  },
  {
    id: "d-trau-02",
    nombre: "Dra. Carmen López Vidal",
    especialidadId: "traumatologia",
    clinicaId: "cal",
    diasTrabajo: [1, 3, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","11:00","11:30","15:00","15:30","16:00","16:30","17:00"],
    precioParticular: 90000,
    precioFonasa: 35000,
  },
  {
    id: "d-trau-03",
    nombre: "Dr. Rodrigo Fernández Arias",
    especialidadId: "traumatologia",
    clinicaId: "csm",
    diasTrabajo: [2, 4],
    horasTrabajo: ["08:00","08:30","09:00","09:30","10:00","13:00","13:30","14:00","14:30","15:00"],
    precioParticular: 75000,
    precioFonasa: 28000,
  },
  {
    id: "d-trau-04",
    nombre: "Dr. Felipe Gutiérrez Muñoz",
    especialidadId: "traumatologia",
    clinicaId: "indisa",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:00","09:00","10:00","11:00","14:00","15:00","16:00","17:00"],
    precioParticular: 65000,
    precioFonasa: 25000,
  },
  {
    id: "d-trau-05",
    nombre: "Dra. Valentina Torres Contreras",
    especialidadId: "traumatologia",
    clinicaId: "tab",
    diasTrabajo: [1, 3, 5],
    horasTrabajo: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00"],
    precioParticular: 82000,
    precioFonasa: 33000,
  },
  {
    id: "d-trau-06",
    nombre: "Dr. Sebastián Rojas Herrera",
    especialidadId: "traumatologia",
    clinicaId: "ucchristus",
    diasTrabajo: [2, 4, 5],
    horasTrabajo: ["08:30","09:30","10:30","11:30","14:00","15:00","16:00"],
    precioParticular: 78000,
    precioFonasa: 30000,
  },
  {
    id: "d-trau-07",
    nombre: "Dr. Mauricio Pérez Díaz",
    especialidadId: "traumatologia",
    clinicaId: "losandes",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","14:00","14:30","15:00"],
    precioParticular: 58000,
    precioFonasa: 22000,
  },
  {
    id: "d-trau-08",
    nombre: "Dra. Andrea Salinas Rojo",
    especialidadId: "traumatologia",
    clinicaId: "ciudadmar",
    diasTrabajo: [1, 3, 4, 5],
    horasTrabajo: ["08:00","09:00","10:00","11:00","15:00","16:00","17:00"],
    precioParticular: 60000,
    precioFonasa: 24000,
  },
  // Medicina General
  {
    id: "d-mg-01",
    nombre: "Dr. Jorge Castillo Ibáñez",
    especialidadId: "medicina-general",
    clinicaId: "redsaludvit",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"],
    precioParticular: 38000,
    precioFonasa: 15000,
  },
  {
    id: "d-mg-02",
    nombre: "Dra. Patricia Navarro Fuentes",
    especialidadId: "medicina-general",
    clinicaId: "redsaludprov",
    diasTrabajo: [1, 2, 3, 4, 5, 6],
    horasTrabajo: ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","15:00","15:30","16:00","16:30","17:00"],
    precioParticular: 40000,
    precioFonasa: 16000,
  },
  {
    id: "d-mg-03",
    nombre: "Dr. Ricardo Vargas Espinoza",
    especialidadId: "medicina-general",
    clinicaId: "davila",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:30","15:00","15:30","16:00","16:30"],
    precioParticular: 35000,
    precioFonasa: 14000,
  },
  {
    id: "d-mg-04",
    nombre: "Dra. Sofía Mendoza Álvarez",
    especialidadId: "medicina-general",
    clinicaId: "concepcion",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"],
    precioParticular: 32000,
    precioFonasa: 13000,
  },
  // Pediatría
  {
    id: "d-ped-01",
    nombre: "Dra. Isabella Mora González",
    especialidadId: "pediatria",
    clinicaId: "clc",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:30","09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"],
    precioParticular: 55000,
    precioFonasa: 22000,
  },
  {
    id: "d-ped-02",
    nombre: "Dr. Andrés Saavedra Bravo",
    especialidadId: "pediatria",
    clinicaId: "indisa",
    diasTrabajo: [1, 3, 4, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","11:00","15:00","15:30","16:00"],
    precioParticular: 48000,
    precioFonasa: 19000,
  },
  {
    id: "d-ped-03",
    nombre: "Dra. Javiera Acuña Reyes",
    especialidadId: "pediatria",
    clinicaId: "bicentenario",
    diasTrabajo: [2, 3, 4, 5],
    horasTrabajo: ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"],
    precioParticular: 45000,
    precioFonasa: 18000,
  },
  // Ginecología
  {
    id: "d-gin-01",
    nombre: "Dra. Camila Ortiz Parra",
    especialidadId: "ginecologia",
    clinicaId: "cal",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30"],
    precioParticular: 72000,
    precioFonasa: 28000,
  },
  {
    id: "d-gin-02",
    nombre: "Dra. Francisca Poblete Sierra",
    especialidadId: "ginecologia",
    clinicaId: "csm",
    diasTrabajo: [2, 4, 5],
    horasTrabajo: ["08:30","09:30","10:30","11:30","14:00","15:00","16:00"],
    precioParticular: 65000,
    precioFonasa: 26000,
  },
  {
    id: "d-gin-03",
    nombre: "Dra. Daniela Cifuentes Lagos",
    especialidadId: "ginecologia",
    clinicaId: "ucchristus",
    diasTrabajo: [1, 3, 5],
    horasTrabajo: ["09:00","10:00","11:00","14:00","15:00","16:00","17:00"],
    precioParticular: 70000,
    precioFonasa: 28000,
  },
  // Cardiología
  {
    id: "d-car-01",
    nombre: "Dr. Luis Carvajal Muñiz",
    especialidadId: "cardiologia",
    clinicaId: "clc",
    diasTrabajo: [1, 3, 5],
    horasTrabajo: ["09:00","10:00","11:00","14:00","15:00","16:00"],
    precioParticular: 95000,
    precioFonasa: 38000,
  },
  {
    id: "d-car-02",
    nombre: "Dra. María José Figueroa",
    especialidadId: "cardiologia",
    clinicaId: "bupa",
    diasTrabajo: [2, 4],
    horasTrabajo: ["08:30","09:30","10:30","14:00","15:00","16:00"],
    precioParticular: 100000,
    precioFonasa: 40000,
  },
  // Dermatología
  {
    id: "d-der-01",
    nombre: "Dra. Natalia Vásquez Romero",
    especialidadId: "dermatologia",
    clinicaId: "cal",
    diasTrabajo: [1, 2, 4, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"],
    precioParticular: 60000,
    precioFonasa: 24000,
  },
  {
    id: "d-der-02",
    nombre: "Dr. Claudio Espinoza Vera",
    especialidadId: "dermatologia",
    clinicaId: "tab",
    diasTrabajo: [2, 3, 5],
    horasTrabajo: ["09:00","10:00","11:00","15:00","16:00","17:00"],
    precioParticular: 65000,
    precioFonasa: 26000,
  },
  // Neurología
  {
    id: "d-neu-01",
    nombre: "Dr. Eduardo Pizarro Albornoz",
    especialidadId: "neurologia",
    clinicaId: "ucchristus",
    diasTrabajo: [1, 2, 4],
    horasTrabajo: ["09:00","10:00","11:00","14:00","15:00"],
    precioParticular: 88000,
    precioFonasa: 35000,
  },
  // Psiquiatría
  {
    id: "d-psi-01",
    nombre: "Dra. Ana Belén Sepúlveda",
    especialidadId: "psiquiatria",
    clinicaId: "csm",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"],
    precioParticular: 75000,
    precioFonasa: 30000,
  },
  // Oftalmología
  {
    id: "d-oft-01",
    nombre: "Dr. Héctor Meza Soto",
    especialidadId: "oftalmologia",
    clinicaId: "bupa",
    diasTrabajo: [1, 3, 4, 5],
    horasTrabajo: ["08:30","09:00","09:30","10:00","14:00","14:30","15:00","15:30"],
    precioParticular: 70000,
    precioFonasa: 28000,
  },
  // Nutrición
  {
    id: "d-nut-01",
    nombre: "Nut. Lorena Campos Trujillo",
    especialidadId: "nutricion",
    clinicaId: "redsaludvit",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["09:00","09:30","10:00","10:30","11:00","14:00","14:30","15:00","15:30","16:00"],
    precioParticular: 42000,
    precioFonasa: 17000,
  },
  // Psicología
  {
    id: "d-psc-01",
    nombre: "Psic. Roberto Araya Fuentes",
    especialidadId: "psicologia",
    clinicaId: "redsaludprov",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["09:00","10:00","11:00","14:00","15:00","16:00","17:00","18:00"],
    precioParticular: 50000,
    precioFonasa: 20000,
  },
  // Traumatología Valparaíso
  {
    id: "d-trau-09",
    nombre: "Dr. Gonzalo Muñoz Cortés",
    especialidadId: "traumatologia",
    clinicaId: "ciudadmar",
    diasTrabajo: [2, 3, 4],
    horasTrabajo: ["09:00","10:00","11:00","14:00","15:00","16:00"],
    precioParticular: 58000,
    precioFonasa: 23000,
  },
  // Traumatología Concepción
  {
    id: "d-trau-10",
    nombre: "Dra. Paulina Castro Fuentes",
    especialidadId: "traumatologia",
    clinicaId: "concepcion",
    diasTrabajo: [1, 2, 3, 4, 5],
    horasTrabajo: ["08:00","09:00","10:00","11:00","14:00","15:00","16:00"],
    precioParticular: 52000,
    precioFonasa: 21000,
  },
];

// ─── Storage interface ────────────────────────────────────────────────────────

export interface IStorage {
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;

  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, paymentToken?: string): Promise<Order | undefined>;

  // Medical
  getClinics(): Promise<Clinica[]>;
  getClinic(id: string): Promise<Clinica | undefined>;
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  searchSlots(query: BusquedaHoraQuery): Promise<SlotConDetalles[]>;
  createReserva(reserva: InsertReservaHora): Promise<ReservaHora>;
  getReserva(id: string): Promise<ReservaHora | undefined>;
}

export class MemStorage implements IStorage {
  private templates: Map<string, Template> = new Map();
  private orders: Map<string, Order> = new Map();
  private reservas: Map<string, ReservaHora> = new Map();

  private clinicas: Map<string, Clinica> = new Map(CLINICAS.map(c => [c.id, c]));
  private doctors: Map<string, Doctor> = new Map(DOCTORS.map(d => [d.id, d]));

  constructor() {
    this.seedTemplates();
  }

  private seedTemplates() {
    const samples = [
      { name: "Contrato de Trabajo Indefinido", category: "Laboral", description: "Plantilla completa según la legislación chilena.", price: 15000, formats: ["PDF", "DOCX"] },
    ];
    samples.forEach(t => {
      const id = randomUUID();
      this.templates.set(id, { ...t, id, previewImage: null });
    });
  }

  async getTemplates(): Promise<Template[]> { return Array.from(this.templates.values()); }
  async getTemplate(id: string): Promise<Template | undefined> { return this.templates.get(id); }

  async getOrders(): Promise<Order[]> { return Array.from(this.orders.values()); }
  async getOrder(id: string): Promise<Order | undefined> { return this.orders.get(id); }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { status: "pending", ...insertOrder, id, createdAt: new Date(), paymentToken: insertOrder.paymentToken ?? null };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string, paymentToken?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, status, ...(paymentToken ? { paymentToken } : {}) };
    this.orders.set(id, updated);
    return updated;
  }

  async getClinics(): Promise<Clinica[]> { return Array.from(this.clinicas.values()); }
  async getClinic(id: string): Promise<Clinica | undefined> { return this.clinicas.get(id); }
  async getDoctors(): Promise<Doctor[]> { return Array.from(this.doctors.values()); }
  async getDoctor(id: string): Promise<Doctor | undefined> { return this.doctors.get(id); }

  async searchSlots(query: BusquedaHoraQuery): Promise<SlotConDetalles[]> {
    // Work with date strings to avoid timezone issues
    function todayStr(): string {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    function addDays(dateStr: string, n: number): string {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d + n);
      const ny = dt.getFullYear();
      const nm = String(dt.getMonth() + 1).padStart(2, "0");
      const nd = String(dt.getDate()).padStart(2, "0");
      return `${ny}-${nm}-${nd}`;
    }

    function getDayOfWeek(dateStr: string): number {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d).getDay(); // 0=Sun,1=Mon,...,6=Sat
    }

    const desde = query.desde || todayStr();
    const defaultHasta = addDays(desde, 14);
    const maxHasta = addDays(desde, 30);
    let hasta = query.hasta || defaultHasta;
    if (hasta > maxHasta) hasta = maxHasta;

    const matchingDoctors = DOCTORS.filter(d => {
      if (d.especialidadId !== query.especialidadId) return false;
      const clinica = this.clinicas.get(d.clinicaId);
      if (!clinica) return false;
      if (query.regionId && clinica.regionId !== query.regionId) return false;
      if (query.comuna && clinica.comuna !== query.comuna) return false;
      return true;
    });

    const slots: SlotConDetalles[] = [];
    let current = desde;

    while (current <= hasta) {
      const dayOfWeek = getDayOfWeek(current);

      for (const doctor of matchingDoctors) {
        if (!doctor.diasTrabajo.includes(dayOfWeek)) continue;

        const clinica = this.clinicas.get(doctor.clinicaId)!;

        for (const hora of doctor.horasTrabajo) {
          if (!isSlotAvailable(doctor.id, current, hora)) continue;

          slots.push({
            id: `${doctor.id}-${current}-${hora}`,
            doctorId: doctor.id,
            clinicaId: clinica.id,
            fecha: current,
            hora,
            precio: doctor.precioParticular,
            tipoPrecio: "Particular",
            doctor,
            clinica,
          });
        }
      }

      current = addDays(current, 1);
    }

    // Sort by date then time
    slots.sort((a, b) => {
      const d = a.fecha.localeCompare(b.fecha);
      return d !== 0 ? d : a.hora.localeCompare(b.hora);
    });

    return slots;
  }

  async createReserva(insertReserva: InsertReservaHora): Promise<ReservaHora> {
    const id = randomUUID();
    const reserva: ReservaHora = { ...insertReserva, id, creadoEn: new Date() };
    this.reservas.set(id, reserva);
    return reserva;
  }

  async getReserva(id: string): Promise<ReservaHora | undefined> {
    return this.reservas.get(id);
  }
}

export const storage = new MemStorage();
