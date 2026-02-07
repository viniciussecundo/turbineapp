import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!isSupabaseConfigured()) {
      setError("Supabase nao configurado.");
      setIsSubmitting(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/update-password`,
      },
    );

    setIsSubmitting(false);

    if (resetError) {
      setError("Nao foi possivel enviar o e-mail. Tente novamente.");
      return;
    }

    setSuccess(true);
  };

  const isSupabaseReady = isSupabaseConfigured();

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-2xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              E-mail enviado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Se o e-mail estiver cadastrado, voce recebera um link para
              redefinir sua senha.
            </p>
            <Link
              to="/login"
              className="text-primary hover:underline text-sm inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Redefinir senha
          </h1>
          <p className="text-muted-foreground">
            Informe seu e-mail para receber o link de recuperacao
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={!isSupabaseReady || isSubmitting}
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            {!isSupabaseReady && (
              <div className="text-sm text-warning">
                Configure o Supabase antes de continuar.
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary"
              disabled={!isSupabaseReady || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar link de recuperacao"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
