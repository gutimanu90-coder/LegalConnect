import { 
  type Template, 
  type InsertTemplate,
  type Consultation,
  type InsertConsultation,
  type Booking,
  type InsertBooking,
  type Order,
  type InsertOrder,
  type CartItem,
  type InsertCartItem,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  getConsultations(): Promise<Consultation[]>;
  getConsultation(id: string): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  
  getBookings(): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, paymentToken?: string): Promise<Order | undefined>;
  
  getCartItems(): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  removeCartItem(id: string): Promise<void>;
  clearCart(): Promise<void>;
}

export class MemStorage implements IStorage {
  private templates: Map<string, Template>;
  private consultations: Map<string, Consultation>;
  private bookings: Map<string, Booking>;
  private orders: Map<string, Order>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.templates = new Map();
    this.consultations = new Map();
    this.bookings = new Map();
    this.orders = new Map();
    this.cartItems = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleTemplates: InsertTemplate[] = [
      {
        name: "Contrato de Trabajo Indefinido",
        category: "Laboral",
        description: "Plantilla completa para contrato de trabajo a plazo indefinido, incluye todas las cláusulas legales necesarias según la legislación chilena.",
        price: 15000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Contrato de Arrendamiento Habitacional",
        category: "Inmobiliario",
        description: "Contrato de arriendo para viviendas con todas las cláusulas de la Ley de Arrendamiento vigente en Chile.",
        price: 18000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Contrato de Prestación de Servicios",
        category: "Empresarial",
        description: "Modelo profesional para formalizar servicios profesionales entre empresas o personas naturales.",
        price: 20000,
        formats: ["PDF", "DOCX", "ODT"],
      },
      {
        name: "Contrato de Compraventa",
        category: "Civil",
        description: "Plantilla estándar para compraventa de bienes muebles e inmuebles con garantías legales.",
        price: 16000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Contrato de Sociedad Limitada",
        category: "Empresarial",
        description: "Estatutos completos para constituir una Sociedad de Responsabilidad Limitada en Chile.",
        price: 35000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Finiquito Laboral",
        category: "Laboral",
        description: "Documento de finiquito con liquidación de haberes según legislación laboral chilena.",
        price: 12000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Contrato de Confidencialidad (NDA)",
        category: "Empresarial",
        description: "Acuerdo de confidencialidad bilateral para proteger información sensible empresarial.",
        price: 14000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Poder Notarial Simple",
        category: "Civil",
        description: "Mandato o poder simple para realizar trámites específicos ante instituciones.",
        price: 10000,
        formats: ["PDF", "DOCX"],
      },
      {
        name: "Contrato de Compraventa de Vehículo",
        category: "Comercial",
        description: "Contrato especializado para la venta de vehículos motorizados con transferencia de dominio.",
        price: 13000,
        formats: ["PDF", "DOCX"],
      },
    ];

    sampleTemplates.forEach(template => {
      const id = randomUUID();
      this.templates.set(id, { ...template, id });
    });

    const sampleConsultations: InsertConsultation[] = [
      {
        consultantName: "María González Ruiz",
        specialty: "Derecho Laboral",
        rating: 5,
        hourlyRate: 45000,
        availableDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
        availableHours: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        consultantName: "Carlos Mendoza Silva",
        specialty: "Derecho Inmobiliario",
        rating: 5,
        hourlyRate: 50000,
        availableDays: ["Lunes", "Miércoles", "Viernes"],
        availableHours: ["10:00", "11:00", "15:00", "16:00", "17:00"],
      },
      {
        consultantName: "Patricia Vega Morales",
        specialty: "Derecho Empresarial",
        rating: 5,
        hourlyRate: 55000,
        availableDays: ["Martes", "Jueves"],
        availableHours: ["09:00", "10:00", "14:00", "15:00"],
      },
    ];

    sampleConsultations.forEach(consultation => {
      const id = randomUUID();
      this.consultations.set(id, { ...consultation, id });
    });
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async getConsultations(): Promise<Consultation[]> {
    return Array.from(this.consultations.values());
  }

  async getConsultation(id: string): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const id = randomUUID();
    const consultation: Consultation = { ...insertConsultation, id };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string, paymentToken?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      const updatedOrder = { ...order, status, paymentToken };
      this.orders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  async getCartItems(): Promise<CartItem[]> {
    return Array.from(this.cartItems.values());
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async removeCartItem(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(): Promise<void> {
    this.cartItems.clear();
  }
}

export const storage = new MemStorage();
