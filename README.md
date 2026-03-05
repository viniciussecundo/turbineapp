# TurbineApp

CRM SaaS multi-tenant para gestão de leads, clientes e finanças — construído com React, TypeScript e Supabase.

---

## Funcionalidades

### Autenticação & Acesso

- Login, logout, reset e atualização de senha via Supabase Auth
- Isolamento total de dados por organização via RLS (Row Level Security)
- RBAC com 4 papéis: **Admin**, **Sales**, **Finance**, **Viewer**
- Painel master TurbineTech para gerenciar todos os tenants

### Sistema de Convites _(recente)_

- Admins convidam membros via link seguro com token único
- Papel atribuído no convite; fluxo com confirmação de e-mail
- Status de convite: pendente, aceito, revogado ou expirado
- RPCs com validação de permissão e hardening de edge cases

### Leads

- Funil com status: Novo → Contato → Proposta → Fechado
- Origens rastreáveis por campo de origem
- Conversão direta de lead em cliente
- Formulário público de auto-cadastro via link único da organização

### Clientes

- Cadastro completo com perfil e redes sociais
- Exportação de ficha do cliente em PDF

### Financeiro

- Carteiras virtuais por organização
- Controle de transações (receitas e despesas)
- Orçamentos com geração de PDF

### Dashboard & Relatórios

- KPIs em tempo real (receita, leads, clientes)
- Gráfico de receita mensal
- Alertas comerciais (leads parados, orçamentos pendentes)
- Relatórios de funil e breakdown de orçamentos

### Configurações

- Gerenciamento de membros e convites
- Onboarding de nova organização no primeiro acesso

---

## Stack

| Tecnologia               | Função                      |
| ------------------------ | --------------------------- |
| React 18 + TypeScript    | UI e tipagem                |
| Vite                     | Build                       |
| Supabase                 | Auth, Postgres, RLS, RPCs   |
| React Router v6          | Navegação e guardas de rota |
| TanStack Query v5        | Estado assíncrono           |
| shadcn/ui + Tailwind CSS | Componentes e estilo        |
| Recharts                 | Gráficos                    |
| jsPDF                    | Geração de PDFs             |
| Sonner                   | Notificações toast          |
| Vitest                   | Testes unitários            |

---

## Primeiros Passos

### Pré-requisitos

- Node.js ≥ 18 (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- Projeto no [Supabase](https://supabase.com/)

### Variáveis de ambiente

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Migrações

Aplique em ordem no Supabase SQL Editor:

| #   | Arquivo                             | Descrição                                                  |
| --- | ----------------------------------- | ---------------------------------------------------------- |
| 001 | `001_auth_rls_policies.sql`         | RLS base e policy de insert anônimo                        |
| 002 | `002_multi_tenant.sql`              | Tabelas `tenants` e `profiles`, `tenant_id` global         |
| 003 | `003_jwt_claims_rbac.sql`           | JWT custom claims (`tenant_id`, `role`, `is_master_admin`) |
| 004 | `004_fix_rls_recursion.sql`         | Correção de recursão infinita nas policies                 |
| 005 | `005_fix_delete_policies.sql`       | DELETE para o papel `finance`                              |
| 006 | `006_hardening_delete_policies.sql` | Hardening geral de deletes                                 |
| 007 | `007_invitations.sql`               | Sistema de convites                                        |
| 008 | `008_invitation_flow_hardening.sql` | Hardening do fluxo de convites                             |

### Instalação

```sh
git clone <URL_DO_REPOSITORIO>
cd turbineapp
npm install
npm run dev
```

Disponível em `http://localhost:8080`

---

## RBAC — Permissões por Papel

| Módulo        | admin | sales | finance | viewer |
| ------------- | :---: | :---: | :-----: | :----: |
| Dashboard     |   ✓   |   ✓   |    ✓    |   ✓    |
| Leads         | CRUD  |  CRU  |    —    |   R    |
| Clientes      | CRUD  |  CRU  |    R    |   R    |
| Financeiro    | CRUD  |   —   |  CRUD   |   R    |
| Orçamentos    | CRUD  |  CRU  |   CRU   |   R    |
| Relatórios    |   ✓   |   ✓   |    ✓    |   ✓    |
| Configurações | CRUD  |   R   |    R    |   R    |

> `isMasterAdmin` ignora a matriz e acessa o painel `/admin`.

### Uso no código

```tsx
// Hook
const { can, canAccessModule } = usePermissions();
can("leads", "edit"); // boolean
canAccessModule("finance"); // boolean

// Componente declarativo
<Can permission="leads.create">
  <Button>Novo Lead</Button>
</Can>;
```

---

## Rotas

| Rota                      | Acesso                 | Página                   |
| ------------------------- | ---------------------- | ------------------------ |
| `/login`                  | Público                | Login                    |
| `/reset-password`         | Público                | Solicitar reset de senha |
| `/update-password`        | Sessão de recovery     | Atualizar senha          |
| `/cadastro?t=<tenant-id>` | Público                | Auto-cadastro de lead    |
| `/convite?token=<token>`  | Público                | Aceitar convite          |
| `/onboarding`             | Autenticado sem perfil | Criar organização        |
| `/admin`                  | Master admin           | Painel TurbineTech       |
| `/`                       | Autenticado            | Dashboard                |
| `/leads`                  | Autenticado            | Leads                    |
| `/clientes`               | Autenticado            | Clientes                 |
| `/financas`               | Autenticado            | Finanças                 |
| `/orcamentos`             | Autenticado            | Orçamentos               |
| `/relatorios`             | Autenticado            | Relatórios               |
| `/configuracoes`          | Autenticado            | Configurações            |

---

## Deploy

Hospedado no **Vercel** com deploy automático na `main`. O arquivo `vercel.json` configura o rewrite de SPA.

Configure no painel do Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Licença

Projeto privado — TurbineTech.
