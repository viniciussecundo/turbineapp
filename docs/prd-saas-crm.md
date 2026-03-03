# PRD — TurbineApp SaaS (Ênfase em Autenticação)

Este PRD descreve os requisitos para transformar o TurbineApp em um CRM SaaS multi‑tenant, com foco prioritário em autenticação, autorização e isolamento de dados.

> **Nota de pesquisa externa:** o ambiente bloqueou acesso a documentações públicas (retorno 403), então referências externas não puderam ser consultadas diretamente nesta execução.

---

## 1) Visão do produto
Transformar o TurbineApp em um CRM SaaS confiável, seguro e escalável, com autenticação robusta, gerenciamento de usuários e multi‑tenant por organização.

---

## 2) Objetivos (Goals)
1. **Autenticação segura** com sessões e revogação.
2. **Autorização por papéis** (RBAC) e políticas.
3. **Isolamento total por tenant** (dados e permissões).
4. **Onboarding simples** (criação de organização + convite).
5. **Times colaborativos** para compartilhar dados dentro do mesmo tenant.
6. **Admin master** (Turbine Tech) para validar/bloquear usuários e controlar acesso.

---

## 3) Não‑objetivos (Non‑Goals)
- SSO corporativo (SAML/SCIM) na primeira versão.
- Migração automática de dados legados no MVP.
- Marketplace de integrações no MVP.

---

## 4) Personas
**Admin do cliente (Owner):** configura organização, times, permissões.  
**Vendas:** gerencia leads e clientes.  
**Financeiro:** controla transações e orçamentos.  

---

## 5) Escopo funcional — Autenticação & Autorização

### 5.1 Autenticação (Login/Session)
**RF‑AUTH‑01** — Login com e‑mail e senha.  
**RF‑AUTH‑02** — Reset de senha por e‑mail.  
**RF‑AUTH‑03** — Sessões com refresh token.  
**RF‑AUTH‑04** — Logout global (revogar sessões ativas).  
**RF‑AUTH‑05** — MFA opcional (TOTP) no plano Pro.  

### 5.2 Multi‑tenant
**RF‑TENANT‑01** — Cada usuário pertence a 1 tenant.  
**RF‑TENANT‑02** — Todas as queries filtradas por `tenant_id`.  
**RF‑TENANT‑03** — O token de sessão deve carregar `tenant_id` e roles.  

### 5.3 RBAC (Roles)
**RF‑RBAC‑01** — Papéis: Admin, Vendas, Financeiro, Leitura.  
**RF‑RBAC‑02** — Admin pode criar/editar convites.  
**RF‑RBAC‑03** — Leitura não pode editar dados.  

### 5.4 Times (colaboração interna)
**RF‑TEAM‑01** — Usuários pertencem a **times** dentro do tenant.  
**RF‑TEAM‑02** — Usuários do mesmo time compartilham dados salvos no CRM.  
**RF‑TEAM‑03** — Admin do tenant pode adicionar/remover usuários de um time.  

### 5.5 Admin master (Turbine Tech)
**RF‑MASTER‑01** — Existe o papel **admin master** com acesso administrativo global.  
**RF‑MASTER‑02** — Admin master pode **validar** ou **bloquear** usuários.  
**RF‑MASTER‑03** — Admin master gerencia políticas de acesso e auditoria.  

### 5.6 Onboarding (Organização)
**RF‑ONB‑01** — Criar organização + usuário admin.  
**RF‑ONB‑02** — Convites por e‑mail com link único e expiração.  
**RF‑ONB‑03** — Aceite de convite cria usuário com role atribuída.  

---

## 6) Requisitos não‑funcionais
1. **Segurança:** criptografia em trânsito, rate‑limit no login.
2. **Confiabilidade:** auditoria de ações críticas (CRUD financeiro).
3. **Escalabilidade:** separar auth e core CRM quando crescer.

---

## 7) Fluxos detalhados (Auth‑first)

### 7.1 Login
1. Usuário envia e‑mail/senha.  
2. API valida credenciais.  
3. Retorna sessão + refresh.  
4. UI armazena sessão com `tenant_id`.  

### 7.2 Reset de senha
1. Usuário solicita reset.  
2. E‑mail com token expira em X minutos.  
3. Reset confirmado → login automático.  

### 7.3 Convite de usuário
1. Admin envia convite (role).  
2. Usuário aceita e cria senha.  
3. Conta ativa no tenant.  

---

## 8) Modelo de dados (conceitual)
- **tenants**: id, nome, plano, status  
- **users**: id, email, nome, tenant_id  
- **roles**: id, nome, escopo  
- **user_roles**: user_id, role_id  
- **teams**: id, tenant_id, nome  
- **team_members**: team_id, user_id  
- **user_status**: user_id, status, motivo, atualizado_em  
- **sessions**: user_id, refresh_token  
- **audit_logs**: actor_id, ação, recurso, timestamp  

---

## 9) Regras de segurança críticas
1. **RLS obrigatório** nas tabelas com `tenant_id`.  
2. **JWT claims** para tenant e roles.  
3. **Nível de autorização** por endpoint.  
4. **Logs de auditoria** para alterações financeiras.  

---

## 10) Métricas de sucesso
1. Taxa de login bem‑sucedido.  
2. Taxa de onboarding concluído.  
3. Tempo médio de sessão ativa.  
4. Incidentes de segurança (zero).  

---

## 11) Roadmap recomendado
**Fase 1 — Auth básico:** login, sessão, reset, logout.  
**Fase 2 — Multi‑tenant e RBAC:** tenant_id, roles, guardas.  
**Fase 3 — Auditoria:** logs e trilha para operações críticas.  
**Fase 4 — Billing:** planos e assinatura.  

---

## 12) Dependências e riscos
**Dependências:** provedor de auth (ex.: Supabase/Auth0).  
**Riscos:** vazamento entre tenants; mitigação com RLS + testes.  

---

## 13) Status de Implementação

Última atualização: Julho 2025.

### 5.1 Autenticação (Login/Session) — ✅ Implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑AUTH‑01** — Login com e‑mail e senha | ✅ | `src/pages/Login.tsx`, `src/contexts/AuthContext.tsx` |
| **RF‑AUTH‑02** — Reset de senha por e‑mail | ✅ | `src/pages/ResetPassword.tsx`, `src/pages/UpdatePassword.tsx` |
| **RF‑AUTH‑03** — Sessões com refresh token | ✅ | `src/contexts/AuthContext.tsx` (Supabase gerencia sessões) |
| **RF‑AUTH‑04** — Logout global | ✅ | `src/contexts/AuthContext.tsx` → `signOut()` |
| **RF‑AUTH‑05** — MFA opcional (TOTP) | ❌ | Fora do escopo do MVP |

### 5.2 Multi‑tenant — ✅ Implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑TENANT‑01** — Cada usuário pertence a 1 tenant | ✅ | `supabase/migrations/002_multi_tenant.sql` (profiles.tenant_id) |
| **RF‑TENANT‑02** — Queries filtradas por `tenant_id` | ✅ | RLS policies em `002_multi_tenant.sql`, `004_fix_rls_recursion.sql`, `005_fix_delete_policies.sql` |
| **RF‑TENANT‑03** — Token carrega `tenant_id` e roles | ✅ | `supabase/migrations/003_jwt_claims_rbac.sql` (custom_access_token_hook) |

### 5.3 RBAC (Roles) — ✅ Implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑RBAC‑01** — Papéis: Admin, Vendas, Financeiro, Leitura | ✅ | `supabase/migrations/003_jwt_claims_rbac.sql`, `src/hooks/use-permissions.ts` |
| **RF‑RBAC‑02** — Admin pode criar/editar convites | ⚠️ | RBAC implementado, mas convites ainda não implementados |
| **RF‑RBAC‑03** — Leitura não pode editar dados | ✅ | RLS restrictive policies + `src/components/auth/RoleRoute.tsx` |

### 5.4 Times (colaboração interna) — ❌ Não implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑TEAM‑01** — Usuários pertencem a times | ❌ | Tabelas `teams`/`team_members` não criadas no DB |
| **RF‑TEAM‑02** — Compartilhamento por time | ❌ | — |
| **RF‑TEAM‑03** — Admin gerencia times | ❌ | — |

### 5.5 Admin master (Turbine Tech) — ✅ Implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑MASTER‑01** — Papel admin master | ✅ | `src/pages/Admin.tsx`, `src/components/auth/AdminRoute.tsx` |
| **RF‑MASTER‑02** — Validar/bloquear usuários | ✅ | RPCs em `003_jwt_claims_rbac.sql`, UI em `src/pages/Admin.tsx` |
| **RF‑MASTER‑03** — Políticas de acesso e auditoria | ⚠️ | Acesso implementado; auditoria pendente |

### 5.6 Onboarding (Organização) — ⚠️ Parcialmente implementado

| Requisito | Status | Referência |
|-----------|--------|------------|
| **RF‑ONB‑01** — Criar organização + usuário admin | ✅ | `src/pages/Onboarding.tsx`, RPC `create_tenant_with_profile` |
| **RF‑ONB‑02** — Convites por e‑mail | ❌ | Não implementado |
| **RF‑ONB‑03** — Aceite de convite com role | ❌ | Não implementado |

### Resumo geral

| Área | Status |
|------|--------|
| Autenticação (5.1) | ✅ Completo |
| Multi‑tenant (5.2) | ✅ Completo |
| RBAC (5.3) | ✅ Completo |
| Times (5.4) | ❌ Não iniciado |
| Admin master (5.5) | ✅ Completo |
| Onboarding (5.6) | ⚠️ Parcial |
