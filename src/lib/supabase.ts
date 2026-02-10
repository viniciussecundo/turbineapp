// ========================================
// Configuração do Supabase Client (tipado)
// ========================================

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env",
  );
}

// Cliente tipado com o schema do banco
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Substitui navigator.locks por noop para evitar AbortError
      // quando React StrictMode desmonta/remonta componentes.
      lock: <R>(
        _name: string,
        _acquireTimeout: number,
        fn: () => Promise<R>,
      ): Promise<R> => {
        return fn();
      },
    },
  },
);

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
