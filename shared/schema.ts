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

export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantName: text("consultant_name").notNull(),
  consultantPhoto: text("consultant_photo"),
  specialty: text("specialty").notNull(),
  rating: integer("rating").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  availableDays: text("available_days").array().notNull(),
  availableHours: text("available_hours").array().notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultationId: varchar("consultation_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  serviceType: text("service_type").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  customerEmail: z.string().email(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
}).extend({
  customerEmail: z.string().email(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
