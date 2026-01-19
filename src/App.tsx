import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Financas from "./pages/Financas";
import Clientes from "./pages/Clientes";
import Leads from "./pages/Leads";
import Orcamentos from "./pages/Orcamentos";
import Relatorios from "./pages/Relatorios";
import CadastroPublico from "./pages/CadastroPublico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota pública - sem layout */}
            <Route path="/cadastro" element={<CadastroPublico />} />

            {/* Rotas internas - com layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/financas" element={<Financas />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/orcamentos" element={<Orcamentos />} />
              <Route path="/relatorios" element={<Relatorios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
