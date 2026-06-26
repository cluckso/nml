/**
 * Audio example clips for the marketing site.
 * Add URLs (and optional titles) here to show example AI calls on the homepage and pricing page.
 * URLs can be relative (/audio/example.mp3) or absolute (https://...).
 * Leave the array empty to hide the audio examples section.
 */
export type AudioExample = {
  src: string
  title?: string
}

const AUDIO_EXAMPLES: AudioExample[] = [
  // Example: { src: "/audio/plumber-example.mp3", title: "Plumber — emergency intake" },
  // Example: { src: "https://your-cdn.com/example.mp3", title: "HVAC after-hours" },
]

/** Optional: override or add clips via env (e.g. NEXT_PUBLIC_AUDIO_EXAMPLE_1_URL, NEXT_PUBLIC_AUDIO_EXAMPLE_1_TITLE) */
function getAudioExamplesFromEnv(): AudioExample[] {
  const out: AudioExample[] = []
  for (let i = 1; i <= 6; i++) {
    const url = process.env[`NEXT_PUBLIC_AUDIO_EXAMPLE_${i}_URL`]
    if (url) {
      const title = process.env[`NEXT_PUBLIC_AUDIO_EXAMPLE_${i}_TITLE`] || `Example ${i}`
      out.push({ src: url, title })
    }
  }
  return out
}

/** All audio examples to display (config file + env). */
export function getAudioExamples(): AudioExample[] {
  const fromEnv = getAudioExamplesFromEnv()
  if (fromEnv.length) return fromEnv
  return AUDIO_EXAMPLES
}
