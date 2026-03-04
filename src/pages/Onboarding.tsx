import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Building2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function Onboarding() {
  const {
    createTenantProfile,
    needsOnboarding,
    session,
    refreshProfile,
    signOut,
  } = useAuth();
  const navigate = useNavigate();
  const [tenantName, setTenantName] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ao montar, tentar recarregar profile (pode já existir)
  useEffect(() => {
    if (session) {
      refreshProfile();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Se não precisa de onboarding, redirecionar (usando <Navigate> ao invés de navigate() no render)
  if (!needsOnboarding && session) {
    return <Navigate to="/" replace />;
  }

  // Se não tem sessão, redirecionar para login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se há um token de convite pendente, redirecionar para a página de convite
  // ao invés de mostrar o form de "Criar Organização"
  const pendingToken = localStorage.getItem("pending_invite_token");
  if (pendingToken) {
    return <Navigate to={`/convite/${pendingToken}`} replace />;
  }

  const handleBackToLogin = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!tenantName.trim()) {
      setError("Informe o nome da sua organização.");
      return;
    }

    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }

    setIsSubmitting(true);

    const result = await createTenantProfile(
      tenantName.trim(),
      fullName.trim(),
    );

    if (result.error) {
      // Se já possui organização, recarregar profile e seguir
      if (result.error.includes("já possui organização")) {
        await refreshProfile();
        setIsSubmitting(false);
        navigate("/", { replace: true });
        return;
      }
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Configure sua Organização
          </h1>
          <p className="text-muted-foreground">
            Último passo! Informe os dados da sua empresa para começar.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 card-shadow animate-in fade-in slide-in-from-bottom-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="tenantName"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-primary" />
                Nome da Organização
              </Label>
              <Input
                id="tenantName"
                type="text"
                required
                value={tenantName}
                onChange={(event) => setTenantName(event.target.value)}
                placeholder="Ex: Minha Agência Digital"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <User className="w-4 h-4 text-primary" />
                Seu Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Seu nome"
                className="bg-secondary/50 border-white/10 focus:border-primary/50"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary text-white hover:opacity-90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando organização..." : "Começar a usar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Você será o administrador desta organização e poderá convidar
          colaboradores depois.
        </p>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="mt-3 mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
