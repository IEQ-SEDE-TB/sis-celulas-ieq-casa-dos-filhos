# SIS Células IEQ Casa dos Filhos

Sistema web de gestão de células da Igreja Quadrangular Sede "Casa dos Filhos" (Tubarão/SC).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth com Google, Postgres, Storage para PDFs)
- Deploy: Vercel

## Estrutura de pastas

```
app/            rotas e páginas (App Router)
components/     componentes reutilizáveis de UI
lib/            clientes/utilitários (ex: lib/supabase)
types/          tipos TypeScript compartilhados (ex: schema do banco)
supabase/       scripts SQL do banco de dados
```

## Rodando localmente

```bash
npm install
cp .env.local.example .env.local # se o .env.local ainda não existir
npm run dev
```

Acesse http://localhost:3000

## Variáveis de ambiente

Preencha o arquivo `.env.local` (não versionado) com os dados do seu projeto Supabase.
Veja `.env.local.example` para o passo a passo de onde encontrar cada valor no
painel do Supabase.

## Banco de dados

O schema inicial está em `supabase/schema.sql`. Rode esse script no
**SQL Editor** do painel do Supabase para criar as tabelas do sistema.

Depois, rode `supabase/policies_auth.sql` — ele cria as policies de RLS
mínimas para o fluxo de login (cada usuário autenticado só pode ler/criar
o próprio registro em `profiles`).

## Autenticação (Google)

- Login com Google via Supabase Auth, com aprovação manual: todo novo
  usuário entra com `status = "pending"` e `role = "leader"` em
  `profiles`, sem acesso a nada até um admin/senior aprovar.
- `app/auth/callback/route.ts`: troca o code do OAuth pela sessão e cria
  o profile no primeiro login.
- `app/auth/signout/route.ts`: encerra a sessão.
- `app/aguardando-aprovacao/page.tsx`: tela exibida para status
  `pending`/`blocked`.
- `middleware.ts` + `lib/supabase/middleware.ts`: protege qualquer rota
  fora da lista pública (`lib/auth/routes.ts`).
- `app/(protected)/layout.tsx` + `lib/auth/profile-context.tsx`: infra
  pronta para as futuras páginas internas lerem o perfil/role logado via
  `useProfile()`.

### Configuração necessária (Google Cloud Console + Supabase)

1. **Google Cloud Console** → crie um projeto (ou use um existente) →
   **APIs & Services > OAuth consent screen** → configure como "External" →
   preencha nome do app, e-mail de suporte etc.
2. **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   → tipo "Web application".
   - **Authorized redirect URIs**: adicione
     `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`
     (pegue a URL do seu projeto em Supabase > Project Settings > API).
   - Copie o **Client ID** e o **Client Secret** gerados.
3. **Supabase Dashboard > Authentication > Providers > Google** → habilite
   e cole o Client ID/Secret do passo anterior.
4. **Supabase Dashboard > Authentication > URL Configuration**:
   - **Site URL**: `http://localhost:3000` em desenvolvimento (troque
     para a URL do Vercel em produção).
   - **Redirect URLs**: adicione `http://localhost:3000/auth/callback`
     (e a versão de produção, ex: `https://seu-dominio.vercel.app/auth/callback`).

## Gestão de Temas e Reuniões (admin/senior)

- `app/(protected)/admin/temas/`: CRUD de temas (`/admin/temas`) e, para
  cada tema, CRUD das reuniões (`/admin/temas/[id]/reunioes`), com upload
  de PDF da pregação e capa do vídeo para o Supabase Storage.
- `app/(protected)/admin/layout.tsx`: só libera acesso a usuários com
  `role` `admin` ou `senior` (`lib/auth/require-role.ts`); cada Server
  Action do módulo repete essa checagem.
- `components/ui/` (Button, Card, Badge): componentes visuais base,
  reaproveitados pelas próximas áreas do sistema. A cor `secondary`
  (roxo, definida em `tailwind.config.ts`) é usada só na área
  administrativa.

Depois de `schema.sql` e `policies_auth.sql`, rode
`supabase/admin_temas_reunioes.sql` — ele cria os buckets de Storage
(`meeting-pdfs`, `video-thumbnails`), as policies de acesso a eles e as
policies de RLS de `themes`/`meetings` (somente admin/senior podem
ler/escrever, por enquanto).

## Cadastro de Células e Membros (admin/senior)

- `app/(protected)/admin/celulas/`: CRUD de células (`/admin/celulas`,
  com seleção de líder entre os `profiles` `role=leader` e
  `status=approved`) e, para cada célula, CRUD de membros
  (`/admin/celulas/[id]/membros`).
- `cells.member_count` é recalculado automaticamente (contagem de
  membros ativos não-visitantes) a cada criação/edição/ativação de
  membro — ver `recalculateMemberCount` em
  `app/(protected)/admin/celulas/[id]/membros/actions.ts`.
- `lib/data/default-church.ts`: por enquanto o sistema atende uma única
  igreja; toda célula nova é associada à primeira linha de `churches`
  (criada automaticamente como "Casa dos Filhos" se ainda não existir).

Rode `supabase/admin_celulas_membros.sql` depois de
`admin_temas_reunioes.sql` (reaproveita a função
`current_profile_role()` criada nele) — cria as policies de RLS de
`churches`/`cells`/`members` (admin/senior).

## Gestão de Usuários (admin/senior)

- `/admin/usuarios`: lista todos os `profiles` (nome, e-mail, role,
  status, data de criação) com filtros por status e role. Ações por
  linha: aprovar (`status=pending` → `approved` + `role=leader`),
  rejeitar/bloquear, reativar, e trocar role (`approved`).
- Um usuário nunca pode alterar o próprio status/role por essa tela —
  a UI esconde os controles na própria linha e a Server Action rejeita
  a chamada mesmo assim (`assertNotSelf` em
  `app/(protected)/admin/usuarios/actions.ts`).
- Só `admin` pode promover alguém para `admin`/`senior`; um `senior`
  só consegue aprovar/gerenciar como `leader` — checado tanto nas
  opções do `<select>` quanto na Server Action (`changeUserRole`).
- Antes deste módulo, `profiles` só tinha as policies de
  `policies_auth.sql` (cada usuário lê/cria só a própria linha), então
  nem o select de líderes no formulário de célula nem esta tela
  conseguiam ler outros usuários.

Rode `supabase/admin_usuarios.sql` depois de `admin_temas_reunioes.sql`
(reaproveita `current_profile_role()`) — cria as duas policies que
faltavam em `profiles`: admin/senior podem ler todos os perfis e
atualizar qualquer perfil.

## Dashboard do Líder

- Página inicial (`app/page.tsx`): líder aprovado e já vinculado a uma
  célula (`cells.leader_id`) é redirecionado para `/lider/dashboard`;
  admin/senior vai para `/admin/dashboard`; líder sem célula vinculada
  vê um aviso para contatar um administrador.
- `/lider/dashboard`: resumo da célula, métricas do tema ativo no
  momento (`themes.active = true`) — reuniões realizadas, pendentes vs.
  atrasadas, frequência média de presença, visitantes recebidos — e a
  lista de reuniões do tema com indicador 🟢/🟡/🔴 conforme existe (ou
  não) um `meeting_record` com `status="done"` e a vigência do tema.
- `/lider/reuniao/[meetingId]`: conteúdo somente leitura da reunião
  (checklist, versículos, dinâmica, perguntas, PDF, vídeo) + formulário
  para marcar como realizada. A célula usada é sempre a do líder logado
  (`getLeaderCell`, nunca um id vindo da URL/formulário).
- `lib/data/leader-cell.ts`: `getLeaderCell(profileId)`, usado por
  ambas as páginas acima.
- `lib/auth/require-role.ts`: `requireLeader()`, mesmo padrão de
  `requireAdminOrSenior()`.
- Cor de destaque desta área: `primary` (azul, `tailwind.config.ts`),
  diferente do roxo (`secondary`) da área administrativa.

Rode `supabase/lider_dashboard.sql` depois de `admin_celulas_membros.sql`
— ativa o acesso de leitura do líder à própria célula/membros (que tinha
ficado só de esboço, comentado, no módulo anterior), dá ao líder acesso
de leitura a `themes`/`meetings` ativos, cria as policies de
`meeting_records` (admin/senior têm acesso total; líder só lê/cria/edita
os registros da própria célula) e adiciona a constraint `unique
(cell_id, meeting_id)` usada pelo "marcar como realizada".

## Dashboard Geral (admin/senior)

- `/admin/dashboard`: agora é a página inicial da área administrativa
  (nav "Dashboard" primeiro, redirecionamento de admin/senior a partir
  de `/`). Métricas do topo: células ativas, membros ativos (soma de
  `cells.member_count`), líderes aprovados e — só quando existe um tema
  com `active=true` cuja vigência inclui hoje — reuniões
  realizadas/pendentes/atrasadas/visitantes recebidos desse tema,
  somando todas as células ativas.
- Tabela "Células — Visão Geral": nome, líder, membros, "X/Y reuniões"
  do tema selecionado no filtro (independente do tema usado nas
  métricas do topo) com indicador 🟢/🟡/🔴 — `lib/data/cell-progress.ts`
  (`computeCellProgressStatus`) compara o progresso real com o ritmo
  esperado (reuniões distribuídas uniformemente entre `start_date` e
  `end_date` do tema): 🔴 vigência encerrada com reunião sem registro,
  🟡 dentro do prazo mas atrasada em relação ao esperado, 🟢 em dia.
- Filtros por tema (todos, não só o ativo) e por status da célula —
  `<form method="GET">` simples, sem JS: a própria navegação do
  navegador aplica `?tema=...&status=...` e a página (Server Component)
  refaz as queries.
- Sem tema ativo agora, o dashboard mostra um aviso no topo mas
  continua exibindo a tabela de células normalmente (o filtro de tema
  ainda permite escolher um ciclo passado para revisar).
- Não precisou de SQL novo: reaproveita as policies de leitura para
  admin/senior já criadas em `admin_temas_reunioes.sql`,
  `admin_celulas_membros.sql`, `lider_dashboard.sql` (meeting_records)
  e `admin_usuarios.sql` (profiles).

## Identidade visual (logo)

- `public/logo-ieq.png`: logo oficial da IEQ (cruz, pomba, cálice e
  coroa), fundo transparente — funciona tanto sobre fundo claro quanto
  sobre os cabeçalhos coloridos.
- `components/ui/Logo.tsx`: wrapper de `next/image` em torno do
  arquivo, com `alt` fixo ("Logo Igreja do Evangelho Quadrangular") e
  `size` configurável. Usado na landing page (96px), em
  `/aguardando-aprovacao` (72px) e nos cabeçalhos de `/admin`/`/lider`
  (40px).
- `app/layout.tsx`: `metadata.icons` aponta pra ele (favicon e
  apple-touch-icon).
- `components/layout/AreaHeader.tsx`: cabeçalho compartilhado por
  `/admin` (roxo) e `/lider` (azul) — antes cada layout tinha o próprio
  JSX duplicado; agora só muda `variant`, `eyebrow` e `navItems`.
