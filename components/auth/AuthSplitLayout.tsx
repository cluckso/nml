import { BrandMark } from "@/components/brand/BrandMark"

function ReceptionIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label="Illustration of an AI receptionist answering a business call"
      className="h-auto w-full max-w-[10rem] lg:max-w-[28rem]"
      fill="none"
    >
      <circle cx="240" cy="180" r="143" fill="currentColor" opacity=".08" />
      <circle cx="240" cy="180" r="112" stroke="currentColor" strokeOpacity=".22" strokeWidth="2" />
      <path
        d="M92 235c22-18 46-26 72-26"
        stroke="currentColor"
        strokeOpacity=".55"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M318 123c24 6 46 20 62 40"
        stroke="currentColor"
        strokeOpacity=".55"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M336 242c-18 17-39 28-63 33"
        stroke="currentColor"
        strokeOpacity=".55"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <rect x="138" y="58" width="204" height="244" rx="28" fill="white" fillOpacity=".97" />
      <rect x="152" y="74" width="176" height="210" rx="18" fill="#FFF8F4" />
      <rect x="211" y="85" width="58" height="5" rx="2.5" fill="#E8D8D0" />

      <circle cx="240" cy="154" r="43" fill="#FBE5DA" />
      <path d="M206 153a34 34 0 0 1 68 0v12h-9v-12a25 25 0 0 0-50 0v12h-9v-12Z" fill="#C94727" />
      <rect x="198" y="153" width="15" height="28" rx="7.5" fill="#C94727" />
      <rect x="267" y="153" width="15" height="28" rx="7.5" fill="#C94727" />
      <path
        d="M274 177c-2 15-13 23-29 23h-9"
        stroke="#C94727"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="229" cy="158" r="3" fill="#63382C" />
      <circle cx="251" cy="158" r="3" fill="#63382C" />
      <path d="M232 173c5 5 11 5 16 0" stroke="#63382C" strokeWidth="2.5" strokeLinecap="round" />

      <rect x="176" y="220" width="128" height="34" rx="17" fill="#F4E9E3" />
      <circle cx="195" cy="237" r="7" fill="#C94727" />
      <path d="M192 237h6m-3-3v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="210" y="232" width="75" height="5" rx="2.5" fill="#C9A99B" />
      <rect x="210" y="241" width="53" height="4" rx="2" fill="#E2CFC6" />

      <rect x="43" y="113" width="132" height="66" rx="16" fill="white" />
      <circle cx="66" cy="146" r="13" fill="#FBE5DA" />
      <path
        d="M62 145c0-3 2-5 4-5s4 2 4 5-2 5-4 5"
        stroke="#C94727"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M69 150l4 4" stroke="#C94727" strokeWidth="2" strokeLinecap="round" />
      <rect x="87" y="136" width="68" height="6" rx="3" fill="#6F4A3C" />
      <rect x="87" y="148" width="48" height="5" rx="2.5" fill="#D6BDB2" />
      <circle cx="154" cy="123" r="10" fill="#5A8C63" />
      <path
        d="m150 123 3 3 5-6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="305" y="201" width="128" height="66" rx="16" fill="white" />
      <rect x="322" y="219" width="76" height="6" rx="3" fill="#6F4A3C" />
      <rect x="322" y="231" width="92" height="5" rx="2.5" fill="#D6BDB2" />
      <rect x="322" y="244" width="54" height="7" rx="3.5" fill="#FBE5DA" />
      <path
        d="m327 247 3 3 6-7"
        stroke="#C94727"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="109" cy="254" r="6" fill="currentColor" opacity=".45" />
      <circle cx="379" cy="102" r="8" fill="currentColor" opacity=".35" />
      <path
        d="m371 145 5-5m0 5-5-5"
        stroke="currentColor"
        strokeOpacity=".65"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="m101 203 4-4m0 4-4-4"
        stroke="currentColor"
        strokeOpacity=".65"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden min-h-screen flex-col items-center justify-center overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary-foreground)/.14),transparent_38%),radial-gradient(circle_at_85%_80%,hsl(var(--primary-foreground)/.1),transparent_35%)]" />
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center text-center">
          <ReceptionIllustration />

          <h2 className="text-3xl font-semibold tracking-tight">
            Every call gets a second chance.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-primary-foreground/80">
            Your AI receptionist answers missed calls, captures the details, and gets the lead back
            to you.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center px-5 py-8 sm:px-10 lg:px-12">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-foreground/5 sm:p-9">
          <div className="mb-6 flex justify-center">
            <BrandMark iconSize={56} />
          </div>
          {children}
        </div>
      </section>
    </div>
  )
}
