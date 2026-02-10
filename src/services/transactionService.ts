// ========================================
// Serviço de Transações - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import { isAbortError } from "@/lib/utils";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/contexts/DataContext";

// Mapeamento de campos (camelCase para snake_case)
const toDbTransaction = (
  transaction: Partial<Transaction>,
  tenantId?: string,
): Record<string, unknown> => {
  const data: Record<string, unknown> = {
    type: transaction.type,
    description: transaction.description,
    value: transaction.value,
    date: transaction.date,
    category: transaction.category,
    status: transaction.status,
    client_id: transaction.clientId || null,
    budget_id: transaction.budgetId || null,
    notes: transaction.notes || null,
  };
  if (tenantId) data.tenant_id = tenantId;
  return data;
};

const fromDbTransaction = (
  dbTransaction: Record<string, unknown>,
): Transaction => ({
  id: dbTransaction.id as number,
  type: dbTransaction.type as TransactionType,
  description: dbTransaction.description as string,
  value: dbTransaction.value as number,
  date: dbTransaction.date as string,
  category: dbTransaction.category as string,
  status: dbTransaction.status as TransactionStatus,
  clientId: dbTransaction.client_id as number | undefined,
  budgetId: dbTransaction.budget_id as number | undefined,
  notes: dbTransaction.notes as string | undefined,
});

export const transactionService = {
  /**
   * Busca todas as transações
   */
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      if (!isAbortError(error))
        console.error("Erro ao buscar transações:", error);
      return [];
    }

    return (data || []).map(fromDbTransaction);
  },

  /**
   * Busca transação por ID
   */
  async getById(id: number): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar transação:", error);
      return null;
    }

    return data ? fromDbTransaction(data) : null;
  },

  /**
   * Busca transações por cliente
   */
  async getByClientId(clientId: number): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Erro ao buscar transações do cliente:", error);
      return [];
    }

    return (data || []).map(fromDbTransaction);
  },

  /**
   * Busca transações por tipo
   */
  async getByType(type: TransactionType): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) {
      console.error("Erro ao buscar transações por tipo:", error);
      return [];
    }

    return (data || []).map(fromDbTransaction);
  },

  /**
   * Cria nova transação
   */
  async create(
    transaction: Omit<Transaction, "id">,
    tenantId?: string,
  ): Promise<Transaction | null> {
    const dbData = toDbTransaction(transaction, tenantId);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data, error } = await supabase
      .from("transactions")
      .insert(dbData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar transação:", error);
      return null;
    }

    return data ? fromDbTransaction(data) : null;
  },

  /**
   * Atualiza transação
   */
  async update(
    id: number,
    data: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const dbData = toDbTransaction(data);

    // Remove campos undefined
    Object.keys(dbData).forEach((key) => {
      if (dbData[key] === undefined) delete dbData[key];
    });

    const { data: updated, error } = await supabase
      .from("transactions")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar transação:", error);
      return null;
    }

    return updated ? fromDbTransaction(updated) : null;
  },

  /**
   * Atualiza status da transação
   */
  async updateStatus(
    id: number,
    status: TransactionStatus,
  ): Promise<Transaction | null> {
    return this.update(id, { status });
  },

  /**
   * Remove transação
   */
  async delete(id: number): Promise<boolean> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover transação:", error);
      return false;
    }

    return true;
  },

  /**
   * Remove transações por budgetId
   */
  async deleteByBudgetId(budgetId: number): Promise<boolean> {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("budget_id", budgetId);

    if (error) {
      console.error("Erro ao remover transações do orçamento:", error);
      return false;
    }

    return true;
  },

  /**
   * Calcula totais (income, expense)
   */
  async getTotals(): Promise<{ income: number; expense: number }> {
    const transactions = await this.getAll();

    const income = transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.value, 0);

    const expense = transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.value, 0);

    return { income, expense };
  },
};

export default transactionService;
