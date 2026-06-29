/**
 * Generate clean marketing section backdrops (no baked-in text or UI).
 * For abstract gradients: node scripts/generate-marketing-sections.mjs
 * For photographic backdrops: add PNGs to scripts/marketing-section-sources/
 *   then run node scripts/process-marketing-section-photos.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, "../public/marketing/sections")
const W = 1920
const H = 1080

function svgBase(defs, rects = "") {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>${defs}</defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      ${rects}
      <rect width="100%" height="100%" fill="url(#vignette)" />
    </svg>`
  )
}

const vignette = `
  <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
    <stop offset="0%" stop-color="#080c16" stop-opacity="0"/>
    <stop offset="100%" stop-color="#080c16" stop-opacity="0.72"/>
  </radialGradient>`

/** @type {Record<string, Buffer>} */
const SECTIONS = {
  hero: svgBase(
    `
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1628"/>
      <stop offset="45%" stop-color="#111d35"/>
      <stop offset="100%" stop-color="#0a1424"/>
    </linearGradient>
    <radialGradient id="g1" cx="78%" cy="22%" r="45%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="12%" cy="88%" r="40%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
    ${vignette}`,
    `
    <rect width="100%" height="100%" fill="url(#g1)"/>
    <rect width="100%" height="100%" fill="url(#g2)"/>
  `
  ),

  workflow: svgBase(
    `
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0e1729"/>
      <stop offset="50%" stop-color="#111c32"/>
      <stop offset="100%" stop-color="#0b1322"/>
    </linearGradient>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#3b82f6" stroke-opacity="0.07" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    ${vignette}`,
    `
    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.85"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <rect x="0" y="${H - 4}" width="${W}" height="4" fill="#3b82f6" fill-opacity="0.35"/>
  `
  ),

  "why-matters": svgBase(
    `
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#101a2e"/>
      <stop offset="50%" stop-color="#152238"/>
      <stop offset="100%" stop-color="#0c1424"/>
    </linearGradient>
    <radialGradient id="warm" cx="82%" cy="28%" r="30%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool" cx="8%" cy="92%" r="42%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    ${vignette}`,
    `
    <rect width="100%" height="100%" fill="url(#warm)"/>
    <rect width="100%" height="100%" fill="url(#cool)"/>
  `
  ),

  "lead-capture": svgBase(
    `
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a1220"/>
      <stop offset="45%" stop-color="#101c33"/>
      <stop offset="100%" stop-color="#0d1526"/>
    </linearGradient>
    <radialGradient id="notify" cx="28%" cy="42%" r="35%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    ${vignette}`,
    `
    <rect x="115" y="162" width="730" height="756" rx="20" fill="#0f172a" fill-opacity="0.22" stroke="#94a3b8" stroke-opacity="0.08"/>
    <rect width="100%" height="100%" fill="url(#notify)"/>
  `
  ),

  "final-cta": svgBase(
    `
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f1a2e"/>
      <stop offset="40%" stop-color="#14243d"/>
      <stop offset="100%" stop-color="#0c1526"/>
    </linearGradient>
    <linearGradient id="band" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e3a5f" stop-opacity="0.45"/>
      <stop offset="35%" stop-color="#1e3a5f" stop-opacity="0"/>
      <stop offset="65%" stop-color="#1e3a5f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#1e3a5f" stop-opacity="0.4"/>
    </linearGradient>
    <radialGradient id="floor" cx="50%" cy="100%" r="65%">
      <stop offset="0%" stop-color="#475569" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="#475569" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="center" cx="50%" cy="50%" r="48%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="48%" r="72%">
      <stop offset="0%" stop-color="#080c16" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#080c16" stop-opacity="0.82"/>
    </radialGradient>`,
    `
    <rect width="100%" height="100%" fill="url(#band)"/>
    <rect width="100%" height="100%" fill="url(#floor)"/>
    <rect width="100%" height="100%" fill="url(#center)"/>
  `
  ),
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const [name, svg] of Object.entries(SECTIONS)) {
    const outPath = path.join(OUT_DIR, `${name}.png`)
    await sharp(svg).png({ compressionLevel: 9 }).toFile(outPath)
    console.log(`✓ ${name}.png`)
  }
  console.log(`\nWrote ${Object.keys(SECTIONS).length} images to ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
