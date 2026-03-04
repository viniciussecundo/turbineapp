import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { isAbortError } from "@/lib/utils";
import { acceptInvitation as acceptInvitationService } from "@/services/invitationService";
import type { UserRole, ProfileStatus } from "@/types/database";

// ========================================
// Profile (vinculo user ↔ tenant)
// ========================================
export interface Profile {
  id: string;
  tenantId: string;
  fullName: string | null;
  role: UserRole;
  status: ProfileStatus;
  isMasterAdmin: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  tenantId: string | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  createTenantProfile: (
    tenantName: string,
    fullName: string,
  ) => Promise<{ error?: string }>;
  acceptInviteAndJoin: (
    token: string,
    fullName: string,
  ) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper: mapear profile do DB para o formato camelCase
function mapProfile(dbProfile: Record<string, unknown>): Profile {
  return {
    id: dbProfile.id as string,
    tenantId: dbProfile.tenant_id as string,
    fullName: dbProfile.full_name as string | null,
    role: dbProfile.role as UserRole,
    status: dbProfile.status as ProfileStatus,
    isMasterAdmin: dbProfile.is_master_admin as boolean,
    createdAt: dbProfile.created_at as string,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Carregar profile do Supabase (com try-catch para evitar travamento)
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !data) {
        if (error && error.code !== "PGRST116" && !isAbortError(error)) {
          console.error("[Auth] Erro ao carregar profile:", error);
        }
        setProfile(null);
        return null;
      }

      const mapped = mapProfile(data);
      setProfile(mapped);
      return mapped;
    } catch (e) {
      if (!isAbortError(e)) {
        console.error("[Auth] Exceção ao carregar profile:", e);
      }
      setProfile(null);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Timeout de segurança: se a inicialização do Supabase demorar muito
    // (ex: projeto pausado, chave inválida, refresh token pendente),
    // libera o loading para evitar travamento infinito.
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn(
          "[Auth] Inicialização expirou (5s). Verifique se o Supabase está acessível.",
        );
        setIsLoading(false);
      }
    }, 5000);

    // Usar onAuthStateChange como única fonte de verdade.
    // O evento INITIAL_SESSION é emitido automaticamente pelo Supabase v2
    // e substitui a necessidade de chamar getSession() separadamente.
    // Isso evita a race condition de duas fontes concorrentes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!isMounted) return;

        // Detectar fluxo de recuperação de senha
        // O link do e-mail já redireciona para /update-password, então
        // apenas atualizamos o estado sem forçar um novo redirecionamento.
        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          clearTimeout(safetyTimeout);
          setIsLoading(false);
          return;
        }

        // Limpar flag de recuperação quando o usuário faz sign in normal ou sai
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          setIsPasswordRecovery(false);
        }

        // IMPORTANTE: carregar profile ANTES de expor session/user
        // para evitar needsOnboarding=true intermediário que causa
        // redirecionamento indevido para /onboarding.
        if (nextSession?.user) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }

        if (!isMounted) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      },
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return {
        error:
          "Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    // Carregar profile ANTES de expor session/user
    // para evitar needsOnboarding=true intermediário
    if (data.user) {
      await loadProfile(data.user.id);
    }

    setSession(data.session ?? null);
    setUser(data.user ?? null);

    return {};
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return {
        error:
          "Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
      };
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }

    setSession(null);
    setUser(null);
    setProfile(null);

    return {};
  };

  const createTenantProfile = async (tenantName: string, fullName: string) => {
    if (!user) {
      return { error: "Usuário não autenticado" };
    }

    const { error } = await supabase.rpc("create_tenant_with_profile", {
      p_tenant_name: tenantName,
      p_full_name: fullName,
    });

    if (error) {
      return { error: error.message };
    }

    // Recarregar profile
    await loadProfile(user.id);

    return {};
  };

  const acceptInviteAndJoin = async (token: string, fullName: string) => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const currentUser = user ?? authUser;

    if (!currentUser) {
      return { error: "Usuário não autenticado" };
    }

    const result = await acceptInvitationService(token, fullName);
    if (result.error) {
      return { error: result.error };
    }

    // Forçar refresh do JWT para incluir novos claims (tenant_id, user_role)
    await supabase.auth.refreshSession();

    // Recarregar profile
    await loadProfile(currentUser.id);

    return {};
  };

  // needsOnboarding: autenticado mas sem profile (precisa criar organização)
  const needsOnboarding = !!session && !isLoading && !profile;

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      tenantId: profile?.tenantId ?? null,
      isLoading,
      needsOnboarding,
      isPasswordRecovery,
      signIn,
      signOut,
      createTenantProfile,
      acceptInviteAndJoin,
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      user,
      session,
      profile,
      isLoading,
      needsOnboarding,
      isPasswordRecovery,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
