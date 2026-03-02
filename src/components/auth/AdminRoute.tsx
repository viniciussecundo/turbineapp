import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Guarda de rota exclusiva para o admin master da Turbine Tech.
 * Verifica se o usuário tem isMasterAdmin: true no profile.
 * Deve ser usado dentro de PrivateRoute (sessão já garantida).
 */
export function AdminRoute() {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!profile?.isMasterAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
