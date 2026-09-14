# API Reference

All endpoints return JSON. Errors: `{ "error": string, "code"?: string, "details"??: [...] }`.
Rate limits are per IP. Auth = `fc_session` HttpOnly JWT cookie.

## Public

| Method | Path | Auth | Rate limit | Purpose |
| ------ | ---- | ---- | ---------- | ------- |
| POST | `/api/leads` | — | 6/hour | Create lead. Body: serviceSlug, areaSlug?, name, phone, description?, preferredTime?, consent + optional photos[] (upload ids) |
| POST | `/api/uploads` | — | 30/hour | Multipart image upload for lead form → returns `{ id }` |
| POST | `/api/events` | — | 60/min | Track CTA events (`whatsapp_click`, `call_click`, …) |
| GET  | `/api/health` | — | — | `{ ok: true }` liveness probe |
| GET  | `/api/files/[...key]` | signed URL or session | — | Secure file serving (never public paths) |
| POST | `/api/quote/[token]/respond` | token | 20/hour | Customer accepts/rejects quotation. Body: `{ action: "ACCEPT"\|"REJECT" }` |

## Auth

| Method | Path | Body / notes |
| ------ | ---- | ------------ |
| POST | `/api/auth/login` | `{ phone, password }` (10/15min per IP). Sets session cookie; role decides redirect target. Audited incl. failures. |
| POST | `/api/auth/logout` | Clears session cookie |

## Field worker (`FIELD_WORKER`, own jobs only)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| PATCH | `/api/field/jobs/[id]` | Update status (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`) and/or append timestamped note. Starting a job queues the on-the-way WhatsApp. |
| POST | `/api/field/jobs/[id]/photos` | Multipart camera upload. Fields: `file`, `stage` (`BEFORE`\|`DURING`\|`AFTER`). 120/hour. |

## Admin (ADMIN unless noted)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| PATCH | `/api/admin/leads/[id]` | Status transition (validated by state machine), assign staff, set visit time. Sets `firstContactedAt` on first CONTACTED. STAFF allowed. |
| POST | `/api/admin/leads/[id]/notes` | Add internal note. STAFF allowed. |
| POST | `/api/admin/jobs` | Create job from lead/customer. STAFF allowed. |
| PATCH | `/api/admin/jobs/[id]` | Status, assignment, schedule, notes. STAFF allowed. Completing syncs lead + schedules review request. |
| POST | `/api/admin/quotes` | Create quote with line items; totals computed server-side. STAFF allowed. |
| PATCH | `/api/admin/quotes/[id]` | `action`: SEND (generates PDF, stores it, queues WhatsApp), MARK_ACCEPTED, MARK_REJECTED. |
| PUT | `/api/admin/settings` | Business phone/WhatsApp/email, working hours, Google review URL, review delay days. ADMIN only. |
| POST | `/api/admin/areas` | Create service area (auto-links active services). ADMIN only. |
| PATCH | `/api/admin/areas` | Toggle active/rename/reorder. ADMIN only. |
| PUT | `/api/admin/templates` | Edit message template body. ADMIN only. |
| POST | `/api/cron/process` | Worker tick. Header `x-cron-secret`. |

## Conventions

- **Zod-validated** bodies; malformed input → 400 with field details.
- **Generic error messages** to unauthenticated callers; specifics only in logs.
- Every mutating endpoint writes an **AuditLog** row (actor, action, entity, ip).
- Responses carry `x-request-id` matching structured log lines.
