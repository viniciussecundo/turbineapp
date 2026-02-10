-- ========================================
-- Migration 004: Fix RLS recursion on profiles
-- Corrige "infinite recursion detected in policy for relation profiles"
--
-- Causa: as policies "master admin read all" usam
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_master_admin)
-- Esse subquery reavalida RLS da própria tabela profiles → recursão.
--
-- Solução: criar função SECURITY DEFINER que faz a mesma consulta
-- sem passar por RLS. Substituir as policies.
-- ========================================

-- 1. Função helper: verifica se o user atual é master admin
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_master_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Recriar policy de profiles (master admin read all)
DROP POLICY IF EXISTS "profiles: master admin read all" ON profiles;
CREATE POLICY "profiles: master admin read all" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_master_admin());

-- 3. Recriar policy de tenants (master admin read all)
DROP POLICY IF EXISTS "tenants: master admin read all" ON tenants;
CREATE POLICY "tenants: master admin read all" ON tenants
  FOR SELECT TO authenticated
  USING (public.is_master_admin());
