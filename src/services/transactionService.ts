// ========================================
// Serviço de Transações (Finanças)
// Preparado para futura migração para API
// ========================================

import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/contexts/DataContext";
import { storage, STORAGE_KEYS } from "./storage";

const KEY = STORAGE_KEYS.TRANSACTIONS;

export const transactionService = {
  /**
   * Busca todas as transações
   * Futuro: GET /api/transactions
   */
  getAll(): Transaction[] {
    return storage.get<Transaction>(KEY);
  },

  /**
   * Busca transação por ID
   * Futuro: GET /api/transactions/:id
   */
  getById(id: number): Transaction | undefined {
    const transactions = this.getAll();
    return transactions.find((t) => t.id === id);
  },

  /**
   * Busca transações por cliente
   * Futuro: GET /api/transactions?clientId=:clientId
   */
  getByClientId(clientId: number): Transaction[] {
    const transactions = this.getAll();
    return transactions.filter((t) => t.clientId === clientId);
  },

  /**
   * Busca transações por tipo
   * Futuro: GET /api/transactions?type=:type
   */
  getByType(type: TransactionType): Transaction[] {
    const transactions = this.getAll();
    return transactions.filter((t) => t.type === type);
  },

  /**
   * Cria nova transação
   * Futuro: POST /api/transactions
   */
  create(transaction: Omit<Transaction, "id">): Transaction {
    const transactions = this.getAll();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now(),
    };
    storage.set(KEY, [...transactions, newTransaction]);
    return newTransaction;
  },

  /**
   * Atualiza transação
   * Futuro: PUT /api/transactions/:id
   */
  update(id: number, data: Partial<Transaction>): Transaction | null {
    const transactions = this.getAll();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;

    transactions[index] = { ...transactions[index], ...data };
    storage.set(KEY, transactions);
    return transactions[index];
  },

  /**
   * Atualiza status da transação
   * Futuro: PATCH /api/transactions/:id/status
   */
  updateStatus(id: number, status: TransactionStatus): Transaction | null {
    return this.update(id, { status });
  },

  /**
   * Remove transação
   * Futuro: DELETE /api/transactions/:id
   */
  delete(id: number): boolean {
    return storage.remove(KEY, id);
  },

  /**
   * Salva lista completa de transações (sync)
   * Usado pelo DataContext para manter compatibilidade
   */
  saveAll(transactions: Transaction[]): boolean {
    return storage.set(KEY, transactions);
  },
};

export default transactionService;
