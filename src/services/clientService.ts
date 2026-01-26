// ========================================
// Serviço de Clientes - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import type {
  Client,
  ClientStatus,
  ProfileAnalysis,
  LeadOrigin,
} from "@/contexts/DataContext";

// Mapeamento de campos (camelCase para snake_case)
const toDbClient = (client: Partial<Client>): Record<string, unknown> => ({
  name: client.name,
  email: client.email,
  phone: client.phone,
  status: client.status,
  projects: client.projects,
  value: client.value,
  avatar: client.avatar || null,
  responsible: client.responsible || null,
  social_media: client.socialMedia || null,
  lead_id: client.leadId || null,
  origin: client.origin || null,
  converted_at: client.convertedAt || null,
  profile_analysis: client.profileAnalysis || null,
});

const fromDbClient = (dbClient: Record<string, unknown>): Client => ({
  id: dbClient.id as number,
  name: dbClient.name as string,
  email: dbClient.email as string,
  phone: dbClient.phone as string,
  status: dbClient.status as ClientStatus,
  projects: dbClient.projects as number,
  value: dbClient.value as number,
  avatar: dbClient.avatar as string | undefined,
  responsible: dbClient.responsible as string | undefined,
  socialMedia: dbClient.social_media as Client["socialMedia"],
  leadId: dbClient.lead_id as number | undefined,
  origin: dbClient.origin as LeadOrigin | undefined,
  convertedAt: dbClient.converted_at as string | undefined,
  profileAnalysis: dbClient.profile_analysis as ProfileAnalysis | undefined,
});

export const clientService = {
  /**
   * Busca todos os clientes
   */
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }

    return (data || []).map(fromDbClient);
  },

  /**
   * Busca cliente por ID
   */
  async getById(id: number): Promise<Client | null> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }

    return data ? fromDbClient(data) : null;
  },

  /**
   * Busca cliente por leadId
   */
  async getByLeadId(leadId: number): Promise<Client | null> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("lead_id", leadId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Erro ao buscar cliente por leadId:", error);
      return null;
    }

    return data ? fromDbClient(data) : null;
  },

  /**
   * Cria novo cliente
   */
  async create(client: Omit<Client, "id">): Promise<Client | null> {
    const dbData = toDbClient(client);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data, error } = await supabase
      .from("clients")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }

    return data ? fromDbClient(data) : null;
  },

  /**
   * Atualiza cliente
   */
  async update(id: number, data: Partial<Client>): Promise<Client | null> {
    const dbData = toDbClient(data);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data: updated, error } = await supabase
      .from("clients")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return null;
    }

    return updated ? fromDbClient(updated) : null;
  },

  /**
   * Atualiza status do cliente
   */
  async updateStatus(id: number, status: ClientStatus): Promise<Client | null> {
    return this.update(id, { status });
  },

  /**
   * Remove cliente
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover cliente:", error);
      return false;
    }

    return true;
  },

  /**
   * Remove referência do lead de um cliente
   */
  async removeLeadReference(leadId: number): Promise<boolean> {
    const { error } = await supabase
      .from("clients")
      .update({ lead_id: null, origin: null })
      .eq("lead_id", leadId);

    if (error) {
      console.error("Erro ao remover referência do lead:", error);
      return false;
    }

    return true;
  },
};

export default clientService;
