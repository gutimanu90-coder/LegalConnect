import { createContext, useContext, useState, ReactNode } from "react";
import type { Template } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  template: Template;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (template: Template) => void;
  removeItem: (templateId: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addItem = (template: Template) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.template.id === template.id);
      if (existingItem) {
        toast({
          title: "Ya en el carrito",
          description: "Esta plantilla ya está en tu carrito",
        });
        return current;
      }
      toast({
        title: "Añadido al carrito",
        description: `${template.name} se agregó a tu carrito`,
      });
      return [...current, { template, quantity: 1 }];
    });
  };

  const removeItem = (templateId: string) => {
    setItems((current) => current.filter((item) => item.template.id !== templateId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.template.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
