import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Activity, Search, CalendarCheck, MousePointerClick,
  Stethoscope, Heart, Brain, Eye, Baby, Bone, Sparkles, Wind,
  Shield, Clock, MapPin,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: <Search className="h-6 w-6" />,
    title: "Ingresa tus datos",
    description: "Completa tu RUT, nombre y elige la especialidad médica que necesitas.",
  },
  {
    step: "2",
    icon: <MapPin className="h-6 w-6" />,
    title: "Selecciona tu zona",
    description: "Filtra por región y comuna para encontrar médicos cerca de ti.",
  },
  {
    step: "3",
    icon: <CalendarCheck className="h-6 w-6" />,
    title: "Reserva en segundos",
    description: "Elige la hora que más te acomoda y confirma tu reserva al instante.",
  },
];

const ESPECIALIDADES_DESTACADAS = [
  { id: "medicina-general", nombre: "Medicina General", icon: <Stethoscope className="h-8 w-8" />, color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  { id: "traumatologia", nombre: "Traumatología", icon: <Bone className="h-8 w-8" />, color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  { id: "pediatria", nombre: "Pediatría", icon: <Baby className="h-8 w-8" />, color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  { id: "ginecologia", nombre: "Ginecología", icon: <Heart className="h-8 w-8" />, color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400" },
  { id: "cardiologia", nombre: "Cardiología", icon: <Activity className="h-8 w-8" />, color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
  { id: "neurologia", nombre: "Neurología", icon: <Brain className="h-8 w-8" />, color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  { id: "oftalmologia", nombre: "Oftalmología", icon: <Eye className="h-8 w-8" />, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
  { id: "dermatologia", nombre: "Dermatología", icon: <Sparkles className="h-8 w-8" />, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
];

const CLINICAS_PARTNER = [
  "Clínica Las Condes",
  "Clínica Alemana",
  "Clínica Santa María",
  "Hospital UC-Christus",
  "Clínica Bupa",
  "Clínica Indisa",
  "Clínica Dávila",
  "RedSalud",
];

const STATS = [
  { label: "Médicos disponibles", value: "200+" },
  { label: "Clínicas y centros", value: "50+" },
  { label: "Especialidades", value: "20" },
  { label: "Regiones de Chile", value: "16" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-primary/4 pointer-events-none" />
          <div className="container relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Activity className="h-4 w-4" />
              Disponibilidad en tiempo real
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Encuentra tu hora médica
              <span className="block text-primary mt-1">en toda Chile</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Consulta disponibilidad de horas médicas en más de 50 clínicas y centros
              de salud de Chile, sin tener que llamar a cada uno.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/buscar-hora">
                <Button size="lg" className="w-full sm:w-auto px-8 text-base h-12">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar hora ahora
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base h-12">
                  Cómo funciona
                </Button>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Sin crear cuenta</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Disponibilidad en tiempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-purple-500" />
                <span>Reserva en 2 minutos</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ────────────────────────────────────────────────── */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section id="como-funciona" className="py-20 scroll-mt-16">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">¿Cómo funciona?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Encuentra y reserva tu hora médica en tres simples pasos, sin llamar ni visitar cada clínica.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map(item => (
                <div key={item.step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/buscar-hora">
                <Button size="lg" className="px-10">
                  Empezar ahora
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Specialties ──────────────────────────────────────────── */}
        <section id="especialidades" className="py-20 bg-muted/20 scroll-mt-16">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">Especialidades disponibles</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Encuentra disponibilidad de horas para más de 20 especialidades médicas en todo Chile.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ESPECIALIDADES_DESTACADAS.map(esp => (
                <Link key={esp.id} href={`/buscar-hora?especialidadId=${esp.id}`}>
                  <div className="flex flex-col items-center gap-3 p-5 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer group">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${esp.color} group-hover:scale-110 transition-transform`}>
                      {esp.icon}
                    </div>
                    <p className="text-sm font-medium text-center text-foreground leading-tight">{esp.nombre}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/buscar-hora">
                <Button variant="outline">
                  Ver todas las especialidades
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Partner clinics ──────────────────────────────────────── */}
        <section className="py-16 border-t">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-wider">
              Clínicas y centros médicos disponibles
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {CLINICAS_PARTNER.map(nombre => (
                <div key={nombre} className="px-4 py-2 rounded-lg border bg-card text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {nombre}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
