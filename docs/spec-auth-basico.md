# Spec — Autenticação Básica (Prioridade 1) ✅ CONCLUÍDA

> **Status:** Implementação completa — todos os critérios de aceitação foram atendidos.  
> **Última atualização:** 2026‑03‑02

Este documento consolida o **PRD**, **backlog**, **schema multi-tenant/RLS**, **prompt de execução** e **referências técnicas** para definir a spec de implementação do **Auth básico** no TurbineApp.

## 1) Objetivo
Implementar autenticação básica com **Supabase Auth** para proteger o CRM, com login, sessão persistente, logout e guardas de rota para páginas internas.

## 2) Contexto e base documental
Fontes utilizadas para esta spec:
- `docs/prd-saas-crm.md`
- `docs/saas-auth-backlog-schema.md`
- `docs/prompt-prioridade-1.md`
- `docs/technology-docs.md`

## 3) Escopo (Prioridade 1)
1) **Tela de login** (UI + validação).
2) **Integração Supabase Auth** (signIn com e-mail/senha).
3) **Gestão de sessão** (persistência e recuperação da sessão atual).
4) **Guardas de rota** (bloquear acesso a rotas internas sem sessão).
5) **Logout**.

> **Nota de alinhamento:** o produto também precisa de **times** (compartilhamento interno) e **admin master** (Turbine Tech) com validação/bloqueio de usuários. Esses itens ficam fora do escopo imediato, mas devem ser considerados na arquitetura.

## 4) Requisitos funcionais
- **RF-AUTH-01**: Login com e-mail e senha.
- **RF-AUTH-02**: Exibir erros de autenticação de forma amigável.
- **RF-AUTH-03**: Manter sessão ativa após refresh da página.
- **RF-AUTH-04**: Bloquear acesso às rotas internas sem sessão válida.
- **RF-AUTH-05**: Logout encerra a sessão local e no Supabase.

## 5) Requisitos não-funcionais
- **RNF-SEC-01**: Não expor conteúdo interno a usuários não autenticados.
- **RNF-UX-01**: Fluxo de login simples e rápido, com feedback de erro.
- **RNF-MAINT-01**: Código organizado em contexto/hook reutilizável.

## 6) Fluxos principais
### 6.1 Login
1. Usuário acessa tela de login.
2. Preenche e-mail e senha.
3. App chama `supabase.auth.signInWithPassword`.
4. Em sucesso, sessão é salva e usuário é redirecionado para o dashboard.
5. Em erro, exibir mensagem clara.

### 6.2 Sessão
1. Ao iniciar o app, recuperar sessão atual do Supabase.
2. Atualizar estado global de autenticação.
3. Guardas de rota usam este estado para liberar/bloquear páginas internas.

### 6.3 Logout
1. Usuário solicita logout.
2. App chama `supabase.auth.signOut`.
3. Sessão local é limpa e usuário é redirecionado para login.

## 7) Componentes e responsabilidades
- **AuthContext/Hook**: expõe `user`, `session`, `isLoading`, `signIn`, `signOut`.
- **LoginPage**: UI + validação + chamada de autenticação.
- **PrivateRoute/RouteGuard**: protege rotas internas.
- **PublicRoute** (opcional): evita acesso à tela de login quando já autenticado.

## 8) Critérios de aceitação
- Usuário **não autenticado** não consegue acessar rotas internas.
- Usuário **autenticado** acessa normalmente o CRM.
- Login com credenciais válidas cria sessão.
- Logout encerra sessão.
- Erros de login são exibidos de forma amigável.

## 9) Dependências técnicas
- Supabase JS (`@supabase/supabase-js`).
- React Router para guardas de rota.
- UI/estilos conforme padrões do projeto (shadcn + Tailwind).

## 10) Fora de escopo
- MFA.
- Convites e onboarding multi-tenant.
- RBAC completo.
- Auditoria e billing.
- Times (gestão e compartilhamento).
- Admin master (validação/bloqueio global).

## 11) Riscos e mitigação
- **Risco**: sessão não persistir após reload.
  - **Mitigação**: usar APIs oficiais do Supabase para recuperar sessão e ouvir mudanças.
- **Risco**: rotas internas expostas.
  - **Mitigação**: implementar guardas de rota obrigatórios e validar em teste manual.

## 12) Plano de entrega (macro)
1) ✅ Criar contexto/hook de autenticação — `src/contexts/AuthContext.tsx`.
2) ✅ Criar tela de login — `src/pages/Login.tsx`.
3) ✅ Implementar guardas de rota — `src/components/auth/PrivateRoute.tsx`, `PublicRoute.tsx`, `AdminRoute.tsx`, `RoleRoute.tsx`.
4) ✅ Implementar logout — integrado no `AuthContext`.
5) ✅ Documentar uso/configuração.

## 13) Definição de pronto
- ✅ Todos os critérios de aceitação validados.
- ✅ Fluxos de login/logout/sessão funcionando em ambiente local.
- ✅ Rotas internas protegidas.

## 14) Artefatos de implementação
- `src/contexts/AuthContext.tsx` — contexto e hook de autenticação.
- `src/pages/Login.tsx` — tela de login com e‑mail/senha.
- `src/pages/ResetPassword.tsx` — solicitação de reset de senha.
- `src/pages/UpdatePassword.tsx` — atualização de senha via link.
- `src/components/auth/PrivateRoute.tsx` — guarda de rota para usuários autenticados.
- `src/components/auth/PublicRoute.tsx` — redireciona usuários autenticados para o dashboard.
- `src/components/auth/AdminRoute.tsx` — guarda de rota para admin master.
- `src/components/auth/RoleRoute.tsx` — guarda de rota baseada em RBAC.
- `src/components/auth/Can.tsx` — componente de permissão condicional.
- `src/hooks/use-permissions.ts` — hook de permissões por role.
- `supabase/migrations/001–005` — migrações de RLS, multi‑tenant, JWT claims e correções.
