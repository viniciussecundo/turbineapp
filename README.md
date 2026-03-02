# 🚀 TurbineApp

CRM SaaS multi‑tenant para gestão de clientes e leads, desenvolvido com React + TypeScript + Supabase.

## 📋 Sobre o Projeto

TurbineApp é um sistema de CRM moderno e intuitivo para gerenciar seu funil de vendas, clientes e leads de forma eficiente, com autenticação segura, multi‑tenancy e controle de acesso por papéis (RBAC).

### ✨ Funcionalidades

#### Autenticação e Segurança
- **Login com e‑mail/senha** via Supabase Auth
- **Reset de senha** com link por e‑mail
- **Sessão persistente** com refresh automático
- **Guardas de rota** para proteger páginas internas
- **Multi‑tenant** — isolamento total de dados por organização (RLS)
- **RBAC** — papéis Admin, Vendas, Financeiro e Leitura

#### CRM e Negócios
- **Gestão de Leads**: Funil visual com status (Novo, Contato, Proposta, Fechado)
- **Gestão de Clientes**: Cadastro completo com análise de perfil
- **Orçamentos**: Criação, aprovação e geração de PDF
- **Finanças**: Receitas, despesas e carteiras virtuais
- **Relatórios**: Dashboard com KPIs e gráficos de receita
- **Link Compartilhável**: Página pública para auto‑cadastro de leads (`/cadastro`)

#### Administração
- **Onboarding**: Criação de organização + usuário admin no primeiro acesso
- **Admin Master (Turbine Tech)**: Painel global para validar/bloquear usuários e gerenciar organizações

## 🛠️ Tecnologias Utilizadas

- **Vite** — Ferramenta de build rápida
- **TypeScript** — Tipagem estática
- **React** — Biblioteca de UI
- **Supabase** — Auth, banco de dados (Postgres) e RLS
- **shadcn/ui** — Componentes de interface
- **Tailwind CSS** — Estilização utilitária
- **React Router** — Navegação
- **React Hook Form + Zod** — Formulários e validação
- **TanStack React Query** — Gerenciamento de estado assíncrono
- **Vitest** — Testes

## 🚀 Como Executar

### Pré-requisitos

- Node.js instalado - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm ou bun
- Projeto Supabase configurado (variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)

### Instalação

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entre na pasta do projeto
cd turbineapp

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8081`

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes shadcn/ui
│   ├── auth/        # Guardas de rota (PrivateRoute, PublicRoute, AdminRoute, RoleRoute, Can)
│   ├── layout/      # Layout (Sidebar, Header)
│   └── dashboard/   # Componentes do dashboard
├── contexts/        # Contextos React
│   ├── AuthContext   # Autenticação e sessão
│   └── DataContext   # Dados de negócio (leads, clientes, etc.)
├── hooks/           # Hooks customizados (permissões, mobile, toast)
├── pages/           # Páginas da aplicação
│   ├── Login        # Tela de login
│   ├── Index        # Dashboard
│   ├── Leads        # Gestão de leads
│   ├── Clientes     # Gestão de clientes
│   ├── Orcamentos   # Orçamentos
│   ├── Financas     # Finanças
│   ├── Relatorios   # Relatórios
│   ├── Settings     # Configurações
│   ├── Admin        # Painel admin master
│   ├── Onboarding   # Criação de organização
│   └── CadastroPublico # Página pública de leads
├── services/        # Serviços de acesso a dados (Supabase)
├── types/           # Tipagens TypeScript
└── lib/             # Utilitários e cliente Supabase
```

## 📊 Status do Projeto

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Auth básico (login, sessão, reset, logout) | ✅ Concluída |
| 2 | Multi‑tenant e RBAC | ✅ Concluída |
| 3 | Times e colaboração (times, convites) | ⬅️ Próximo passo |
| 4 | Auditoria (logs de ações críticas) | Pendente |
| 5 | Faturamento (planos e assinatura) | Pendente |

> Para detalhes completos do backlog, consulte `docs/saas-auth-backlog-schema.md`.

## 🔧 Configuração de Origem dos Leads

Para adicionar novas origens de leads, edite dois arquivos:

1. **Tipo** em `src/contexts/DataContext.tsx`:

```typescript
export type LeadOrigin = "site" | "instagram" | "nova_origem";
```

2. **Config** em `src/pages/Leads.tsx`:

```typescript
const originConfig = {
  nova_origem: { label: "Nova Origem", icon: Globe },
};
```

## 📄 Licença

Este projeto é privado.

---

Desenvolvido com 💜 por **TurbineTech**
