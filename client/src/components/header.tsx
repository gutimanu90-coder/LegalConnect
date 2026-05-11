import { Link } from "wouter";
import { ShoppingCart, Scale, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export function Header({ cartItemCount = 0, onCartClick }: HeaderProps) {
  const categories = [
    { name: "Laboral", href: "/?category=laboral" },
    { name: "Empresarial", href: "/?category=empresarial" },
    { name: "Inmobiliario", href: "/?category=inmobiliario" },
    { name: "Civil", href: "/?category=civil" },
    { name: "Comercial", href: "/?category=comercial" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 cursor-pointer" data-testid="link-home">
              <Scale className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">LegalDocs</span>
            </div>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger data-testid="button-categories">Categorías</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <Link href={category.href}>
                          <div className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover-elevate active-elevate-2 cursor-pointer" data-testid={`link-category-${category.name.toLowerCase()}`}>
                            <div className="text-sm font-medium leading-none">{category.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Plantillas legales de {category.name.toLowerCase()}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <Link href="/reporte-credito">
              <Button variant="outline" className="hidden sm:flex" data-testid="button-credit-report">
                Reporte de Crédito
              </Button>
            </Link>
            <Link href="/consultas">
              <Button variant="default" className="hidden sm:flex" data-testid="button-book-consultation">
                Agendar Consulta
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <ThemeToggle />

            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
