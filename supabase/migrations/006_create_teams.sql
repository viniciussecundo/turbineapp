-- ========================================
-- Migration 006 — Criação de Times (Teams)
-- RF-TEAM-01, RF-TEAM-02, RF-TEAM-03
-- ========================================
-- Cria tabelas `teams` e `team_members` para colaboração interna
-- dentro de cada tenant, com políticas RLS de isolamento.

-- ========================================
-- 1) Tabela: teams
-- ========================================
CREATE TABLE IF NOT EXISTS teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_teams_tenant_id ON teams(tenant_id);

-- RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado do mesmo tenant pode visualizar times
CREATE POLICY "teams: tenant select" ON teams AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- Somente admin do tenant pode criar times
CREATE POLICY "teams: admin insert" ON teams AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- Somente admin do tenant pode atualizar times
CREATE POLICY "teams: admin update" ON teams AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  )
  WITH CHECK (tenant_id = public.get_tenant_id());

-- Somente admin do tenant pode excluir times
CREATE POLICY "teams: admin delete" ON teams AS PERMISSIVE
  FOR DELETE TO authenticated
  USING (
    tenant_id = public.get_tenant_id()
    AND public.get_user_role() = 'admin'
  );

-- ========================================
-- 2) Tabela: team_members
-- ========================================
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado do mesmo tenant pode ver membros dos times
CREATE POLICY "team_members: tenant select" ON team_members AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE tenant_id = public.get_tenant_id())
  );

-- Somente admin do tenant pode adicionar membros
CREATE POLICY "team_members: admin insert" ON team_members AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role() = 'admin'
    AND team_id IN (SELECT id FROM teams WHERE tenant_id = public.get_tenant_id())
  );

-- Somente admin do tenant pode atualizar membros
CREATE POLICY "team_members: admin update" ON team_members AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (
    public.get_user_role() = 'admin'
    AND team_id IN (SELECT id FROM teams WHERE tenant_id = public.get_tenant_id())
  )
  WITH CHECK (
    public.get_user_role() = 'admin'
  );

-- Somente admin do tenant pode remover membros
CREATE POLICY "team_members: admin delete" ON team_members AS PERMISSIVE
  FOR DELETE TO authenticated
  USING (
    public.get_user_role() = 'admin'
    AND team_id IN (SELECT id FROM teams WHERE tenant_id = public.get_tenant_id())
  );
