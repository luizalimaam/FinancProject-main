# Nexo — finanças pessoais

O Nexo é um aplicativo de organização financeira pessoal. Reúne receitas, despesas e indicadores em uma interface responsiva, com autenticação e armazenamento no Supabase.

## Tecnologias

- Vue 3 e TypeScript
- Ionic Vue
- Supabase Auth e banco de dados
- ApexCharts
- Vite

## Começar

### Requisitos

- Node.js e npm
- Um projeto Supabase

### Instalação

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```env
   VITE_APP_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_APP_SUPABASE_KEY=SUA_CHAVE_PUBLICA
   ```

3. No Supabase, habilite a autenticação por e-mail. Se a confirmação de e-mail estiver ativa, configure as URLs de redirecionamento para os endereços de desenvolvimento e publicação. Para uso contínuo, configure um servidor SMTP próprio em **Authentication → SMTP Settings**.

4. Inicie o servidor local:

   ```bash
   npm run dev
   ```

Reinicie o servidor após alterar as variáveis de ambiente.

## O que você pode fazer

- Criar uma conta e entrar com e-mail e senha.
- Registrar, editar, consultar e excluir receitas e despesas.
- Acompanhar saldo, totais, quantidade de lançamentos e proporção de gastos.
- Visualizar gastos por categoria e movimentações mensais.
- Consultar os dados da conta e encerrar a sessão.

## Configuração do Supabase

O aplicativo espera duas tabelas: `receitas` e `despesas`. Ambas devem ter as colunas:

| Coluna | Uso |
| --- | --- |
| `id` | Identificador do lançamento |
| `descricao` | Descrição |
| `valor` | Valor numérico |
| `categoria` | Categoria do lançamento |
| `data` | Data compatível com `YYYY-MM-DD` |
| `user_id` | Identificador do usuário autenticado |

Os serviços filtram os dados pelo usuário atual. Configure políticas de Row Level Security (RLS) para permitir que cada usuário consulte e altere somente os próprios registros (`user_id = auth.uid()`). As verificações no cliente não substituem a RLS. Este projeto não cria as tabelas nem aplica migrations automaticamente.

O cadastro cria uma conta em **Supabase Authentication → Users**. Não é criado automaticamente um registro em uma tabela pública de perfil.

## Páginas

| Caminho | Página | Acesso |
| --- | --- | --- |
| `/login` | Entrar | Visitantes |
| `/register` | Criar conta | Visitantes |
| `/dashboard` | Visão geral | Autenticado |
| `/receitas` | Receitas | Autenticado |
| `/despesas` | Despesas | Autenticado |
| `/perfil` | Perfil | Autenticado |

## Comandos

```bash
npm run dev          # inicia o servidor de desenvolvimento
npm run build        # verifica os tipos e gera a versão de produção
npm run preview      # serve localmente a versão de produção
npm run eslint       # executa o ESLint
npm run test:unit    # executa os testes unitários
npm run test:e2e     # executa os testes Playwright
npm test             # executa os testes unitários e E2E
```

O Playwright pode exigir a instalação do navegador configurado:

```bash
npx playwright install
```

## Organização do código

```text
src/
├── components/   # cabeçalho, indicadores, gráficos e lançamentos
├── router/       # rotas e proteção de autenticação
├── service/      # autenticação e acesso ao Supabase
├── theme/        # identidade visual e estilos globais
└── views/        # páginas da aplicação
```
