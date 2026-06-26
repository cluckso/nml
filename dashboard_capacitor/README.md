# CallGrabbr Mobile Dashboard

Android mobile app for CallGrabbr businesses to monitor calls, appointments, and notifications on the go.

## App Details

- **App ID:** `com.me.adhd`
- **Platform:** Android (via Capacitor)
- **Framework:** React 18 + Vite + React Router

## Features

- **Dashboard:** Real-time stats, recent calls, trial status, and usage metrics
- **Calls:** Searchable call history with emergency filtering
- **Appointments:** View and manage scheduled appointments
- **Settings:** Configure push notifications and app preferences
- **Push Notifications:** FCM-based alerts for new calls, emergencies, and appointments
- **Haptic Feedback:** Native touch feedback on interactions
- **Pull-to-Refresh:** Update data with swipe gestures

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your web app API base URL)

3. **Build the web assets:**
   ```bash
   npm run build
   ```

4. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

5. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

## Development

- **Dev server:** `npm run dev` (web preview only)
- **Build:** `npm run build`
- **Sync:** `npx cap sync android`
- **Run on device:** Open in Android Studio and run

## Push Notifications

The app registers for push notifications on login and saves the FCM token to the backend (`/api/push-token`). Notifications can include:
- New call alerts
- Emergency/urgent call flags
- Appointment reminders
- Custom deep links (via `data.route`)

## Architecture

- **Authentication:** Supabase Auth (shared session with web app)
- **API:** REST endpoints on the main web app (`nml-main`)
- **State:** React hooks + local state (no Redux/Zustand needed for this scope)
- **Styling:** Custom CSS with CSS variables for theming
- **Native features:** Capacitor plugins for push, haptics, and app lifecycle

## API Endpoints Used

- `GET /api/dashboard` - Dashboard stats and recent calls
- `GET /api/calls` - Call history with pagination and search
- `GET /api/appointments` - Upcoming and past appointments
- `GET /api/settings` - User notification preferences
- `PATCH /api/settings` - Update notification settings
- `DELETE /api/appointments/:id` - Cancel an appointment
- `POST /api/push-token` - Save FCM push token

## Notes

- The app ID `com.me.adhd` is maintained for continuity with existing configuration
- Push notification credentials must be configured in Firebase Console and linked to the Supabase project
- Ensure the web API CORS settings allow requests from the mobile app domain (capacitor://localhost)
