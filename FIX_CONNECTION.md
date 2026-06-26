# Fix Database Connection Issue

## Current Situation
- ✅ Prisma Studio works (can view database)
- ❌ `prisma db push` fails with "Can't reach database server"

## Possible Causes

1. **IPv4 Compatibility Issue** (Most Likely)
   - Your Supabase dashboard showed "Not IPv4 compatible"
   - CLI tools might need IPv4 while Prisma Studio uses a different method

2. **Supabase Project Status**
   - Check if your Supabase project is active (not paused)
   - Go to Supabase dashboard and verify project status

3. **Network/Firewall**
   - Your network might be blocking direct database connections
   - Prisma Studio might use a different connection method

## Solutions to Try

### Solution 1: Enable Connection Pooler in Supabase

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Look for **Connection Pooling** section
4. Enable **Session Mode** pooler
5. Copy the pooler connection string (port 6543)
6. Update your `.env`:

```env
DATABASE_URL="postgresql://postgres:CcF7DGhTFdddMqpB@db.sbfwaopvqpfgjfdzxnaq.supabase.co:6543/postgres?schema=public&pgbouncer=true"
```

### Solution 2: Use Supabase SQL Editor

Since Prisma Studio works, you can create tables manually:

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Run this SQL to create the schema:

```sql
-- Create enums
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');
CREATE TYPE "Industry" AS ENUM ('HVAC', 'PLUMBING', 'AUTO_REPAIR', 'CHILDCARE', 'ELECTRICIAN', 'GENERIC');
CREATE TYPE "PlanType" AS ENUM ('STARTER', 'PRO', 'LOCAL_PLUS');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED');

-- Then run: npx prisma db pull to sync schema
```

### Solution 3: Check Supabase Project Status

1. Go to Supabase Dashboard
2. Check if project shows as "Active"
3. If paused, click "Resume" or "Restore"

### Solution 4: Use Prisma Migrate with Different Connection

Try using the connection string from Supabase's "Connection Pooling" section instead of "Direct connection".

## Quick Test

Test if you can connect via command line:

```bash
# Test connection
npx prisma db execute --stdin
# Type: SELECT 1;
# Press Enter, then Ctrl+D
```

If this works but `db push` doesn't, it's likely a Prisma-specific issue.

## Alternative: Manual Migration

If nothing works, you can:

1. Use Prisma Studio to verify connection
2. Use Supabase SQL Editor to run migrations manually
3. Use `prisma db pull` to sync schema after manual changes

Let me know which solution works for you!
