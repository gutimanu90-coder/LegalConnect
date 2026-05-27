import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, Building2, MapPin, Phone, Loader2, AlertCircle, User } from "lucide-react";
import type { ReservaHora } from "@shared/schema";
import { ESPECIALIDADES } from "@shared/chile-data";

function formatFechaLarga(fechaStr: string): string {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ConfirmarReserva() {
  const params = useParams<{ id: string }>();

  const { data: reserva, isLoading, error } = useQuery<ReservaHora>({
    queryKey: ["/api/medico/reserva", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/medico/reserva/${params.id}`);
      if (!res.ok) throw new Error("Reserva no encontrada");
      return res.json();
    },
    enabled: !!params.id,
  });

  // We need clinic and doctor info — fetch from slots detail isn't stored.
  // The reserva has clinicaId and doctorId; let's fetch clinics for the address.
  const { data: clinicas } = useQuery<any[]>({
    queryKey: ["/api/medico/clinicas"],
    queryFn: async () => {
      const res = await fetch("/api/medico/clinicas");
      return res.json();
    },
  });

  const clinica = clinicas?.find((c: any) => c.id === reserva?.clinicaId);
  const especialidad = ESPECIALIDADES.find(e => e.id === reserva?.especialidadId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-xl px-4 sm:px-6 py-16">

          {isLoading && (
            <div className="flex items-center justify-center gap-3 h-64 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Cargando tu reserva…</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4 text-center h-64 justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Reserva no encontrada</p>
              <Link href="/buscar-hora">
                <Button>Volver a buscar</Button>
              </Link>
            </div>
          )}

          {reserva && (
            <div className="space-y-6">
              {/* Success header */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">¡Hora reservada!</h1>
                <p className="text-muted-foreground">
                  Tu cita ha sido registrada. Guarda esta información para tu visita.
                </p>
              </div>

              {/* Booking summary */}
              <Card>
                <CardContent className="p-6 space-y-5">
                  <div className="pb-3 border-b">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Número de reserva</p>
                    <p className="font-mono font-semibold text-sm text-primary break-all">{reserva.id}</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Paciente</p>
                      <p className="font-medium">{reserva.pacienteNombre} {reserva.pacienteApellido}</p>
                      <p className="text-sm text-muted-foreground">RUT: {reserva.pacienteRut}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha y hora</p>
                      <p className="font-medium capitalize">{formatFechaLarga(reserva.fecha)}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{reserva.hora} hrs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Especialidad</p>
                      <p className="font-medium">{especialidad?.nombre ?? reserva.especialidadId}</p>
                    </div>
                  </div>

                  {clinica && (
                    <>
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Centro médico</p>
                          <p className="font-medium">{clinica.nombre}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Dirección</p>
                          <p className="font-medium">{clinica.direccion}</p>
                          <p className="text-sm text-muted-foreground">{clinica.comuna}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Teléfono clínica</p>
                          <a href={`tel:${clinica.telefono}`} className="font-medium text-primary hover:underline">
                            {clinica.telefono}
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Advice */}
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Recuerda para tu consulta:</p>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>• Lleva tu cédula de identidad</li>
                    <li>• Llega 15 minutos antes de tu hora</li>
                    <li>• Si tienes Fonasa o Isapre, lleva tu carnet de salud</li>
                    <li>• Guarda el número de reserva: <strong>{reserva.id.slice(0, 8)}…</strong></li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/buscar-hora" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Buscar otra hora
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Ir al inicio
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
