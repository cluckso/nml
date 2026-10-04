import { SITE_URL } from "@/lib/site-url"

/** Public IndexNow key. The matching file is served at /{key}.txt. */
export const INDEXNOW_KEY = "c4e8a1b79d3046f2a5e6b8c0d1f3a7e9"

export function indexNowKeyLocation(): string {
  return `${SITE_URL}/${INDEXNOW_KEY}.txt`
}

export async function pingIndexNow(urls: string[]): Promise<{ ok: boolean; status: number }> {
  const host = new URL(SITE_URL).host
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(),
      urlList: urls,
    }),
  })
  return { ok: response.ok, status: response.status }
}
