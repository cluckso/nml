# Fix Database Connection Issue

## Quick start

1. Copy `.env.example` to `.env` in the project root.
2. Fill in `DATABASE_URL` and `DIRECT_URL` from Supabase (see `DATABASE.md`).
3. Run `npm run check:env` to validate configuration.
4. Restart the dev server and hit `/api/health`.

## Common causes

### Missing env vars (most common locally)

If the dashboard shows "Unable to load dashboard" and `npm run check:env` reports `DATABASE_URL is not set`, add the Supabase Transaction pooler URI to `.env`.

### Wrong connection type

- **Runtime (`DATABASE_URL`)**: Transaction pooler, port **6543**, username `postgres.[project-ref]`, append `?pgbouncer=true`.
- **Migrations (`DIRECT_URL`)**: Direct connection, port **5432**, username `postgres`.

Do **not** use the direct URL (port 5432) as `DATABASE_URL` in production or local dev.

### IPv4 / network issues

If `prisma db push` fails but Supabase SQL Editor works, use the pooler URI from the dashboard instead of the direct host.

## Verify

```bash
npm run check:env
curl http://localhost:3000/api/health
```

## Full reference

See `DATABASE.md` for pooler vs direct URLs, password URL-encoding, and Vercel deployment notes.
