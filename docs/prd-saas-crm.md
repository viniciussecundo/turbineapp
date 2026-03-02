# PRD — TurbineApp SaaS (Ênfase em Autenticação)

Este PRD descreve os requisitos para transformar o TurbineApp em um CRM SaaS multi‑tenant, com foco prioritário em autenticação, autorização e isolamento de dados.

> **Nota de pesquisa externa:** o ambiente bloqueou acesso a documentações públicas (retorno 403), então referências externas não puderam ser consultadas diretamente nesta execução.

---

## 1) Visão do produto
Transformar o TurbineApp em um CRM SaaS confiável, seguro e escalável, com autenticação robusta, gerenciamento de usuários e multi‑tenant por organização.

---

## 2) Objetivos
1. **Autenticação segura** com sessões e revogação.
2. **Autorização por papéis** (RBAC) e políticas.
3. **Isolamento total por tenant** (dados e permissões).
4. **Onboarding simples** (criação de organização + convite).
5. **Times colaborativos** para compartilhar dados dentro do mesmo tenant.
6. **Admin master** (Turbine Tech) para validar/bloquear usuários e controlar acesso.

---

## 3) Não‑objetivos
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

### 5.1 Autenticação (Login/Sessão)
**RF‑AUTH‑01** — Login com e‑mail e senha.  
**RF‑AUTH‑02** — Reset de senha por e‑mail.  
**RF‑AUTH‑03** — Sessões com token de atualização (refresh token).  
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
1. **Segurança:** criptografia em trânsito, limite de tentativas no login.
2. **Confiabilidade:** auditoria de ações críticas (CRUD financeiro).
3. **Escalabilidade:** separar auth e core CRM quando crescer.

---

## 7) Fluxos detalhados (autenticação primeiro)

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

> **Última atualização:** 2026‑03‑02

**Fase 1 — Auth básico:** login, sessão, reset, logout. ✅ **CONCLUÍDA**  
**Fase 2 — Multi‑tenant e RBAC:** tenant_id, roles, guardas. ✅ **CONCLUÍDA**  
**Fase 3 — Times e colaboração:** times, compartilhamento, convites. ⬅️ **PRÓXIMO PASSO**  
**Fase 4 — Auditoria:** logs e trilha para operações críticas.  
**Fase 5 — Faturamento:** planos e assinatura.  

---

## 12) Dependências e riscos
**Dependências:** provedor de auth (ex.: Supabase/Auth0).  
**Riscos:** vazamento entre tenants; mitigação com RLS + testes.  
