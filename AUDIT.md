# Codebase Audit — Mars Shot VC CRM

**Date:** 2026-03-23
**Scope:** Full codebase audit covering security, code quality, database, dependencies, and configuration.

---

## Executive Summary

This audit identified **100+ issues** across the codebase. The most critical findings relate to **missing authentication/authorization** — all routes and server actions are accessible without auth checks. The codebase is a case-study prototype, but significant hardening is needed before any production use.

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security & Auth | 4 | 3 | 6 | 1 |
| Code Quality | 0 | 2 | 4 | 2 |
| Database & Schema | 0 | 1 | 4 | 0 |
| Dependencies & Config | 0 | 0 | 4 | 1 |

---

## 1. Security & Authentication

### 1.1 CRITICAL: No Route Authentication Guard

**File:** `app/[locale]/(routes)/layout.tsx:33-35`

The entire authenticated app shell has its auth check commented out:

```typescript
// TODO: Replace with Supabase Auth session check
// const session = await getSupabaseSession();
// if (!session) redirect("/sign-in");
```

No `middleware.ts` exists either. Any unauthenticated user can access all protected routes (`/deals`, `/portfolio`, `/ecosystem`, etc.) by navigating directly.

### 1.2 CRITICAL: Hardcoded Demo Credentials

**Files:**
- `app/api/auth/login/route.ts:3-4` — Plaintext email/password comparison
- `app/[locale]/(auth)/sign-in/page.tsx:16-22` — Credentials pre-filled in UI

```typescript
const DEMO_EMAIL = "vp@marsshot.vc";
const DEMO_PASSWORD = "marsshot2026";
```

No real Supabase Auth integration is wired up. Single credential pair for all users.

### 1.3 CRITICAL: No Authorization in Server Actions

**17+ server action files** skip authorization entirely. All project actions use a hardcoded `"demo-user"` ID:

- `actions/projects/create-task.ts:14`
- `actions/projects/delete-task.ts:6`
- `actions/projects/delete-project.ts:6`
- `actions/projects/update-task.ts:6`
- `actions/projects/create-project.ts:6`
- `actions/projects/delete-section.ts:5`
- `actions/projects/update-section-title.ts:6`
- `actions/projects/assign-document-to-task.ts:5`
- `actions/projects/create-task-in-board.ts:5`
- `actions/projects/mark-task-done.ts:5`
- `actions/projects/update-kanban-position.ts:6`
- `actions/projects/watch-project.ts:6`

Deal, portfolio, and ecosystem actions (`actions/deals/index.ts`, `actions/portfolio/index.ts`, `actions/ecosystem/index.ts`) also perform **no user/permission checks**.

### 1.4 CRITICAL: No Authentication on API Routes

All API routes lack authentication:

| Route | Risk |
|-------|------|
| `app/api/ai/one-pager/route.ts` | Unmetered AI cost |
| `app/api/ai/extract/route.ts` | Unmetered AI cost |
| `app/api/ai/email-draft/route.ts` | Unmetered AI cost |
| `app/api/ai/url-import/route.ts` | SSRF + AI cost |
| `app/api/documents/upload/route.ts` | Unauthed file upload |
| `app/api/ingest/route.ts` | Data poisoning |
| `app/api/import/contacts/route.ts` | Data poisoning |
| `app/api/cron/sla-check/route.ts` | Trigger internal processes |

### 1.5 HIGH: SSRF Risk in URL Import

**File:** `app/api/ai/url-import/route.ts:34`

Fetches user-provided URLs without validating against private IP ranges (localhost, 10.x.x.x, 192.168.x.x). Protocol validation (HTTP/HTTPS only) partially mitigates but doesn't prevent internal network scanning.

### 1.6 HIGH: Service Role Key Used Globally

**File:** `lib/supabase.ts:4-14`

`createServerSupabaseClient()` uses `SUPABASE_SERVICE_ROLE_KEY` for all queries — full admin privileges, no row-level security, no per-user isolation.

### 1.7 HIGH: Document Deletion Without Permission Check

**File:** `actions/documents/delete-document.ts:6-20`

`deleteDocument(documentId)` deletes any document by ID with no ownership verification.

### 1.8 MEDIUM: No Rate Limiting

No rate limiting on any endpoint. AI routes (`/api/ai/*`) can be called unlimited times, causing unbounded API costs.

### 1.9 MEDIUM: No CSRF Protection

**File:** `app/api/auth/login/route.ts:11-17`

Cookie uses `sameSite: "lax"` (partial protection) but no anti-CSRF token validation on state-changing operations.

### 1.10 MEDIUM: No CORS Configuration

API routes lack explicit CORS headers. Public webhook (`/api/ingest`) has no origin validation.

### 1.11 MEDIUM: No Content Security Policy

No CSP headers defined anywhere. XSS attacks have no defense-in-depth.

### 1.12 MEDIUM: Insufficient File Upload Validation

**File:** `app/api/documents/upload/route.ts:35-49`

- File name stored unsanitized from `file.name`
- MIME type from client (can be spoofed)
- Storage path includes raw filename — path traversal risk when real storage is wired up
- No file size limit enforcement server-side

### 1.13 MEDIUM: Incomplete Audit Logging

**File:** `lib/audit.ts`

- Not called for contact deletion, document deletion, or project deletion
- `userId` always null
- Failures swallowed with `.catch(console.error)`

---

## 2. Code Quality

### 2.1 HIGH: Excessive `any` Types (40+ occurrences)

Despite `strict: true` in `tsconfig.json`, `any` is used extensively in the projects module:

| File | Line(s) | Description |
|------|---------|-------------|
| `lib/junction-helpers.ts` | 50, 52 | `board: any`, `(bw: any)` |
| `components/tremor/AreaChart.tsx` | 23 | `chartData: any[]` |
| `components/tremor/BarChart.tsx` | 23 | `chartData: any[]` |
| `components/form/from-select.tsx` | 30, 84, 92 | `data: any`, callbacks |
| `app/.../projects/dashboard/page.tsx` | 15 | `dashboardData: any` |
| `app/.../projects/boards/[boardId]/components/Kanban.tsx` | 77, 91, 214, 219+ | 10+ `any` usages |
| `app/.../projects/dialogs/UpdateTask.tsx` | 33, 44, 46, 108 | Props and error |
| `app/.../projects/dialogs/NewTask.tsx` | 52, 103 | Props and error |
| `app/.../projects/tasks/page.tsx` | 11 | `tasks: any` |
| `app/.../projects/tasks/[userId]/page.tsx` | 19 | `tasks: any` |

### 2.2 HIGH: No Error Boundaries

No `error.tsx` files exist in the app directory. Unhandled errors crash entire route segments with no recovery UI.

### 2.3 MEDIUM: @ts-ignore Usage

- `app/.../projects/dialogs/UpdateTask.tsx:203`
- `app/.../projects/dialogs/NewTask.tsx:203`
- `app/.../projects/boards/[boardId]/dialogs/NewTaskInProject.tsx:199`
- `app/.../projects/tasks/components/columns.tsx:58`

All have associated TODO comments indicating known type issues.

### 2.4 MEDIUM: Debug Logging in Production

**20+ `console.log()` statements** across server actions and components:

- `actions/projects/create-task.ts:61`
- `actions/projects/delete-task.ts:48`
- `app/.../projects/dialogs/UpdateTask.tsx:94`
- `app/.../projects/dialogs/NewTask.tsx:94`
- `app/.../projects/boards/[boardId]/components/Kanban.tsx:436`
- `lib/minio.ts:13`
- And more across action files

### 2.5 MEDIUM: Inconsistent Server Action Patterns

Some actions use `createSafeAction` with Zod validation, others export raw async functions without validation:

- `actions/deals/check-duplicate.ts` — Raw async, no wrapper
- `actions/calendar/index.ts` — All functions return raw Prisma results
- `actions/projects/*` — None use `createSafeAction`

### 2.6 MEDIUM: Missing Pagination

- `actions/deals/index.ts:115-136` — `getDealsByStage()` fetches all deals
- `actions/ecosystem/index.ts:141-146` — `getColdContacts()` fetches all contacts
- No cursor/offset pagination on any list endpoint

### 2.7 LOW: Dead Code and Commented Blocks

- `app/.../projects/tasks/components/columns.tsx:15-35` — Large commented-out checkbox column
- `app/.../projects/dialogs/UpdateTask.tsx:119-133` — Commented debug code
- Unnecessary `isMounted` pattern in `NewTask.tsx:59-89`

### 2.8 LOW: Minimal Accessibility

- Only 2 `aria-label` attributes in the entire codebase
- Most form fields lack `aria-describedby` linking to error messages
- No skip navigation links

---

## 3. Database & Schema

### 3.1 HIGH: Missing Cascade Delete on PortfolioCompany

**File:** `prisma/schema.prisma:303-304`

When a Deal is deleted, the related PortfolioCompany becomes orphaned (dealId set to NULL) instead of cascading.

### 3.2 MEDIUM: Missing Foreign Key Indexes

| Model | Missing Indexes | Lines |
|-------|----------------|-------|
| CalendarEvent | dealId, portfolioCompanyId, contactId, createdBy | 528-537 |
| Document | dealId, portfolioCompanyId, contactId, termSheetId, uploadedById | 429-454 |
| Document | createdAt (for sorting) | 429-454 |

Activity model correctly has FK indexes (lines 420-422).

### 3.3 MEDIUM: Missing User Relation on DocumentVersion

**File:** `prisma/schema.prisma:467`

`uploadedById String?` has no foreign key to User, unlike `Document.uploadedBy` which correctly has the relation.

### 3.4 MEDIUM: Enum Constants Not Fully Synced

The following Prisma enums have **no corresponding arrays** in `lib/constants.ts`:

- `CalendarEventType` (INTRO_CALL, PARTNER_REVIEW, DD_MEETING, etc.)
- `CalendarEventStatus` (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
- `TermSheetStatus` (DRAFT, SENT, NEGOTIATING, SIGNED, EXPIRED)
- `EmailTemplateType` (SCREENING_PASS, SCREENING_REJECT, etc.)

### 3.5 MEDIUM: File Storage Not Implemented

**File:** `lib/minio.ts:9-14`

MinIO stub is a no-op (`console.warn`). Document upload records metadata but files are never actually stored. `actions/documents/delete-document.ts:17` has a TODO for storage deletion.

---

## 4. Dependencies & Configuration

### 4.1 MEDIUM: Prisma Version Mismatch Risk

**File:** `package.json`

- `@prisma/adapter-pg`: `"7.5.0"` (exact)
- `@prisma/client`: `"7.5.0"` (exact)
- `prisma` CLI: `"^7.4.1"` (caret — allows 7.x.x)

CLI could update to 7.6.0+ while client stays at 7.5.0, causing mismatch.

### 4.2 MEDIUM: Invalid Localhost Image Pattern

**File:** `next.config.js:9`

```javascript
{ protocol: "https", hostname: "localhost" }
```

Localhost uses HTTP, not HTTPS. Image optimization will fail for local dev images.

### 4.3 MEDIUM: Missing Environment Variable Validation

`.env.example` lists 7 required variables but no runtime validation at startup. Missing `DATABASE_URL` or `CEREBRAS_API_KEY` produces cryptic runtime errors.

### 4.4 MEDIUM: Minimal ESLint Rules

**File:** `eslint.config.mjs`

Only 1 rule override (react-hooks compatibility). No rules for import ordering, naming conventions, unused variables, or security patterns.

### 4.5 LOW: Unused Tremor CSS Reference

**File:** `tailwind.config.js:9`

References `./node_modules/@tremor/**/*.{js,ts,jsx,tsx}` but `@tremor` is not in `package.json`.

---

## Remediation Priorities

### Immediate (before any shared access)
1. Implement authentication middleware to protect `/(routes)` pages
2. Add authorization checks to all server actions
3. Add authentication to all API routes
4. Replace hardcoded demo credentials with real Supabase Auth

### Short-term
5. Add rate limiting to public endpoints
6. Add CSRF token validation
7. Fix `any` types and add error boundaries
8. Add missing database indexes
9. Validate environment variables at startup
10. Remove debug `console.log` statements

### Medium-term
11. Implement CORS and CSP headers
12. Add comprehensive audit logging
13. Add pagination to list queries
14. Sync all Prisma enums to `lib/constants.ts`
15. Fix Prisma version pinning
16. Wire up real file storage with proper validation
17. Add accessibility (ARIA labels, keyboard navigation)
