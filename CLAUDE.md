# CLAUDE.md — Mars Shot VC CRM

## Project Overview

Mars Shot VC CRM is a deal-pipeline management tool for a micro-VC fund. It tracks deals from sourcing through decision, manages portfolio companies, ecosystem contacts, and documents. This is a **case-study prototype** — not a production SaaS app.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict)
- **Database**: Supabase PostgreSQL via Prisma 7 with `@prisma/adapter-pg` (driver adapters)
- **Auth**: Supabase Auth (email/password) — demo credentials pre-filled on sign-in
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Forms**: react-hook-form + zod v4 validation
- **State**: zustand (client), SWR for data fetching where needed
- **i18n**: next-intl (currently English only)
- **AI**: Cerebras Cloud SDK (fast inference)
- **Email**: Resend
- **Deployment**: Netlify
- **Package Manager**: pnpm (>=9)
- **Node**: >=22.12.0

## Project Structure

```
app/[locale]/(auth)/       # Auth pages (sign-in)
app/[locale]/(routes)/     # Authenticated app shell
  deals/                   # Deal pipeline CRUD + Kanban
  portfolio/               # Portfolio companies
  ecosystem/               # Contacts & network
  documents/               # Uploaded docs (decks, briefs)
  projects/                # Project boards
  reports/                 # Reporting views
  settings/                # User settings
  components/              # Layout: sidebar, header, footer
actions/                   # Server actions (grouped by domain)
  deals/                   # Deal CRUD, stage transitions
  dashboard/               # Dashboard stats
  ecosystem/               # Contacts
  portfolio/               # Portfolio companies
  documents/               # Document management
components/                # Shared components
  ui/                      # shadcn/ui primitives (DO NOT edit by hand — use `pnpm dlx shadcn add`)
  deals/                   # Deal-specific components
  ecosystem/               # Ecosystem-specific components
lib/
  prisma.ts                # Singleton Prisma client with pg adapter
  supabase.ts              # Supabase client helpers (server + browser)
  constants.ts             # Pipeline stages, enums, SLA config, label maps
  create-safe-action.ts    # Zod-validated server action wrapper
  ai.ts                    # AI integration helpers
  utils.ts                 # cn() and general utilities
prisma/
  schema.prisma            # Single-file schema (PostgreSQL)
  seeds/seed.ts            # Seed script
```

## Key Conventions

### Server Actions
- All mutations go through `actions/` as Next.js server actions
- Use `createSafeAction` from `lib/create-safe-action.ts` for Zod validation
- Group actions by domain: `actions/deals/`, `actions/ecosystem/`, etc.
- Server actions should call `prismadb` from `lib/prisma.ts`

### Database
- Prisma with `@prisma/adapter-pg` driver adapter (not default Prisma engine)
- Config lives in `prisma.config.ts`, loads `.env.local` then `.env`
- After schema changes: `pnpm db:generate` then `pnpm db:push`
- Seed with: `pnpm db:seed`
- Enums are defined in `prisma/schema.prisma` AND mirrored in `lib/constants.ts` — keep both in sync

### Components
- **shadcn/ui components** live in `components/ui/` — add new ones with `pnpm dlx shadcn add <component>`, never write them by hand
- Domain components go in `components/<domain>/` or colocated in `app/[locale]/(routes)/<domain>/`
- Use `@/` import alias for all project imports
- Icons: `lucide-react`

### Styling
- Tailwind CSS v4 (no `tailwind.config.ts` — config is in CSS)
- Use `cn()` from `lib/utils.ts` to merge class names
- Responsive: mobile-first with `md:` and `lg:` breakpoints

### Routing
- All routes are under `app/[locale]/(routes)/` with next-intl
- Auth routes under `app/[locale]/(auth)/`
- API routes under `app/api/`

### Domain Concepts
- **Deal stages** follow a fixed pipeline: Deal Source → Radar → Screening → Intro Call → Partner Gut-Check → Active DD → Partner Review → Decision
- Each stage has an **SLA** (hours) defined in `lib/constants.ts`
- **Stage gates** define required fields before advancing (also in `lib/constants.ts`)
- Deals have a `stageEnteredAt` timestamp for SLA tracking

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Generate Prisma client + build Next.js
pnpm lint             # ESLint (zero warnings allowed)
pnpm test             # Jest unit tests
pnpm test:e2e         # Playwright end-to-end tests
pnpm db:generate      # Regenerate Prisma client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

## Environment Variables

Required variables are listed in `.env.example`. Store secrets in `.env.local` (gitignored). Key vars:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `CEREBRAS_API_KEY` — AI inference
- `RESEND_API_KEY` — Transactional email

## Guidelines for AI Agents

- Always read a file before editing it
- Run `pnpm lint` after making changes to catch issues early
- When adding new deal pipeline features, check `lib/constants.ts` for stage/SLA definitions
- When modifying the Prisma schema, also update `lib/constants.ts` if enums changed
- Prefer server components; only use `"use client"` when interactivity is required
- Keep server actions thin — business logic in the action, no UI concerns
- Do not commit `.env.local` or any file containing real credentials
