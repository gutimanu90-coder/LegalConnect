import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">Página No Encontrada</h1>
          
          <p className="text-muted-foreground leading-relaxed">
            La página que buscas no existe o ha sido movida.
          </p>

          <Link href="/">
            <Button className="w-full" size="lg" data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
