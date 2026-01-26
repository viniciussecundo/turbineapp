-- ========================================
-- Schema do Banco de Dados - Turbine App
-- Execute este script no Supabase SQL Editor
-- ========================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENUMS
-- ========================================

-- Status do Lead
CREATE TYPE lead_status AS ENUM ('novo', 'contato', 'proposta', 'fechado');

-- Origem do Lead
CREATE TYPE lead_origin AS ENUM ('site', 'instagram', 'facebook', 'indicacao', 'google', 'outro');

-- Status do Cliente
CREATE TYPE client_status AS ENUM ('active', 'pending', 'inactive');

-- Tipo de Transação
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Status da Transação
CREATE TYPE transaction_status AS ENUM ('pending', 'completed');

-- Status do Orçamento
CREATE TYPE budget_status AS ENUM ('draft', 'sent', 'approved', 'rejected');

-- Tipo de Atividade
CREATE TYPE activity_type AS ENUM ('lead', 'client', 'transaction', 'budget', 'wallet');

-- Tipo de Movimentação de Carteira
CREATE TYPE wallet_movement_type AS ENUM ('deposit', 'withdrawal');

-- ========================================
-- TABELAS
-- ========================================

-- Leads
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    status lead_status DEFAULT 'novo',
    origin lead_origin NOT NULL,
    value DECIMAL(12, 2),
    created_at DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    converted_to_client_id BIGINT,
    self_registered BOOLEAN DEFAULT FALSE,
    viewed BOOLEAN DEFAULT FALSE,
    followers INTEGER,
    posts INTEGER,
    monthly_budget DECIMAL(12, 2)
);

-- Clientes
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status client_status DEFAULT 'active',
    projects INTEGER DEFAULT 0,
    value DECIMAL(12, 2) DEFAULT 0,
    avatar TEXT,
    responsible TEXT,
    social_media JSONB,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL,
    origin lead_origin,
    converted_at DATE,
    profile_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar referência de lead para cliente (após criar clients)
ALTER TABLE leads
ADD CONSTRAINT fk_leads_converted_client
FOREIGN KEY (converted_to_client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Transações
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    type transaction_type NOT NULL,
    description TEXT NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    status transaction_status DEFAULT 'pending',
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    budget_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carteiras Virtuais
CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(client_id)
);

-- Movimentações de Carteira
CREATE TABLE wallet_movements (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type wallet_movement_type NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orçamentos
CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    total_value DECIMAL(12, 2) NOT NULL,
    status budget_status DEFAULT 'draft',
    created_at DATE DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    sent_at DATE,
    approved_at DATE,
    rejected_at DATE,
    notes TEXT
);

-- Adicionar referência de budget na transaction
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_budget
FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL;

-- Atividades/Notificações
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    icon TEXT,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES
-- ========================================

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_origin ON leads(origin);
CREATE INDEX idx_leads_self_registered ON leads(self_registered);
CREATE INDEX idx_leads_viewed ON leads(viewed);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_lead_id ON clients(lead_id);

CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_date ON transactions(date);

CREATE INDEX idx_wallets_client_id ON wallets(client_id);

CREATE INDEX idx_wallet_movements_wallet_id ON wallet_movements(wallet_id);
CREATE INDEX idx_wallet_movements_date ON wallet_movements(date);

CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_client_id ON budgets(client_id);

CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_read ON activities(read);
CREATE INDEX idx_activities_timestamp ON activities(timestamp);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- Desativado por padrão - ative quando adicionar autenticação
-- ========================================

-- Para habilitar RLS (quando tiver autenticação):
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wallet_movements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para gerar código do orçamento automaticamente
CREATE OR REPLACE FUNCTION generate_budget_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := 'ORC-' || LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM budgets)::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_budget_code
BEFORE INSERT ON budgets
FOR EACH ROW
EXECUTE FUNCTION generate_budget_code();

-- Função para atualizar saldo da carteira
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_balance
AFTER INSERT OR DELETE ON wallet_movements
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- ========================================
-- POLÍTICAS DE ACESSO PÚBLICO (temporário)
-- Remova estas políticas quando implementar autenticação
-- ========================================

-- Habilitar acesso anônimo para todas as tabelas (desenvolvimento)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (REMOVA EM PRODUÇÃO!)
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on wallets" ON wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on wallet_movements" ON wallet_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activities" ON activities FOR ALL USING (true) WITH CHECK (true);
