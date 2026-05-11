import { useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartSheet } from "@/components/cart-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import type { Template } from "@shared/schema";
import {
  CheckCircle2,
  Shield,
  FileSearch,
  Building2,
  Gavel,
  Car,
  Home,
  CreditCard,
  AlertTriangle,
  Users,
  TrendingDown,
  Package,
  Globe,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Clock,
  Star,
} from "lucide-react";

const CREDIT_REPORT_PRODUCT: Template = {
  id: "credit-report-ar-001",
  name: "Reporte de Crédito Comercial Argentina",
  category: "Informes Comerciales",
  description:
    "Informe crediticio completo sobre personas físicas y jurídicas en Argentina. Consulta las principales bases de datos del país para evaluar el riesgo comercial de clientes, proveedores y socios.",
  price: 12990,
  formats: ["PDF"],
  previewImage: null,
};

const informesComerciales = [
  {
    icon: CreditCard,
    title: "BCRA – Central de Deudores",
    description:
      "Deudas con bancos, financieras y tarjetas de crédito. Clasificación crediticia del 1 al 5.",
  },
  {
    icon: AlertTriangle,
    title: "BCRA – Cheques Rechazados",
    description:
      "Historial completo de cheques rechazados: fechas, montos y motivos del rechazo.",
  },
  {
    icon: Building2,
    title: "Base propia de la Cámara",
    description:
      "Créditos comerciales, tarjetas otorgadas por socios, garantías de locación y registros de mora.",
  },
  {
    icon: Gavel,
    title: "Juzgados Civiles y Comerciales",
    description:
      "Juicios civiles, comerciales, concursos preventivos y quiebras declaradas.",
  },
  {
    icon: Home,
    title: "Registro de la Propiedad",
    description:
      "Inmuebles registrados a nombre del consultado: dominio y titularidad.",
  },
  {
    icon: AlertTriangle,
    title: "Archivo de Observaciones",
    description:
      "Denuncias por robo de documentación, extravío de DNI y alertas de identidad.",
  },
];

const maatSources = [
  {
    icon: CreditCard,
    title: "BCRA – Central de Deudores",
    description:
      "Situación crediticia en el sistema financiero argentino, historial y clasificación.",
  },
  {
    icon: AlertTriangle,
    title: "BCRA – Cheques Rechazados",
    description:
      "Detalle completo de cheques rechazados con fechas y montos.",
  },
  {
    icon: Gavel,
    title: "Registros Judiciales",
    description:
      "Juicios comerciales, civiles y laborales a nivel nacional.",
  },
  {
    icon: TrendingDown,
    title: "Registro de Quiebras",
    description:
      "Concursos preventivos, quiebras y acuerdos de reestructuración.",
  },
  {
    icon: Users,
    title: "IGJ / Registro de Sociedades",
    description:
      "Participación societaria: empresas donde figura como socio, autoridad o apoderado.",
  },
  {
    icon: Home,
    title: "Registro de la Propiedad",
    description:
      "Bienes inmuebles registrados a nombre del consultado en todo el país.",
  },
  {
    icon: Car,
    title: "Registro Automotor",
    description:
      "Vehículos registrados a nombre del consultado.",
  },
  {
    icon: Globe,
    title: "Exportaciones e Importaciones",
    description:
      "Actividad de comercio exterior declarada (especialmente relevante para empresas).",
  },
  {
    icon: Package,
    title: "Registro de Prendas",
    description:
      "Prendas constituidas sobre bienes muebles.",
  },
  {
    icon: Shield,
    title: "Consultas al CUIT/CUIL",
    description:
      "Historial de consultas realizadas sobre el CUIT o CUIL del consultado.",
  },
];

const reportSections = [
  "Identificación y datos personales / razón social",
  "Score de riesgo crediticio",
  "Resumen ejecutivo de morosidades",
  "Situación en Central de Deudores BCRA",
  "Cheques rechazados (BCRA)",
  "Juicios civiles y comerciales",
  "Concursos preventivos y quiebras",
  "Participación en sociedades (IGJ)",
  "Bienes registrables: inmuebles y vehículos",
  "Exportaciones e importaciones",
  "Prendas sobre bienes",
  "Historial de consultas al CUIT/CUIL",
];

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "¿Quién puede solicitar un reporte de crédito?",
    answer:
      "Cualquier empresa o persona física puede solicitar un informe comercial sobre terceros para evaluar riesgo crediticio, siempre que exista una relación comercial o contractual vigente o potencial. El uso de la información está regulado por la Ley 25.326 de Protección de Datos Personales.",
  },
  {
    question: "¿De dónde provienen los datos del informe?",
    answer:
      "El informe consolida información de dos fuentes especializadas: Informes Comerciales (Cámara del Crédito Comercial de Rosario) e Informe Premium de Maat. Ambas consultan el BCRA, registros judiciales, Registro de la Propiedad, IGJ, registros automotores y otras bases públicas argentinas.",
  },
  {
    question: "¿Cuánto demora en generarse el informe?",
    answer:
      "Una vez confirmado el pago, el informe es procesado y entregado en formato PDF en un plazo de hasta 24 horas hábiles.",
  },
  {
    question: "¿El informe incluye personas físicas y jurídicas?",
    answer:
      "Sí. Podés consultar tanto personas físicas (con CUIL) como personas jurídicas (empresas con CUIT). Para personas jurídicas el informe incluye además la composición societaria y actividad de comercio exterior.",
  },
];

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-medium text-foreground">{item.question}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t bg-muted/20">
          <p className="pt-3">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function CreditReport() {
  const [cartOpen, setCartOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { items: cartItems, addItem, removeItem, itemCount } = useCart();

  const handleBuy = () => {
    addItem(CREDIT_REPORT_PRODUCT);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={itemCount} onCartClick={() => setCartOpen(true)} />

      <main className="flex-1">
        {/* Hero */}
        <section className="w-full py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                  Informes Comerciales
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Reporte de Crédito Comercial{" "}
                  <span className="text-primary">Argentina</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Evaluá el riesgo crediticio de cualquier persona física o
                  jurídica en Argentina. Información consolidada de las
                  principales bases de datos públicas y privadas del país.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Entrega en menos de 24 hs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    12+ fuentes de datos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Personas físicas y jurídicas
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-mono font-bold text-foreground">
                    ${CREDIT_REPORT_PRODUCT.price.toLocaleString("es-CL")}
                  </span>
                  <span className="text-lg text-muted-foreground">CLP</span>
                </div>
                <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={handleBuy}>
                  <ShoppingCart className="h-5 w-5" />
                  Solicitar Reporte
                </Button>
              </div>

              {/* Visual summary card */}
              <Card className="shadow-xl border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">
                      Contenido del Informe
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reportSections.map((section) => (
                    <div key={section} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {section}
                      </span>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-accent shrink-0" />
                    Entrega en formato PDF en hasta 24 hs hábiles
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="w-full py-16 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground">
                Fuentes de Información
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                El informe consolida datos de dos proveedores especializados con
                acceso a las principales bases de datos públicas y privadas de
                Argentina.
              </p>
            </div>

            {/* Informes Comerciales */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/40">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Informes Comerciales — Cámara del Crédito Comercial de Rosario
                  </span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                Organización fundada en 1953. Cobertura regional fuerte en Santa
                Fe, Córdoba y Buenos Aires, con red propia de referencias
                comerciales entre sus socios.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {informesComerciales.map((source) => {
                  const Icon = source.icon;
                  return (
                    <Card
                      key={source.title}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {source.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {source.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Maat */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/40">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    Maat — Informe Premium Argentina
                  </span>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
                Empresa con más de 20 años de experiencia en informes
                comerciales. Su informe premium para Argentina consolida fuentes
                públicas nacionales en un reporte único y estructurado.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {maatSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <Card
                      key={source.title}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Icon className="h-4 w-4 text-accent-foreground" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            {source.title}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {source.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="w-full py-16 bg-muted/30">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-semibold text-foreground">
                Preguntas Frecuentes
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FaqRow key={faq.question} item={faq} />
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-semibold">
              Tomá decisiones comerciales con información confiable
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Verificá a tus clientes, proveedores y socios antes de firmar
              contratos o extender crédito.
            </p>
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-4xl font-mono font-bold">
                ${CREDIT_REPORT_PRODUCT.price.toLocaleString("es-CL")}
              </span>
              <span className="text-primary-foreground/70">CLP por informe</span>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={handleBuy}
            >
              <ShoppingCart className="h-5 w-5" />
              Solicitar Reporte Ahora
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onRemoveItem={removeItem}
        onCheckout={() => setLocation("/checkout")}
      />
    </div>
  );
}
