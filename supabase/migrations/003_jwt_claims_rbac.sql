-- ========================================
-- Migration 003: JWT Custom Claims + RBAC backend
-- B3: Injetar tenant_id, role, is_master_admin no JWT
-- B4: Função helper get_user_role()
-- B5: Policies RLS baseadas em role (write restrictions)
-- ========================================

-- ========================================
-- 1. FUNÇÃO HELPER: retorna role do usuário atual
-- ========================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========================================
-- 2. CUSTOM ACCESS TOKEN HOOK
--    Supabase chama essa função ao gerar/refreshar o JWT.
--    Injetamos tenant_id, user_role e is_master_admin como claims.
--    IMPORTANTE: Ativar no dashboard Supabase:
--      Authentication > Hooks > Customize Access Token (JWT)
--      → Selecionar public.custom_access_token_hook
-- ========================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
  claims jsonb;
  v_tenant_id uuid;
  v_role text;
  v_is_master boolean;
BEGIN
  -- Buscar dados do profile
  SELECT p.tenant_id, p.role::text, p.is_master_admin
  INTO v_tenant_id, v_role, v_is_master
  FROM public.profiles p
  WHERE p.id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Só injeta se profile existe
  IF v_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
    claims := jsonb_set(claims, '{is_master_admin}', to_jsonb(COALESCE(v_is_master, false)));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Permissões necessárias para o hook funcionar
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ========================================
-- 3. POLICIES: Admin pode atualizar membros do mesmo tenant
--    (A policy atual só permite update do próprio profile)
-- ========================================

CREATE POLICY "profiles: admin update tenant members" ON profiles
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Admin pode deletar (remover) membros do mesmo tenant (exceto a si mesmo)
CREATE POLICY "profiles: admin delete tenant members" ON profiles
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
    AND id != auth.uid()
  );

-- ========================================
-- 4. ROLE-BASED WRITE RESTRICTIONS (RESTRICTIVE policies)
--    Essas policies são AND com as permissivas de tenant.
--    Impedem que roles sem permissão façam write.
-- ========================================

-- ── LEADS: somente admin e sales podem escrever ──

CREATE POLICY "leads: role insert" ON leads AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'sales'));

CREATE POLICY "leads: role update" ON leads AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'sales'));

CREATE POLICY "leads: role delete" ON leads AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── CLIENTS: somente admin e sales podem escrever ──

CREATE POLICY "clients: role insert" ON clients AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'sales'));

CREATE POLICY "clients: role update" ON clients AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'sales'));

CREATE POLICY "clients: role delete" ON clients AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── TRANSACTIONS: somente admin e finance podem escrever ──

CREATE POLICY "transactions: role insert" ON transactions AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "transactions: role update" ON transactions AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "transactions: role delete" ON transactions AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── WALLETS: somente admin e finance podem escrever ──

CREATE POLICY "wallets: role insert" ON wallets AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "wallets: role update" ON wallets AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "wallets: role delete" ON wallets AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── WALLET_MOVEMENTS: herdam restrição via FK de wallets,
--    mas adicionamos safety net ──

CREATE POLICY "wallet_movements: role insert" ON wallet_movements AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "wallet_movements: role update" ON wallet_movements AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'finance'));

CREATE POLICY "wallet_movements: role delete" ON wallet_movements AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── BUDGETS: admin, sales e finance podem escrever ──

CREATE POLICY "budgets: role insert" ON budgets AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'sales', 'finance'));

CREATE POLICY "budgets: role update" ON budgets AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'sales', 'finance'));

CREATE POLICY "budgets: role delete" ON budgets AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ── ACTIVITIES: qualquer autenticado pode escrever (sistema gera) ──
-- Sem restrição adicional (já isolado por tenant).

-- ========================================
-- 5. RPCs PARA GESTÃO DE MEMBROS
-- ========================================

-- Atualizar role de um membro (somente admin do tenant)
CREATE OR REPLACE FUNCTION public.update_member_role(
  p_user_id UUID,
  p_role user_role
) RETURNS VOID AS $$
BEGIN
  -- Verificar se é admin
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Somente administradores podem alterar papéis';
  END IF;

  -- Não pode alterar próprio role
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível alterar seu próprio papel';
  END IF;

  -- Atualizar (RLS garante mesmo tenant)
  UPDATE profiles
  SET role = p_role
  WHERE id = p_user_id
    AND tenant_id = public.get_tenant_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado no seu tenant';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bloquear/desbloquear membro (somente admin do tenant)
CREATE OR REPLACE FUNCTION public.update_member_status(
  p_user_id UUID,
  p_status profile_status
) RETURNS VOID AS $$
BEGIN
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Somente administradores podem alterar status de membros';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível alterar seu próprio status';
  END IF;

  UPDATE profiles
  SET status = p_status
  WHERE id = p_user_id
    AND tenant_id = public.get_tenant_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado no seu tenant';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover membro do tenant (somente admin)
CREATE OR REPLACE FUNCTION public.remove_tenant_member(
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Somente administradores podem remover membros';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível remover a si mesmo';
  END IF;

  DELETE FROM profiles
  WHERE id = p_user_id
    AND tenant_id = public.get_tenant_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado no seu tenant';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
