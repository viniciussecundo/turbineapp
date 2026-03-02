# SaaS CRM — Backlog detalhado + Schema multi‑tenant (Supabase)

Este documento complementa o PRD e define:

1. backlog detalhado com tarefas e estimativas;
2. escolha do provedor de autenticação (Supabase);
3. desenho do schema multi‑tenant + RLS (Segurança em Nível de Linha).

> **Última atualização:** 2026‑03‑02 — status de implementação revisado.

---

## 1) Provedor de autenticação

**Escolha:** **Supabase Auth** (JWT + RLS nativos, integração com Postgres).  
Motivos: já existe cliente Supabase no projeto, reduz custo e tempo de integração.

**Status:** ✅ Implementado — cliente Supabase configurado em `src/lib/supabase.ts`.

---

## 2) Backlog detalhado (com estimativas)

Estimativas em **pontos de história (SP)**.

### Épico A — Auth básico (total ~13 SP) ✅ CONCLUÍDO

1. ✅ **A1 — Tela de login** (2 SP)
   - UI + validação de e‑mail/senha.
   - Implementado em `src/pages/Login.tsx`.
2. ✅ **A2 — Integração Supabase Auth (signIn)** (2 SP)
   - fluxo de login + sessão.
   - Implementado em `src/contexts/AuthContext.tsx`.
3. ✅ **A3 — Reset de senha** (3 SP)
   - solicitação, link e confirmação.
   - Implementado em `src/pages/ResetPassword.tsx` e `src/pages/UpdatePassword.tsx`.
4. ✅ **A4 — Logout global** (2 SP)
   - revogar sessões ativas.
   - Implementado no `AuthContext` (`signOut`).
5. ✅ **A5 — Guardas de rota (private/public)** (4 SP)
   - bloquear `/` e módulos sem sessão.
   - Implementado em `src/components/auth/PrivateRoute.tsx` e `PublicRoute.tsx`.

### Épico B — Multi‑tenant + RBAC (total ~21 SP) ✅ CONCLUÍDO

1. ✅ **B1 — Schema multi‑tenant (tenant_id)** (5 SP)
   - migrações e índices.
   - Implementado em `supabase/migrations/002_multi_tenant.sql`.
2. ✅ **B2 — RLS por tenant (políticas)** (6 SP)
   - select/insert/update/delete.
   - Implementado em `supabase/migrations/001_auth_rls_policies.sql` + correções em `004` e `005`.
3. ✅ **B3 — Claims de tenant no JWT** (4 SP)
   - garantir `tenant_id` em sessão.
   - Implementado em `supabase/migrations/003_jwt_claims_rbac.sql`.
4. ✅ **B4 — RBAC básico (roles)** (4 SP)
   - Admin, Vendas, Financeiro, Leitura.
   - Implementado com `RoleRoute` e hook `use-permissions.ts`.
5. ✅ **B5 — Permissões por módulo** (2 SP)
   - habilitar/desabilitar views e ações.
   - Implementado com componente `Can` e `RoleRoute` no roteamento.

### Épico C — Times + Administração Master (total ~16 SP) ⚠️ PARCIALMENTE CONCLUÍDO

1. ❌ **C1 — Schema de times** (4 SP)
   - tabelas `teams` e `team_members`.
   - **Pendente** — tabelas ainda não existem no banco de dados.
2. ❌ **C2 — UI de times** (5 SP)
   - criar time, adicionar/remover membros.
   - **Pendente** — nenhuma interface de times criada.
3. ❌ **C3 — Compartilhamento por time** (4 SP)
   - regras de visibilidade por `team_id`.
   - **Pendente** — sem regras de compartilhamento.
4. ✅ **C4 — Admin master (Turbine Tech)** (3 SP)
   - validar/bloquear usuários, auditoria e listagem global.
   - Implementado em `src/pages/Admin.tsx` com `AdminRoute`.

### Épico D — Onboarding (total ~8 SP) ⚠️ PARCIALMENTE CONCLUÍDO

1. ❌ **D1 — Convites por e‑mail** (4 SP)
   - criação e aceite de convite.
   - **Pendente** — tabela `invites` e fluxo de e‑mail não implementados.
2. ❌ **D2 — Aceite de convite + role** (4 SP)
   - criação de usuário + role.
   - **Pendente**.
3. ✅ **D3 — Onboarding inicial (tenant + admin)** (estimativa adicional)
   - Criação de organização + usuário admin no primeiro acesso.
   - Implementado em `src/pages/Onboarding.tsx`.

### Épico E — Auditoria e segurança (total ~10 SP) ⚠️ PARCIALMENTE CONCLUÍDO

1. ⚠️ **E1 — Audit log** (4 SP)
   - registrar ações críticas (CRUD financeiro).
   - **Parcial** — existe serviço de atividades (`activityService.ts`), mas sem trilha de auditoria formal para ações críticas.
2. ❌ **E2 — Rate limit / proteção login** (3 SP)
   - **Pendente**.
3. ❌ **E3 — Alertas de segurança** (3 SP)
   - **Pendente**.

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

## 4) RLS (Segurança em Nível de Linha)

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

## 5) Resumo de progresso

| Épico | Descrição | Status | SP feitos / total |
|-------|-----------|--------|-------------------|
| A | Auth básico | ✅ Concluído | 13 / 13 |
| B | Multi‑tenant + RBAC | ✅ Concluído | 21 / 21 |
| C | Times + Admin Master | ⚠️ Parcial | 3 / 16 |
| D | Onboarding + Convites | ⚠️ Parcial | ~2 / 8 |
| E | Auditoria e segurança | ⚠️ Parcial | ~1 / 10 |

**Total estimado:** ~40 / 68 SP concluídos (~59 %).

---

## 6) Próximo passo recomendado

**→ Épico C: Times (C1 → C2 → C3)**

Motivo: o esquema multi‑tenant e RBAC já estão prontos. A funcionalidade de times é pré‑requisito para o compartilhamento de dados entre membros da mesma organização e para o sistema de convites (Épico D).

### Tarefas imediatas
1. **C1** — Criar migração com tabelas `teams` e `team_members` + índices + RLS.
2. **C2** — Criar página de gestão de times (CRUD de times + adicionar/remover membros).
3. **C3** — Implementar regras de visibilidade por `team_id` nos serviços existentes (leads, clientes, etc.).

---

## 7) Observações finais

- As políticas acima assumem que o **JWT carrega `tenant_id`** — ✅ já implementado via `003_jwt_claims_rbac.sql`.
- Para convites, usar uma tabela `invites` com `tenant_id`, `email`, `role`, `expires_at` — ❌ pendente (Épico D).
- Para RBAC granular, adicionar tabela `roles` e `permissions` — ⚠️ RBAC básico implementado via campo `role` em `profiles`.
