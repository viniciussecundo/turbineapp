-- ========================================
-- Migration: Trocar policies permissivas por policies de usuario autenticado
-- Execute no Supabase SQL Editor
-- ========================================

-- Remover policies permissivas antigas
DROP POLICY IF EXISTS "Allow all on leads" ON leads;
DROP POLICY IF EXISTS "Allow all on clients" ON clients;
DROP POLICY IF EXISTS "Allow all on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all on wallet_movements" ON wallet_movements;
DROP POLICY IF EXISTS "Allow all on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow all on activities" ON activities;

-- ========================================
-- Novas policies: somente usuario autenticado
-- Prepara terreno para multi-tenant (tenant_id) na proxima fase
-- ========================================

-- LEADS
CREATE POLICY "leads: authenticated select" ON leads
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "leads: authenticated insert" ON leads
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "leads: authenticated update" ON leads
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "leads: authenticated delete" ON leads
  FOR DELETE TO authenticated USING (true);
-- Permitir insert anonimo (formulario publico /cadastro)
CREATE POLICY "leads: anon insert" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- CLIENTS
CREATE POLICY "clients: authenticated select" ON clients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients: authenticated insert" ON clients
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clients: authenticated update" ON clients
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "clients: authenticated delete" ON clients
  FOR DELETE TO authenticated USING (true);

-- TRANSACTIONS
CREATE POLICY "transactions: authenticated select" ON transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "transactions: authenticated insert" ON transactions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "transactions: authenticated update" ON transactions
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "transactions: authenticated delete" ON transactions
  FOR DELETE TO authenticated USING (true);

-- WALLETS
CREATE POLICY "wallets: authenticated select" ON wallets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wallets: authenticated insert" ON wallets
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wallets: authenticated update" ON wallets
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "wallets: authenticated delete" ON wallets
  FOR DELETE TO authenticated USING (true);

-- WALLET_MOVEMENTS
CREATE POLICY "wallet_movements: authenticated select" ON wallet_movements
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wallet_movements: authenticated insert" ON wallet_movements
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wallet_movements: authenticated update" ON wallet_movements
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "wallet_movements: authenticated delete" ON wallet_movements
  FOR DELETE TO authenticated USING (true);

-- BUDGETS
CREATE POLICY "budgets: authenticated select" ON budgets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "budgets: authenticated insert" ON budgets
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "budgets: authenticated update" ON budgets
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "budgets: authenticated delete" ON budgets
  FOR DELETE TO authenticated USING (true);

-- ACTIVITIES
CREATE POLICY "activities: authenticated select" ON activities
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "activities: authenticated insert" ON activities
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "activities: authenticated update" ON activities
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "activities: authenticated delete" ON activities
  FOR DELETE TO authenticated USING (true);
