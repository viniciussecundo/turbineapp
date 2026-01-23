// ========================================
// Serviço de Orçamentos
// Preparado para futura migração para API
// ========================================

import type { Budget, BudgetStatus } from "@/contexts/DataContext";
import { storage, STORAGE_KEYS } from "./storage";

const KEY = STORAGE_KEYS.BUDGETS;

export const budgetService = {
  /**
   * Busca todos os orçamentos
   * Futuro: GET /api/budgets
   */
  getAll(): Budget[] {
    return storage.get<Budget>(KEY);
  },

  /**
   * Busca orçamento por ID
   * Futuro: GET /api/budgets/:id
   */
  getById(id: number): Budget | undefined {
    const budgets = this.getAll();
    return budgets.find((budget) => budget.id === id);
  },

  /**
   * Busca orçamentos por cliente
   * Futuro: GET /api/budgets?clientId=:clientId
   */
  getByClientId(clientId: number): Budget[] {
    const budgets = this.getAll();
    return budgets.filter((budget) => budget.clientId === clientId);
  },

  /**
   * Busca orçamentos por status
   * Futuro: GET /api/budgets?status=:status
   */
  getByStatus(status: BudgetStatus): Budget[] {
    const budgets = this.getAll();
    return budgets.filter((budget) => budget.status === status);
  },

  /**
   * Cria novo orçamento
   * Futuro: POST /api/budgets
   */
  create(budget: Omit<Budget, "id" | "code" | "createdAt">): Budget {
    const budgets = this.getAll();
    const nextNumber = budgets.length + 1;
    const newBudget: Budget = {
      ...budget,
      id: Date.now(),
      code: `ORC-${String(nextNumber).padStart(3, "0")}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    storage.set(KEY, [...budgets, newBudget]);
    return newBudget;
  },

  /**
   * Atualiza orçamento
   * Futuro: PUT /api/budgets/:id
   */
  update(id: number, data: Partial<Budget>): Budget | null {
    const budgets = this.getAll();
    const index = budgets.findIndex((budget) => budget.id === id);
    if (index === -1) return null;

    budgets[index] = { ...budgets[index], ...data };
    storage.set(KEY, budgets);
    return budgets[index];
  },

  /**
   * Atualiza status do orçamento
   * Futuro: PATCH /api/budgets/:id/status
   */
  updateStatus(id: number, status: BudgetStatus): Budget | null {
    const now = new Date().toISOString().split("T")[0];
    const updates: Partial<Budget> = { status };

    if (status === "sent") updates.sentAt = now;
    if (status === "approved") updates.approvedAt = now;
    if (status === "rejected") updates.rejectedAt = now;

    return this.update(id, updates);
  },

  /**
   * Remove orçamento
   * Futuro: DELETE /api/budgets/:id
   */
  delete(id: number): boolean {
    return storage.remove(KEY, id);
  },

  /**
   * Salva lista completa de orçamentos (sync)
   * Usado pelo DataContext para manter compatibilidade
   */
  saveAll(budgets: Budget[]): boolean {
    return storage.set(KEY, budgets);
  },
};

export default budgetService;
