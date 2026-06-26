# Clerk Authentication Setup

## Quick Setup Steps

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com)
   - Sign up for a free account

2. **Create a New Application**
   - Click "Create Application"
   - Choose a name (e.g., "CallGrabbr")
   - Select authentication methods (Email/Password is fine for now)
   - Click "Create Application"

3. **Get Your API Keys**
   - In your Clerk dashboard, go to **API Keys**
   - You'll see two keys:
     - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
     - **Secret Key** (starts with `sk_test_` or `sk_live_`)

4. **Add to `.env` File**
   - Open your `.env` file
   - Replace the placeholder values:
     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
     CLERK_SECRET_KEY=sk_test_your_actual_secret_here
     ```

5. **Restart Dev Server**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

## Important Notes

- **Publishable Key** starts with `NEXT_PUBLIC_` - this means it's exposed to the browser (safe)
- **Secret Key** does NOT have `NEXT_PUBLIC_` - this stays server-side only
- Use `pk_test_` and `sk_test_` for development
- Use `pk_live_` and `sk_live_` for production

## Testing

After adding the keys and restarting:
1. Go to http://localhost:3000
2. You should see the landing page (no error)
3. Try clicking "Sign Up" or "Sign In" to test authentication

## Clerk Dashboard

Once set up, you can:
- View users in Clerk dashboard
- Configure authentication methods
- Set up email templates
- Configure social logins (optional)

## Next Steps After Clerk Setup

1. ✅ Clerk configured
2. ⏭️ Set up Retell AI (for call handling)
3. ⏭️ Set up Stripe (for billing)
4. ⏭️ Set up Twilio (for SMS)
5. ⏭️ Set up Resend (for email)

You can test the app with just Clerk configured - other services are only needed when you test those specific features.
