import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Templates endpoints
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching templates: " + error.message });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching template: " + error.message });
    }
  });

  // Consultations endpoints
  app.get("/api/consultations", async (req, res) => {
    try {
      const consultations = await storage.getConsultations();
      res.json(consultations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching consultations: " + error.message });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const consultation = await storage.getConsultation(req.params.id);
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      res.json(consultation);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching consultation: " + error.message });
    }
  });

  // Bookings endpoint
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating booking: " + error.message });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching bookings: " + error.message });
    }
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order: " + error.message });
    }
  });

  // WebPay Plus integration
  // Using Transbank test credentials for development
  const WEBPAY_COMMERCE_CODE = process.env.WEBPAY_COMMERCE_CODE || "597055555532";
  const WEBPAY_API_KEY = process.env.WEBPAY_API_KEY || "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C";
  const WEBPAY_URL = "https://webpay3gint.transbank.cl"; // Integration environment

  app.post("/api/create-payment", async (req, res) => {
    try {
      const { customerName, customerEmail, phone, items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Server-side validation: recalculate total based on authoritative template pricing
      let serverTotal = 0;
      const validatedItems = [];

      for (const item of items) {
        // Validate quantity: must be positive integer
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          return res.status(400).json({ 
            message: `Invalid quantity for template ${item.id}: must be a positive integer` 
          });
        }

        const template = await storage.getTemplate(item.id);
        if (!template) {
          return res.status(400).json({ message: `Template ${item.id} not found` });
        }
        
        // Use server-side pricing with validated quantity
        const itemTotal = template.price * quantity;
        serverTotal += itemTotal;
        
        validatedItems.push({
          id: template.id,
          name: template.name,
          price: template.price,
          quantity: quantity,
        });
      }

      // Create order with validated total
      const order = await storage.createOrder({
        customerName,
        customerEmail,
        items: JSON.stringify(validatedItems),
        total: serverTotal,
        status: "pending",
      });

      // Simulate WebPay Plus transaction creation
      // In a real implementation, you would call the Transbank API here
      const buyOrder = `ORDER-${order.id}`;
      const sessionId = `SESSION-${Date.now()}`;
      const returnUrl = `${req.protocol}://${req.get('host')}/api/payment-return`;

      // For test environment, we'll return a mock URL
      const mockToken = `${Buffer.from(order.id).toString('base64')}`;
      const webpayUrl = `${WEBPAY_URL}/rswebpaytransaction/webpay.htm?token=${mockToken}`;

      // Update order with payment token
      await storage.updateOrderStatus(order.id, "payment_initiated", mockToken);

      res.json({
        url: webpayUrl,
        token: mockToken,
        orderId: order.id,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment: " + error.message });
    }
  });

  app.post("/api/payment-return", async (req, res) => {
    try {
      const { token_ws } = req.body;

      if (!token_ws) {
        return res.status(400).json({ message: "Missing payment token" });
      }

      // Decode the token to get order ID (in production, verify with Transbank)
      const orderId = Buffer.from(token_ws, 'base64').toString('utf8');
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify token matches what we created for this order
      if (order.paymentToken !== token_ws) {
        return res.status(403).json({ message: "Invalid payment token" });
      }

      // Verify order is in correct state to complete
      if (order.status !== "payment_initiated") {
        return res.status(400).json({ 
          message: `Order cannot be completed from status: ${order.status}` 
        });
      }

      // In production, you would verify the payment status with Transbank here
      // For testing, we'll mark it as completed
      await storage.updateOrderStatus(orderId, "completed", token_ws);

      res.json({
        success: true,
        orderId: orderId,
        status: "completed",
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error processing payment return: " + error.message });
    }
  });

  app.get("/api/payment-status/:orderId", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json({
        orderId: order.id,
        status: order.status,
        total: order.total,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching payment status: " + error.message });
    }
  });

  // Cart endpoints
  app.get("/api/cart", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems();
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const item = await storage.addCartItem(req.body);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeCartItem(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      await storage.clearCart();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: "Error clearing cart: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
