import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Download, Award } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full py-20 md:py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
      
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight text-foreground lg:text-7xl" data-testid="text-hero-title">
                Plantillas Legales
                <span className="block text-primary mt-2">Profesionales</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl" data-testid="text-hero-description">
                Accede a más de 100 plantillas de contratos legales redactadas por abogados profesionales. Descarga inmediata y asesoría certificada cuando la necesites.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#plantillas">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-explore-templates">
                  Explorar Plantillas
                </Button>
              </Link>
              <Link href="/consultas">
                <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-schedule-consultation">
                  Agendar Asesoría Legal
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">100+ Plantillas Profesionales</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Descarga Inmediata</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Asesoría Certificada</span>
              </div>
            </div>
          </div>

          <div className="relative lg:block">
            <div className="aspect-square w-full max-w-lg mx-auto rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-8 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Shield className="h-32 w-32 mx-auto text-primary" />
                <p className="text-2xl font-semibold text-foreground">Documentos Legales Confiables</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
