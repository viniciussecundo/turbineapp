# Migração para Supabase - Turbine App

Este documento descreve como configurar o Supabase para o projeto Turbine App.

## 1. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> **Nota**: Se você conectou via Vercel Integration, essas variáveis já estarão disponíveis automaticamente no ambiente de produção.

### Para ambiente local:

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Settings > API**
3. Copie a **Project URL** e a **anon public key**
4. Cole no arquivo `.env`

## 2. Criar as Tabelas no Banco de Dados

Execute o script SQL localizado em `supabase/schema.sql` no **SQL Editor** do Supabase:

1. Acesse o Dashboard do Supabase
2. Vá em **SQL Editor**
3. Copie todo o conteúdo do arquivo `supabase/schema.sql`
4. Cole e execute

O script irá criar:

- ✅ Todas as tabelas necessárias (leads, clients, transactions, wallets, budgets, activities)
- ✅ Tipos ENUM personalizados
- ✅ Índices para performance
- ✅ Triggers para automação (código de orçamento, saldo de carteira)
- ✅ Políticas de segurança (RLS)

## 3. Estrutura do Banco de Dados

### Tabelas

| Tabela             | Descrição                                  |
| ------------------ | ------------------------------------------ |
| `leads`            | Leads/prospects do funil de vendas         |
| `clients`          | Clientes convertidos                       |
| `transactions`     | Transações financeiras (receitas/despesas) |
| `wallets`          | Carteiras virtuais dos clientes            |
| `wallet_movements` | Movimentações das carteiras                |
| `budgets`          | Orçamentos                                 |
| `activities`       | Atividades/notificações do sistema         |

### Relacionamentos

```
leads ──────── (1:1) ──────── clients
  └── convertedToClientId      └── leadId

clients ──────── (1:N) ──────── transactions
                  └── clientId

clients ──────── (1:1) ──────── wallets
                  └── clientId

wallets ──────── (1:N) ──────── wallet_movements
                  └── walletId

clients ──────── (1:N) ──────── budgets
                  └── clientId

budgets ──────── (1:N) ──────── transactions
                  └── budgetId
```

## 4. Segurança (RLS)

Por padrão, o schema habilita **Segurança em Nível de Linha (RLS)** com políticas permissivas para desenvolvimento.

### ⚠️ Para produção, você deve:

1. Implementar autenticação (Supabase Auth)
2. Criar políticas de acesso por usuário
3. Remover as políticas de "Permitir tudo"

Exemplo de política segura:

```sql
-- Remover política permissiva
DROP POLICY "Allow all on leads" ON leads;

-- Criar política por usuário
CREATE POLICY "Users can access own leads" ON leads
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## 5. Recursos Automáticos

### Trigger: Código de Orçamento

- Gera automaticamente códigos sequenciais (ORC-001, ORC-002, etc.)

### Trigger: Saldo de Carteira

- Atualiza automaticamente o saldo ao inserir/remover movimentações

## 6. Testando a Conexão

Após configurar, inicie o projeto:

```bash
npm run dev
```

Abra o console do navegador e verifique se não há erros de conexão com o Supabase.

## 7. Migração de Dados Existentes

Se você tinha dados no LocalStorage, eles não são migrados automaticamente. Para migrar:

1. Exporte os dados do LocalStorage antes da atualização
2. Use o SQL Editor para importar os dados nas tabelas

### Estrutura de mapeamento (camelCase → snake_case)

| Campo App             | Campo DB                 |
| --------------------- | ------------------------ |
| `createdAt`           | `created_at`             |
| `clientId`            | `client_id`              |
| `leadId`              | `lead_id`                |
| `convertedToClientId` | `converted_to_client_id` |
| `selfRegistered`      | `self_registered`        |
| `monthlyBudget`       | `monthly_budget`         |
| `socialMedia`         | `social_media`           |
| `profileAnalysis`     | `profile_analysis`       |
| `totalValue`          | `total_value`            |
| `validUntil`          | `valid_until`            |
| `budgetId`            | `budget_id`              |
| `walletId`            | `wallet_id`              |

## 8. Solução de Problemas

### Erro: "Supabase não configurado"

- Verifique se as variáveis de ambiente estão corretas
- Reinicie o servidor de desenvolvimento

### Erro: "relation does not exist"

- Execute o script `schema.sql` no SQL Editor

### Erro: "permission denied"

- Verifique as políticas RLS
- Certifique-se que as políticas de "Permitir tudo" foram criadas

## Suporte

Para mais informações, consulte:

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
