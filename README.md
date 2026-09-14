# Peepal Flow Fix Solutions

Production platform for a Chennai home-services business (plumbing, electrical, bathroom renovation): SEO website that captures leads with photos, an ops dashboard for the office, and a big-button phone app for the field technician.

## Quick start (dev)

```bash
npm install
docker compose up -d db        # Postgres on localhost:5433
npx prisma migrate deploy      # apply schema
npm run db:seed                # services, areas, templates, demo users
npm run dev                    # http://localhost:3000
```

Demo logins (seeded):

| Role         | Phone          | Password       |
| ------------ | -------------- | -------------- |
| Admin        | +919000000001  | `Admin@Dev123` |
| Staff        | +919000000002  | `Staff@Dev123` |
| Field worker | +919000000003  | `Field@Dev123` |

- Website: `/`
- Ops dashboard: `/admin`
- Field app: `/field` (sign in as the field user on a phone)

## Scripts

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Dev server                            |
| `npm run build`      | Production build (standalone output)  |
| `npm start`          | Run production server                 |
| `npm run typecheck`  | `tsc --noEmit`                        |
| `npm test`           | Vitest unit tests                     |
| `npm run e2e`        | Playwright smoke tests (needs server) |
| `npm run db:migrate` | `prisma migrate dev`                  |
| `npm run db:deploy`  | `prisma migrate deploy`               |
| `npm run db:seed`    | Seed reference data                   |
| `npm run worker`     | Long-running notification worker      |

## Configuration

Copy `.env.example` → `.env`. Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`.

Everything else is optional and activates when keys exist:

- WhatsApp Cloud API (`WHATSAPP_API_*`) / SMS gateway (`SMS_API_KEY`) / email (`EMAIL_API_KEY`)
- S3 storage (`STORAGE_DRIVER=s3` + `S3_*`) — otherwise files live in `.data/uploads/`
- `GOOGLE_REVIEW_URL`, `CRON_SECRET`, owner alert phone

## Cron / workers

Notifications retry automatically. Two ways to drive them:

1. Sidecar: `npm run worker` (every 5 min)
2. HTTP: `POST /api/cron/process` with header `x-cron-secret: $CRON_SECRET`

Also handles review requests sent N days after job completion.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how it fits together
- [docs/API.md](./docs/API.md) — endpoint reference
- [ROADMAP.md](./ROADMAP.md) — what's done and what's next
