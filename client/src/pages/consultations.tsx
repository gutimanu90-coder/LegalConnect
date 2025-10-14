import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Clock, Calendar as CalendarIcon } from "lucide-react";
import type { Consultation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Consultations() {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const { data: consultations, isLoading } = useQuery<Consultation[]>({
    queryKey: ["/api/consultations"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva Confirmada",
        description: "Recibirás un email de confirmación pronto",
      });
      setSelectedConsultation(null);
      setSelectedDate(undefined);
      setSelectedTime("");
      setServiceType("");
      setCustomerName("");
      setCustomerEmail("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo confirmar la reserva",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedConsultation || !selectedDate || !selectedTime || !serviceType || !customerName || !customerEmail) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      consultationId: selectedConsultation.id,
      customerName,
      customerEmail,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      serviceType,
      notes,
    });
  };

  const serviceTypes = [
    "Asesoría General",
    "Revisión de Contratos",
    "Redacción de Documentos",
    "Consulta Específica",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <main className="flex-1">
        <div className="w-full bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold lg:text-5xl" data-testid="text-consultations-title">
                Asesoría Legal Profesional
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Conecta con abogados certificados para resolver tus consultas legales
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-lg bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : consultations && consultations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {consultations.map((consultation) => (
                <Card key={consultation.id} className="hover-elevate transition-all" data-testid={`card-consultation-${consultation.id}`}>
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {consultation.consultantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-lg" data-testid={`text-consultant-name-${consultation.id}`}>
                          {consultation.consultantName}
                        </h3>
                        <p className="text-sm text-muted-foreground" data-testid={`text-specialty-${consultation.id}`}>
                          {consultation.specialty}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-medium" data-testid={`text-rating-${consultation.id}`}>
                            {consultation.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-0 space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-mono font-bold" data-testid={`text-rate-${consultation.id}`}>
                        ${consultation.hourlyRate.toLocaleString('es-CL')}
                      </span>
                      <span className="text-sm text-muted-foreground">CLP/hora</span>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => setSelectedConsultation(consultation)}
                      data-testid={`button-book-${consultation.id}`}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay consultores disponibles</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-booking">
          <DialogHeader>
            <DialogTitle>Agendar Consulta</DialogTitle>
            <DialogDescription>
              {selectedConsultation && `con ${selectedConsultation.consultantName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Servicio *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger data-testid="select-service-type">
                  <SelectValue placeholder="Selecciona un tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
                locale={es}
              />
            </div>

            {selectedDate && selectedConsultation && (
              <div className="space-y-2">
                <Label>Hora *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger data-testid="select-time">
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedConsultation.availableHours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerName">Nombre Completo *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Juan Pérez"
                data-testid="input-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                data-testid="input-customer-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe brevemente tu consulta..."
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <Button 
              onClick={handleBooking} 
              className="w-full" 
              size="lg"
              disabled={bookingMutation.isPending}
              data-testid="button-confirm-booking"
            >
              {bookingMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Procesando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
