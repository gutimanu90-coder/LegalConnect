import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppointmentCard } from "@/components/appointment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, AlertCircle, Filter, User, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { REGIONES, COMUNAS_POR_REGION, ESPECIALIDADES } from "@shared/chile-data";
import { formatRut, validateRut, getRutError } from "@/lib/rut-validator";
import type { SlotConDetalles } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// ─── Forms ────────────────────────────────────────────────────────────────────

const pacienteSchema = z.object({
  rut: z.string().min(1, "RUT requerido").refine(val => validateRut(val), "RUT inválido"),
  nombre: z.string().min(2, "Nombre requerido"),
  apellido: z.string().min(2, "Apellido requerido"),
});

const busquedaSchema = z.object({
  especialidadId: z.string().min(1, "Selecciona una especialidad"),
  regionId: z.string().optional(),
  comuna: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

type PacienteForm = z.infer<typeof pacienteSchema>;
type BusquedaForm = z.infer<typeof busquedaSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function BuscarHora() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [paciente, setPaciente] = useState<PacienteForm | null>(null);
  const [rutInput, setRutInput] = useState("");
  const [rutError, setRutError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<BusquedaForm | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [slotToBook, setSlotToBook] = useState<SlotConDetalles | null>(null);

  // Read ?especialidadId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedEspecialidad = urlParams.get("especialidadId") || "";

  const pacienteForm = useForm<PacienteForm>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: { rut: "", nombre: "", apellido: "" },
  });

  const busquedaForm = useForm<BusquedaForm>({
    resolver: zodResolver(busquedaSchema),
    defaultValues: { especialidadId: preselectedEspecialidad, regionId: "", comuna: "" },
  });

  const comunasDisponibles = selectedRegion ? (COMUNAS_POR_REGION[selectedRegion] ?? []) : [];

  type SearchResult = {
    slots: (SlotConDetalles & { bookingUrl?: string; isLive?: boolean; source?: string })[];
    deepLinks: Array<{ clinica: string; url: string }>;
    isLive: boolean;
    sources: Array<{ adapter: string; status: string; count: number; error?: string }>;
  };

  // ─── Search query ──────────────────────────────────────────────────────────
  const { data: searchResult, isLoading: isSearching, error: searchError, refetch } = useQuery<SearchResult>({
    queryKey: ["/api/medico/buscar", searchParams],
    queryFn: async () => {
      if (!searchParams) return { slots: [], deepLinks: [], isLive: false, sources: [] };
      const params = new URLSearchParams();
      params.set("especialidadId", searchParams.especialidadId);
      if (searchParams.regionId) params.set("regionId", searchParams.regionId);
      if (searchParams.comuna) params.set("comuna", searchParams.comuna);
      if (searchParams.desde) params.set("desde", searchParams.desde);
      if (searchParams.hasta) params.set("hasta", searchParams.hasta);
      const res = await fetch(`/api/medico/buscar?${params}`);
      if (!res.ok) throw new Error("Error al buscar horas");
      return res.json();
    },
    enabled: !!searchParams,
  });

  const slots = searchResult?.slots ?? [];
  const deepLinks = searchResult?.deepLinks ?? [];
  const isLive = searchResult?.isLive ?? false;

  // ─── Booking mutation ──────────────────────────────────────────────────────
  const reservaMutation = useMutation({
    mutationFn: async (data: {
      pacienteRut: string;
      pacienteNombre: string;
      pacienteApellido: string;
      slot: SlotConDetalles;
    }) => {
      const res = await apiRequest("POST", "/api/medico/reservar", {
        pacienteRut: data.pacienteRut,
        pacienteNombre: data.pacienteNombre,
        pacienteApellido: data.pacienteApellido,
        slotId: data.slot.id,
        doctorId: data.slot.doctorId,
        clinicaId: data.slot.clinicaId,
        especialidadId: data.slot.doctor.especialidadId,
        fecha: data.slot.fecha,
        hora: data.slot.hora,
        estado: "confirmada",
      });
      return res.json();
    },
    onSuccess: (reserva) => {
      setSlotToBook(null);
      navigate(`/confirmar-reserva/${reserva.id}`);
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error al reservar", description: "Intenta nuevamente." });
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleRutChange(value: string) {
    const formatted = formatRut(value);
    setRutInput(formatted);
    pacienteForm.setValue("rut", formatted);
    setRutError(null);
  }

  function handleRutBlur() {
    const err = getRutError(rutInput);
    setRutError(err);
    if (!err) pacienteForm.clearErrors("rut");
  }

  function onPacienteSubmit(data: PacienteForm) {
    setPaciente(data);
    toast({ title: "Datos guardados", description: `Hola, ${data.nombre}. Ahora busca tu hora.` });
  }

  function onBusquedaSubmit(data: BusquedaForm) {
    const clean = {
      ...data,
      regionId: data.regionId || undefined,
      comuna: data.comuna || undefined,
    };
    setSearchParams(clean);
  }

  function handleConfirmarReserva() {
    if (!paciente || !slotToBook) return;
    reservaMutation.mutate({
      pacienteRut: paciente.rut,
      pacienteNombre: paciente.nombre,
      pacienteApellido: paciente.apellido,
      slot: slotToBook,
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Buscar Hora Médica</h1>
            <p className="text-muted-foreground mt-1">
              Ingresa tus datos y encuentra disponibilidad en clínicas y centros médicos de Chile.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            {/* ── Left panel ─────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Patient form */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-primary" />
                    Datos del Paciente
                    {paciente && (
                      <span className="ml-auto text-xs font-normal text-green-600 dark:text-green-400">✓ Guardado</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={pacienteForm.handleSubmit(onPacienteSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rut">RUT</Label>
                      <Input
                        id="rut"
                        placeholder="12.345.678-9"
                        value={rutInput}
                        onChange={e => handleRutChange(e.target.value)}
                        onBlur={handleRutBlur}
                        className={rutError ? "border-destructive" : ""}
                      />
                      {rutError && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {rutError}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          placeholder="Juan"
                          {...pacienteForm.register("nombre")}
                          className={pacienteForm.formState.errors.nombre ? "border-destructive" : ""}
                        />
                        {pacienteForm.formState.errors.nombre && (
                          <p className="text-xs text-destructive">{pacienteForm.formState.errors.nombre.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="apellido">Apellido</Label>
                        <Input
                          id="apellido"
                          placeholder="Pérez"
                          {...pacienteForm.register("apellido")}
                          className={pacienteForm.formState.errors.apellido ? "border-destructive" : ""}
                        />
                        {pacienteForm.formState.errors.apellido && (
                          <p className="text-xs text-destructive">{pacienteForm.formState.errors.apellido.message}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" variant={paciente ? "outline" : "default"} size="sm" className="w-full">
                      {paciente ? "Actualizar datos" : "Guardar datos"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Search filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Filter className="h-4 w-4 text-primary" />
                    Filtros de búsqueda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={busquedaForm.handleSubmit(onBusquedaSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Especialidad *</Label>
                      <Select
                        value={busquedaForm.watch("especialidadId")}
                        onValueChange={v => busquedaForm.setValue("especialidadId", v, { shouldValidate: true })}
                      >
                        <SelectTrigger className={busquedaForm.formState.errors.especialidadId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Seleccionar especialidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESPECIALIDADES.map(esp => (
                            <SelectItem key={esp.id} value={esp.id}>{esp.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {busquedaForm.formState.errors.especialidadId && (
                        <p className="text-xs text-destructive">{busquedaForm.formState.errors.especialidadId.message}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label>Región</Label>
                      <Select
                        value={selectedRegion}
                        onValueChange={v => {
                          setSelectedRegion(v);
                          busquedaForm.setValue("regionId", v);
                          busquedaForm.setValue("comuna", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las regiones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas las regiones</SelectItem>
                          {REGIONES.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {comunasDisponibles.length > 0 && (
                      <div className="space-y-1.5">
                        <Label>Comuna</Label>
                        <Select
                          value={busquedaForm.watch("comuna") || ""}
                          onValueChange={v => busquedaForm.setValue("comuna", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las comunas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas las comunas</SelectItem>
                            {comunasDisponibles.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="desde">Desde</Label>
                        <Input
                          id="desde"
                          type="date"
                          min={today}
                          {...busquedaForm.register("desde")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="hasta">Hasta</Label>
                        <Input
                          id="hasta"
                          type="date"
                          min={today}
                          {...busquedaForm.register("hasta")}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSearching}>
                      {isSearching ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Buscando...</>
                      ) : (
                        <><Search className="h-4 w-4 mr-2" /> Buscar horas</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* ── Results ─────────────────────────────────────────────── */}
            <div>
              {!searchParams && (
                <div className="flex flex-col items-center justify-center h-80 text-center gap-4 text-muted-foreground border-2 border-dashed rounded-xl">
                  <Search className="h-12 w-12 opacity-30" />
                  <div>
                    <p className="font-medium text-foreground">Ingresa tus datos y busca</p>
                    <p className="text-sm mt-1">
                      Selecciona la especialidad y tu zona para ver horas disponibles.
                    </p>
                  </div>
                </div>
              )}

              {searchParams && isSearching && (
                <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Buscando horas disponibles…</span>
                </div>
              )}

              {searchParams && searchError && (
                <div className="flex flex-col items-center gap-2 h-64 justify-center text-destructive">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">Error al buscar. Intenta nuevamente.</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
                </div>
              )}

              {searchParams && !isSearching && searchResult && (
                <>
                  {/* Scraper status banner */}
                  <div className={`flex items-start gap-2 p-3 rounded-lg mb-4 text-sm ${
                    isLive
                      ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  }`}>
                    {isLive ? (
                      <><Wifi className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Datos en vivo</span> — disponibilidad obtenida directamente desde los portales de las clínicas.
                      </div></>
                    ) : (
                      <><WifiOff className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">Modo demo</span> — los portales bloquean acceso desde servidores cloud (IP de datacenter).
                        {" "}Para datos en vivo, configura <code className="text-xs bg-muted px-1 rounded">SCRAPER_PROXY_URL</code> o despliega desde una IP residencial.
                        {deepLinks.length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer font-medium underline">
                              Ir directamente a los portales de reserva ({deepLinks.length} clínicas)
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {deepLinks.map(dl => (
                                <a key={dl.clinica} href={dl.url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 text-foreground">
                                  {dl.clinica} <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ))}
                            </div>
                          </details>
                        )}
                      </div></>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{slots.length}</span>{" "}
                      hora{slots.length !== 1 ? "s" : ""} disponible{slots.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {slots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center gap-3 border-2 border-dashed rounded-xl text-muted-foreground">
                      <AlertCircle className="h-10 w-10 opacity-30" />
                      <div>
                        <p className="font-medium text-foreground">Sin horas disponibles</p>
                        <p className="text-sm mt-1">
                          No hay horas disponibles para los filtros seleccionados.
                          <br />Prueba con otra región o amplía el rango de fechas.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {slots.map(slot => (
                        <AppointmentCard
                          key={slot.id}
                          slot={slot}
                          onReservar={(s) => {
                            if (!paciente) {
                              toast({
                                variant: "destructive",
                                title: "Falta información del paciente",
                                description: "Primero ingresa tu RUT y nombre en el panel izquierdo.",
                              });
                              return;
                            }
                            setSlotToBook(s);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── Booking confirmation dialog ─────────────────────────────── */}
      <Dialog open={!!slotToBook} onOpenChange={open => !open && setSlotToBook(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar reserva</DialogTitle>
          </DialogHeader>

          {slotToBook && paciente && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p><span className="text-muted-foreground">Paciente:</span>{" "}
                  <span className="font-medium">{paciente.nombre} {paciente.apellido}</span>
                </p>
                <p><span className="text-muted-foreground">RUT:</span>{" "}
                  <span className="font-medium">{paciente.rut}</span>
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p><span className="text-muted-foreground">Médico:</span>{" "}
                  <span className="font-medium">{slotToBook.doctor.nombre}</span>
                </p>
                <p><span className="text-muted-foreground">Clínica:</span>{" "}
                  <span className="font-medium">{slotToBook.clinica.nombre}</span>
                </p>
                <p><span className="text-muted-foreground">Dirección:</span>{" "}
                  {slotToBook.clinica.direccion}, {slotToBook.clinica.comuna}
                </p>
                <p><span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-medium capitalize">
                    {new Date(slotToBook.fecha + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </p>
                <p><span className="text-muted-foreground">Hora:</span>{" "}
                  <span className="font-medium">{slotToBook.hora}</span>
                </p>
                <p><span className="text-muted-foreground">Valor:</span>{" "}
                  <span className="font-medium text-primary">
                    {slotToBook.precio.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 })}
                  </span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSlotToBook(null)} disabled={reservaMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarReserva} disabled={reservaMutation.isPending}>
              {reservaMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Reservando...</>
              ) : (
                "Confirmar reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
