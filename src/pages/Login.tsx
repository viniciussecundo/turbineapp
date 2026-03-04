import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: Location } | null;
    const pathname = state?.from?.pathname;
    // Validate path is internal: must start with "/" but not "//" (protocol-relative external URL)
    if (pathname && pathname.startsWith("/") && !pathname.startsWith("//")) {
      return pathname;
    }
    return "/";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError("E-mail ou senha invalidos. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigate(redirectPath, { replace: true });
  };

  const isSupabaseReady = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Acessar TurbineApp
          </h1>
          <p className="text-muted-foreground">
            Entre com seu e-mail e senha para continuar
          </p>
        </div>

        <div className="glass rounded-2xl p-6 card-shadow animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-primary" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={!isSupabaseReady || isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-primary" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Sua senha"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={!isSupabaseReady || isSubmitting}
              />
            </div>

            {error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : null}

            {!isSupabaseReady ? (
              <div className="text-sm text-warning">
                Configure o Supabase antes de tentar entrar.
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={!isSupabaseReady || isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a
              className="text-sm text-primary hover:underline"
              href="/reset-password"
            >
              Esqueci minha senha
            </a>
          </div>

          <div className="mt-3 text-center text-sm text-muted-foreground">
            Precisa falar com o time?{" "}
            <a className="text-primary hover:underline" href="/cadastro">
              Cadastre seu interesse
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
