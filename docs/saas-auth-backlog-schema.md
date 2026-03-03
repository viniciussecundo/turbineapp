# SaaS CRM — Backlog detalhado + Schema multi‑tenant (Supabase)

Este documento complementa o PRD e define:

1. backlog detalhado com tarefas e estimativas;
2. escolha do provedor de autenticação (Supabase);
3. desenho do schema multi‑tenant + RLS (Row Level Security).

---

## 1) Provedor de autenticação

**Escolha:** **Supabase Auth** (JWT + RLS nativos, integração com Postgres).  
Motivos: já existe cliente Supabase no projeto, reduz custo e tempo de integração.

---

## 2) Backlog detalhado (com estimativas)

Estimativas em **story points (SP)**.

### Épico A — Auth básico (total ~13 SP) ✅ COMPLETO

1. **A1 — Tela de login** (2 SP) ✅
   - UI + validação de e‑mail/senha.
   - → `src/pages/Login.tsx`
2. **A2 — Integração Supabase Auth (signIn)** (2 SP) ✅
   - fluxo de login + sessão.
   - → `src/contexts/AuthContext.tsx`
3. **A3 — Reset de senha** (3 SP) ✅
   - solicitação, link e confirmação.
   - → `src/pages/ResetPassword.tsx`, `src/pages/UpdatePassword.tsx`
4. **A4 — Logout global** (2 SP) ✅
   - revogar sessões ativas.
   - → `src/contexts/AuthContext.tsx` → `signOut()`
5. **A5 — Guardas de rota (private/public)** (4 SP) ✅
   - bloquear `/` e módulos sem sessão.
   - → `src/components/auth/PrivateRoute.tsx`, `src/components/auth/PublicRoute.tsx`

### Épico B — Multi‑tenant + RBAC (total ~21 SP) ✅ COMPLETO

1. **B1 — Schema multi‑tenant (tenant_id)** (5 SP) ✅
   - migrações e índices.
   - → `supabase/migrations/002_multi_tenant.sql`
2. **B2 — RLS por tenant (políticas)** (6 SP) ✅
   - select/insert/update/delete.
   - → `supabase/migrations/002_multi_tenant.sql`, `004_fix_rls_recursion.sql`, `005_fix_delete_policies.sql`
3. **B3 — Claims de tenant no JWT** (4 SP) ✅
   - garantir `tenant_id` em sessão.
   - → `supabase/migrations/003_jwt_claims_rbac.sql` (custom_access_token_hook)
4. **B4 — RBAC básico (roles)** (4 SP) ✅
   - Admin, Vendas, Financeiro, Leitura.
   - → `supabase/migrations/003_jwt_claims_rbac.sql`, `src/hooks/use-permissions.ts`
5. **B5 — Permissões por módulo** (2 SP) ✅
   - habilitar/desabilitar views e ações.
   - → `src/components/auth/RoleRoute.tsx`, RLS restrictive policies

### Épico C — Times + Administração Master (total ~16 SP) ✅ COMPLETO

1. **C1 — Schema de times** (4 SP) ✅
   - tabelas `teams` e `team_members`.
   - → `supabase/migrations/006_create_teams.sql`
2. **C2 — UI de times** (5 SP) ✅
   - criar time, adicionar/remover membros.
   - → `src/pages/Teams.tsx`, `src/services/teamService.ts`, `src/contexts/DataContext.tsx`
3. **C3 — Compartilhamento por time** (4 SP) ✅
   - regras de visibilidade por `team_id`.
   - → RLS policies em `006_create_teams.sql`, RBAC em `src/hooks/use-permissions.ts`
4. **C4 — Admin master (Turbine Tech)** (3 SP) ✅
   - validar/bloquear usuários, auditoria e listagem global.
   - → `src/pages/Admin.tsx`, `src/components/auth/AdminRoute.tsx`, RPCs em `003_jwt_claims_rbac.sql`

### Épico D — Onboarding (total ~8 SP) ⚠️ PARCIAL

1. **D1 — Convites por e‑mail** (4 SP) ❌
   - criação e aceite de convite.
2. **D2 — Aceite de convite + role** (4 SP) ❌
   - criação de usuário + role.
3. **Onboarding (criar tenant + perfil)** ✅
   - → `src/pages/Onboarding.tsx`, RPC `create_tenant_with_profile`

### Épico E — Auditoria e segurança (total ~10 SP) ❌ NÃO INICIADO

1. **E1 — Audit log** (4 SP) ❌
   - registrar ações críticas (CRUD financeiro).
2. **E2 — Rate limit / proteção login** (3 SP) ❌
3. **E3 — Alertas de segurança** (3 SP) ❌

### Resumo de progresso

| Épico | Status | Progresso |
|-------|--------|-----------|
| A — Auth básico | ✅ Completo | 5/5 itens |
| B — Multi‑tenant + RBAC | ✅ Completo | 5/5 itens |
| C — Times + Admin Master | ✅ Completo | 4/4 itens |
| D — Onboarding | ⚠️ Parcial | 1/3 (criar tenant + perfil; convites pendentes) |
| E — Auditoria e segurança | ❌ Não iniciado | 0/3 itens |

---

## 3) Schema multi‑tenant (Postgres / Supabase)

### 3.1 Tabelas base (conceitual)

```sql
create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id),
  full_name text,
  role text not null default 'viewer',
  status text not null default 'pending',
  is_master_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table team_members (
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- exemplo: leads
create table leads (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references tenants(id),
  team_id uuid references teams(id),
  name text not null,
  email text not null,
  phone text not null,
  status text not null default 'novo',
  created_at date not null default current_date
);
```

### 3.2 Índices recomendados

```sql
create index on profiles(tenant_id);
create index on teams(tenant_id);
create index on team_members(team_id);
create index on team_members(user_id);
create index on leads(tenant_id);
create index on leads(team_id);
```

---

## 4) RLS (Row Level Security)

### 4.1 Habilitar RLS

```sql
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table leads enable row level security;
```

### 4.2 Policies — perfis

```sql
create policy "profiles: read own tenant"
on profiles
for select
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "profiles: update own profile"
on profiles
for update
using (id = auth.uid());

create policy "profiles: master admin read"
on profiles
for select
using ((auth.jwt() ->> 'is_master_admin')::boolean = true);
```

### 4.3 Policies — leads

```sql
create policy "leads: read by tenant"
on leads
for select
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "leads: read by team"
on leads
for select
using (team_id is null or team_id in (
  select team_id from team_members where user_id = auth.uid()
));

create policy "leads: insert by tenant"
on leads
for insert
with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "leads: update by tenant"
on leads
for update
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "leads: delete by tenant"
on leads
for delete
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### 4.4 Policies — teams

```sql
create policy "teams: read by tenant"
on teams
for select
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

create policy "teams: manage by admin"
on teams
for all
using (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid and (auth.jwt() ->> 'role') = 'admin')
with check (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

### 4.5 Policies — team_members

```sql
create policy "team_members: read by tenant"
on team_members
for select
using (team_id in (select id from teams where tenant_id = (auth.jwt() ->> 'tenant_id')::uuid));

create policy "team_members: manage by admin"
on team_members
for all
using ((auth.jwt() ->> 'role') = 'admin')
with check ((auth.jwt() ->> 'role') = 'admin');
```

---

## 5) Observações finais

- As políticas acima assumem que o **JWT carrega `tenant_id`**.
- Para convites, use uma tabela `invites` com `tenant_id`, `email`, `role`, `expires_at`.
- Para RBAC granular, adicionar tabela `roles` e `permissions`.
