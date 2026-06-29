/**
 * Process photographic section assets → 1920×1080 web backdrops with readability overlay.
 * Place source PNGs in scripts/marketing-section-sources/ then run:
 *   node scripts/process-marketing-section-photos.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.join(__dirname, "marketing-section-sources")
const OUT_DIR = path.join(__dirname, "../public/marketing/sections")
const W = 1920
const H = 1080

/** @type {Record<string, { focal?: string }>} */
const FILES = {
  "hero.png": { focal: "right" },
  "workflow.png": { focal: "center" },
  "why-matters.png": { focal: "right" },
  "lead-capture.png": { focal: "left" },
  "final-cta.png": { focal: "center" },
}

const vignetteSvg = Buffer.from(
  `<svg width="${W}" height="${H}"><defs>
    <radialGradient id="v" cx="50%" cy="45%" r="78%">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b1220" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0b1220" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  </svg>`
)

async function processOne(filename) {
  const src = path.join(SRC_DIR, filename)
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source: ${src}`)
  }
  const meta = await sharp(src).metadata()
  const base = sharp(src).resize(W, H, {
    fit: "cover",
    position: meta.width && meta.height ? "attention" : "centre",
  })
  const overlay = await sharp(vignetteSvg).png().toBuffer()
  await base
    .composite([{ input: overlay, blend: "over" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, filename))
  console.log(`✓ ${filename}`)
}

async function main() {
  fs.mkdirSync(SRC_DIR, { recursive: true })
  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const name of Object.keys(FILES)) {
    await processOne(name)
  }
  console.log(`\nWrote ${Object.keys(FILES).length} photos to ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
