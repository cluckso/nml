# How to Re-enable Clerk Later

I've temporarily disabled Clerk so you can test the app. When you're ready to set up Clerk:

## Step 1: Get Clerk Keys

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create an account and application
3. Get your API keys from the dashboard

## Step 2: Update .env

Replace the placeholder values with your actual keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_here
```

**Important:** No quotes, no spaces, no `...` - just the actual key.

## Step 3: Re-enable Clerk

1. **Uncomment middleware.ts:**
   - Remove the temporary middleware code
   - Uncomment the Clerk middleware code

2. **Uncomment app/providers.tsx:**
   - Uncomment the ClerkProvider import and usage

3. **Uncomment components/nav.tsx:**
   - Uncomment the UserButton import and usage

4. **Clear Next.js cache:**
   ```bash
   # Stop server, then:
   rm -rf .next
   # Or Windows:
   rmdir /s /q .next
   ```

5. **Restart:**
   ```bash
   npm run dev
   ```

## For Now

The app will work without Clerk - you just won't have authentication. You can:
- ✅ View the landing page
- ✅ View the pricing page
- ✅ Test other features that don't require auth
- ❌ Can't access dashboard (requires auth)

When you're ready to test authentication, follow the steps above to re-enable Clerk.
