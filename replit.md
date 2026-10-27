# Pantry Tracker

A pantry inventory app where members track their own items and admins can review all users' pantry items.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/pantry-web run dev` — run the Pantry Tracker web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run generate` — generate SQL migrations from the Drizzle schema
- `pnpm --filter @workspace/db run migrate` — apply pending development migrations
- `pnpm --filter @workspace/db run seed` — add five demo pantry items
- `PANTRY_ADMIN_USER_ID=<trusted-clerk-user-id> pnpm --filter @workspace/db run grant-admin` — grant an admin role outside the browser
- Required env: `DATABASE_URL` — Postgres connection
- Clerk env values: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` (provisioned by Clerk setup)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pantry-web` — Pantry Tracker React + Vite frontend and user-facing README
- `artifacts/api-server` — shared Express API, routes under `/api`
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema` — Drizzle table definitions; `lib/db/drizzle` contains SQL migrations

## Architecture decisions

- Clerk session cookies authenticate web requests; server middleware enforces access.
- New users receive `member` only through the idempotent `POST /api/me/role` endpoint. No browser route can assign admin.
- Admin grants use the server-side database script and a trusted Clerk user ID.

## Product

Members can add and remove their own pantry items and track expiration dates. Administrators can view every user's items.

## User preferences

- Keep authentication, role checks, and ownership checks on the server.

## Gotchas

- Apply `pnpm --filter @workspace/db run migrate` after generating a schema migration.
- Seed examples use `DEMO_USER_ID` or the demo ID `demo-user`; they are not assigned to a signed-in user automatically.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
