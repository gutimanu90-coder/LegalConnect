import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TemplateCard } from "@/components/template-card";
import { TrustSection } from "@/components/trust-section";
import { Footer } from "@/components/footer";
import { CartSheet } from "@/components/cart-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Template } from "@shared/schema";
import { useCart } from "@/contexts/cart-context";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { items: cartItems, addItem: addToCart, removeItem: removeFromCart, itemCount } = useCart();

  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates?.map(t => t.category) || []));

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        cartItemCount={itemCount}
        onCartClick={() => setCartOpen(true)}
      />
      
      <main className="flex-1">
        <Hero />

        <section id="plantillas" className="w-full py-16 bg-background">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-semibold text-foreground lg:text-4xl">
                  Explora Nuestras Plantillas
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Encuentra el contrato legal perfecto para tus necesidades
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar plantillas..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-templates"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    data-testid="button-category-all"
                  >
                    Todas
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category)}
                      data-testid={`button-category-filter-${category.toLowerCase()}`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-96 rounded-lg bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredTemplates && filteredTemplates.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground" data-testid="text-no-templates">
                    No se encontraron plantillas
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <TrustSection />
      </main>

      <Footer />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => setLocation("/checkout")}
      />
    </div>
  );
}
