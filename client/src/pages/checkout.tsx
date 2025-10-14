import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";

const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "Teléfono inválido"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, total, clearCart, itemCount } = useCart();

  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "No hay productos en tu carrito",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [items, setLocation, toast]);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "El carrito está vacío",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const cartItems = items.map(item => ({
        id: item.template.id,
        name: item.template.name,
        price: item.template.price,
        quantity: item.quantity,
      }));

      const response = await apiRequest("POST", "/api/create-payment", {
        customerName: data.name,
        customerEmail: data.email,
        phone: data.phone,
        items: cartItems,
        amount: total,
      });

      const result = await response.json();
      
      if (result.url && result.token) {
        clearCart();
        window.location.href = result.url;
      } else {
        throw new Error("Error al procesar el pago");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pago. Intenta nuevamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={itemCount} onCartClick={() => {}} />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-8" data-testid="text-checkout-title">Finalizar Compra</h1>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Pérez" {...field} data-testid="input-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="juan@ejemplo.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+56912345678" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isProcessing}
                        data-testid="button-pay"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Pagar con WebPay Plus
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-6 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-accent mt-1" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Pago Seguro</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tus datos están protegidos con encriptación SSL. El pago es procesado de forma segura por WebPay Plus de Transbank.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.template.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.template.name}</p>
                          <p className="text-muted-foreground text-xs">{item.template.category}</p>
                        </div>
                        <span className="font-mono">${item.template.price.toLocaleString('es-CL')}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono" data-testid="text-subtotal">${total.toLocaleString('es-CL')} CLP</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="font-mono" data-testid="text-total">${total.toLocaleString('es-CL')} CLP</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{items.length} plantilla{items.length > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Al finalizar la compra, recibirás un email con los enlaces de descarga de tus plantillas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
