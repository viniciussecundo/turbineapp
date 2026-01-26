// ========================================
// Serviço de Carteira Virtual - Supabase
// ========================================

import { supabase } from "@/lib/supabase";
import type { ClientWallet, WalletMovement } from "@/contexts/DataContext";

// Mapeamento de campos para Wallet
const fromDbWallet = (
  dbWallet: Record<string, unknown>,
  movements: WalletMovement[] = [],
): ClientWallet => ({
  id: dbWallet.id as number,
  clientId: dbWallet.client_id as number,
  balance: Number(dbWallet.balance) || 0,
  createdAt: dbWallet.created_at as string,
  movements,
});

// Mapeamento de campos para Movement
const fromDbMovement = (
  dbMovement: Record<string, unknown>,
): WalletMovement => ({
  id: dbMovement.id as number,
  type: dbMovement.type as WalletMovement["type"],
  value: Number(dbMovement.value) || 0,
  date: dbMovement.date as string,
  description: dbMovement.description as string,
});

export const walletService = {
  /**
   * Busca todas as carteiras com movimentações
   */
  async getAll(): Promise<ClientWallet[]> {
    const { data: wallets, error: walletsError } = await supabase
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: false });

    if (walletsError) {
      console.error("Erro ao buscar carteiras:", walletsError);
      return [];
    }

    if (!wallets || wallets.length === 0) return [];

    // Buscar todas as movimentações
    const walletIds = wallets.map((w) => w.id);
    const { data: movements, error: movementsError } = await supabase
      .from("wallet_movements")
      .select("*")
      .in("wallet_id", walletIds)
      .order("date", { ascending: false });

    if (movementsError) {
      console.error("Erro ao buscar movimentações:", movementsError);
    }

    // Agrupar movimentações por carteira
    const movementsByWallet = (movements || []).reduce(
      (acc, mov) => {
        const walletId = mov.wallet_id as number;
        if (!acc[walletId]) acc[walletId] = [];
        acc[walletId].push(fromDbMovement(mov));
        return acc;
      },
      {} as Record<number, WalletMovement[]>,
    );

    return wallets.map((w) =>
      fromDbWallet(w, movementsByWallet[w.id as number] || []),
    );
  },

  /**
   * Busca carteira por ID com movimentações
   */
  async getById(id: number): Promise<ClientWallet | null> {
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("id", id)
      .single();

    if (walletError) {
      console.error("Erro ao buscar carteira:", walletError);
      return null;
    }

    if (!wallet) return null;

    // Buscar movimentações
    const { data: movements, error: movementsError } = await supabase
      .from("wallet_movements")
      .select("*")
      .eq("wallet_id", id)
      .order("date", { ascending: false });

    if (movementsError) {
      console.error("Erro ao buscar movimentações:", movementsError);
    }

    return fromDbWallet(wallet, (movements || []).map(fromDbMovement));
  },

  /**
   * Busca carteira por cliente com movimentações
   */
  async getByClientId(clientId: number): Promise<ClientWallet | null> {
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("client_id", clientId)
      .single();

    if (walletError && walletError.code !== "PGRST116") {
      console.error("Erro ao buscar carteira do cliente:", walletError);
      return null;
    }

    if (!wallet) return null;

    // Buscar movimentações
    const { data: movements, error: movementsError } = await supabase
      .from("wallet_movements")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("date", { ascending: false });

    if (movementsError) {
      console.error("Erro ao buscar movimentações:", movementsError);
    }

    return fromDbWallet(wallet, (movements || []).map(fromDbMovement));
  },

  /**
   * Cria nova carteira
   */
  async create(
    clientId: number,
    initialBalance = 0,
    initialMovement?: Omit<WalletMovement, "id">,
  ): Promise<ClientWallet | null> {
    // Verificar se já existe
    const existing = await this.getByClientId(clientId);
    if (existing) return existing;

    // Criar carteira (com saldo 0 inicialmente, será atualizado pelo trigger)
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .insert({
        client_id: clientId,
        balance: 0,
        created_at: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (walletError) {
      console.error("Erro ao criar carteira:", walletError);
      return null;
    }

    if (!wallet) return null;

    // Criar movimento inicial se fornecido
    if (initialMovement) {
      const { error: movError } = await supabase
        .from("wallet_movements")
        .insert({
          wallet_id: wallet.id,
          type: initialMovement.type,
          value: initialMovement.value,
          date: initialMovement.date,
          description: initialMovement.description,
        });

      if (movError) {
        console.error("Erro ao criar movimento inicial:", movError);
      }
    } else if (initialBalance > 0) {
      // Criar depósito inicial
      const { error: movError } = await supabase
        .from("wallet_movements")
        .insert({
          wallet_id: wallet.id,
          type: "deposit",
          value: initialBalance,
          date: new Date().toISOString().split("T")[0],
          description: "Depósito inicial",
        });

      if (movError) {
        console.error("Erro ao criar depósito inicial:", movError);
      }
    }

    // Retornar carteira atualizada
    return this.getById(wallet.id as number);
  },

  /**
   * Adiciona movimentação na carteira
   */
  async addMovement(
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ): Promise<ClientWallet | null> {
    const { error } = await supabase.from("wallet_movements").insert({
      wallet_id: walletId,
      type: movement.type,
      value: movement.value,
      date: movement.date,
      description: movement.description,
    });

    if (error) {
      console.error("Erro ao adicionar movimentação:", error);
      return null;
    }

    // Retornar carteira atualizada (o trigger já atualizou o saldo)
    return this.getById(walletId);
  },

  /**
   * Atualiza saldo da carteira manualmente
   */
  async updateBalance(
    id: number,
    balance: number,
  ): Promise<ClientWallet | null> {
    const { error } = await supabase
      .from("wallets")
      .update({ balance })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar saldo:", error);
      return null;
    }

    return this.getById(id);
  },

  /**
   * Remove carteira
   */
  async delete(id: number): Promise<boolean> {
    // Movimentações são removidas em cascata
    const { error } = await supabase.from("wallets").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover carteira:", error);
      return false;
    }

    return true;
  },
};

export default walletService;
