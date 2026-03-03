# TurbineApp

CRM SaaS multi-tenant para gestão de leads, clientes e finanças, desenvolvido com React + TypeScript + Supabase.

## Sobre o Projeto

TurbineApp é um sistema de CRM moderno com autenticação completa, isolamento de dados por organização (multi-tenant), controle de acesso por papéis (RBAC) e painel administrativo master para a equipe TurbineTech.

### Funcionalidades

- **Autenticação**: Login, logout, reset e atualização de senha via Supabase Auth
- **Multi-tenant**: Isolamento total de dados por organização via RLS (Row Level Security)
- **RBAC**: Controle de acesso por papéis — Admin, Vendas, Financeiro, Leitura
- **Admin Master**: Painel TurbineTech para gerenciar todos os tenants e membros
- **Onboarding**: Criação de organização e perfil de administrador
- **Gestão de Leads**: Funil com status (Novo, Contato, Proposta, Fechado), origens e conversão para cliente
- **Gestão de Clientes**: Cadastro completo com perfil de redes sociais e carteiras vinculadas
- **Financeiro**: Controle de transações, carteiras virtuais e orçamentos com geração de PDF
- **Relatórios**: Dashboard com gráficos de receita, funil de leads e breakdown de orçamentos
- **Cadastro Público**: Formulário público com link único por organização para auto-cadastro de leads

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React + TypeScript | UI e tipagem estática |
| Vite | Build tool |
| Supabase | Backend — Auth, Postgres, RLS |
| React Router | Navegação e guardas de rota |
| TanStack React Query | Estado assíncrono |
| shadcn/ui + Tailwind CSS | Componentes e estilização |
| Recharts | Gráficos e visualizações |
| jsPDF | Geração de PDFs |
| Sonner | Notificações toast |

## Como Executar

### Pré-requisitos

- Node.js (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- Projeto no [Supabase](https://supabase.com/) configurado

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### Migrações do banco

Aplique as migrações no Supabase Dashboard → SQL Editor, na ordem:

1. `supabase/migrations/001_auth_rls_policies.sql` — RLS inicial e policy de insert anônimo
2. `supabase/migrations/002_multi_tenant.sql` — Tabelas `tenants` e `profiles`, `tenant_id` em todas as tabelas de negócio
3. `supabase/migrations/003_jwt_claims_rbac.sql` — JWT custom claims com `tenant_id`, `role` e `is_master_admin`
4. `supabase/migrations/004_fix_rls_recursion.sql` — Correção de recursão infinita nas policies
5. `supabase/migrations/005_fix_delete_policies.sql` — Permissão de delete para o papel `finance`

### Instalação

```sh
git clone <URL_DO_REPOSITORIO>
cd turbineapp
npm install
npm run dev
```

Disponível em `http://localhost:8080`

## Rotas

| Rota | Acesso | Página |
|---|---|---|
| `/login` | Público | Login |
| `/reset-password` | Público | Solicitar reset de senha |
| `/update-password` | Sessão de recovery | Atualizar senha |
| `/cadastro?t=<tenant-id>` | Público | Formulário de auto-cadastro de lead |
| `/onboarding` | Autenticado sem perfil | Criar organização |
| `/admin` | Admin master | Painel TurbineTech |
| `/` | Autenticado | Dashboard |
| `/leads` | Autenticado | Gestão de leads |
| `/clientes` | Autenticado | Gestão de clientes |
| `/financas` | Autenticado | Finanças |
| `/orcamentos` | Autenticado | Orçamentos |
| `/relatorios` | Autenticado | Relatórios |
| `/configuracoes` | Autenticado | Configurações e membros |

## Estrutura do Projeto

```
src/
├── components/
│   ├── auth/
│   │   ├── PrivateRoute.tsx      # Requer sessão + perfil
│   │   ├── PublicRoute.tsx       # Redireciona autenticados
│   │   ├── RoleRoute.tsx         # Guarda RBAC por módulo
│   │   ├── AdminRoute.tsx        # Somente admin master
│   │   └── Can.tsx               # Renderização condicional por permissão
│   ├── dashboard/
│   │   ├── StatCard.tsx          # Card de KPI
│   │   ├── RevenueChart.tsx      # Gráfico de receita
│   │   ├── FeaturedClients.tsx   # Clientes em destaque
│   │   ├── RecentClients.tsx     # Clientes recentes
│   │   ├── CommercialAlerts.tsx  # Alertas (leads, orçamentos)
│   │   └── QuickActions.tsx      # Ações rápidas
│   ├── layout/
│   │   ├── AppLayout.tsx         # Layout principal
│   │   ├── Sidebar.tsx           # Menu lateral
│   │   └── Header.tsx            # Cabeçalho com notificações
│   ├── ui/                       # Componentes shadcn/ui
│   └── PageTransition.tsx        # Animação de transição de rota
├── contexts/
│   ├── AuthContext.tsx            # Sessão, perfil, tenantId, RBAC
│   └── DataContext.tsx            # CRUD de todos os dados do CRM
├── hooks/
│   ├── use-permissions.ts         # Hook RBAC — can(), canAccessModule()
│   └── use-mobile.tsx             # Detecção de viewport mobile
├── services/
│   ├── leadService.ts             # CRUD de leads
│   ├── clientService.ts           # CRUD de clientes
│   ├── transactionService.ts      # CRUD de transações
│   ├── walletService.ts           # Carteiras virtuais
│   ├── budgetService.ts           # Orçamentos
│   ├── activityService.ts         # Log de atividades
│   ├── profileService.ts          # Membros do tenant
│   └── supabaseStorage.ts         # Abstração genérica do Supabase
├── pages/
│   ├── Login.tsx
│   ├── ResetPassword.tsx
│   ├── UpdatePassword.tsx
│   ├── Onboarding.tsx
│   ├── CadastroPublico.tsx
│   ├── Admin.tsx
│   ├── Index.tsx
│   ├── Leads.tsx
│   ├── Clientes.tsx
│   ├── Financas.tsx
│   ├── Orcamentos.tsx
│   ├── Relatorios.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── lib/
│   ├── supabase.ts                # Cliente Supabase tipado
│   ├── utils.ts                   # cn(), isAbortError()
│   ├── generateBudgetPDF.ts       # Geração de PDF de orçamentos
│   └── generateClientPDF.ts       # Geração de PDF de clientes
└── types/
    └── database.ts                # Schema TypeScript do banco
```

## RBAC — Papéis e Permissões

### Papéis disponíveis

| Papel | Descrição |
|---|---|
| `admin` | Acesso total a todos os módulos |
| `sales` | Leads, clientes e orçamentos (sem finanças) |
| `finance` | Financeiro e orçamentos (sem leads) |
| `viewer` | Somente leitura em todos os módulos |

### Matriz de permissões

| Módulo | admin | sales | finance | viewer |
|---|---|---|---|---|
| Dashboard | view | view | view | view |
| Leads | view/create/edit/delete | view/create/edit | — | view |
| Clientes | view/create/edit/delete | view/create/edit | view | view |
| Financeiro | view/create/edit/delete | — | view/create/edit/delete | view |
| Orçamentos | view/create/edit/delete | view/create/edit | view/create/edit | view |
| Relatórios | view | view | view | view |
| Configurações | view/create/edit/delete | view | view | view |

O papel `isMasterAdmin` ignora toda a matriz e acessa o painel `/admin`.

### Verificação de permissões no código

```typescript
// Hook
const { can, canAccessModule } = usePermissions();
can("leads", "edit");         // boolean
canAccessModule("finance");   // boolean

// Componente
<Can permission="leads.create">
  <Button>Novo Lead</Button>
</Can>
```

## Cadastro Público de Leads

Cada organização tem um link público único para auto-cadastro de leads:

```
https://seudominio.com/cadastro?t=<tenant-uuid>
```

### Como obter o link

1. Acesse `/leads` no painel autenticado
2. Clique em **"Link Compartilhável"**
3. O link com o `tenant_id` correto é copiado para a área de transferência

> Links sem o parâmetro `?t=` são rejeitados. Sempre use o botão da página de Leads.

### Como funciona internamente

- O `tenant_id` é lido do query param `?t=` em `CadastroPublico.tsx`
- O lead é inserido via policy RLS de insert para usuários anônimos (`leads: anon insert`)
- Como anônimos não têm SELECT policy, o retorno do insert não é lido — apenas o erro é verificado
- O lead aparece em `/leads` do tenant com status `Novo` e flag `self_registered: true`

## Configurando Origens de Leads

Para adicionar novas origens, edite dois arquivos:

**1. Tipo em `src/contexts/DataContext.tsx`:**
```typescript
export type LeadOrigin = "site" | "instagram" | "facebook" | "indicacao" | "google" | "outro" | "nova_origem";
```

**2. Configuração em `src/pages/Leads.tsx` e `src/pages/CadastroPublico.tsx`:**
```typescript
const originConfig = {
  nova_origem: { label: "Nova Origem", icon: Globe },
};
```

## Scripts

```sh
npm run dev        # Servidor de desenvolvimento (porta 8080)
npm run build      # Build de produção
npm run preview    # Prévia do build local
npm run test       # Executar testes
npm run test:watch # Testes em modo watch
```

## Deploy

O projeto é hospedado no **Vercel**. O deploy é automático via push para a branch `main`. O arquivo `vercel.json` configura o rewrite de SPA:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Configure as variáveis de ambiente no painel do Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Licença

Este projeto é privado — TurbineTech.
