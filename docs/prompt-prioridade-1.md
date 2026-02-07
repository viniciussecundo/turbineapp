# Prompt — Prioridade 1 (Auth básico)

Use este prompt para iniciar a implementação da **Prioridade 1** do roadmap: **autenticação básica** com Supabase.

---

## Prompt

Você é um engenheiro de software sênior responsável por iniciar a implementação do **Auth básico** no TurbineApp.

### Objetivo
Implementar a **autenticação básica** (login, sessão, logout e guardas de rota) usando **Supabase Auth**, seguindo o PRD e o backlog já definidos.

### Contexto do repositório
- Frontend em **React + TypeScript + Vite**.
- Rotas internas hoje não possuem proteção.
- Já existe configuração do Supabase no projeto (`src/lib/supabase.ts`).
- Documentos de referência:
  - `docs/prd-saas-crm.md`
  - `docs/saas-auth-backlog-schema.md`
  - `docs/technology-docs.md`

### Escopo (Prioridade 1)
1) **Tela de login** (UI + validação).
2) **Integração com Supabase Auth** (signIn com email/senha).
3) **Gestão de sessão** (persistência e recuperação de sessão atual).
4) **Guardas de rota** (bloquear acesso a rotas internas sem sessão).
5) **Logout**.

### Requisitos de entrega
- Implementar componentes e hooks necessários para sessão.
- Proteger rotas privadas (dashboard e módulos internos).
- Não alterar fluxos de negócio além do necessário para autenticação.
- Garantir UX clara para login e estado de autenticação.
- Adicionar documentação de uso e notas de configuração, se necessário.

### Critérios de aceitação
- Usuário **não autenticado** não consegue acessar rotas internas.
- Usuário **autenticado** acessa normalmente o CRM.
- Login com credenciais válidas cria sessão.
- Logout encerra sessão.
- Erros de login são exibidos de forma amigável.

### Observações
- Se necessário, criar um `AuthContext` para expor sessão e ações.
- Usar padrões existentes do projeto (UI com shadcn + Tailwind).
- Evitar alterações amplas sem necessidade.
- Considerar que haverá **times** (compartilhamento interno) e **admin master** (Turbine Tech) para validação/bloqueio de usuários nas próximas fases.

---

### Saída esperada
Forneça um plano de implementação, depois aplique as mudanças no código com commits pequenos e mensagens claras.
