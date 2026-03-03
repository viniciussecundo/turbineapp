import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/database";

// ========================================
// Mapa de permissões por role (RBAC básico)
// ========================================
// Baseado em RF-RBAC-01 do PRD:
// - admin: acesso total
// - sales: leads, clientes, orçamentos
// - finance: finanças, orçamentos, relatórios
// - viewer: somente leitura em tudo

type Module =
  | "dashboard"
  | "clients"
  | "leads"
  | "finance"
  | "budgets"
  | "reports"
  | "settings"
  | "teams";

type Action = "view" | "create" | "edit" | "delete";

const PERMISSIONS: Record<UserRole, Record<Module, Action[]>> = {
  admin: {
    dashboard: ["view"],
    clients: ["view", "create", "edit", "delete"],
    leads: ["view", "create", "edit", "delete"],
    finance: ["view", "create", "edit", "delete"],
    budgets: ["view", "create", "edit", "delete"],
    reports: ["view"],
    settings: ["view", "create", "edit", "delete"],
    teams: ["view", "create", "edit", "delete"],
  },
  sales: {
    dashboard: ["view"],
    clients: ["view", "create", "edit"],
    leads: ["view", "create", "edit"],
    finance: [],
    budgets: ["view", "create", "edit"],
    reports: ["view"],
    settings: ["view"],
    teams: ["view"],
  },
  finance: {
    dashboard: ["view"],
    clients: ["view"],
    leads: [],
    finance: ["view", "create", "edit", "delete"],
    budgets: ["view", "create", "edit"],
    reports: ["view"],
    settings: ["view"],
    teams: ["view"],
  },
  viewer: {
    dashboard: ["view"],
    clients: ["view"],
    leads: ["view"],
    finance: ["view"],
    budgets: ["view"],
    reports: ["view"],
    settings: ["view"],
    teams: ["view"],
  },
};

export interface Permissions {
  role: UserRole | null;
  isMasterAdmin: boolean;
  can: (module: Module, action: Action) => boolean;
  canAccessModule: (module: Module) => boolean;
}

export function usePermissions(): Permissions {
  const { profile } = useAuth();
  const role = profile?.role ?? null;
  const isMasterAdmin = profile?.isMasterAdmin ?? false;

  const can = (module: Module, action: Action): boolean => {
    // Master admin pode tudo
    if (isMasterAdmin) return true;
    if (!role) return false;
    return PERMISSIONS[role][module]?.includes(action) ?? false;
  };

  const canAccessModule = (module: Module): boolean => {
    if (isMasterAdmin) return true;
    if (!role) return false;
    return (PERMISSIONS[role][module]?.length ?? 0) > 0;
  };

  return { role, isMasterAdmin, can, canAccessModule };
}

// Helper: mapear path de rota para módulo
export function routeToModule(path: string): Module | null {
  if (path === "/") return "dashboard";
  if (path.startsWith("/clientes")) return "clients";
  if (path.startsWith("/leads")) return "leads";
  if (path.startsWith("/financas")) return "finance";
  if (path.startsWith("/orcamentos")) return "budgets";
  if (path.startsWith("/relatorios")) return "reports";
  if (path.startsWith("/configuracoes")) return "settings";
  if (path.startsWith("/times")) return "teams";
  return null;
}
