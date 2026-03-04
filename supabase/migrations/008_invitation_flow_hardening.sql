-- =============================================
-- Migration 008: Invitation Flow Hardening
-- =============================================
-- Corrige comportamento de revogacao para estados ja processados
-- e garante grants explicitos nos RPCs de convite.
-- =============================================

CREATE OR REPLACE FUNCTION public.revoke_invitation(
  p_invitation_id UUID
) RETURNS VOID AS $$
DECLARE
  v_invitation public.invitations%ROWTYPE;
  v_current_tenant UUID;
BEGIN
  IF public.get_user_role() != 'admin' AND NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Somente administradores podem revogar convites';
  END IF;

  SELECT *
  INTO v_invitation
  FROM public.invitations
  WHERE id = p_invitation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite nao encontrado';
  END IF;

  IF NOT public.is_master_admin() THEN
    v_current_tenant := public.get_tenant_id();

    IF v_current_tenant IS NULL OR v_invitation.tenant_id != v_current_tenant THEN
      RAISE EXCEPTION 'Convite nao pertence a sua organizacao';
    END IF;
  END IF;

  IF v_invitation.status = 'revoked' OR v_invitation.status = 'expired' THEN
    RETURN;
  END IF;

  IF v_invitation.status = 'accepted' THEN
    RAISE EXCEPTION 'Convite ja foi aceito e nao pode ser revogado';
  END IF;

  UPDATE public.invitations
  SET status = 'revoked'
  WHERE id = p_invitation_id
    AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_invitation(user_role, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_invitation(UUID) TO authenticated;
