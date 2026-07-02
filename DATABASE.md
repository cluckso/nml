# Database connection (Supabase + Prisma)

## Avoiding "MaxClientsInSessionMode: max clients reached"

This error happens when the app uses Supabase’s **direct** (Session) connection, which has a low connection limit. Use the **connection pooler** for runtime instead.

### 1. Use the **Transaction** pooler for `DATABASE_URL`

- Use the **Transaction** pooler (not Session). Transaction mode returns connections to the pool after each transaction, which fits Prisma and avoids "max clients" in serverless.
- In [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **Database**, under **Connection pooling** choose **Transaction** and copy the **URI** (or use the "Connection string" that Supabase shows for Transaction mode).
- **Important:** The pooler uses a **different username** than the direct connection. The username must be `postgres.[project-ref]` (e.g. `postgres.abcdefghijklmnop`), **not** plain `postgres`. If you see *"the provided database credentials for postgres are not valid"*, your `DATABASE_URL` is likely using the direct connection’s username/password or you built the URL by hand with `postgres`. Use the **exact** Transaction pooler URI from the dashboard (it already has the right user and port 6543).
- The URI looks like:
  ```txt
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```
- Append `?pgbouncer=true` to that URI so Prisma works with the pooler:
  ```txt
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- If your password contains special characters (`#`, `?`, `@`, `/`, `%`, etc.), **URL-encode** them in the connection string (e.g. `#` → `%23`, `@` → `%40`).
- Set the result as `DATABASE_URL` in `.env` and in your host’s env (e.g. Vercel).

### 2. Use the direct URL for `DIRECT_URL` (migrations)

- Use the **direct** connection (port **5432**) for `DIRECT_URL`.
- Prisma uses this for `prisma migrate` and introspection; the app should not use it at runtime.

### 3. Single Prisma Client

- `lib/db.ts` exports a single shared `db` instance (attached to `globalThis` in dev and production) so you don’t create a new client per request and exhaust connections.

If you still see "max clients" after switching `DATABASE_URL` to the pooler, confirm the pooler URL is the one actually loaded at runtime (e.g. in Vercel, redeploy and check that the env var is the 6543 URL with `?pgbouncer=true`).

---

## "Prepared statement does not exist" / "already exists" (Prisma on Vercel)

Symptoms in runtime logs:

- `prepared statement "s11" does not exist`
- `prepared statement "s20" already exists`
- `bind message supplies N parameters, but prepared statement requires M`

**Cause:** `DATABASE_URL` points at Supabase **pooler** (port 6543) but is missing `?pgbouncer=true`, or you're using **Session** pooler instead of **Transaction** pooler.

**Fix:**

1. Supabase → **Project Settings** → **Database** → **Connection pooling** → **Transaction** mode
2. Copy the URI (host `aws-0-….pooler.supabase.com`, user `postgres.sbfwaopvqpfgjfdzxnaq`, port **6543**)
3. Ensure the URL ends with `?pgbouncer=true` (or `&pgbouncer=true` if other query params exist)
4. Set that as `DATABASE_URL` in Vercel → redeploy

`DIRECT_URL` stays the direct host `db.sbfwaopvqpfgjfdzxnaq.supabase.co:5432` with user `postgres` — **only for migrations**, not runtime.

`lib/db.ts` auto-appends `pgbouncer=true` when it detects a Supabase pooler URL without it, but you should still fix the env var in Vercel.

---

## "Authentication failed" / "credentials for postgres are not valid"

This means the **pooler** is being used (host `pooler.supabase.com`) but the **username or password is wrong** for the pooler.

1. **Use the pooler username, not `postgres`**  
   The pooler expects the role **`postgres.[project-ref]`**. Get it from Supabase: **Project Settings → Database → Connection pooling → Transaction → URI**. The username in that URI is correct; do not replace it with `postgres`.

2. **Use the correct password**  
   Use the same database password you use for the direct connection (often under **Database password** or **Reset database password** in Project Settings). If you reset the password, update **both** `DATABASE_URL` (pooler) and `DIRECT_URL` (direct).

3. **URL-encode the password**  
   If the password has `#`, `?`, `@`, `/`, `%`, or `&`, encode it (e.g. `#` → `%23`, `@` → `%40`) in the URI, or use the Supabase dashboard’s **URI** copy and only replace the placeholder with your actual password (then encode if needed).

4. **Redeploy**  
   After changing `DATABASE_URL` on Vercel (or your host), redeploy so the new env is used.
