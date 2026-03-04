// ========================================
// Invitation Service — Gestão de convites do tenant
// ========================================

import { supabase } from "@/lib/supabase";
import type { UserRole, InvitationStatus } from "@/types/database";

export interface Invitation {
  id: string;
  tenantId: string;
  token: string;
  role: UserRole;
  invitedEmail: string | null;
  status: InvitationStatus;
  createdBy: string;
  acceptedBy: string | null;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
}

export interface InvitationPreview {
  id: string;
  tenantId: string;
  tenantName: string;
  role: UserRole;
  invitedEmail: string | null;
  expiresAt: string;
}

function rowToInvitation(row: Record<string, unknown>): Invitation {
  return {
    id: row.id as string,
    tenantId: row.tenant_id as string,
    token: row.token as string,
    role: row.role as UserRole,
    invitedEmail: row.invited_email as string | null,
    status: row.status as InvitationStatus,
    createdBy: row.created_by as string,
    acceptedBy: row.accepted_by as string | null,
    expiresAt: row.expires_at as string,
    createdAt: row.created_at as string,
    acceptedAt: row.accepted_at as string | null,
  };
}

/**
 * Lista todos os convites do tenant atual (admin only, RLS).
 */
export async function listTenantInvitations(): Promise<{
  data: Invitation[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const invitations = (data ?? []).map((row) =>
    rowToInvitation(row as unknown as Record<string, unknown>),
  );

  return { data: invitations, error: null };
}

/**
 * Cria um novo convite (admin only).
 */
export async function createInvitation(
  role: UserRole = "viewer",
  invitedEmail?: string | null,
  expiresInDays: number = 7,
): Promise<{
  data: { id: string; token: string } | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc(
    "create_invitation" as never,
    {
      p_role: role,
      p_invited_email: invitedEmail ?? null,
      p_expires_in_days: expiresInDays,
    } as never,
  );

  if (error) {
    return { data: null, error: (error as { message: string }).message };
  }

  const result = data as unknown as { id: string; token: string };
  return { data: result, error: null };
}

/**
 * Busca dados de um convite pelo token (para página de aceitação).
 */
export async function getInvitationByToken(
  token: string,
): Promise<{ data: InvitationPreview | null; error: string | null }> {
  const { data, error } = await supabase.rpc(
    "get_invitation_by_token" as never,
    { p_token: token } as never,
  );

  if (error) {
    return { data: null, error: (error as { message: string }).message };
  }

  const raw = data as unknown as Record<string, unknown>;
  return {
    data: {
      id: raw.id as string,
      tenantId: raw.tenant_id as string,
      tenantName: raw.tenant_name as string,
      role: raw.role as UserRole,
      invitedEmail: raw.invited_email as string | null,
      expiresAt: raw.expires_at as string,
    },
    error: null,
  };
}

/**
 * Aceita um convite (cria profile no tenant do convite).
 */
export async function acceptInvitation(
  token: string,
  fullName: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "accept_invitation" as never,
    { p_token: token, p_full_name: fullName } as never,
  );

  if (error) {
    return { error: (error as { message: string }).message };
  }

  return { error: null };
}

/**
 * Revoga um convite pendente (admin only).
 */
export async function revokeInvitation(
  invitationId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc(
    "revoke_invitation" as never,
    { p_invitation_id: invitationId } as never,
  );

  if (error) {
    return { error: (error as { message: string }).message };
  }

  return { error: null };
}

/**
 * Monta a URL completa do convite a partir do token.
 */
export function buildInviteUrl(token: string): string {
  return `${window.location.origin}/convite/${token}`;
}
