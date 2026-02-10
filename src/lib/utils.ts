import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detecta se um erro é um AbortError (request cancelado por desmontagem/navegação).
 * Esses erros são inofensivos e podem ser silenciados.
 */
export function isAbortError(error: unknown): boolean {
  if (!error) return false;
  // Supabase wraps AbortError in its error object
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;
    if (e.name === "AbortError") return true;
    if (typeof e.message === "string" && e.message.includes("AbortError"))
      return true;
    if (typeof e.details === "string" && e.details.includes("AbortError"))
      return true;
    if (typeof e.code === "string" && e.code === "ABORT_ERR") return true;
  }
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return false;
}
