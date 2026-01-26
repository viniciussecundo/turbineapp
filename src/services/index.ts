// ========================================
// Serviços - Índice Central
// Usando Supabase como backend
// ========================================

export { leadService } from "./leadService";
export { clientService } from "./clientService";
export { transactionService } from "./transactionService";
export { walletService } from "./walletService";
export { budgetService } from "./budgetService";
export { activityService } from "./activityService";

// Re-export Supabase client and storage
export { supabase, isSupabaseConfigured } from "@/lib/supabase";
export { storage, TABLES } from "./supabaseStorage";
