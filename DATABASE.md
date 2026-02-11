# Database connection (Supabase + Prisma)

## Avoiding "MaxClientsInSessionMode: max clients reached"

This error happens when the app uses Supabase’s **direct** (Session) connection, which has a low connection limit. Use the **connection pooler** for runtime instead.

### 1. Use the **Transaction** pooler for `DATABASE_URL`

- Use the **Transaction** pooler (not Session). Transaction mode returns connections to the pool after each transaction, which fits Prisma and avoids "max clients" in serverless.
- In [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **Database**, under **Connection pooling** choose **Transaction** and copy that connection string.
- It uses **port 6543** (not 5432).
- Append `?pgbouncer=true` so Prisma works correctly with the pooler:
  ```txt
  postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- Set that as `DATABASE_URL` in `.env` and in your host’s env (e.g. Vercel).

### 2. Use the direct URL for `DIRECT_URL` (migrations)

- Use the **direct** connection (port **5432**) for `DIRECT_URL`.
- Prisma uses this for `prisma migrate` and introspection; the app should not use it at runtime.

### 3. Single Prisma Client

- `lib/db.ts` exports a single shared `db` instance (attached to `globalThis` in dev and production) so you don’t create a new client per request and exhaust connections.

If you still see "max clients" after switching `DATABASE_URL` to the pooler, confirm the pooler URL is the one actually loaded at runtime (e.g. in Vercel, redeploy and check that the env var is the 6543 URL with `?pgbouncer=true`).
