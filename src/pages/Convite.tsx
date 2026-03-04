import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Lock,
  Loader2,
  UserPlus,
  AlertCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getInvitationByToken,
  type InvitationPreview,
} from "@/services/invitationService";
import type { UserRole } from "@/types/database";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  sales: "Vendas",
  finance: "Financeiro",
  viewer: "Leitura",
};

const roleBadgeVariant: Record<UserRole, string> = {
  admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  sales: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  finance: "bg-green-500/10 text-green-400 border-green-500/20",
  viewer: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

type PageState = "loading" | "error" | "signup" | "accept" | "already_member";

export default function Convite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const {
    user,
    session,
    profile,
    isLoading: authLoading,
    acceptInviteAndJoin,
  } = useAuth();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invite, setInvite] = useState<InvitationPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Login mode toggle (for existing users without org)
  const [showLogin, setShowLogin] = useState(false);

  const loadInvite = useCallback(async () => {
    if (!token) {
      setErrorMessage("Link de convite inválido.");
      setPageState("error");
      return;
    }

    const result = await getInvitationByToken(token);
    if (result.error) {
      setErrorMessage(result.error);
      setPageState("error");
      return;
    }

    setInvite(result.data);

    // Persistir token para que, se o user cair no /onboarding após signup/email confirm,
    // seja redirecionado de volta para cá automaticamente.
    if (token) {
      localStorage.setItem("pending_invite_token", token);
    }
  }, [token]);

  // Load invite data on mount
  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  // Determine page state once invite and auth are loaded
  useEffect(() => {
    if (!invite) return;
    if (authLoading) return;

    if (session && profile) {
      setPageState("already_member");
    } else if (session && !profile) {
      setPageState("accept");
    } else {
      setPageState("signup");
    }
  }, [invite, session, profile, authLoading]);

  // Handle signup + accept
  const handleSignupSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Informe seu e-mail.");
      return;
    }
    if (!password) {
      setFormError("Informe uma senha.");
      return;
    }
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não conferem.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Informe seu nome.");
      return;
    }

    setIsSubmitting(true);

    // Step 1: Create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email.trim(),
        password,
      },
    );

    if (signUpError) {
      setFormError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.user || !signUpData.session) {
      setFormError(
        "Conta criada! Verifique seu e-mail para confirmar e depois acesse este link novamente.",
      );
      setIsSubmitting(false);
      return;
    }

    // Step 2: Accept the invite
    const result = await acceptInviteAndJoin(token!, fullName.trim());
    if (result.error) {
      setFormError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    toast.success("Bem-vindo!", {
      description: `Você entrou na organização ${invite?.tenantName}`,
    });
    localStorage.removeItem("pending_invite_token");
    navigate("/", { replace: true });
  };

  // Handle login + accept for existing user
  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Informe e-mail e senha.");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setFormError("E-mail ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    // After login, the useEffect will re-evaluate and set pageState
    // to "accept" or "already_member". We don't navigate away yet.
    setIsSubmitting(false);
    setShowLogin(false);
  };

  // Handle accept for authenticated user without profile
  const handleAcceptSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Informe seu nome.");
      return;
    }

    setIsSubmitting(true);

    const result = await acceptInviteAndJoin(token!, fullName.trim());
    if (result.error) {
      setFormError(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    toast.success("Bem-vindo!", {
      description: `Você entrou na organização ${invite?.tenantName}`,
    });
    localStorage.removeItem("pending_invite_token");
    navigate("/", { replace: true });
  };

  // Limpar token pendente quando o convite é inválido ou o user já tem org
  useEffect(() => {
    if (pageState === "error" || pageState === "already_member") {
      localStorage.removeItem("pending_invite_token");
    }
  }, [pageState]);

  // -- Render helpers --

  const renderInviteHeader = () => {
    if (!invite) return null;
    return (
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 glow-primary">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Convite Recebido
        </h1>
        <p className="text-muted-foreground">
          Você foi convidado para entrar na organização
        </p>
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-secondary/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              {invite.tenantName}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Papel:</span>
            <Badge
              variant="outline"
              className={`text-xs ${roleBadgeVariant[invite.role]}`}
            >
              <Shield className="h-3 w-3 mr-1" />
              {roleLabels[invite.role]}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando convite...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Convite Inválido
          </h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button
            variant="outline"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  // Already has a profile in another org
  if (pageState === "already_member") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {renderInviteHeader()}
          <div className="glass rounded-2xl p-6 card-shadow text-center">
            <AlertCircle className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Você já pertence a uma organização
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Não é possível aceitar este convite pois sua conta já está
              vinculada a outra organização.
            </p>
            <Button onClick={() => navigate("/", { replace: true })}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user without profile - accept form
  if (pageState === "accept") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
          {renderInviteHeader()}
          <div className="glass rounded-2xl p-6 card-shadow">
            <form onSubmit={handleAcceptSubmit} className="space-y-5">
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
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary text-white hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Aceitar Convite"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Logado como {user?.email}
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated - signup or login form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
        {renderInviteHeader()}

        <div className="glass rounded-2xl p-6 card-shadow">
          {showLogin ? (
            // Login form for existing users
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <p className="text-sm text-center text-muted-foreground mb-2">
                Entre com sua conta existente
              </p>

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
                  disabled={isSubmitting}
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary text-white hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar e Aceitar Convite"}
              </Button>
            </form>
          ) : (
            // Signup form for new users
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <p className="text-sm text-center text-muted-foreground mb-2">
                Crie sua conta para entrar na organização
              </p>

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
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>

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
                  disabled={isSubmitting}
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="bg-secondary/50 border-white/10 focus:border-primary/50"
                  disabled={isSubmitting}
                />
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary text-white hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta e Aceitar Convite"
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setShowLogin(!showLogin);
                setFormError(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              {showLogin
                ? "Não tem conta? Criar uma nova"
                : "Já tem conta? Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
