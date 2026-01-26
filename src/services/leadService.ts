// ========================================
// Serviço de Leads - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/contexts/DataContext";

// Mapeamento de campos (camelCase para snake_case)
const toDbLead = (lead: Partial<Lead>): Record<string, unknown> => ({
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  company: lead.company || null,
  status: lead.status,
  origin: lead.origin,
  value: lead.value || null,
  created_at: lead.createdAt,
  notes: lead.notes || null,
  converted_to_client_id: lead.convertedToClientId || null,
  self_registered: lead.selfRegistered || false,
  viewed: lead.viewed || false,
  followers: lead.followers || null,
  posts: lead.posts || null,
  monthly_budget: lead.monthlyBudget || null,
});

const fromDbLead = (dbLead: Record<string, unknown>): Lead => ({
  id: dbLead.id as number,
  name: dbLead.name as string,
  email: dbLead.email as string,
  phone: dbLead.phone as string,
  company: dbLead.company as string | undefined,
  status: dbLead.status as LeadStatus,
  origin: dbLead.origin as Lead["origin"],
  value: dbLead.value as number | undefined,
  createdAt: dbLead.created_at as string,
  notes: dbLead.notes as string | undefined,
  convertedToClientId: dbLead.converted_to_client_id as number | undefined,
  selfRegistered: dbLead.self_registered as boolean | undefined,
  viewed: dbLead.viewed as boolean | undefined,
  followers: dbLead.followers as number | undefined,
  posts: dbLead.posts as number | undefined,
  monthlyBudget: dbLead.monthly_budget as number | undefined,
});

export const leadService = {
  /**
   * Busca todos os leads
   */
  async getAll(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar leads:", error);
      return [];
    }

    return (data || []).map(fromDbLead);
  },

  /**
   * Busca lead por ID
   */
  async getById(id: number): Promise<Lead | null> {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar lead:", error);
      return null;
    }

    return data ? fromDbLead(data) : null;
  },

  /**
   * Cria novo lead
   */
  async create(
    lead: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered = false,
  ): Promise<Lead | null> {
    const dbData = toDbLead({
      ...lead,
      status: "novo",
      createdAt: new Date().toISOString().split("T")[0],
      selfRegistered,
      viewed: false,
    });

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data, error } = await supabase
      .from("leads")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar lead:", error);
      return null;
    }

    return data ? fromDbLead(data) : null;
  },

  /**
   * Atualiza lead
   */
  async update(id: number, data: Partial<Lead>): Promise<Lead | null> {
    const dbData = toDbLead(data);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data: updated, error } = await supabase
      .from("leads")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar lead:", error);
      return null;
    }

    return updated ? fromDbLead(updated) : null;
  },

  /**
   * Atualiza status do lead
   */
  async updateStatus(id: number, status: LeadStatus): Promise<Lead | null> {
    return this.update(id, { status });
  },

  /**
   * Marca lead como visualizado
   */
  async markAsViewed(id: number): Promise<Lead | null> {
    return this.update(id, { viewed: true });
  },

  /**
   * Marca todos os leads auto-cadastrados como visualizados
   */
  async markAllAsViewed(): Promise<boolean> {
    const { error } = await supabase
      .from("leads")
      .update({ viewed: true })
      .eq("self_registered", true)
      .eq("viewed", false);

    if (error) {
      console.error("Erro ao marcar leads como visualizados:", error);
      return false;
    }

    return true;
  },

  /**
   * Conta leads não visualizados
   */
  async getUnviewedCount(): Promise<number> {
    const { count, error } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("self_registered", true)
      .eq("viewed", false);

    if (error) {
      console.error("Erro ao contar leads não visualizados:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Remove lead
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover lead:", error);
      return false;
    }

    return true;
  },
};

export default leadService;
