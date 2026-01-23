// ========================================
// Serviço de Leads
// Preparado para futura migração para API
// ========================================

import type { Lead, LeadStatus } from "@/contexts/DataContext";
import { storage, STORAGE_KEYS } from "./storage";

const KEY = STORAGE_KEYS.LEADS;

export const leadService = {
  /**
   * Busca todos os leads
   * Futuro: GET /api/leads
   */
  getAll(): Lead[] {
    return storage.get<Lead>(KEY);
  },

  /**
   * Busca lead por ID
   * Futuro: GET /api/leads/:id
   */
  getById(id: number): Lead | undefined {
    const leads = this.getAll();
    return leads.find((lead) => lead.id === id);
  },

  /**
   * Cria novo lead
   * Futuro: POST /api/leads
   */
  create(
    lead: Omit<Lead, "id" | "createdAt" | "status">,
    selfRegistered = false,
  ): Lead {
    const leads = this.getAll();
    const newLead: Lead = {
      ...lead,
      id: Date.now(),
      status: "novo" as LeadStatus,
      createdAt: new Date().toISOString().split("T")[0],
      selfRegistered,
    };
    storage.set(KEY, [...leads, newLead]);
    return newLead;
  },

  /**
   * Atualiza lead
   * Futuro: PUT /api/leads/:id
   */
  update(id: number, data: Partial<Lead>): Lead | null {
    const leads = this.getAll();
    const index = leads.findIndex((lead) => lead.id === id);
    if (index === -1) return null;

    leads[index] = { ...leads[index], ...data };
    storage.set(KEY, leads);
    return leads[index];
  },

  /**
   * Atualiza status do lead
   * Futuro: PATCH /api/leads/:id/status
   */
  updateStatus(id: number, status: LeadStatus): Lead | null {
    return this.update(id, { status });
  },

  /**
   * Remove lead
   * Futuro: DELETE /api/leads/:id
   */
  delete(id: number): boolean {
    return storage.remove(KEY, id);
  },

  /**
   * Salva lista completa de leads (sync)
   * Usado pelo DataContext para manter compatibilidade
   */
  saveAll(leads: Lead[]): boolean {
    return storage.set(KEY, leads);
  },
};

export default leadService;
