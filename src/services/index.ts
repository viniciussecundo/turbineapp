// ========================================
// Serviços - Índice Central
// Preparado para futura migração para API
// ========================================

export { storage, STORAGE_KEYS } from "./storage";
export { leadService } from "./leadService";
export { clientService } from "./clientService";
export { transactionService } from "./transactionService";
export { walletService } from "./walletService";
export { budgetService } from "./budgetService";

// ========================================
// GUIA DE MIGRAÇÃO PARA API
// ========================================
//
// Quando for migrar para uma API real:
//
// 1. Crie um arquivo api.ts com configuração base:
//    - Base URL
//    - Headers de autenticação
//    - Interceptors de erro
//
// 2. Substitua as chamadas de storage.get/set por fetch/axios:
//    - storage.get() -> await fetch(url).then(r => r.json())
//    - storage.set() -> await fetch(url, { method: 'POST', body })
//
// 3. Torne os métodos async:
//    - getAll() -> async getAll(): Promise<Lead[]>
//
// 4. Atualize o DataContext para usar async/await
//
// 5. Adicione tratamento de loading e erro nos componentes
//
// ========================================
