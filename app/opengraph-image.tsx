import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "CallGrabbr — Stop losing jobs to voicemail"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            📞
          </div>
          CallGrabbr
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 900,
            marginBottom: 28,
          }}
        >
          Stop Losing Jobs to Voicemail
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.4,
            color: "#cbd5e1",
            maxWidth: 820,
            marginBottom: 40,
          }}
        >
          Answers missed calls and texts you the lead in seconds. Built for local service businesses.
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            fontSize: 22,
            color: "#93c5fd",
            fontWeight: 600,
          }}
        >
          <span>7-day free trial</span>
          <span>·</span>
          <span>No card required</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
