# Supabase Auth — sign-up and email confirmation

This app uses Supabase Auth for sign-up and sign-in. If you see **429**, **400**, or **500** on sign-up or email confirmation, use this guide.

---

## Common errors

| Status | Meaning | What to do |
|--------|--------|------------|
| **403** | Forbidden on `/auth/v1/user` | Usually **URL / CORS**. Add your app origin to Supabase: **Authentication** → **URL Configuration** → **Site URL** and **Redirect URLs** (e.g. `http://localhost:3000`, `https://www.callgrabbr.com`, `https://www.callgrabbr.com/**`). Clear cookies and sign in again. |
| **429** | Too many requests (rate limit) | Wait a few minutes and try again. Supabase free tier limits auth requests per hour. |
| **400** | Bad request | Check email/password format. If you already signed up, use **Sign in** and confirm your email first. |
| **500** | Supabase server error | Often related to **email sending**. Check the steps below. |

---

## 500 and email confirmation

If sign-up returns **500**, Supabase may be failing while sending the confirmation email. Check:

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Email**
   - Ensure **Confirm email** is enabled if you want confirmation.
   - If you use **Custom SMTP**, ensure SMTP is set under **Project Settings** → **Auth** → **SMTP** (host, port, user, password). Without it, Supabase uses its built-in sender (which can hit limits or fail).

2. **Supabase Dashboard** → **Authentication** → **URL Configuration**
   - **Site URL**: set to `https://www.callgrabbr.com`.
   - **Redirect URLs**: add `https://www.callgrabbr.com/**`.

3. **Rate limits**
   - Free tier has limits on auth and email. If you hit 429 or 500 after many sign-ups, wait or upgrade.

4. **Redirect URL typo**
   - Ensure `NEXT_PUBLIC_APP_URL` matches your real domain (`https://www.callgrabbr.com`). A wrong domain causes email confirmation links to redirect to the wrong site.

---

## App behavior

- **Sign-up**: User is sent to `/confirm-email?email=...` and told to check their email. No sign-in until email is confirmed (if you have **Confirm email** on).
- **429**: The app shows: *"Too many sign-up attempts. Please wait a few minutes and try again."*
- **500**: The app shows a message suggesting checking Supabase Auth settings (email/SMTP) or trying again later.

---

## Checklist

- [ ] **Site URL** and **Redirect URLs** in Supabase match your app URL.
- [ ] **Confirm email** and **SMTP** (if used) are configured in Supabase Auth.
- [ ] `NEXT_PUBLIC_APP_URL` in your app matches your production URL (for confirmation links).
- [ ] If you still get 500, check Supabase **Logs** (Authentication) for the exact error.
