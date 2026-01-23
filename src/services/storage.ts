// ========================================
// Camada de Abstração de Storage
// Preparado para futura migração para API
// ========================================

const STORAGE_KEYS = {
  LEADS: "turbine_leads",
  CLIENTS: "turbine_clients",
  TRANSACTIONS: "turbine_transactions",
  WALLETS: "turbine_wallets",
  BUDGETS: "turbine_budgets",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ========================================
// Storage Base - LocalStorage (atual)
// Substitua por chamadas de API no futuro
// ========================================

export const storage = {
  /**
   * Busca dados do storage
   * Futuro: GET /api/{resource}
   */
  get<T>(key: StorageKey, defaultValue: T[] = []): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Erro ao ler ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Salva dados no storage
   * Futuro: POST/PUT /api/{resource}
   */
  set<T>(key: StorageKey, data: T[]): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      return false;
    }
  },

  /**
   * Remove item específico (por id)
   * Futuro: DELETE /api/{resource}/{id}
   */
  remove(key: StorageKey, id: number): boolean {
    try {
      const data = this.get(key) as { id: number }[];
      const filtered = data.filter((item) => item.id !== id);
      return this.set(key, filtered);
    } catch (error) {
      console.error(`Erro ao remover item de ${key}:`, error);
      return false;
    }
  },

  /**
   * Limpa todos os dados de uma chave
   * Futuro: DELETE /api/{resource}
   */
  clear(key: StorageKey): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Erro ao limpar ${key}:`, error);
      return false;
    }
  },
};

export { STORAGE_KEYS };
