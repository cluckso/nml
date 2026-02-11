# Twilio Setup for CallGrabbr

Your app uses Twilio to send SMS:

- **To you (business owner):** Call summary when someone calls (name, issue, callback number).
- **To callers (Pro+):** Confirmation after the call (“We received your information…”).

You need a Twilio account, a phone number, and three env vars.

---

## 1. Create a Twilio account

1. Go to [twilio.com](https://www.twilio.com) → **Sign up**.
2. Complete sign-up and verify your email/phone if asked.
3. You start in a **Trial** account. You can upgrade to paid later for production.

---

## 2. Get Account SID and Auth Token

1. In [Twilio Console](https://console.twilio.com), you’re on the **Dashboard**.
2. In **Account Info**, copy:
   - **Account SID** (starts with `AC...`) → use as `TWILIO_ACCOUNT_SID`
   - **Auth Token** → click **Show** and copy → use as `TWILIO_AUTH_TOKEN`

Keep the Auth Token secret (never commit it or expose it in the browser).

---

## 3. Get a phone number (for sending SMS)

Your app sends SMS *from* a Twilio number. You need at least one number that can send SMS.

1. In the Twilio Console go to **Phone Numbers** → **Manage** → **Buy a number** (or **Get a number** in Trial).
2. **Country:** United States (or your country).
3. **Capabilities:** enable **SMS** (and **Voice** if you use Twilio for calls).
4. Pick a number and complete the purchase (Trial accounts get one free number in many regions).
5. Copy the number in **E.164** form, e.g. `+15551234567` → use as `TWILIO_PHONE_NUMBER`.

**Trial accounts:** You can only send SMS to **verified** phone numbers. Add test numbers under **Phone Numbers** → **Manage** → **Verified Caller IDs**. For production, upgrade and you can send to any number.

---

## 4. Set environment variables

Add to `.env` (and your host’s env, e.g. Vercel):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

Use the **exact** values from the Twilio Console. The phone number must include country code and no spaces (e.g. `+15551234567`).

---

## 5. Optional: Messaging Service (recommended for production)

For higher volume and better deliverability:

1. In Twilio Console go to **Messaging** → **Try it out** → **Send an SMS** (or **Messaging** → **Services**).
2. Create a **Messaging Service** and add your phone number as a sender.
3. You can then send using the Messaging Service SID instead of a single number (would require a small code change to use the service).

For getting started, a single number and the three env vars above are enough.

---

## 6. Quick test

1. Set the three env vars and restart your app.
2. Trigger a flow that sends SMS (e.g. complete a test call so the Retell webhook runs and calls `sendSMSNotification`).
3. Or send a test SMS from the Twilio Console: **Messaging** → **Try it out** → **Send an SMS** (from your number to a verified number in Trial).

---

## Checklist

- [ ] Twilio account created
- [ ] **Account SID** and **Auth Token** copied from Console → Dashboard
- [ ] **Phone number** bought/claimed with SMS capability
- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` set in `.env`
- [ ] (Trial) Caller IDs verified for any number you want to receive SMS in testing

If any of the three env vars are missing or wrong, the app will skip sending SMS (see `lib/notifications.ts`). Check the server logs for Twilio errors if messages don’t arrive.
