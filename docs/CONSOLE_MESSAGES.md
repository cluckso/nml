# Console messages — what they mean

Quick reference for common browser console messages and whether you can fix them.

---

## [DEPRECATED] Default export is deprecated (Zustand)

**Message:** `Default export is deprecated. Instead use import { create } from 'zustand'`

**Cause:** A **dependency** (or React DevTools / Cursor) uses the old Zustand API. Your app does **not** use Zustand (it’s not in `package.json`).

**What to do:** Ignore. You can’t fix it in this repo. It will go away when the dependency (or the tool) updates. If you ever add Zustand yourself, use: `import { create } from 'zustand'`.

---

## Use `createWithEqualityFn` instead of `create` (Zustand)

**Message:** `Use createWithEqualityFn instead of create or use useStoreWithEqualityFn instead of useStore`

**Cause:** Same as above — something in the dependency chain or DevTools uses the older Zustand API.

**What to do:** Ignore unless you introduce Zustand; then follow the [Zustand migration note](https://github.com/pmndrs/zustand/discussions/1937).

---

## [LC Tracking ERROR] / data-tracking-id / widget-v2

**Messages:**  
`Required data-tracking-id attribute not found`  
`Please add data-tracking-id="your-tracking-id" to the script tag`  
`An iframe which has both allow-scripts and allow-same-origin...`

**Cause:** A **third-party script** (e.g. LiveChat, or another chat/tracking widget) is loaded — often by a **browser extension** or by another script you don’t control. There is **no** such script in this app’s layout or source.

**What to do:**
- If you don’t use that service: ignore, or disable the extension on this site.
- If you do add a chat/tracking widget: follow that provider’s docs and add the required `data-tracking-id` (or other attributes) to the script tag.

---

## api.retellai.com/test-agent-webhook — 400

**Message:** `Failed to load resource: the server responded with a status of 400` (URL: `api.retellai.com/test-agent-webhook`)

**Cause:** **Retell’s** backend is returning 400 when they run their webhook test. The request goes to **Retell’s** server, not yours. Your webhook URL (`https://www.callgrabbr.com/api/webhooks/retell`) is only called by Retell **after** their test step.

**What to do:** Nothing in your code. If the Test button in Retell dashboard keeps failing, try:
- Saving the webhook URL and testing again.
- Checking Retell status/docs or contacting Retell support — the 400 is from their test-agent-webhook endpoint.

---

## isInternalUser false

**Message:** `isInternalUser false`

**Cause:** Logged by a dependency or by the host (e.g. Cursor’s embedded browser). Not from this app’s source.

**What to do:** Ignore. Safe to leave as-is.
