// ========================================
// Serviço de Atividades/Notificações - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import type { Activity, ActivityType } from "@/contexts/DataContext";

// Mapeamento de campos
const fromDbActivity = (dbActivity: Record<string, unknown>): Activity => ({
  id: dbActivity.id as number,
  type: dbActivity.type as ActivityType,
  title: dbActivity.title as string,
  description: dbActivity.description as string,
  timestamp: dbActivity.timestamp as string,
  read: dbActivity.read as boolean,
  icon: dbActivity.icon as string | undefined,
  link: dbActivity.link as string | undefined,
});

export const activityService = {
  /**
   * Busca todas as atividades (limitado a 50)
   */
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Erro ao buscar atividades:", error);
      return [];
    }

    return (data || []).map(fromDbActivity);
  },

  /**
   * Cria nova atividade
   */
  async create(
    activity: Omit<Activity, "id" | "timestamp" | "read">,
  ): Promise<Activity | null> {
    const { data, error } = await supabase
      .from("activities")
      .insert({
        type: activity.type,
        title: activity.title,
        description: activity.description,
        icon: activity.icon || null,
        link: activity.link || null,
        read: false,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar atividade:", error);
      return null;
    }

    return data ? fromDbActivity(data) : null;
  },

  /**
   * Marca atividade como lida
   */
  async markAsRead(id: number): Promise<boolean> {
    const { error } = await supabase
      .from("activities")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Erro ao marcar atividade como lida:", error);
      return false;
    }

    return true;
  },

  /**
   * Marca todas as atividades como lidas
   */
  async markAllAsRead(): Promise<boolean> {
    const { error } = await supabase
      .from("activities")
      .update({ read: true })
      .eq("read", false);

    if (error) {
      console.error("Erro ao marcar todas as atividades como lidas:", error);
      return false;
    }

    return true;
  },

  /**
   * Conta atividades não lidas
   */
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("read", false);

    if (error) {
      console.error("Erro ao contar atividades não lidas:", error);
      return 0;
    }

    return count || 0;
  },

  /**
   * Limpa todas as atividades
   */
  async clearAll(): Promise<boolean> {
    const { error } = await supabase
      .from("activities")
      .delete()
      .not("id", "is", null); // Deleta todos os registros

    if (error) {
      console.error("Erro ao limpar atividades:", error);
      return false;
    }

    return true;
  },
};

export default activityService;
