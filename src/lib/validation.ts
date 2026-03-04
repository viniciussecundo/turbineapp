// Validação centralizada para formulários

/**
 * Valida e-mail usando regex baseada na spec HTML5 (mais rigorosa que a anterior).
 * Rejeita: domínios sem TLD, TLDs de 1 char, espaços, caracteres inválidos.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email é obrigatório";
  if (email.length > 254) return "Email muito longo";
  if (!EMAIL_REGEX.test(email)) return "Email inválido";
  return null;
}

/**
 * Valida telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular com 9).
 * DDD deve estar entre 11-99. Celulares devem começar com 9 após o DDD.
 */
export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return "Telefone é obrigatório";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11)
    return "Telefone deve ter 10 ou 11 dígitos";
  const ddd = parseInt(digits.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return "DDD inválido";
  if (digits.length === 11 && digits[2] !== "9")
    return "Celular deve começar com 9 após o DDD";
  return null;
}
