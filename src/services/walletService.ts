// ========================================
// Serviço de Carteira Virtual
// Preparado para futura migração para API
// ========================================

import type { ClientWallet, WalletMovement } from "@/contexts/DataContext";
import { storage, STORAGE_KEYS } from "./storage";

const KEY = STORAGE_KEYS.WALLETS;

export const walletService = {
  /**
   * Busca todas as carteiras
   * Futuro: GET /api/wallets
   */
  getAll(): ClientWallet[] {
    return storage.get<ClientWallet>(KEY);
  },

  /**
   * Busca carteira por ID
   * Futuro: GET /api/wallets/:id
   */
  getById(id: number): ClientWallet | undefined {
    const wallets = this.getAll();
    return wallets.find((w) => w.id === id);
  },

  /**
   * Busca carteira por cliente
   * Futuro: GET /api/wallets?clientId=:clientId
   */
  getByClientId(clientId: number): ClientWallet | undefined {
    const wallets = this.getAll();
    return wallets.find((w) => w.clientId === clientId);
  },

  /**
   * Cria nova carteira
   * Futuro: POST /api/wallets
   */
  create(clientId: number, initialBalance = 0): ClientWallet {
    const wallets = this.getAll();
    const newWallet: ClientWallet = {
      id: Date.now(),
      clientId,
      balance: initialBalance,
      movements: [],
      createdAt: new Date().toISOString().split("T")[0],
    };
    storage.set(KEY, [...wallets, newWallet]);
    return newWallet;
  },

  /**
   * Adiciona movimentação na carteira
   * Futuro: POST /api/wallets/:id/movements
   */
  addMovement(
    walletId: number,
    movement: Omit<WalletMovement, "id">,
  ): ClientWallet | null {
    const wallets = this.getAll();
    const index = wallets.findIndex((w) => w.id === walletId);
    if (index === -1) return null;

    const newMovement: WalletMovement = {
      ...movement,
      id: Date.now(),
    };

    const wallet = wallets[index];
    wallet.movements.push(newMovement);
    wallet.balance +=
      movement.type === "deposit" ? movement.value : -movement.value;

    storage.set(KEY, wallets);
    return wallet;
  },

  /**
   * Atualiza saldo da carteira
   * Futuro: PATCH /api/wallets/:id/balance
   */
  updateBalance(id: number, balance: number): ClientWallet | null {
    const wallets = this.getAll();
    const index = wallets.findIndex((w) => w.id === id);
    if (index === -1) return null;

    wallets[index].balance = balance;
    storage.set(KEY, wallets);
    return wallets[index];
  },

  /**
   * Remove carteira
   * Futuro: DELETE /api/wallets/:id
   */
  delete(id: number): boolean {
    return storage.remove(KEY, id);
  },

  /**
   * Salva lista completa de carteiras (sync)
   * Usado pelo DataContext para manter compatibilidade
   */
  saveAll(wallets: ClientWallet[]): boolean {
    return storage.set(KEY, wallets);
  },
};

export default walletService;
