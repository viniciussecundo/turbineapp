import { Navigate, Outlet, useLocation, type Location } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function PublicRoute() {
  const { session, isLoading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (session) {
    // Se precisa de onboarding, redireciona para lá
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    const fromPath =
      (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={fromPath} replace />;
  }

  return <Outlet />;
}
