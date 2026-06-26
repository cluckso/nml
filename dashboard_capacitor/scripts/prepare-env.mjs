/**
 * Writes dashboard_capacitor/.env.production before Vite build.
 * 1. Maps NEXT_PUBLIC_SUPABASE_* from nml-main/.env when present
 * 2. Otherwise fetches /api/public-config from production
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const appDir = dirname(root)
const parentEnv = join(appDir, '..', '.env')
const outFile = join(appDir, '.env.production')
const apiBase = 'https://www.callgrabbr.com'

function readParentEnv() {
  if (!existsSync(parentEnv)) return {}
  const text = readFileSync(parentEnv, 'utf8')
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const i = line.indexOf('=')
        return i === -1 ? null : [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      })
      .filter(Boolean)
  )
}

async function fetchRemoteConfig() {
  const res = await fetch(`${apiBase}/api/public-config`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`public-config returned ${res.status}`)
  }
  const data = await res.json()
  return {
    url: data.supabaseUrl,
    key: data.supabaseAnonKey,
    api: apiBase,
  }
}

const vars = readParentEnv()
let url = vars.NEXT_PUBLIC_SUPABASE_URL || vars.VITE_SUPABASE_URL
let key = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY || vars.VITE_SUPABASE_ANON_KEY
let api = vars.VITE_API_BASE_URL || apiBase

if (!url || !key) {
  try {
    const remote = await fetchRemoteConfig()
    url = remote.url
    key = remote.key
    api = remote.api
    console.log('[prepare-env] Loaded Supabase config from production API.')
  } catch (error) {
    console.warn(
      '[prepare-env] Could not resolve Supabase config:',
      error instanceof Error ? error.message : error
    )
    console.warn('[prepare-env] App will fetch /api/public-config at runtime on device.')
    process.exit(0)
  }
}

const lines = [
  `VITE_SUPABASE_URL=${url}`,
  `VITE_SUPABASE_ANON_KEY=${key}`,
  `VITE_API_BASE_URL=${api}`,
  '',
]
writeFileSync(outFile, lines.join('\n'), 'utf8')
console.log('[prepare-env] Wrote .env.production for Capacitor build.')
