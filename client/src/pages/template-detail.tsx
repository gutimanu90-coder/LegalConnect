import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Shield, ArrowLeft, ShoppingCart } from "lucide-react";
import type { Template } from "@shared/schema";
import { useState } from "react";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/contexts/cart-context";

export default function TemplateDetail() {
  const [, params] = useRoute("/plantilla/:id");
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const { items: cartItems, addItem: addToCart, removeItem: removeFromCart, itemCount } = useCart();

  const { data: template, isLoading } = useQuery<Template>({
    queryKey: ["/api/templates", params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartItemCount={0} onCartClick={() => {}} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Plantilla no encontrada</h2>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={itemCount}
        onCartClick={() => setCartOpen(true)}
      />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/">
            <div className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 cursor-pointer" data-testid="link-back">
              <ArrowLeft className="h-4 w-4" />
              Volver a plantillas
            </div>
          </Link>

          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <Badge className="mb-4 bg-accent/20 text-accent-foreground border-accent/30" data-testid="badge-category">
                  {template.category}
                </Badge>
                <h1 className="text-4xl font-bold mb-4" data-testid="text-template-name">{template.name}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-description">
                  {template.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Formatos Disponibles</h3>
                <div className="flex gap-3">
                  {template.formats.map((format) => (
                    <Badge key={format} variant="outline" className="text-sm px-4 py-2" data-testid={`badge-format-${format}`}>
                      <Download className="h-4 w-4 mr-2" />
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Características</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4 text-accent" />
                    Revisado por abogados profesionales
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Download className="h-4 w-4 text-accent" />
                    Descarga inmediata después del pago
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-accent" />
                    Listo para personalizar y usar
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:sticky lg:top-24 h-fit space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="aspect-[4/3] w-full rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <FileText className="h-24 w-24 text-primary" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-mono font-bold" data-testid="text-price">
                        ${template.price.toLocaleString('es-CL')}
                      </span>
                      <span className="text-lg text-muted-foreground">CLP</span>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => addToCart(template)}
                      data-testid="button-add-to-cart"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Añadir al Carrito
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Pago seguro con WebPay Plus
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-semibold">Garantía de Satisfacción</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Si no estás completamente satisfecho con tu compra, ofrecemos reembolso completo dentro de los primeros 7 días.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => setLocation("/checkout")}
      />
    </div>
  );
}
