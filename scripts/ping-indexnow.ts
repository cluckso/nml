/**
 * Ping IndexNow with URLs edited on the latest content date.
 * Run after this build is live so the key file at /{key}.txt is reachable:
 *   npx tsx scripts/ping-indexnow.ts
 */
import { getRecentlyEditedUrls } from "../lib/public-sitemap"
import { pingIndexNow } from "../lib/indexnow"

async function main() {
  const urls = getRecentlyEditedUrls()
  const result = await pingIndexNow(urls)
  console.log(JSON.stringify({ count: urls.length, ...result }, null, 2))
  if (!result.ok) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
