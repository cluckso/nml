# Firebase / FCM setup (Android push)

CallGrabbr mobile uses **FCM only** for push delivery. You do not need Firestore, Firebase Auth, or other Firebase products.

## 1. Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com) and create or select a project.
2. **Add Android app** with package name: `com.me.adhd`
3. Download **`google-services.json`**
4. Place it at:

   ```
   dashboard_capacitor/android/app/google-services.json
   ```

5. Enable **Cloud Messaging** (enabled by default on new projects).

## 2. Service account (server / Vercel)

1. Firebase Console → Project settings → **Service accounts**
2. **Generate new private key** (JSON)
3. In Vercel **Production** (and Preview if needed), set:

   ```
   FIREBASE_SERVICE_ACCOUNT_JSON=<paste entire JSON on one line>
   ```

   The JSON must include `project_id`, `client_email`, and `private_key`.

## 3. Rebuild the Android app

```bash
cd dashboard_capacitor
npm run build
npx cap sync android
```

Open Android Studio, rebuild, and install. On login the app will:

1. Request notification permission (Android 13+)
2. Register with FCM
3. POST the token to `/api/push-token`

## 4. Verify

- **Mobile:** Log in → allow notifications → no crash
- **Web:** Settings → Notifications → send test (type `push` if calling API directly)
- **Live call:** Complete a test call with actionable intake → push should arrive if `pushAlerts` is on

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Crash right after allowing notifications | Missing or wrong `google-services.json` for `com.me.adhd` |
| Push never arrives | Set `FIREBASE_SERVICE_ACCOUNT_JSON` on Vercel; confirm token saved in DB |
| `registration-token-not-registered` | Reinstall app / log in again to refresh token |
| Wrong package | `capacitor.config.ts` and `android/app/build.gradle` must both use `com.me.adhd` |

## Files

- Client registration: `dashboard_capacitor/src/lib/notifications.ts`
- Token storage: `app/api/push-token/route.ts`
- Server send: `lib/push-notifications.ts`
- Call triggers: `app/api/webhooks/retell/route.ts`
