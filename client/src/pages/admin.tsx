import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ClinicaScraperForm } from "@/components/clinica-scraper-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Wifi, WifiOff, Loader2, FlaskConical, ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { REGIONES } from "@shared/chile-data";
import type { ClinicaScraperConfig } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<ClinicaScraperConfig | undefined>(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: configs = [], isLoading } = useQuery<ClinicaScraperConfig[]>({
    queryKey: ["/api/admin/clinicas-scraper"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clinicas-scraper");
      if (!res.ok) throw new Error("Error al cargar configuraciones");
      return res.json();
    },
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/clinicas-scraper"] });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ClinicaScraperConfig, "id" | "creadoEn">) => {
      const res = await apiRequest("POST", "/api/admin/clinicas-scraper", data);
      return res.json();
    },
    onSuccess: () => { invalidate(); setFormOpen(false); toast({ title: "Clínica agregada" }); },
    onError: () => toast({ variant: "destructive", title: "Error al agregar clínica" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<ClinicaScraperConfig, "id" | "creadoEn"> }) => {
      const res = await apiRequest("PUT", `/api/admin/clinicas-scraper/${id}`, data);
      return res.json();
    },
    onSuccess: () => { invalidate(); setFormOpen(false); setEditConfig(undefined); toast({ title: "Cambios guardados" }); },
    onError: () => toast({ variant: "destructive", title: "Error al guardar" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, habilitada }: { id: string; habilitada: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/clinicas-scraper/${id}`, { habilitada });
      return res.json();
    },
    onSuccess: () => invalidate(),
    onError: () => toast({ variant: "destructive", title: "Error al cambiar estado" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/clinicas-scraper/${id}`);
    },
    onSuccess: () => { invalidate(); setDeleteId(null); toast({ title: "Clínica eliminada" }); },
    onError: () => toast({ variant: "destructive", title: "Error al eliminar" }),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleFormSubmit(data: Omit<ClinicaScraperConfig, "id" | "creadoEn">) {
    if (editConfig) {
      await updateMutation.mutateAsync({ id: editConfig.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  function handleEdit(cfg: ClinicaScraperConfig) {
    setEditConfig(cfg);
    setFormOpen(true);
  }

  function handleNew() {
    setEditConfig(undefined);
    setFormOpen(true);
  }

  async function handleTest(cfg: ClinicaScraperConfig) {
    setTestingId(cfg.id);
    try {
      const res = await fetch(`/api/admin/clinicas-scraper/${cfg.id}/test`);
      const data: { reachable: boolean; url: string } = await res.json();
      toast({
        title: data.reachable ? "Sitio accesible" : "Sitio bloqueado",
        description: data.reachable
          ? `${cfg.baseUrl} respondió correctamente.`
          : `${cfg.baseUrl} retornó 403/timeout. Activa SCRAPER_PROXY_URL para IPs residenciales.`,
        variant: data.reachable ? "default" : "destructive",
      });
    } catch {
      toast({ variant: "destructive", title: "Error en test de conexión" });
    } finally {
      setTestingId(null);
    }
  }

  const regionNombre = (id: string) => REGIONES.find(r => r.id === id)?.nombre.replace("Región ", "").replace("de ", "").replace("del ", "") ?? id;

  const enabledCount = configs.filter(c => c.habilitada).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clínicas configuradas</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {configs.length} clínica{configs.length !== 1 ? "s" : ""} — {enabledCount} habilitada{enabledCount !== 1 ? "s" : ""} para scraping
              </p>
            </div>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" /> Nueva clínica
            </Button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center gap-3 justify-center h-40 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Cargando…
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clínica</TableHead>
                    <TableHead>Región / Comuna</TableHead>
                    <TableHead>URL base</TableHead>
                    <TableHead className="text-right">Precio base</TableHead>
                    <TableHead className="text-center">Habilitada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        No hay clínicas configuradas. Agrega la primera.
                      </TableCell>
                    </TableRow>
                  )}
                  {configs.map(cfg => (
                    <TableRow key={cfg.id}>
                      <TableCell>
                        <div className="font-medium">{cfg.nombre}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {cfg.direccion}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">{regionNombre(cfg.regionId)}</div>
                        <div className="text-xs text-muted-foreground">{cfg.comuna}</div>
                      </TableCell>

                      <TableCell>
                        <a
                          href={cfg.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 max-w-[180px] truncate"
                        >
                          {cfg.baseUrl.replace("https://", "").replace("http://", "")}
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      </TableCell>

                      <TableCell className="text-right text-sm font-mono">
                        ${cfg.precioBase.toLocaleString("es-CL")}
                      </TableCell>

                      <TableCell className="text-center">
                        <Switch
                          checked={cfg.habilitada}
                          onCheckedChange={habilitada =>
                            toggleMutation.mutate({ id: cfg.id, habilitada })
                          }
                          disabled={toggleMutation.isPending}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTest(cfg)}
                            disabled={testingId === cfg.id}
                            title="Probar conexión"
                          >
                            {testingId === cfg.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <FlaskConical className="h-3.5 w-3.5" />
                            }
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(cfg)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(cfg.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Info card */}
          <div className="mt-6 p-4 rounded-lg border bg-muted/30 text-sm">
            <p className="font-medium mb-1">¿Cómo funciona?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Cada clínica habilitada se consulta en paralelo cuando un paciente busca hora.</li>
              <li>• La URL de reserva puede incluir <code className="bg-muted px-1 rounded">{"{especialidad}"}</code>, <code className="bg-muted px-1 rounded">{"{ciudad}"}</code>, <code className="bg-muted px-1 rounded">{"{region}"}</code>, <code className="bg-muted px-1 rounded">{"{comuna}"}</code>.</li>
              <li>• El botón <FlaskConical className="inline h-3 w-3" /> prueba si el sitio es accesible desde el servidor (403 = IP bloqueada por Cloudflare).</li>
              <li>• Configura <code className="bg-muted px-1 rounded">SCRAPER_PROXY_URL</code> en el servidor para habilitar scraping en vivo desde IPs residenciales.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Add/Edit form dialog */}
      <ClinicaScraperForm
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open);
          if (!open) setEditConfig(undefined);
        }}
        config={editConfig}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La clínica dejará de incluirse en todas las búsquedas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
