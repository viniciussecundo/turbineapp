// ========================================
// Serviço de Times (Teams) - Supabase
// RF-TEAM-01, RF-TEAM-02, RF-TEAM-03
// ========================================

import { supabase } from "@/lib/supabase";
import { isAbortError } from "@/lib/utils";
import type { TeamMemberRole } from "@/types/database";

// ========================================
// Interfaces de domínio (camelCase)
// ========================================
export interface Team {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: string;
  role: TeamMemberRole;
  createdAt: string;
  // Dados do perfil (preenchidos no join)
  fullName?: string | null;
}

// ========================================
// Mapeamento DB ↔ Domínio
// ========================================
const fromDbTeam = (row: Record<string, unknown>): Team => ({
  id: row.id as number,
  tenantId: row.tenant_id as string,
  name: row.name as string,
  description: (row.description as string) || undefined,
  createdAt: row.created_at as string,
});

const fromDbTeamMember = (row: Record<string, unknown>): TeamMember => {
  const profiles = row.profiles as Record<string, unknown> | undefined;
  return {
    id: row.id as number,
    teamId: row.team_id as number,
    userId: row.user_id as string,
    role: row.role as TeamMemberRole,
    createdAt: row.created_at as string,
    fullName: profiles?.full_name as string | null | undefined,
  };
};

// ========================================
// Service
// ========================================
export const teamService = {
  /**
   * Busca todos os times do tenant
   */
  async getAll(): Promise<Team[]> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (!isAbortError(error)) console.error("Erro ao buscar times:", error);
      return [];
    }

    return (data || []).map((r) =>
      fromDbTeam(r as unknown as Record<string, unknown>),
    );
  },

  /**
   * Busca time por ID
   */
  async getById(id: number): Promise<Team | null> {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar time:", error);
      return null;
    }

    return data
      ? fromDbTeam(data as unknown as Record<string, unknown>)
      : null;
  },

  /**
   * Cria novo time
   */
  async create(
    team: { name: string; description?: string },
    tenantId?: string,
  ): Promise<Team | null> {
    const dbData: Record<string, unknown> = {
      name: team.name,
      description: team.description || null,
    };
    if (tenantId) dbData.tenant_id = tenantId;

    const { data, error } = await supabase
      .from("teams")
      .insert(dbData as never)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar time:", error);
      return null;
    }

    return data
      ? fromDbTeam(data as unknown as Record<string, unknown>)
      : null;
  },

  /**
   * Atualiza time
   */
  async update(
    id: number,
    data: { name?: string; description?: string },
  ): Promise<Team | null> {
    const dbData: Record<string, unknown> = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined)
      dbData.description = data.description || null;

    const { data: updated, error } = await supabase
      .from("teams")
      .update(dbData as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar time:", error);
      return null;
    }

    return updated
      ? fromDbTeam(updated as unknown as Record<string, unknown>)
      : null;
  },

  /**
   * Remove time
   */
  async delete(id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("teams")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Erro ao remover time:", error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  },

  // ========================================
  // Membros do time
  // ========================================

  /**
   * Lista membros de um time (com nome do perfil)
   */
  async getMembers(teamId: number): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, profiles(full_name)")
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (error) {
      if (!isAbortError(error))
        console.error("Erro ao buscar membros do time:", error);
      return [];
    }

    return (data || []).map((r) =>
      fromDbTeamMember(r as unknown as Record<string, unknown>),
    );
  },

  /**
   * Lista todos os membros de todos os times (para contexto global)
   */
  async getAllMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: true });

    if (error) {
      if (!isAbortError(error))
        console.error("Erro ao buscar membros:", error);
      return [];
    }

    return (data || []).map((r) =>
      fromDbTeamMember(r as unknown as Record<string, unknown>),
    );
  },

  /**
   * Adiciona membro ao time
   */
  async addMember(
    teamId: number,
    userId: string,
    role: TeamMemberRole = "member",
  ): Promise<TeamMember | null> {
    const { data, error } = await supabase
      .from("team_members")
      .insert({ team_id: teamId, user_id: userId, role } as never)
      .select("*, profiles(full_name)")
      .single();

    if (error) {
      console.error("Erro ao adicionar membro ao time:", error);
      return null;
    }

    return data
      ? fromDbTeamMember(data as unknown as Record<string, unknown>)
      : null;
  },

  /**
   * Atualiza role do membro
   */
  async updateMemberRole(
    memberId: number,
    role: TeamMemberRole,
  ): Promise<boolean> {
    const { error } = await supabase
      .from("team_members")
      .update({ role } as never)
      .eq("id", memberId);

    if (error) {
      console.error("Erro ao atualizar role do membro:", error);
      return false;
    }

    return true;
  },

  /**
   * Remove membro do time
   */
  async removeMember(memberId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .select();

    if (error) {
      console.error("Erro ao remover membro do time:", error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  },
};

export default teamService;
