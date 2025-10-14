import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingBag } from "lucide-react";
import type { Template } from "@shared/schema";

interface CartItem {
  template: Template;
  quantity: number;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onRemoveItem: (templateId: string) => void;
  onCheckout: () => void;
}

export function CartSheet({
  open,
  onOpenChange,
  items,
  onRemoveItem,
  onCheckout,
}: CartSheetProps) {
  const total = items.reduce(
    (sum, item) => sum + item.template.price * item.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col" data-testid="sheet-cart">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground" data-testid="text-empty-cart">Tu carrito está vacío</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.template.id}
                    className="flex gap-4 py-4"
                    data-testid={`cart-item-${item.template.id}`}
                  >
                    <div className="h-20 w-20 rounded-md bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono font-semibold text-primary">
                        {item.template.category}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium leading-tight text-sm" data-testid={`text-cart-item-name-${item.template.id}`}>
                        {item.template.name}
                      </h4>
                      <p className="text-sm font-mono text-muted-foreground" data-testid={`text-cart-item-price-${item.template.id}`}>
                        ${item.template.price.toLocaleString('es-CL')} CLP
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onRemoveItem(item.template.id)}
                      data-testid={`button-remove-${item.template.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono" data-testid="text-cart-subtotal">${total.toLocaleString('es-CL')} CLP</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="font-mono" data-testid="text-cart-total">${total.toLocaleString('es-CL')} CLP</span>
                </div>
              </div>

              <SheetFooter className="flex flex-col gap-2">
                <Link href="/checkout">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      onCheckout();
                      onOpenChange(false);
                    }}
                    data-testid="button-checkout"
                  >
                    Proceder al Pago
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-continue-shopping"
                >
                  Continuar Comprando
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
