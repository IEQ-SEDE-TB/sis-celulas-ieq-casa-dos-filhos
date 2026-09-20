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
`churches`/`cells`/`members` (admin/senior). O arquivo também já traz,
comentado, o esboço das policies que darão ao líder acesso de leitura à
própria célula/membros — ainda não deve ser executado, fica pronto para
quando o dashboard do líder for construído.
