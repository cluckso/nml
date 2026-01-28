# Migration from Clerk to Supabase Auth - Summary

## ✅ What's Been Done

1. **Removed Clerk Dependencies**
   - Removed `@clerk/nextjs` from package.json
   - Added `@supabase/ssr` and `@supabase/supabase-js`

2. **Updated Authentication Code**
   - `lib/auth.ts` - Now uses Supabase instead of Clerk
   - `middleware.ts` - Protects routes using Supabase Auth
   - `app/providers.tsx` - Removed ClerkProvider
   - `components/nav.tsx` - Shows Supabase user state

3. **Updated Auth Pages**
   - `app/(auth)/sign-in/page.tsx` - Custom sign-in form
   - `app/(auth)/sign-up/page.tsx` - Custom sign-up form

4. **Updated Database Schema**
   - Changed `clerkId` to `supabaseUserId` in Prisma schema
   - Updated SQL schema file

5. **Updated Environment Variables**
   - Removed Clerk keys
   - Added Supabase URL and anon key

## 🔧 What You Need to Do

### Step 1: Get Supabase API Keys

1. Go to your Supabase Dashboard
2. Click **Project Settings** (gear icon)
3. Go to **API** section
4. Copy:
   - **Project URL**: `https://sbfwaopvqpfgjfdzxnaq.supabase.co` (already in .env)
   - **anon/public key**: Copy this key

### Step 2: Update .env File

Open `.env` and update:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sbfwaopvqpfgjfdzxnaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

### Step 3: Update Database (If Already Created)

If you already ran the SQL schema, run this migration in Supabase SQL Editor:

```sql
-- Run supabase_migrate_user_table.sql
ALTER TABLE "User" RENAME COLUMN "clerkId" TO "supabaseUserId";
DROP INDEX IF EXISTS "User_clerkId_key";
DROP INDEX IF EXISTS "User_clerkId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseUserId_key" ON "User"("supabaseUserId");
CREATE INDEX IF NOT EXISTS "User_supabaseUserId_idx" ON "User"("supabaseUserId");
```

If you haven't created the tables yet, just use the updated `supabase_schema.sql` file.

### Step 4: Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. Configure email settings if needed

### Step 5: Restart Dev Server

```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
rmdir /s /q .next
# Restart
npm run dev
```

## ✅ Testing

1. Go to http://localhost:3000/sign-up
2. Create an account with email/password
3. Check email for confirmation (if enabled)
4. Sign in at http://localhost:3000/sign-in
5. You should be redirected to `/dashboard`

## 📝 Notes

- Supabase Auth is now fully integrated
- All protected routes work with Supabase
- User creation in database happens automatically on first login
- No more Clerk dependencies!

## 🆘 Troubleshooting

**"Invalid API key" error:**
- Make sure you copied the full anon key from Supabase
- Check that NEXT_PUBLIC_SUPABASE_URL is correct

**"User table doesn't have supabaseUserId":**
- Run the migration SQL in Supabase SQL Editor
- Or drop and recreate tables with updated schema

**Email not sending:**
- Check Supabase Authentication → Email settings
- Check spam folder
- For development, Supabase sends emails automatically
