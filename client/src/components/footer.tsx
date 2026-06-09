import { Link } from "wouter";
import { Activity, Shield, Lock, Heart } from "lucide-react";

export function Footer() {
  const especialidades = [
    { name: "Traumatología", href: "/buscar-hora?especialidadId=traumatologia" },
    { name: "Medicina General", href: "/buscar-hora?especialidadId=medicina-general" },
    { name: "Pediatría", href: "/buscar-hora?especialidadId=pediatria" },
    { name: "Ginecología", href: "/buscar-hora?especialidadId=ginecologia" },
    { name: "Cardiología", href: "/buscar-hora?especialidadId=cardiologia" },
    { name: "Dermatología", href: "/buscar-hora?especialidadId=dermatologia" },
  ];

  const info = [
    { name: "Cómo funciona", href: "/#como-funciona" },
    { name: "Especialidades", href: "/#especialidades" },
    { name: "Términos de uso", href: "/terminos" },
    { name: "Privacidad", href: "/privacidad" },
  ];

  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">HoraMédica Chile</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Encuentra disponibilidad de horas médicas en clínicas y centros de salud
              de todo Chile, sin tener que llamar a cada uno.
            </p>
            <div className="flex gap-3 pt-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Especialidades</h3>
            <ul className="space-y-2">
              {especialidades.map(item => (
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
            <h3 className="text-sm font-semibold">Información</h3>
            <ul className="space-y-2">
              {info.map(item => (
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
        </div>

        <div className="mt-10 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-sm text-muted-foreground">
            © 2025 HoraMédica Chile. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            La disponibilidad de horas puede variar. Confirma directamente con el centro médico.
          </p>
        </div>
      </div>
    </footer>
  );
}
