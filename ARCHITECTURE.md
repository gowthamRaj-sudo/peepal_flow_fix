# Architecture

Peepal Flow Fix Solutions — production platform for a Chennai home-services business.

## Stack

| Layer      | Choice                                   | Why                                              |
| ---------- | ---------------------------------------- | ------------------------------------------------ |
| Framework  | Next.js 15 (App Router, standalone)      | SSR/ISR for SEO + API routes in one deploy       |
| Language   | TypeScript (strict, noUncheckedIndexedAccess) | Catch bugs at compile time                  |
| Styling    | Tailwind CSS v3.4                        | Fast, consistent, small bundle                   |
| Database   | PostgreSQL + Prisma 6                    | Relational integrity for ops data                |
| Auth       | jose JWT in HttpOnly cookie              | No external service; edge-compatible middleware  |
| Files      | Local disk or S3 driver behind one interface | Start free, switch to S3 with an env var     |
| PDF        | pdf-lib                                  | Pure JS, no headless browser needed              |
| Validation | zod everywhere                           | One schema language across client/server         |

## Layout

```
src/
├── app/
│   ├── (public)/            # SEO website: home, services, areas, projects, legal
│   │   └── quote/[token]/   # Public quotation view (noindex, token-gated)
│   ├── admin/               # Ops dashboard (login, dashboard group)
│   ├── field/               # Father's phone app: today's jobs, camera, big buttons
│   ├── api/                 # Route handlers (public, admin, field, cron)
│   ├── layout.tsx           # Root metadata
│   ├── sitemap.ts robots.ts manifest.ts opengraph-image.tsx
├── components/
│   ├── ui/                  # Button/Input/Card primitives (44px+ touch targets)
│   └── site/                # Header/footer/CTA/JSON-LD shared by public pages
├── config/                  # Business NAP, service & area content (SEO source of truth)
├── domain/                  # Pure business rules: lead status machine, quote math
├── features/                # Client components grouped by feature
├── lib/                     # env, auth, api wrapper, rate limit, money, phone, codes
├── server/                  # DB-touching services (leads/jobs/quotes/settings/catalog/audit)
└── services/                # Infrastructure: notifications, templates, storage, pdf
```

## Key decisions

### Security model
- **Server-side RBAC only.** Pages re-check `getSession()`; APIs declare `roles` in `withApi`; middleware only redirects UX paths.
- **Field workers are scoped to their own jobs** — every field endpoint verifies `job.assignedToId === user.id` before reading/writing.
- **Uploads are never public.** Storage keys are random (`uploads/<yyyy>/<mm>/<uuid>.<ext>`); serving goes through `/api/files/[...key]`, which validates a signed URL (local driver) or the viewer's role and ownership.
- **Upload validation is content-based**: magic-byte sniffing overrides client MIME; images ≤10 MB, videos ≤60 MB; leads ≤8 files; per-IP rate limits on every write endpoint.
- **CSRF**: state-changing API calls require same-origin; session cookie is SameSite=Lax, Secure in prod, HttpOnly.

### Speed-to-lead pipeline
1. Lead form → `POST /api/leads` creates Customer (upsert by phone) + Lead with generated code `FC-####`.
2. Notifications queue rows for customer confirmation + owner alert (WhatsApp preferred, SMS/email fallback).
3. A worker (cron or long-running process) retries queued messages up to 3× and sends review requests `N` days after job completion (exactly once, tracked via `ReviewRequest.sentAt`).
4. With no provider keys configured everything logs to console — zero cost until real APIs exist.

### Status machines (enforced server-side)
- Leads: NEW → CONTACTED → VISIT_SCHEDULED → QUOTATION_SENT → CUSTOMER_APPROVED → JOB_SCHEDULED → IN_PROGRESS → COMPLETED (+ CANCELLED/LOST terminal, reopenable to NEW). See `src/domain/lead-status.ts`.
- Jobs: SCHEDULED → IN_PROGRESS → COMPLETED/CANCELLED. Completing syncs the linked lead and schedules the review request.
- Quotes: DRAFT → SENT → VIEWED → ACCEPTED/REJECTED/EXPIRED. Sending generates the PDF once, stores it, and queues the customer message.

### SEO
- Service pages prerender from `src/config/services.data.ts`; area pages render from DB with ISR (`revalidate = 3600`) and fall back to config data when the DB is unreachable at build time.
- JSON-LD: `LocalBusiness` site-wide, `Service`/`FAQPage` on service pages, `BreadcrumbList` everywhere hierarchical.
- `sitemap.xml` includes static routes, all services, active areas, top-area × core-service combos, published projects.

### Money & codes
- All amounts are `Decimal(12,2)` in Postgres; totals computed once in `computeQuoteTotals` (discount capped at subtotal, tax on discounted base).
- Human-friendly codes from Postgres sequences: FC-1001…, JOB-2001…, QTE-3001….

## Environments
`.env.example` documents every variable. Required in production: `DATABASE_URL`, `AUTH_SECRET` (32+ bytes), `NEXT_PUBLIC_SITE_URL`. Optional integrations activate automatically when their keys appear: WhatsApp Cloud API, generic HTTP SMS gateway, Resend email, S3 storage.

## Deployment shape
- `docker-compose.yml` for dev (Postgres on host port **5433**) and prod (app container + db).
- Dockerfile builds Next.js standalone; `prisma migrate deploy` runs as a release step before boot.
- `/api/cron/process` (secret header) drives workers if you prefer Vercel cron over a sidecar.
