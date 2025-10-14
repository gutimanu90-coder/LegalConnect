import { Link } from "wouter";
import { Scale, Shield, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const categories = [
    { name: "Laboral", href: "/?category=laboral" },
    { name: "Empresarial", href: "/?category=empresarial" },
    { name: "Inmobiliario", href: "/?category=inmobiliario" },
    { name: "Civil", href: "/?category=civil" },
  ];

  const legal = [
    { name: "Términos y Condiciones", href: "/terminos" },
    { name: "Política de Privacidad", href: "/privacidad" },
    { name: "Política de Reembolso", href: "/reembolso" },
  ];

  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LegalDocs</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plantillas de contratos legales profesionales y asesoría certificada para empresas y particulares en Chile.
            </p>
            <div className="flex gap-4 pt-2">
              <Shield className="h-5 w-5 text-accent" />
              <Lock className="h-5 w-5 text-accent" />
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Categorías</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link href={category.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-block" data-testid={`link-footer-${category.name.toLowerCase()}`}>
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-block">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Recibe actualizaciones de nuevas plantillas y ofertas especiales.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button data-testid="button-subscribe">Suscribir</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 LegalDocs. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Pagos seguros con WebPay Plus</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
