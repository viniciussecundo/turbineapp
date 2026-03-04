import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
      setChecking(false);
    };
    check();
  }, []);

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
    if (!/[A-Z]/.test(pw))
      return "A senha deve conter pelo menos uma letra maiuscula.";
    if (!/[0-9]/.test(pw)) return "A senha deve conter pelo menos um numero.";
    if (!/[^A-Za-z0-9]/.test(pw))
      return "A senha deve conter pelo menos um caractere especial (!@#$...).";
    return null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (updateError) {
      setError("Nao foi possivel atualizar a senha. Tente novamente.");
      return;
    }

    navigate("/", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-xl font-display font-bold text-foreground mb-3">
            Link expirado
          </h1>
          <p className="text-muted-foreground mb-4">
            Solicite um novo link de recuperacao na tela de login.
          </p>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Ir para login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Nova senha
          </h1>
          <p className="text-muted-foreground">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        <div className="glass rounded-2xl p-6 card-shadow animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-primary" />
                Nova senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caracteres, maiuscula, numero e simbolo"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-primary" />
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={isSubmitting}
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
