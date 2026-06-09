import { Calendar, Clock, MapPin, Building2, CreditCard, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SlotConDetalles } from "@shared/schema";
import { ESPECIALIDADES } from "@shared/chile-data";

interface AppointmentCardProps {
  slot: SlotConDetalles & { bookingUrl?: string; isLive?: boolean; source?: string };
  onReservar: (slot: SlotConDetalles) => void;
}

function formatFecha(fechaStr: string): string {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatPrecio(precio: number | null): string {
  if (precio === null) return "Ver precio";
  return precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export function AppointmentCard({ slot, onReservar }: AppointmentCardProps) {
  const especialidad = ESPECIALIDADES.find(e => e.id === slot.doctor.especialidadId);
  const isLive = (slot as any).isLive ?? false;
  const bookingUrl = (slot as any).bookingUrl ?? slot.clinica.url;

  return (
    <Card className="hover:shadow-md transition-shadow border-border/60">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Doctor + Specialty */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm leading-tight truncate">
                {slot.doctor.nombre}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">
                  {especialidad?.nombre ?? slot.doctor.especialidadId}
                </Badge>
                {isLive ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                    <Wifi className="h-3 w-3" /> En vivo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <WifiOff className="h-3 w-3" /> Demo
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-primary">
                {formatPrecio(slot.precio ?? slot.clinica.precioBase)}
              </p>
              <p className="text-xs text-muted-foreground">Particular</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 min-w-0">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="capitalize truncate">{formatFecha(slot.fecha)}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium text-foreground">{slot.hora}</span>
            </div>
          </div>

          {/* Clinic */}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-foreground">{slot.clinica.nombre}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="text-xs truncate">{slot.clinica.comuna} — {slot.clinica.direccion}</span>
              </div>
            </div>
          </div>

          {/* Previsión chips */}
          <div className="flex flex-wrap gap-1">
            {slot.clinica.previsionAceptada.slice(0, 4).map(prev => (
              <span
                key={prev}
                className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full"
              >
                <CreditCard className="h-2.5 w-2.5" />
                {prev}
              </span>
            ))}
            {slot.clinica.previsionAceptada.length > 4 && (
              <span className="text-xs text-muted-foreground px-1 py-0.5">
                +{slot.clinica.previsionAceptada.length - 4} más
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {isLive ? (
              // Live slot: redirect to clinic's actual booking page
              <Button size="sm" className="flex-1" asChild>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  Reservar en clínica
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </Button>
            ) : (
              // Mock slot: in-app booking flow
              <Button size="sm" className="flex-1" onClick={() => onReservar(slot)}>
                Reservar hora
              </Button>
            )}
            <Button size="sm" variant="outline" asChild>
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

