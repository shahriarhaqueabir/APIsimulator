# Provider Ops Console

A Next.js operations console for a sandbox provider API. It surfaces order
monitoring, onboarding status, event inspection, and guided triage, backed
by either a live provider API or a seeded local demo database.

> This repository is a proof-of-concept / test lab. It is not a production
> brokerage frontend.

## Stack

- Next.js 16 (App Router, `src/`), TypeScript, pnpm
- Tailwind CSS v4 + shadcn/ui
- TanStack React Query v5
- Prisma + SQLite (via `@prisma/adapter-libsql`)
- Zod v4
- Vitest (unit) + Playwright (e2e)

## Getting started

```bash
cd lemonmarkets
pnpm install
cp .env.example .env   # optional: add PROVIDER_API_KEY / PROVIDER_BASE_URL
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example`. All values are optional for demo mode:

- `PROVIDER_API_KEY` — provider sandbox API key (omit for demo mode)
- `PROVIDER_BASE_URL` — provider API base URL
- `DATABASE_URL` — SQLite/libsql URL (default `file:./dev.db`)

Secrets are read **only** on the server. Never expose them via
`NEXT_PUBLIC_*`.

## Scripts

```bash
pnpm dev        # dev server
pnpm build      # production build
pnpm lint       # eslint
pnpm test       # vitest (watch)
pnpm test:run   # vitest (once)
pnpm test:e2e   # playwright
```

## Architecture

Browser → `/api/provider/*` (Next.js route handlers) → provider API.
Credentials never reach the browser. External responses are parsed with Zod
at the boundary. Remote state is managed with React Query; UI state is
local. See `docs/` for the full product, architecture, and build playbook.

## Documentation

- `docs/playbook for provider-ops-console.md` — build playbook (shared
  separately; not committed)
- `docs/superpowers/specs/` — design spec
- `docs/superpowers/plans/` — implementation plan
- `01_Product_and_Functional_Specification.md`
- `02_Technical_Architecture_and_Engineering_Specification.md`
- `03_Agentic_Development_Playbook.md`

## Security

- No secrets in the client bundle.
- Tokens are not persisted in browser storage.
- External JSON is rendered as data, never as HTML.
- Demo mode runs entirely against the seeded local database.
