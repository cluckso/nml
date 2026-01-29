import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Help & FAQ - NeverMissLead-AI",
  description:
    "How to forward your business line to your AI call assistant. Step-by-step instructions by carrier.",
}

// Force dynamic so Vercel builder gets a lambda for this route (static pages don't emit one).
export const dynamic = "force-dynamic"

const CARRIERS = [
  {
    name: "AT&T",
    slug: "att",
    steps: [
      {
        method: "Dial code (fastest)",
        items: [
          "Open your phone’s dialer.",
          "Dial ***21*** followed by the 10-digit AI number, then **#** (e.g. *21*1234567890#).",
          "Press **Call** and wait at least 3 seconds for a confirmation tone.",
          "To turn off: dial **#21#** and wait for confirmation.",
        ],
      },
      {
        method: "Phone settings",
        items: [
          "Open the **Phone** app → **Menu** (⋮) → **Settings**.",
          "Go to **Supplementary services** → **Call forwarding**.",
          "Select **Always forward**, enter the AI number, then **Turn on**.",
          "To turn off: **Always forward** → **Turn off**.",
        ],
      },
    ],
  },
  {
    name: "Verizon",
    slug: "verizon",
    steps: [
      {
        method: "From your phone",
        items: [
          "Open the **Phone** app.",
          "Dial ***72** followed by the 10-digit AI number (e.g. *725551234567).",
          "Press **Call** and listen for a confirmation message or tone.",
          "End the call. Forwarding is now on.",
          "To turn off: dial ***73** and press Call.",
        ],
      },
      {
        method: "My Verizon (web)",
        items: [
          "Log in at **verizon.com** → **My Verizon**.",
          "Go to **Call Forwarding** (under Calling or Plan).",
          "Select the line, enter the AI number as the forward-to number.",
          "Choose **Forward all calls** (or conditional if offered).",
          "Click **Update** or **Save**.",
          "To turn off: open Call Forwarding and click **Cancel**.",
        ],
      },
    ],
  },
  {
    name: "T-Mobile",
    slug: "tmobile",
    steps: [
      {
        method: "Forward all calls (dial code)",
        items: [
          "Open your phone’s dialer.",
          "Dial **21* followed by the 10-digit AI number, then **#** (e.g. **21*5551234567#).",
          "Press **Call** and wait for a confirmation tone or message.",
          "To turn off: dial **##21#** and press Call.",
        ],
      },
      {
        method: "Conditional (no answer, busy, unreachable)",
        items: [
          "**No answer:** Dial ****61*** + AI number + **#**, then Call.",
          "**Busy:** Dial ****67*** + AI number + **#**, then Call.",
          "**Unreachable:** Dial ****62*** + AI number + **#**, then Call.",
          "To turn off: **##61#**, **##67#**, or **##62#** respectively.",
        ],
      },
      {
        method: "Phone settings",
        items: [
          "**iPhone:** Settings → **Phone** → **Call Forwarding** → enter AI number and toggle on.",
          "**Android:** **Phone** app → **Settings** or **Calls** → **Call forwarding** → set number.",
        ],
      },
    ],
  },
  {
    name: "US Cellular",
    slug: "us-cellular",
    steps: [
      {
        method: "Dial code",
        items: [
          "Open your phone’s dialer.",
          "Dial ***72** followed by the 10-digit AI number (e.g. *725551234567), then press **Send**.",
          "Wait for a confirmation tone.",
          "To turn off: dial ***73** and press Send.",
        ],
      },
      {
        method: "Conditional forwarding",
        items: [
          "**No answer:** Dial ***71** + 10-digit AI number, press Send.",
          "**Busy:** Dial ***90** + 10-digit AI number, press Send.",
          "**Unreachable:** Dial ***92** + 10-digit AI number, press Send.",
        ],
      },
      {
        method: "Phone settings",
        items: [
          "Open **Phone** app → **Menu** (⋮) → **Settings**.",
          "Go to **Supplementary Services** → **Call Forwarding**.",
          "Select **Always forwarded**, enter the AI number, tap **Enable**.",
          "To turn off: open Call Forwarding and disable.",
        ],
      },
    ],
  },
  {
    name: "Google Voice",
    slug: "google-voice",
    steps: [
      {
        method: "Forward calls to your AI number",
        items: [
          "Go to **voice.google.com** and sign in.",
          "Click the **gear icon (Settings)** in the top right.",
          "Under **Account**, open **Linked numbers**.",
          "Click **+ New linked number** and enter your **AI assistant’s number** (the one from your NeverMissLead-AI dashboard).",
          "Click **Send code** and verify via text or call.",
          "Once linked, calls to your Google Voice number will also ring/forward to your AI number (and any other linked devices).",
          "To stop: go to **Settings** → **Linked numbers** and remove the AI number (click the X).",
        ],
      },
      {
        method: "Notes",
        items: [
          "You can link up to 6 numbers. US/Canada only.",
          "For “forward all calls only to AI,” link just the AI number and turn off other linked devices or use **Calls** → **Incoming calls** to control where GV rings.",
        ],
      },
    ],
  },
  {
    name: "Straight Talk",
    slug: "straight-talk",
    steps: [
      {
        method: "Forward all calls",
        items: [
          "Open the **Phone** app.",
          "Dial ***72** followed by the 10-digit AI number (e.g. *721234567890).",
          "Press **Call** or **Send** and wait for a confirmation tone or message.",
          "To turn off: dial ***73** and press Call.",
        ],
      },
      {
        method: "Conditional forwarding",
        items: [
          "**No answer:** Dial ***61** + AI number + **#**, then Call.",
          "**Busy:** Dial ***67** + AI number + **#**, then Call.",
          "**Unreachable:** Dial ***62** + AI number + **#**, then Call.",
          "To turn off: **#61#**, **#67#**, or **#62#** respectively.",
        ],
      },
      {
        method: "Phone settings (if available)",
        items: [
          "On some phones: **Settings** → **Phone** → **Call Forwarding** → choose type and enter the AI number.",
        ],
      },
    ],
  },
  {
    name: "Sprint (including T-Mobile merged)",
    slug: "sprint",
    steps: [
      {
        method: "Forward all calls",
        items: [
          "Open your phone’s dialer.",
          "Dial ***72** followed by the 10-digit AI number.",
          "Press **Call** and wait for confirmation.",
          "To turn off: dial ***720** and press Call.",
        ],
      },
      {
        method: "Conditional forwarding",
        items: [
          "**No answer:** Dial ***73** + AI number, press Call.",
          "**Busy:** Dial ***74** + AI number, press Call.",
          "**Unreachable:** Dial ***62** + AI number, press Call.",
        ],
      },
    ],
  },
  {
    name: "Mint Mobile",
    slug: "mint-mobile",
    steps: [
      {
        method: "Forward all calls",
        items: [
          "Open your phone’s dialer.",
          "Dial **21*1** + 10-digit AI number + **#** (include the 1 for US, e.g. **21*15551234567#).",
          "Press **Call** and wait for confirmation.",
          "To turn off: dial **##21#** and press Call.",
        ],
      },
      {
        method: "Conditional forwarding",
        items: [
          "**No answer:** **21*1** + number + **#**. Off: **##61#**.",
          "**Unreachable:** **62*1** + number + **#**. Off: **##62#**.",
          "**Busy:** **67*1** + number + **#**. Off: **##67#**.",
        ],
      },
    ],
  },
  {
    name: "Cricket Wireless",
    slug: "cricket",
    steps: [
      {
        method: "Forward all calls",
        items: [
          "Open your phone’s dialer.",
          "Dial ***72** followed by the 10-digit AI number.",
          "Press **Send**. You’ll hear two quick beeps when it’s set.",
          "To turn off: dial ***720** and press Send.",
        ],
      },
      {
        method: "Conditional forwarding",
        items: [
          "**Busy:** Dial ***73** + AI number, press Send. Off: ***730**.",
          "**No answer:** Dial ***74** + AI number, press Send. Off: ***740**.",
        ],
      },
    ],
  },
  {
    name: "RingCentral (VoIP / business)",
    slug: "ringcentral",
    steps: [
      {
        method: "Desktop or web app",
        items: [
          "Log in to **RingCentral** (app or ringcentral.com).",
          "Go to **Settings** → **Phone** in the left sidebar.",
          "Under **Call handling**, click **Edit**.",
          "Set **Work hours** and **After hours** (and ring order if needed).",
          "Under **Incoming calls**, choose how your lines ring; for forwarding to the AI number select **Forward to external number** and enter your AI assistant’s number.",
          "For **Missed call** or **After hours**, you can set **Forward to external number** to the same AI number.",
          "Click **Save**.",
        ],
      },
      {
        method: "Mobile app",
        items: [
          "Open the **RingCentral** app → **Settings** (or **Phone** settings).",
          "Find **Call handling** or **Forwarding** and set **Forward to external number** to your AI number.",
        ],
      },
    ],
  },
] as const

export default function DocsFaqPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Help & FAQ</h1>
        <p className="text-muted-foreground">
          How to forward your business line to your AI call assistant. Pick your carrier below for exact steps.
        </p>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Forward your business line to the AI</CardTitle>
          <CardDescription>
            Your AI has its own phone number (shown on your dashboard after you connect). You forward your existing business number to that AI number so the AI answers when customers call you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Get your <strong>AI number</strong> from the dashboard (after clicking &quot;Connect to my call assistant&quot;).</li>
            <li>Use the steps below for <strong>your carrier</strong> and enter that AI number as the &quot;forward to&quot; number.</li>
            <li>Save the settings and test by calling your business line from another phone.</li>
          </ol>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Step-by-step by carrier</h2>
        <p className="text-sm text-muted-foreground">
          Expand your carrier for exact dial codes and menu paths. Replace any example number with your AI number from the dashboard.
        </p>

        <div className="space-y-2">
          {CARRIERS.map((carrier) => (
            <details
              key={carrier.slug}
              className="group rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-medium flex items-center justify-between">
                <span>{carrier.name}</span>
                <span className="text-muted-foreground text-sm group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-4 pb-4 pt-0 border-t">
                <div className="space-y-6 pt-4">
                  {carrier.steps.map((step, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        {step.method}
                      </h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {step.items.map((item, j) => (
                          <li key={j} className="pl-1">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: item.replace(
                                  /\*\*([^*]+)\*\*/g,
                                  "<strong>$1</strong>"
                                ),
                              }}
                            />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-base">Don’t see your carrier?</CardTitle>
          <CardDescription>
            Most carriers use *72 (forward all) and *73 or *720 (turn off). Check your carrier’s support site for &quot;call forwarding&quot; or &quot;conditional forwarding.&quot; If you use another VoIP (e.g. Vonage, Ooma), look for Call Forwarding or Forward to external number in the account or app settings.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
