import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePermissions, routeToModule } from "@/hooks/use-permissions";

/**
 * Guarda de rota baseada em RBAC.
 * Verifica se o usuário tem acesso ao módulo correspondente à rota atual.
 * Deve ser usado dentro de PrivateRoute (sessão já garantida).
 */
export function RoleRoute() {
  const location = useLocation();
  const { role, canAccessModule } = usePermissions();

  // Se o profile/role ainda não carregou, libera (PrivateRoute já garante sessão)
  if (!role) {
    return <Outlet />;
  }

  const mod = routeToModule(location.pathname);

  // Se não é um módulo conhecido ou tem permissão, libera
  if (!mod || canAccessModule(mod)) {
    return <Outlet />;
  }

  // Sem permissão → redireciona pro dashboard
  return <Navigate to="/" replace />;
}
