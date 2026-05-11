import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/cart-context";
import Home from "@/pages/home";
import TemplateDetail from "@/pages/template-detail";
import Checkout from "@/pages/checkout";
import Consultations from "@/pages/consultations";
import CreditReport from "@/pages/credit-report";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/plantilla/:id" component={TemplateDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/consultas" component={Consultations} />
      <Route path="/reporte-credito" component={CreditReport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
