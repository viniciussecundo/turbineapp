-- ================================================
-- 006: Hardening DELETE policies
-- ================================================
-- 1. Tenants: block deletion entirely (only superadmin via dashboard)
-- 2. Activities: restrict DELETE to admin role
-- ================================================

-- -----------------------------------------------
-- 1. Tenants DELETE policy: deny all
--    Tenant deletion should only happen via
--    Supabase dashboard / service_role key.
--    No authenticated user can delete a tenant.
-- -----------------------------------------------
CREATE POLICY "tenants: deny delete" ON tenants
  FOR DELETE TO authenticated
  USING (false);

-- -----------------------------------------------
-- 2. Activities: add RESTRICTIVE role-based DELETE
--    Previously any authenticated user in the
--    tenant could delete activities. Now only
--    admins can.
-- -----------------------------------------------
CREATE POLICY "activities: role delete" ON activities AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');
