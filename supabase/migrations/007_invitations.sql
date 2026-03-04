-- =============================================
-- Migration 007: Sistema de Convites
-- =============================================
-- Permite que admins convidem novos membros para
-- sua organização via link seguro com token.
-- =============================================

-- 1. Enum de status do convite
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- 2. Tabela de convites
CREATE TABLE invitations (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID              NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token       TEXT              NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role        user_role         NOT NULL DEFAULT 'viewer',
  invited_email TEXT,
  status      invitation_status NOT NULL DEFAULT 'pending',
  created_by  UUID              NOT NULL REFERENCES auth.users(id),
  accepted_by UUID              REFERENCES auth.users(id),
  expires_at  TIMESTAMPTZ       NOT NULL DEFAULT (now() + interval '7 days'),
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_tenant_id ON invitations(tenant_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- 3. RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins do tenant podem listar convites
CREATE POLICY "invitations: tenant admin select" ON invitations
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() IN ('admin')
  );

-- Admins do tenant podem criar convites
CREATE POLICY "invitations: admin insert" ON invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Admins do tenant podem atualizar (revogar)
CREATE POLICY "invitations: admin update" ON invitations
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Admins do tenant podem deletar
CREATE POLICY "invitations: admin delete" ON invitations
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Master admins podem ver todos os convites
CREATE POLICY "invitations: master admin select all" ON invitations
  FOR SELECT TO authenticated
  USING (public.is_master_admin());

-- 4. RPC: Criar convite
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_role user_role DEFAULT 'viewer',
  p_invited_email TEXT DEFAULT NULL,
  p_expires_in_days INT DEFAULT 7
) RETURNS jsonb AS $$
DECLARE
  v_tenant_id UUID;
  v_invitation_id UUID;
  v_token TEXT;
BEGIN
  IF public.get_user_role() != 'admin' AND NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem criar convites';
  END IF;

  v_tenant_id := public.get_tenant_id();
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Tenant não encontrado';
  END IF;

  IF p_invited_email IS NOT NULL AND p_invited_email !~ '^[^@]+@[^@]+\.[^@]+$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;

  INSERT INTO invitations (tenant_id, role, invited_email, created_by, expires_at)
  VALUES (
    v_tenant_id,
    p_role,
    LOWER(TRIM(p_invited_email)),
    auth.uid(),
    now() + (p_expires_in_days || ' days')::interval
  )
  RETURNING id, token INTO v_invitation_id, v_token;

  RETURN jsonb_build_object(
    'id', v_invitation_id,
    'token', v_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: Buscar convite por token (acessível por anon para página de convite)
CREATE OR REPLACE FUNCTION public.get_invitation_by_token(
  p_token TEXT
) RETURNS jsonb AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  SELECT i.id, i.tenant_id, t.name AS tenant_name, i.role, i.invited_email, i.expires_at, i.status
  INTO v_invitation
  FROM invitations i
  JOIN tenants t ON t.id = i.tenant_id
  WHERE i.token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Este convite já foi utilizado ou revogado';
  END IF;

  IF v_invitation.expires_at < now() THEN
    UPDATE invitations SET status = 'expired' WHERE token = p_token;
    RAISE EXCEPTION 'Este convite expirou';
  END IF;

  RETURN jsonb_build_object(
    'id', v_invitation.id,
    'tenant_id', v_invitation.tenant_id,
    'tenant_name', v_invitation.tenant_name,
    'role', v_invitation.role,
    'invited_email', v_invitation.invited_email,
    'expires_at', v_invitation.expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permitir anon chamar get_invitation_by_token
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token TO anon;

-- 6. RPC: Aceitar convite
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token TEXT,
  p_full_name TEXT
) RETURNS jsonb AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;

  SELECT * INTO v_invitation FROM invitations WHERE token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado';
  END IF;

  IF v_invitation.status != 'pending' THEN
    RAISE EXCEPTION 'Este convite já foi utilizado ou revogado';
  END IF;

  IF v_invitation.expires_at < now() THEN
    UPDATE invitations SET status = 'expired' WHERE id = v_invitation.id;
    RAISE EXCEPTION 'Este convite expirou';
  END IF;

  IF v_invitation.invited_email IS NOT NULL
     AND LOWER(TRIM(v_user_email)) != LOWER(TRIM(v_invitation.invited_email)) THEN
    RAISE EXCEPTION 'Este convite foi enviado para outro e-mail';
  END IF;

  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Você já pertence a uma organização';
  END IF;

  INSERT INTO profiles (id, tenant_id, full_name, role, status)
  VALUES (v_user_id, v_invitation.tenant_id, p_full_name, v_invitation.role, 'active');

  UPDATE invitations
  SET status = 'accepted', accepted_by = v_user_id, accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'tenant_id', v_invitation.tenant_id,
    'role', v_invitation.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: Revogar convite
CREATE OR REPLACE FUNCTION public.revoke_invitation(
  p_invitation_id UUID
) RETURNS VOID AS $$
BEGIN
  IF public.get_user_role() != 'admin' AND NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem revogar convites';
  END IF;

  UPDATE invitations
  SET status = 'revoked'
  WHERE id = p_invitation_id
    AND tenant_id = public.get_tenant_id()
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite não encontrado ou já processado';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
