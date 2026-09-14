# Roadmap

## Phase 1 — MVP (this codebase) ✅

- [x] Next.js 15 + TS strict scaffold, Tailwind design system (44px+ touch targets)
- [x] Prisma schema: users, customers, leads, jobs (+photos), quotes (+items), payments, review requests, notifications, templates, portfolio, campaigns, audit, settings, events
- [x] Auth: phone+password, JWT cookie, edge middleware, role-scoped redirects
- [x] Public site: home, 8 service pages, 18 area pages + area×service combos, about/contact/legal
- [x] Lead capture: 6-step form, client-side image compression, ≤8 photos, UTM capture, rate limits
- [x] Ops dashboard: metrics, lead pipeline w/ guarded transitions, customers, jobs, quotes → PDF → WhatsApp link
- [x] Field app: today's jobs, call/WhatsApp/navigate, before/after camera flow, notes, offline-friendly big buttons
- [x] Notifications: queue + retry, WhatsApp/SMS/email providers behind env keys, console fallback
- [x] Templates editable in DB; settings (phone/hours/review URL/delay) editable by admin
- [x] Marketing analytics: source/area/service breakdowns, quote win-rate, CTA event tracking
- [x] SEO: JSON-LD everywhere, sitemap incl. combos & projects, robots, manifest, OG image
- [x] Workers via cron endpoint or sidecar process
- [x] Unit tests (quote math, state machine, rate limiter, formatting, templates) + Playwright smoke skeleton
- [x] Dockerfile (standalone), docker-compose, GitHub Actions CI

## Phase 2 — After first revenue

- [ ] Payments: record advance/balance per job (Payment model exists), simple daily cash sheet for the father
- [ ] Portfolio admin: publish projects with before/after photos from completed jobs
- [ ] Campaign tracking UI: create Campaign rows, auto-tag leads by landing UTM
- [ ] WhatsApp Cloud API production templates approval + interactive buttons
- [ ] Google Business Profile review deep-links per technician attribution
- [ ] PWA install prompt + offline queue of field photos (IndexedDB)

## Phase 3 — Scale

- [ ] Multi-city expansion (area model already isolated)
- [ ] Subcontractor accounts with scoped dashboards
- [ ] Inventory of common materials for accurate quoting
- [ ] SMS fallback provider failover chains
- [ ] Read replica + Redis rate limiting when traffic justifies it

## Operational notes

- Speed-to-lead target <5 min: owner alert fires on every new lead; check `/api/health` uptime monitor.
- Backups: nightly `pg_dump` + weekly `.data/uploads` sync to S3.
- Rotate `AUTH_SECRET` only with planned logout-all (sessions are stateless JWTs).
