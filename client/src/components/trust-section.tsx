import { Shield, Lock, RefreshCw, Award } from "lucide-react";

export function TrustSection() {
  const features = [
    {
      icon: Shield,
      title: "Documentos Verificados",
      description: "Todas las plantillas son revisadas por abogados profesionales",
    },
    {
      icon: Lock,
      title: "Pago Seguro",
      description: "Transacciones protegidas con encriptación SSL y WebPay Plus",
    },
    {
      icon: RefreshCw,
      title: "Garantía de Satisfacción",
      description: "Reembolso completo si no quedas satisfecho con tu compra",
    },
    {
      icon: Award,
      title: "Asesoría Profesional",
      description: "Acceso a abogados certificados para consultas personalizadas",
    },
  ];

  return (
    <section className="w-full py-16 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-semibold text-foreground lg:text-4xl">
            ¿Por qué confiar en LegalDocs?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nos comprometemos a brindar documentos legales de la más alta calidad con el respaldo de profesionales certificados
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg hover-elevate transition-all duration-200"
            >
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 pt-8 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-accent" />
            <span>SSL Certificado</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-5 w-5 text-accent" />
            <span>Pago Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-5 w-5 text-accent" />
            <span>Abogados Certificados</span>
          </div>
        </div>
      </div>
    </section>
  );
}
