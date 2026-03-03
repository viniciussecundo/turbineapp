import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { PageTransition } from "./components/PageTransition";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { RoleRoute } from "./components/auth/RoleRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import Index from "./pages/Index";
import Financas from "./pages/Financas";
import Clientes from "./pages/Clientes";
import Leads from "./pages/Leads";
import Orcamentos from "./pages/Orcamentos";
import Relatorios from "./pages/Relatorios";
import Settings from "./pages/Settings";
import CadastroPublico from "./pages/CadastroPublico";
import Login from "./pages/Login";

import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Admin from "./pages/Admin";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTransition>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />

                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Rota de atualizacao de senha (precisa de sessao via link) */}
                <Route path="/update-password" element={<UpdatePassword />} />

                {/* Rota de onboarding (autenticado sem profile) */}
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Rota pública - sem layout */}
                <Route path="/cadastro" element={<CadastroPublico />} />

                {/* Rotas internas - com layout + RBAC */}
                <Route element={<PrivateRoute />}>
                  {/* Painel Admin Master */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>

                  <Route element={<RoleRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/financas" element={<Financas />} />
                      <Route path="/clientes" element={<Clientes />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/orcamentos" element={<Orcamentos />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="/configuracoes" element={<Settings />} />
                      <Route path="/times" element={<Teams />} />
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
