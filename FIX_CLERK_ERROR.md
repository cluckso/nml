# Fix Clerk Invalid Character Error

## The Problem

The error "InvalidCharacterError: Invalid character" means Clerk can't parse your publishable key. This usually happens when:

1. The key has extra spaces or quotes
2. The key is incomplete or malformed
3. The key has special characters that weren't properly escaped
4. The placeholder text wasn't replaced

## Solution

### Step 1: Check Your .env File

Make sure your Clerk keys look like this (NO quotes, NO spaces):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz789...
CLERK_SECRET_KEY=sk_test_def456uvw012...
```

**Common Mistakes:**
- ❌ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."` (quotes)
- ❌ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...` (spaces)
- ❌ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` (incomplete key)
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc123xyz789...` (correct)

### Step 2: Get Fresh Keys from Clerk

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 3: Update .env Correctly

Open your `.env` file and make sure it looks exactly like this:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here_without_quotes
CLERK_SECRET_KEY=sk_test_your_actual_secret_here_without_quotes
```

**Important:**
- No quotes around the values
- No spaces before or after the `=`
- Copy the entire key (they're usually long)
- Make sure you didn't accidentally include `...` or placeholder text

### Step 4: Clear Next.js Cache

After updating, clear the Next.js cache:

```bash
# Stop the dev server (Ctrl+C)
# Then run:
rm -rf .next
# Or on Windows:
rmdir /s /q .next

# Then restart:
npm run dev
```

### Step 5: Verify the Key Format

Clerk keys should:
- Start with `pk_test_` or `pk_live_` for publishable keys
- Start with `sk_test_` or `sk_live_` for secret keys
- Be long strings (usually 50+ characters)
- Not have any spaces or line breaks

## Quick Test

If you want to test without Clerk first, you can temporarily comment out Clerk in middleware:

1. Open `middleware.ts`
2. Comment out the Clerk middleware
3. Restart the server

But it's better to fix the keys properly so authentication works.
