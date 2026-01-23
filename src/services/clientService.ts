// ========================================
// Serviço de Clientes
// Preparado para futura migração para API
// ========================================

import type { Client, ClientStatus } from "@/contexts/DataContext";
import { storage, STORAGE_KEYS } from "./storage";

const KEY = STORAGE_KEYS.CLIENTS;

export const clientService = {
  /**
   * Busca todos os clientes
   * Futuro: GET /api/clients
   */
  getAll(): Client[] {
    return storage.get<Client>(KEY);
  },

  /**
   * Busca cliente por ID
   * Futuro: GET /api/clients/:id
   */
  getById(id: number): Client | undefined {
    const clients = this.getAll();
    return clients.find((client) => client.id === id);
  },

  /**
   * Busca cliente por leadId
   * Futuro: GET /api/clients?leadId=:leadId
   */
  getByLeadId(leadId: number): Client | undefined {
    const clients = this.getAll();
    return clients.find((client) => client.leadId === leadId);
  },

  /**
   * Cria novo cliente
   * Futuro: POST /api/clients
   */
  create(client: Omit<Client, "id">): Client {
    const clients = this.getAll();
    const newClient: Client = {
      ...client,
      id: Date.now(),
    };
    storage.set(KEY, [...clients, newClient]);
    return newClient;
  },

  /**
   * Atualiza cliente
   * Futuro: PUT /api/clients/:id
   */
  update(id: number, data: Partial<Client>): Client | null {
    const clients = this.getAll();
    const index = clients.findIndex((client) => client.id === id);
    if (index === -1) return null;

    clients[index] = { ...clients[index], ...data };
    storage.set(KEY, clients);
    return clients[index];
  },

  /**
   * Atualiza status do cliente
   * Futuro: PATCH /api/clients/:id/status
   */
  updateStatus(id: number, status: ClientStatus): Client | null {
    return this.update(id, { status });
  },

  /**
   * Remove cliente
   * Futuro: DELETE /api/clients/:id
   */
  delete(id: number): boolean {
    return storage.remove(KEY, id);
  },

  /**
   * Salva lista completa de clientes (sync)
   * Usado pelo DataContext para manter compatibilidade
   */
  saveAll(clients: Client[]): boolean {
    return storage.set(KEY, clients);
  },
};

export default clientService;
