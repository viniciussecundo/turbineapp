-- ========================================
-- Migration 002: Multi-tenant
-- Transforma o TurbineApp em SaaS multi-tenant
-- ========================================

-- ========================================
-- 1. ENUMS
-- ========================================

CREATE TYPE user_role AS ENUM ('admin', 'sales', 'finance', 'viewer');
CREATE TYPE profile_status AS ENUM ('active', 'pending', 'blocked');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled');
CREATE TYPE tenant_plan AS ENUM ('starter', 'pro', 'enterprise');

-- ========================================
-- 2. TABELA DE TENANTS (organizações)
-- ========================================

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan tenant_plan NOT NULL DEFAULT 'starter',
  status tenant_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================
-- 3. TABELA DE PROFILES (vinculo user ↔ tenant)
-- ========================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  status profile_status NOT NULL DEFAULT 'pending',
  is_master_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_tenant_id ON profiles(tenant_id);

-- ========================================
-- 4. FUNÇÃO HELPER: retorna tenant_id do usuário atual
--    SECURITY DEFINER para bypassar RLS (evitar recursão)
-- ========================================

CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========================================
-- 5. ADICIONAR tenant_id NAS TABELAS DE NEGÓCIO
-- ========================================

ALTER TABLE leads ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE clients ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE wallets ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE budgets ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE activities ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- ========================================
-- 6. MIGRAÇÃO DE DADOS EXISTENTES
-- ========================================

-- Tenant padrão para dados existentes
INSERT INTO tenants (id, name, plan, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'Organização Padrão', 'starter', 'active')
ON CONFLICT DO NOTHING;

-- Vincular dados existentes ao tenant padrão
UPDATE leads SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE clients SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE transactions SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE wallets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE budgets SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE activities SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- Tornar NOT NULL
ALTER TABLE leads ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE wallets ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE budgets ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE activities ALTER COLUMN tenant_id SET NOT NULL;

-- ========================================
-- 7. ÍNDICES para tenant_id
-- ========================================

CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX idx_transactions_tenant_id ON transactions(tenant_id);
CREATE INDEX idx_wallets_tenant_id ON wallets(tenant_id);
CREATE INDEX idx_budgets_tenant_id ON budgets(tenant_id);
CREATE INDEX idx_activities_tenant_id ON activities(tenant_id);

-- ========================================
-- 8. AJUSTAR UNIQUE CONSTRAINT de budget code (per-tenant)
-- ========================================

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_code_key;
CREATE UNIQUE INDEX idx_budgets_code_tenant ON budgets(tenant_id, code);

-- ========================================
-- 9. REMOVER POLICIES ANTIGAS
-- ========================================

DROP POLICY IF EXISTS "leads: authenticated select" ON leads;
DROP POLICY IF EXISTS "leads: authenticated insert" ON leads;
DROP POLICY IF EXISTS "leads: authenticated update" ON leads;
DROP POLICY IF EXISTS "leads: authenticated delete" ON leads;
DROP POLICY IF EXISTS "leads: anon insert" ON leads;

DROP POLICY IF EXISTS "clients: authenticated select" ON clients;
DROP POLICY IF EXISTS "clients: authenticated insert" ON clients;
DROP POLICY IF EXISTS "clients: authenticated update" ON clients;
DROP POLICY IF EXISTS "clients: authenticated delete" ON clients;

DROP POLICY IF EXISTS "transactions: authenticated select" ON transactions;
DROP POLICY IF EXISTS "transactions: authenticated insert" ON transactions;
DROP POLICY IF EXISTS "transactions: authenticated update" ON transactions;
DROP POLICY IF EXISTS "transactions: authenticated delete" ON transactions;

DROP POLICY IF EXISTS "wallets: authenticated select" ON wallets;
DROP POLICY IF EXISTS "wallets: authenticated insert" ON wallets;
DROP POLICY IF EXISTS "wallets: authenticated update" ON wallets;
DROP POLICY IF EXISTS "wallets: authenticated delete" ON wallets;

DROP POLICY IF EXISTS "wallet_movements: authenticated select" ON wallet_movements;
DROP POLICY IF EXISTS "wallet_movements: authenticated insert" ON wallet_movements;
DROP POLICY IF EXISTS "wallet_movements: authenticated update" ON wallet_movements;
DROP POLICY IF EXISTS "wallet_movements: authenticated delete" ON wallet_movements;

DROP POLICY IF EXISTS "budgets: authenticated select" ON budgets;
DROP POLICY IF EXISTS "budgets: authenticated insert" ON budgets;
DROP POLICY IF EXISTS "budgets: authenticated update" ON budgets;
DROP POLICY IF EXISTS "budgets: authenticated delete" ON budgets;

DROP POLICY IF EXISTS "activities: authenticated select" ON activities;
DROP POLICY IF EXISTS "activities: authenticated insert" ON activities;
DROP POLICY IF EXISTS "activities: authenticated update" ON activities;
DROP POLICY IF EXISTS "activities: authenticated delete" ON activities;

-- ========================================
-- 10. HABILITAR RLS NAS NOVAS TABELAS
-- ========================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 11. NOVAS POLICIES (isolamento por tenant)
-- ========================================

-- TENANTS
CREATE POLICY "tenants: read own" ON tenants
  FOR SELECT TO authenticated
  USING (id = public.get_tenant_id());

CREATE POLICY "tenants: master admin read all" ON tenants
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_master_admin = true));

-- PROFILES
CREATE POLICY "profiles: read own tenant" ON profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: master admin read all" ON profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_master_admin = true));

-- LEADS
CREATE POLICY "leads: tenant select" ON leads
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "leads: tenant insert" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "leads: tenant update" ON leads
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "leads: tenant delete" ON leads
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- Leads: form público (anon) — exige tenant_id válido (FK garante existência)
CREATE POLICY "leads: anon insert" ON leads
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL);

-- CLIENTS
CREATE POLICY "clients: tenant select" ON clients
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "clients: tenant insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "clients: tenant update" ON clients
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "clients: tenant delete" ON clients
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- TRANSACTIONS
CREATE POLICY "transactions: tenant select" ON transactions
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "transactions: tenant insert" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "transactions: tenant update" ON transactions
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "transactions: tenant delete" ON transactions
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- WALLETS
CREATE POLICY "wallets: tenant select" ON wallets
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "wallets: tenant insert" ON wallets
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "wallets: tenant update" ON wallets
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "wallets: tenant delete" ON wallets
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- WALLET_MOVEMENTS (isolado via FK de wallets)
CREATE POLICY "wallet_movements: tenant select" ON wallet_movements
  FOR SELECT TO authenticated
  USING (wallet_id IN (SELECT id FROM wallets WHERE tenant_id = public.get_tenant_id()));

CREATE POLICY "wallet_movements: tenant insert" ON wallet_movements
  FOR INSERT TO authenticated
  WITH CHECK (wallet_id IN (SELECT id FROM wallets WHERE tenant_id = public.get_tenant_id()));

CREATE POLICY "wallet_movements: tenant update" ON wallet_movements
  FOR UPDATE TO authenticated
  USING (wallet_id IN (SELECT id FROM wallets WHERE tenant_id = public.get_tenant_id()));

CREATE POLICY "wallet_movements: tenant delete" ON wallet_movements
  FOR DELETE TO authenticated
  USING (wallet_id IN (SELECT id FROM wallets WHERE tenant_id = public.get_tenant_id()));

-- BUDGETS
CREATE POLICY "budgets: tenant select" ON budgets
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "budgets: tenant insert" ON budgets
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "budgets: tenant update" ON budgets
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "budgets: tenant delete" ON budgets
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- ACTIVITIES
CREATE POLICY "activities: tenant select" ON activities
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "activities: tenant insert" ON activities
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.get_tenant_id());

CREATE POLICY "activities: tenant update" ON activities
  FOR UPDATE TO authenticated
  USING (tenant_id = public.get_tenant_id());

CREATE POLICY "activities: tenant delete" ON activities
  FOR DELETE TO authenticated
  USING (tenant_id = public.get_tenant_id());

-- ========================================
-- 12. ATUALIZAR TRIGGERS (escopo por tenant)
-- ========================================

-- Budget code generator — agora conta por tenant
CREATE OR REPLACE FUNCTION generate_budget_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'ORC-' || LPAD(
          (SELECT COUNT(*) + 1 FROM budgets WHERE tenant_id = NEW.tenant_id)::TEXT,
          3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Wallet balance — SECURITY DEFINER para funcionar com RLS
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE wallets
        SET balance = balance + CASE
            WHEN NEW.type = 'deposit' THEN NEW.value
            ELSE -NEW.value
        END
        WHERE id = NEW.wallet_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE wallets
        SET balance = balance - CASE
            WHEN OLD.type = 'deposit' THEN OLD.value
            ELSE -OLD.value
        END
        WHERE id = OLD.wallet_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 13. RPC: criar tenant + profile (para onboarding)
-- ========================================

CREATE OR REPLACE FUNCTION create_tenant_with_profile(
  p_tenant_name TEXT,
  p_full_name TEXT
) RETURNS JSONB AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se já tem profile
  IF EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Usuário já possui organização';
  END IF;

  -- Criar tenant
  INSERT INTO tenants (name)
  VALUES (p_tenant_name)
  RETURNING id INTO v_tenant_id;

  -- Criar profile como admin
  INSERT INTO profiles (id, tenant_id, full_name, role, status)
  VALUES (v_user_id, v_tenant_id, p_full_name, 'admin', 'active');

  RETURN jsonb_build_object(
    'tenant_id', v_tenant_id,
    'tenant_name', p_tenant_name,
    'role', 'admin',
    'status', 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
