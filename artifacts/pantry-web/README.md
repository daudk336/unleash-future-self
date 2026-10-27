# Pantry Tracker

Pantry Tracker helps signed-in users track pantry items and expiration dates. Members can manage only their own items; admins can view every user's items.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /api/health` | Public | Returns `{ "ok": true }` |
| `GET /api/healthz` | Public | Legacy health check |
| `GET /api/me` | Signed in | Returns the Clerk user ID and app role |
| `POST /api/me/role` | Signed in | Creates a `member` role only when the user has no role |
| `GET /api/items` | Signed in | Lists only the current user's items |
| `POST /api/items` | Signed in | Validates and creates an item for the current user |
| `DELETE /api/items/:id` | Signed in | Deletes only the current user's item |
| `GET /api/admin/items` | Admin | Lists all pantry items |

The API enforces Clerk sessions and roles on the server. The browser cannot choose or update a role.

## Database tables

- `items`: `id`, `name`, `quantity`, `expires_on`, `created_by`, `created_at`
- `user_roles`: `user_id`, `role` (`admin` or `member`)

Drizzle schema lives in `lib/db/src/schema/`. SQL migrations are generated into `lib/db/drizzle/`.

## Environment variables

- `DATABASE_URL` — PostgreSQL connection
- `CLERK_SECRET_KEY` — Clerk server key
- `CLERK_PUBLISHABLE_KEY` — Clerk server-side publishable key
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk browser publishable key
- `VITE_CLERK_PROXY_URL` — Clerk proxy URL provided for production
- `DEMO_USER_ID` — optional owner ID for demo seed items; defaults to `demo-user`
- `PANTRY_ADMIN_USER_ID` — trusted Clerk user ID to grant admin access using the server-side grant script

Clerk keys are provisioned through Replit's Clerk setup. Do not commit key values.

## Database commands

- `pnpm --filter @workspace/db run generate` — create SQL migrations from the Drizzle schema
- `pnpm --filter @workspace/db run migrate` — apply pending migrations
- `pnpm --filter @workspace/db run seed` — add five example items for the demo user
- `PANTRY_ADMIN_USER_ID=<trusted-clerk-user-id> pnpm --filter @workspace/db run grant-admin` — grant administrator access outside the browser
