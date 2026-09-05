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
