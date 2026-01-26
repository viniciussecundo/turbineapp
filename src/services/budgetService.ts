// ========================================
// Serviço de Orçamentos - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import type { Budget, BudgetStatus, BudgetItem } from "@/contexts/DataContext";

// Mapeamento de campos (camelCase para snake_case)
const toDbBudget = (budget: Partial<Budget>): Record<string, unknown> => ({
  code: budget.code,
  client_id: budget.clientId,
  title: budget.title,
  description: budget.description || null,
  items: budget.items || [],
  total_value: budget.totalValue,
  status: budget.status,
  created_at: budget.createdAt,
  valid_until: budget.validUntil,
  sent_at: budget.sentAt || null,
  approved_at: budget.approvedAt || null,
  rejected_at: budget.rejectedAt || null,
  notes: budget.notes || null,
});

const fromDbBudget = (dbBudget: Record<string, unknown>): Budget => ({
  id: dbBudget.id as number,
  code: dbBudget.code as string,
  clientId: dbBudget.client_id as number,
  title: dbBudget.title as string,
  description: dbBudget.description as string | undefined,
  items: dbBudget.items as BudgetItem[],
  totalValue: dbBudget.total_value as number,
  status: dbBudget.status as BudgetStatus,
  createdAt: dbBudget.created_at as string,
  validUntil: dbBudget.valid_until as string,
  sentAt: dbBudget.sent_at as string | undefined,
  approvedAt: dbBudget.approved_at as string | undefined,
  rejectedAt: dbBudget.rejected_at as string | undefined,
  notes: dbBudget.notes as string | undefined,
});

export const budgetService = {
  /**
   * Busca todos os orçamentos
   */
  async getAll(): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar orçamentos:", error);
      return [];
    }

    return (data || []).map(fromDbBudget);
  },

  /**
   * Busca orçamento por ID
   */
  async getById(id: number): Promise<Budget | null> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar orçamento:", error);
      return null;
    }

    return data ? fromDbBudget(data) : null;
  },

  /**
   * Busca orçamentos por cliente
   */
  async getByClientId(clientId: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar orçamentos do cliente:", error);
      return [];
    }

    return (data || []).map(fromDbBudget);
  },

  /**
   * Busca orçamentos por status
   */
  async getByStatus(status: BudgetStatus): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar orçamentos por status:", error);
      return [];
    }

    return (data || []).map(fromDbBudget);
  },

  /**
   * Gera próximo código de orçamento
   */
  async generateCode(): Promise<string> {
    const { count, error } = await supabase
      .from("budgets")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Erro ao gerar código:", error);
      return `ORC-${Date.now()}`;
    }

    const nextNumber = (count || 0) + 1;
    return `ORC-${String(nextNumber).padStart(3, "0")}`;
  },

  /**
   * Cria novo orçamento
   */
  async create(
    budget: Omit<Budget, "id" | "code" | "createdAt">,
  ): Promise<Budget | null> {
    const code = await this.generateCode();
    const dbData = toDbBudget({
      ...budget,
      code,
      createdAt: new Date().toISOString().split("T")[0],
    });

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data, error } = await supabase
      .from("budgets")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar orçamento:", error);
      return null;
    }

    return data ? fromDbBudget(data) : null;
  },

  /**
   * Atualiza orçamento
   */
  async update(id: number, data: Partial<Budget>): Promise<Budget | null> {
    const dbData = toDbBudget(data);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data: updated, error } = await supabase
      .from("budgets")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar orçamento:", error);
      return null;
    }

    return updated ? fromDbBudget(updated) : null;
  },

  /**
   * Atualiza status do orçamento
   */
  async updateStatus(id: number, status: BudgetStatus): Promise<Budget | null> {
    const now = new Date().toISOString().split("T")[0];
    const updates: Partial<Budget> = { status };

    if (status === "sent") updates.sentAt = now;
    if (status === "approved") updates.approvedAt = now;
    if (status === "rejected") updates.rejectedAt = now;

    return this.update(id, updates);
  },

  /**
   * Remove orçamento
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover orçamento:", error);
      return false;
    }

    return true;
  },
};

export default budgetService;
