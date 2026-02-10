// ========================================
// Profile / Member Service — Gestão de membros do tenant
// ========================================

import { supabase } from "@/lib/supabase";
import type { UserRole, ProfileStatus } from "@/types/database";

export interface TenantMember {
  id: string;
  tenantId: string;
  fullName: string | null;
  email: string | null;
  role: UserRole;
  status: ProfileStatus;
  isMasterAdmin: boolean;
  createdAt: string;
}

// Helper: mapeia row genérico para TenantMember
function rowToMember(row: Record<string, unknown>): TenantMember {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    fullName: row.full_name as string | null,
    email: null,
    role: row.role as UserRole,
    status: row.status as ProfileStatus,
    isMasterAdmin: row.is_master_admin as boolean,
    createdAt: row.created_at as string,
  };
}

/**
 * Lista todos os membros do tenant atual.
 * RLS garante que só retorna profiles do mesmo tenant.
 */
export async function listTenantMembers(): Promise<{
  data: TenantMember[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  const members = (data ?? []).map((row) =>
    rowToMember(row as unknown as Record<string, unknown>),
  );

  return { data: members, error: null };
}

/**
 * Atualiza o role de um membro (somente admin).
 */
export async function updateMemberRole(
  userId: string,
  role: UserRole,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "update_member_role" as never,
    { p_user_id: userId, p_role: role } as never,
  );

  if (error) {
    return { error: (error as { message: string }).message };
  }

  return { error: null };
}

/**
 * Atualiza o status de um membro (somente admin).
 */
export async function updateMemberStatus(
  userId: string,
  status: ProfileStatus,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "update_member_status" as never,
    { p_user_id: userId, p_status: status } as never,
  );

  if (error) {
    return { error: (error as { message: string }).message };
  }

  return { error: null };
}

/**
 * Remove um membro do tenant (somente admin).
 */
export async function removeTenantMember(
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "remove_tenant_member" as never,
    { p_user_id: userId } as never,
  );

  if (error) {
    return { error: (error as { message: string }).message };
  }

  return { error: null };
}

/**
 * Atualiza o próprio perfil (nome).
 */
export async function updateOwnProfile(
  fullName: string,
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Usuário não autenticado" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName } as never)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
