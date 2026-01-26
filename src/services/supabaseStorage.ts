// ========================================
// Camada de Abstração de Storage - Supabase
// ========================================

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ========================================
// Tipos de tabelas do banco
// ========================================
export const TABLES = {
  LEADS: "leads",
  CLIENTS: "clients",
  TRANSACTIONS: "transactions",
  WALLETS: "wallets",
  WALLET_MOVEMENTS: "wallet_movements",
  BUDGETS: "budgets",
  ACTIVITIES: "activities",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];

// ========================================
// Storage Base - Supabase
// ========================================

export const storage = {
  /**
   * Verifica se o Supabase está configurado
   */
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Busca todos os registros de uma tabela
   */
  async getAll<T>(
    table: TableName,
    orderBy?: string,
    ascending = false,
  ): Promise<T[]> {
    try {
      let query = supabase.from(table).select("*");

      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Erro ao buscar ${table}:`, error);
        return [];
      }

      return (data as T[]) || [];
    } catch (error) {
      console.error(`Erro ao buscar ${table}:`, error);
      return [];
    }
  },

  /**
   * Busca um registro por ID
   */
  async getById<T>(table: TableName, id: number): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Erro ao buscar ${table} por ID:`, error);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error(`Erro ao buscar ${table} por ID:`, error);
      return null;
    }
  },

  /**
   * Busca registros com filtro
   */
  async getWhere<T>(
    table: TableName,
    column: string,
    value: unknown,
  ): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(column, value);

      if (error) {
        console.error(`Erro ao buscar ${table} com filtro:`, error);
        return [];
      }

      return (data as T[]) || [];
    } catch (error) {
      console.error(`Erro ao buscar ${table} com filtro:`, error);
      return [];
    }
  },

  /**
   * Insere um novo registro
   */
  async insert<T>(table: TableName, data: Partial<T>): Promise<T | null> {
    try {
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(data as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao inserir em ${table}:`, error);
        return null;
      }

      return inserted as T;
    } catch (error) {
      console.error(`Erro ao inserir em ${table}:`, error);
      return null;
    }
  },

  /**
   * Atualiza um registro
   */
  async update<T>(
    table: TableName,
    id: number,
    data: Partial<T>,
  ): Promise<T | null> {
    try {
      const { data: updated, error } = await supabase
        .from(table)
        .update(data as Record<string, unknown>)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Erro ao atualizar ${table}:`, error);
        return null;
      }

      return updated as T;
    } catch (error) {
      console.error(`Erro ao atualizar ${table}:`, error);
      return null;
    }
  },

  /**
   * Remove um registro
   */
  async delete(table: TableName, id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) {
        console.error(`Erro ao remover de ${table}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Erro ao remover de ${table}:`, error);
      return false;
    }
  },

  /**
   * Remove registros com filtro
   */
  async deleteWhere(
    table: TableName,
    column: string,
    value: unknown,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from(table).delete().eq(column, value);

      if (error) {
        console.error(`Erro ao remover de ${table}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Erro ao remover de ${table}:`, error);
      return false;
    }
  },

  /**
   * Conta registros
   */
  async count(
    table: TableName,
    column?: string,
    value?: unknown,
  ): Promise<number> {
    try {
      let query = supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (column && value !== undefined) {
        query = query.eq(column, value);
      }

      const { count, error } = await query;

      if (error) {
        console.error(`Erro ao contar ${table}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error(`Erro ao contar ${table}:`, error);
      return 0;
    }
  },
};

export { TABLES as STORAGE_KEYS };
