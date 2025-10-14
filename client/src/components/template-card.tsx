import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, FilePlus } from "lucide-react";
import type { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template;
  onAddToCart: (template: Template) => void;
}

export function TemplateCard({ template, onAddToCart }: TemplateCardProps) {
  return (
    <Card className="h-full flex flex-col hover-elevate transition-all duration-200" data-testid={`card-template-${template.id}`}>
      <CardHeader className="space-y-4 p-6">
        <div className="aspect-[4/3] w-full rounded-md bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <FileText className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <Badge className="bg-accent/20 text-accent-foreground border-accent/30" data-testid={`badge-category-${template.id}`}>
            {template.category}
          </Badge>
          <h3 className="text-xl font-semibold leading-tight" data-testid={`text-template-name-${template.id}`}>
            {template.name}
          </h3>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-6 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-description-${template.id}`}>
          {template.description}
        </p>
        <div className="flex gap-2 mt-4">
          {template.formats.map((format) => (
            <Badge key={format} variant="outline" className="text-xs" data-testid={`badge-format-${format}-${template.id}`}>
              {format}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 p-6 pt-0">
        <div className="flex items-baseline gap-2 w-full">
          <span className="text-3xl font-mono font-semibold text-foreground" data-testid={`text-price-${template.id}`}>
            ${template.price.toLocaleString('es-CL')}
          </span>
          <span className="text-sm text-muted-foreground">CLP</span>
        </div>
        <div className="flex gap-2 w-full">
          <Link href={`/plantilla/${template.id}`}>
            <Button variant="outline" className="flex-1" data-testid={`button-details-${template.id}`}>
              Ver Detalles
            </Button>
          </Link>
          <Button 
            onClick={() => onAddToCart(template)}
            className="flex-1"
            data-testid={`button-add-cart-${template.id}`}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
