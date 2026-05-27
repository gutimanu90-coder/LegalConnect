import { Link, useLocation } from "wouter";
import { Activity, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/buscar-hora", label: "Buscar Hora" },
    { href: "/#como-funciona", label: "Cómo Funciona" },
    { href: "/#especialidades", label: "Especialidades" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 hover:opacity-80 transition-opacity">
              <Activity className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">HoraMédica</span>
              <span className="hidden sm:inline text-xs font-medium text-muted-foreground border border-border rounded px-1.5 py-0.5">
                Chile
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-muted ${
                  location === link.href ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/buscar-hora">
              <Button size="sm" className="hidden sm:flex">
                Buscar Hora
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <div
                  className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
