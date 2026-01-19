# 🚀 TurbineApp

CRM completo para gestão de clientes e leads, desenvolvido com React + TypeScript.

## 📋 Sobre o Projeto

TurbineApp é um sistema de CRM moderno e intuitivo para gerenciar seu funil de vendas, clientes e leads de forma eficiente.

### ✨ Funcionalidades

- **Gestão de Leads**: Funil visual com status (Novo, Contato, Proposta, Fechado)
- **Gestão de Clientes**: Cadastro completo com análise de perfil
- **Link Compartilhável**: Página pública para auto-cadastro de leads (`/cadastro`)
- **Persistência de Dados**: Dados salvos no LocalStorage
- **Linhas Expansíveis**: Detalhes adicionais ao clicar em leads/clientes
- **Campos de Tráfego**: Seguidores, posts, orçamento mensal
- **Análise de Perfil**: Segmento, objetivo, público-alvo, score

## 🛠️ Tecnologias Utilizadas

- **Vite** - Build tool rápido
- **TypeScript** - Tipagem estática
- **React** - Biblioteca de UI
- **shadcn/ui** - Componentes de interface
- **Tailwind CSS** - Estilização utilitária
- **React Router** - Navegação

## 🚀 Como Executar

### Pré-requisitos

- Node.js instalado - [instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm ou bun

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
│   ├── layout/      # Layout (Sidebar, Header)
│   └── dashboard/   # Componentes do dashboard
├── contexts/        # Contextos React (DataContext)
├── pages/           # Páginas da aplicação
│   ├── Index.tsx    # Dashboard
│   ├── Leads.tsx    # Gestão de leads
│   ├── Clientes.tsx # Gestão de clientes
│   └── CadastroPublico.tsx # Página pública
├── hooks/           # Hooks customizados
└── lib/             # Utilitários
```

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
