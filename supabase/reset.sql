-- ========================================
-- RESET: Limpa todo o schema antes de recriar
-- Execute ANTES do schema.sql
-- ========================================

-- Desabilitar verificação de foreign keys temporariamente
SET session_replication_role = 'replica';

-- Dropar políticas RLS
DROP POLICY IF EXISTS "Allow all on leads" ON leads;
DROP POLICY IF EXISTS "Allow all on clients" ON clients;
DROP POLICY IF EXISTS "Allow all on transactions" ON transactions;
DROP POLICY IF EXISTS "Allow all on wallets" ON wallets;
DROP POLICY IF EXISTS "Allow all on wallet_movements" ON wallet_movements;
DROP POLICY IF EXISTS "Allow all on budgets" ON budgets;
DROP POLICY IF EXISTS "Allow all on activities" ON activities;

-- Dropar triggers
DROP TRIGGER IF EXISTS trigger_generate_budget_code ON budgets;
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON wallet_movements;

-- Dropar funções
DROP FUNCTION IF EXISTS generate_budget_code();
DROP FUNCTION IF EXISTS update_wallet_balance();

-- Dropar tabelas (ordem importa por causa das foreign keys)
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS wallet_movements CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS leads CASCADE;

-- Dropar ENUMs
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS lead_origin CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS budget_status CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS wallet_movement_type CASCADE;

-- Reabilitar verificação de foreign keys
SET session_replication_role = 'origin';

-- Mensagem de sucesso
SELECT 'Reset completo! Agora execute o schema.sql' as status;
