import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  formats: text("formats").array().notNull(),
  previewImage: text("preview_image"),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  items: text("items").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentToken: text("payment_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true }).extend({
  customerEmail: z.string().email(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// ─── Medical appointment types ────────────────────────────────────────────────

export type Clinica = {
  id: string;
  nombre: string;
  regionId: string;
  comuna: string;
  direccion: string;
  telefono: string;
  url: string;
  previsionAceptada: string[];
  precioBase: number;
};

export type Doctor = {
  id: string;
  nombre: string;
  especialidadId: string;
  clinicaId: string;
  foto?: string;
  diasTrabajo: number[];   // 1=Lunes … 6=Sábado
  horasTrabajo: string[];  // ["08:30","09:00",…]
  precioParticular: number;
  precioFonasa: number;
};

export type SlotDisponible = {
  id: string;
  doctorId: string;
  clinicaId: string;
  fecha: string;   // YYYY-MM-DD
  hora: string;    // HH:MM
  precio: number;
  tipoPrecio: string;
};

export type SlotConDetalles = SlotDisponible & {
  doctor: Doctor;
  clinica: Clinica;
};

export type ReservaHora = {
  id: string;
  pacienteRut: string;
  pacienteNombre: string;
  pacienteApellido: string;
  slotId: string;
  doctorId: string;
  clinicaId: string;
  especialidadId: string;
  fecha: string;
  hora: string;
  estado: string;
  creadoEn: Date;
};

export type InsertReservaHora = Omit<ReservaHora, "id" | "creadoEn">;

export type BusquedaHoraQuery = {
  especialidadId: string;
  regionId?: string;
  comuna?: string;
  desde?: string;
  hasta?: string;
};

export const busquedaHoraSchema = z.object({
  especialidadId: z.string().min(1, "Selecciona una especialidad"),
  regionId: z.string().optional(),
  comuna: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const reservaHoraSchema = z.object({
  pacienteRut: z.string().min(8, "RUT inválido"),
  pacienteNombre: z.string().min(2, "Nombre requerido"),
  pacienteApellido: z.string().min(2, "Apellido requerido"),
  slotId: z.string().min(1),
  doctorId: z.string().min(1),
  clinicaId: z.string().min(1),
  especialidadId: z.string().min(1),
  fecha: z.string().min(1),
  hora: z.string().min(1),
  estado: z.string().default("confirmada"),
});
