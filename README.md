# 🚀 TurbineApp

CRM SaaS multi‑tenant para gestão de clientes e leads, desenvolvido com React + TypeScript + Supabase.

## 📋 Sobre o Projeto

TurbineApp é um sistema de CRM SaaS moderno e seguro, com autenticação robusta, RBAC, isolamento multi‑tenant e painel de administração master.

### ✨ Funcionalidades

- **Autenticação Completa**: Login, logout, reset de senha com Supabase Auth
- **Multi‑tenant**: Isolamento de dados por organização com RLS (Row Level Security)
- **RBAC**: Controle de acesso por papéis (Admin, Vendas, Financeiro, Leitura)
- **Admin Master**: Painel Turbine Tech para validar/bloquear usuários globalmente
- **Onboarding**: Criação de organização + perfil de administrador
- **Gestão de Leads**: Funil visual com status (Novo, Contato, Proposta, Fechado)
- **Gestão de Clientes**: Cadastro completo com análise de perfil
- **Finanças**: Controle de transações, carteiras e orçamentos com geração de PDF
- **Link Compartilhável**: Página pública para auto-cadastro de leads (`/cadastro`)
- **Relatórios**: Dashboard com gráficos e métricas

## 🛠️ Tecnologias Utilizadas

- **Vite** - Build tool rápido
- **TypeScript** - Tipagem estática
- **React** - Biblioteca de UI
- **Supabase** - Backend (Auth, Postgres, RLS, Storage)
- **shadcn/ui** - Componentes de interface
- **Tailwind CSS** - Estilização utilitária
- **React Router** - Navegação
- **TanStack React Query** - Gerenciamento de estado assíncrono
- **React Hook Form + Zod** - Formulários e validação
- **jsPDF** - Geração de PDFs
- **Recharts** - Gráficos e visualização

## 🚀 Como Executar

### Pré-requisitos

- Node.js instalado - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm ou bun
- Conta no [Supabase](https://supabase.com/) com projeto configurado

### Configuração do Supabase

Crie um arquivo `.env` na raiz do projeto com as variáveis do seu projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

Aplique as migrações SQL na ordem (via Supabase Dashboard > SQL Editor):

1. `supabase/migrations/001_auth_rls_policies.sql`
2. `supabase/migrations/002_multi_tenant.sql`
3. `supabase/migrations/003_jwt_claims_rbac.sql`
4. `supabase/migrations/004_fix_rls_recursion.sql`
5. `supabase/migrations/005_fix_delete_policies.sql`

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
├── components/
│   ├── auth/            # Guardas de rota e componentes de autorização
│   │   ├── PrivateRoute.tsx   # Bloqueia acesso sem sessão
│   │   ├── PublicRoute.tsx    # Redireciona se já autenticado
│   │   ├── RoleRoute.tsx      # Guarda com verificação de role
│   │   ├── AdminRoute.tsx     # Acesso exclusivo admin master
│   │   └── Can.tsx            # Renderização condicional por permissão
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # Layout (Sidebar, Header)
│   └── dashboard/       # Componentes do dashboard
├── contexts/
│   ├── AuthContext.tsx   # Autenticação (sessão, login, logout, perfil)
│   └── DataContext.tsx   # Dados do CRM
├── hooks/
│   ├── use-permissions.ts  # Hook de verificação de permissões (RBAC)
│   └── use-toast.ts        # Notificações
├── services/            # Serviços de acesso a dados (Supabase)
│   ├── leadService.ts
│   ├── clientService.ts
│   ├── profileService.ts
│   └── ...
├── pages/
│   ├── Login.tsx           # Tela de login
│   ├── ResetPassword.tsx   # Solicitar reset de senha
│   ├── UpdatePassword.tsx  # Confirmar nova senha
│   ├── Onboarding.tsx      # Criar organização + perfil
│   ├── Admin.tsx           # Painel admin master
│   ├── Index.tsx           # Dashboard
│   ├── Leads.tsx           # Gestão de leads
│   ├── Clientes.tsx        # Gestão de clientes
│   └── ...
└── lib/
    ├── supabase.ts         # Cliente Supabase
    └── utils.ts            # Utilitários gerais
```

## 🔗 Link Compartilhável de Cadastro

Cada organização possui um link público único para auto-cadastro de leads. O link inclui o `tenant_id` da organização como parâmetro de URL:

```
https://seudominio.com/cadastro?t=<tenant-uuid>
```

### Como obter o link

1. Acesse `/leads` no painel autenticado
2. Clique no botão **"Link Compartilhável"**
3. O link com o `tenant_id` correto é copiado automaticamente para a área de transferência

> **Importante:** Links gerados sem o parâmetro `?t=` não funcionam. Sempre use o botão na página de Leads para garantir o link correto.

### Como funciona

- O formulário público em `/cadastro` lê o `tenant_id` do parâmetro `?t=` da URL
- O lead é inserido diretamente no banco via policy RLS de insert anônimo (`leads: anon insert`)
- Usuários anônimos têm permissão apenas de INSERT (sem SELECT), então a operação não lê o resultado de volta — apenas verifica se houve erro
- O lead aparece imediatamente na página `/leads` do tenant correspondente com status `Novo` e marcado como `self_registered`

---

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
