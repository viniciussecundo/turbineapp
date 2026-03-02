import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

// Formato de permissão: "module.action" (ex: "leads.create", "clients.delete")
type PermissionString =
  | "dashboard.view"
  | "clients.view"
  | "clients.create"
  | "clients.edit"
  | "clients.delete"
  | "leads.view"
  | "leads.create"
  | "leads.edit"
  | "leads.delete"
  | "finance.view"
  | "finance.create"
  | "finance.edit"
  | "finance.delete"
  | "budgets.view"
  | "budgets.create"
  | "budgets.edit"
  | "budgets.delete"
  | "reports.view"
  | "settings.view"
  | "settings.create"
  | "settings.edit"
  | "settings.delete";

interface CanProps {
  permission: PermissionString;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children apenas se o usuário tiver a permissão especificada.
 * Master admin tem acesso total independente do role.
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  const [module, action] = permission.split(".") as [
    Parameters<typeof can>[0],
    Parameters<typeof can>[1],
  ];

  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}

/**
 * Renderiza children apenas se o usuário NÃO tiver a permissão especificada.
 */
export function CanNot({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  const [module, action] = permission.split(".") as [
    Parameters<typeof can>[0],
    Parameters<typeof can>[1],
  ];

  return !can(module, action) ? <>{children}</> : <>{fallback}</>;
}
