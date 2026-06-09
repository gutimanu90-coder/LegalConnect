import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { REGIONES, PREVISIONES } from "@shared/chile-data";
import type { ClinicaScraperConfig } from "@shared/schema";

const formSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  regionId: z.string().min(1, "Región requerida"),
  comuna: z.string().min(1, "Comuna requerida"),
  direccion: z.string().min(1, "Dirección requerida"),
  telefono: z.string().min(1, "Teléfono requerido"),
  baseUrl: z.string().url("URL inválida (incluye https://)"),
  bookingUrlTemplate: z.string().min(10, "URL de reserva requerida"),
  previsionAceptadaText: z.string().min(1, "Al menos una previsión"),
  precioBase: z.coerce.number().int().positive("Precio debe ser positivo"),
  habilitada: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ClinicaScraperFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config?: ClinicaScraperConfig;
  onSubmit: (data: Omit<ClinicaScraperConfig, "id" | "creadoEn">) => Promise<void>;
  isSubmitting: boolean;
}

export function ClinicaScraperForm({
  open, onOpenChange, config, onSubmit, isSubmitting,
}: ClinicaScraperFormProps) {
  const isEdit = !!config;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      regionId: "RM",
      comuna: "",
      direccion: "",
      telefono: "",
      baseUrl: "https://",
      bookingUrlTemplate: "https://",
      previsionAceptadaText: "Particular, Fonasa B, Fonasa C, Fonasa D, Banmédica, Colmena, Cruz Blanca, Consalud",
      precioBase: 50000,
      habilitada: true,
    },
  });

  useEffect(() => {
    if (config) {
      form.reset({
        nombre: config.nombre,
        regionId: config.regionId,
        comuna: config.comuna,
        direccion: config.direccion,
        telefono: config.telefono,
        baseUrl: config.baseUrl,
        bookingUrlTemplate: config.bookingUrlTemplate,
        previsionAceptadaText: config.previsionAceptada.join(", "),
        precioBase: config.precioBase,
        habilitada: config.habilitada,
      });
    } else {
      form.reset({
        nombre: "", regionId: "RM", comuna: "", direccion: "", telefono: "",
        baseUrl: "https://", bookingUrlTemplate: "https://",
        previsionAceptadaText: "Particular, Fonasa B, Fonasa C, Fonasa D, Banmédica, Colmena",
        precioBase: 50000, habilitada: true,
      });
    }
  }, [config, open]);

  async function handleSubmit(values: FormValues) {
    const previsionAceptada = values.previsionAceptadaText
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    await onSubmit({
      nombre: values.nombre,
      regionId: values.regionId,
      comuna: values.comuna,
      direccion: values.direccion,
      telefono: values.telefono,
      baseUrl: values.baseUrl,
      bookingUrlTemplate: values.bookingUrlTemplate,
      previsionAceptada,
      precioBase: values.precioBase,
      habilitada: values.habilitada,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar clínica" : "Nueva clínica"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="nombre">Nombre de la clínica *</Label>
              <Input id="nombre" placeholder="Clínica Las Condes" {...form.register("nombre")} />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Región *</Label>
              <Select
                value={form.watch("regionId")}
                onValueChange={v => form.setValue("regionId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONES.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comuna">Comuna *</Label>
              <Input id="comuna" placeholder="Las Condes" {...form.register("comuna")} />
              {form.formState.errors.comuna && (
                <p className="text-xs text-destructive">{form.formState.errors.comuna.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input id="direccion" placeholder="Av. Ejemplo 1234, Las Condes" {...form.register("direccion")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input id="telefono" placeholder="+56 2 2210 0000" {...form.register("telefono")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="precioBase">Precio base (CLP) *</Label>
              <Input id="precioBase" type="number" min={0} step={1000} {...form.register("precioBase")} />
              {form.formState.errors.precioBase && (
                <p className="text-xs text-destructive">{form.formState.errors.precioBase.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="baseUrl">URL base del sitio *</Label>
              <Input id="baseUrl" placeholder="https://www.clinica.cl" {...form.register("baseUrl")} />
              {form.formState.errors.baseUrl && (
                <p className="text-xs text-destructive">{form.formState.errors.baseUrl.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="bookingUrlTemplate">
                URL de reserva (template) *
              </Label>
              <Input
                id="bookingUrlTemplate"
                placeholder="https://www.clinica.cl/agendar?especialidad={especialidad}&ciudad={ciudad}"
                {...form.register("bookingUrlTemplate")}
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles:{" "}
                <code className="bg-muted px-1 rounded">{"{especialidad}"}</code>{" "}
                <code className="bg-muted px-1 rounded">{"{ciudad}"}</code>{" "}
                <code className="bg-muted px-1 rounded">{"{region}"}</code>{" "}
                <code className="bg-muted px-1 rounded">{"{comuna}"}</code>
              </p>
              {form.formState.errors.bookingUrlTemplate && (
                <p className="text-xs text-destructive">{form.formState.errors.bookingUrlTemplate.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="previsionAceptadaText">Previsiones aceptadas *</Label>
              <Textarea
                id="previsionAceptadaText"
                placeholder={PREVISIONES.join(", ")}
                rows={2}
                {...form.register("previsionAceptadaText")}
              />
              <p className="text-xs text-muted-foreground">
                Separadas por coma. Opciones: {PREVISIONES.slice(0, 5).join(", ")}…
              </p>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Switch
                id="habilitada"
                checked={form.watch("habilitada")}
                onCheckedChange={v => form.setValue("habilitada", v)}
              />
              <Label htmlFor="habilitada" className="cursor-pointer">
                {form.watch("habilitada") ? "Habilitada (se incluye en búsquedas)" : "Deshabilitada (excluida de búsquedas)"}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Agregar clínica"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
