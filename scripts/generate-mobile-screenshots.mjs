/**
 * Generate Play Store marketing screenshots from Capacitor-style HTML mockups.
 * Run: node scripts/generate-mobile-screenshots.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { chromium } from "playwright"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, "../public/marketing/mobile-screenshots")
const WIDTH = 390
const HEIGHT = 845

const CSS = `
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --bg: #0f172a;
  --card: #1e293b;
  --border: #334155;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --error: #ef4444;
  --success: #10b981;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  width: ${WIDTH}px;
  min-height: ${HEIGHT}px;
}
.app-bar {
  background: rgba(30, 41, 59, 0.95);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.app-bar h1 { font-size: 18px; font-weight: 600; }
.back-btn { background: transparent; border: none; color: var(--primary); font-size: 16px; }
.page { padding: 16px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat-card { text-align: center; padding: 8px; background: rgba(15,23,42,0.5); border-radius: 8px; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
.stat-label { font-size: 12px; color: var(--text-muted); }
.call-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
.call-item:last-child { border-bottom: none; }
.call-header { display: flex; justify-content: space-between; align-items: center; }
.call-name { font-weight: 600; font-size: 14px; }
.call-time { font-size: 12px; color: var(--text-muted); }
.call-description { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.badge.success { background: rgba(16,185,129,0.2); color: var(--success); }
.badge.error { background: rgba(239,68,68,0.2); color: var(--error); }
.btn { padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; border: none; background: var(--primary); color: white; width: 100%; margin-top: 8px; }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
.input { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 14px; }
.progress-bar { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; margin: 12px 0; }
.progress-fill { height: 100%; background: var(--success); width: 35%; border-radius: 4px; }
.step { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.step.done { color: var(--success); }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: var(--border); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.step.done .step-num { background: var(--success); color: white; }
`

const screens = {
  "dashboard-overview": `
    <header class="app-bar"><h1>CallGrabbr</h1><span style="font-size:12px;color:var(--text-muted)">Sign out</span></header>
    <div class="page">
      <div class="card" style="background:rgba(16,185,129,0.1);border-color:var(--success)">
        <div class="section-title" style="color:var(--success)">⚡ Free Trial Active</div>
        <div style="display:flex;gap:24px;margin-top:8px">
          <div><div style="font-size:1.25rem;font-weight:700;color:var(--success)">28</div><div style="font-size:12px;color:var(--text-muted)">min left</div></div>
          <div><div style="font-size:1.25rem;font-weight:700;color:var(--success)">5</div><div style="font-size:12px;color:var(--text-muted)">days left</div></div>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Mike's HVAC</div>
        <p style="font-size:14px;color:var(--text-muted)">📞 (555) 234-8901</p>
        <span class="badge success" style="margin-top:8px">✓ Agent connected</span>
      </div>
      <div class="card">
        <div class="section-title">Usage</div>
        <div class="stat-grid">
          <div class="stat-card"><div class="stat-value">24</div><div class="stat-label">Total calls</div></div>
          <div class="stat-card"><div class="stat-value">47</div><div class="stat-label">Minutes</div></div>
          <div class="stat-card"><div class="stat-value" style="color:var(--error)">2</div><div class="stat-label">Urgent</div></div>
          <div class="stat-card"><div class="stat-value" style="color:var(--success)">18</div><div class="stat-label">This month</div></div>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Recent calls</div>
        <div class="call-item">
          <div class="call-header"><div class="call-name">Sarah Johnson</div><div class="call-time">2h ago</div></div>
          <div class="call-description">AC not cooling — needs service this week</div>
        </div>
        <div class="call-item">
          <div class="call-header"><div class="call-name">(555) 891-2234</div><div class="call-time">5h ago</div></div>
          <div class="call-description">Furnace making loud noise</div>
          <span class="badge error" style="margin-top:6px">🚨 Emergency</span>
        </div>
        <button class="btn btn-outline">View all calls</button>
      </div>
    </div>`,
  calls: `
    <header class="app-bar"><span class="back-btn">← Back</span><h1>Calls</h1><span>🔄</span></header>
    <div class="page">
      <div class="card">
        <input class="input" placeholder="Search calls..." value="" />
        <label style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:14px">
          <input type="checkbox" /> Show emergency only
        </label>
      </div>
      <div class="card">
        <div class="call-item">
          <div class="call-header"><div class="call-name">Sarah Johnson</div><div class="call-time">2h ago</div></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Duration: 3:42</div>
          <div class="call-description">AC not cooling — needs service this week</div>
        </div>
        <div class="call-item">
          <div class="call-header"><div class="call-name">Unknown</div><div class="call-time">5h ago</div></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Duration: 1:15</div>
          <div class="call-description">Furnace making loud noise, after hours</div>
          <span class="badge error" style="margin-top:6px">🚨 Emergency</span>
        </div>
        <div class="call-item">
          <div class="call-header"><div class="call-name">Tom Rivera</div><div class="call-time">1d ago</div></div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Duration: 2:08</div>
          <div class="call-description">Quote for duct cleaning</div>
        </div>
      </div>
    </div>`,
  settings: `
    <header class="app-bar"><span class="back-btn">← Back</span><h1>Settings</h1><span style="width:32px"></span></header>
    <div class="page">
      <div class="card">
        <div class="section-title">Notifications</div>
        <label style="display:flex;justify-content:space-between;margin-top:12px;font-size:14px">
          <span>Enable push notifications</span><input type="checkbox" checked />
        </label>
        <label style="display:flex;justify-content:space-between;margin-top:16px;font-size:14px">
          <span>Emergency alerts only</span><input type="checkbox" />
        </label>
      </div>
      <div class="card">
        <div class="section-title">Account</div>
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px">For full settings and business configuration, visit the web dashboard.</p>
        <button class="btn">Sign out</button>
      </div>
      <div class="card" style="background:rgba(59,130,246,0.1);border-color:var(--primary)">
        <div style="font-size:12px;color:var(--text-muted);text-align:center">
          <p>CallGrabbr Mobile v1.0.0</p>
          <p style="margin-top:4px">App ID: com.me.adhd</p>
        </div>
      </div>
    </div>`,
  billing: `
    <header class="app-bar"><span class="back-btn">← Back</span><h1>Billing</h1><span style="width:32px"></span></header>
    <div class="page">
      <div class="card">
        <div class="section-title">Mid Volume</div>
        <p style="font-size:14px;color:var(--text-muted)">$159/mo · 800 min included</p>
        <span class="badge success" style="margin-top:8px">Active subscription</span>
      </div>
      <div class="card">
        <div class="section-title">Usage this month</div>
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px">
          <span>612 min used</span><span style="color:var(--text-muted)">800 included</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:76%"></div></div>
        <p style="font-size:13px;color:var(--text-muted)">Overage: $0.22/min after included minutes</p>
      </div>
      <div class="card">
        <div class="section-title">Plan options</div>
        <div style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="font-weight:600">Solo Owner — $99/mo</div>
          <div style="font-size:13px;color:var(--text-muted)">300 min · missed & after-hours</div>
        </div>
        <div style="padding:10px 0;border-bottom:1px solid var(--border);background:rgba(59,130,246,0.08);margin:0 -16px;padding-left:16px;padding-right:16px">
          <div style="font-weight:600;color:var(--primary)">Mid Volume — $159/mo ✓</div>
          <div style="font-size:13px;color:var(--text-muted)">800 min · 24/7 answering</div>
        </div>
        <div style="padding:10px 0">
          <div style="font-weight:600">High Volume — $279/mo</div>
          <div style="font-size:13px;color:var(--text-muted)">1,500 min · multi-crew routing</div>
        </div>
        <button class="btn btn-outline" style="margin-top:12px">Switch plan</button>
      </div>
    </div>`,
  "trial-setup": `
    <header class="app-bar"><h1>CallGrabbr</h1></header>
    <div class="page">
      <div class="card" style="background:rgba(59,130,246,0.1);border-color:var(--primary)">
        <div class="section-title" style="color:var(--primary)">Start your free trial</div>
        <p style="font-size:14px;color:var(--text-muted);margin-top:8px">7 days · 40 free minutes · no charge until you upgrade</p>
      </div>
      <div class="card">
        <div class="section-title">Setup progress</div>
        <div class="step done"><div class="step-num">✓</div><div><div style="font-weight:600">Create account</div><div style="font-size:13px;color:var(--text-muted)">Signed in</div></div></div>
        <div class="step done"><div class="step-num">✓</div><div><div style="font-weight:600">Add payment method</div><div style="font-size:13px;color:var(--text-muted)">Card on file</div></div></div>
        <div class="step"><div class="step-num">3</div><div><div style="font-weight:600">Connect your number</div><div style="font-size:13px;color:var(--text-muted)">Forward calls to CallGrabbr</div></div></div>
        <div class="step"><div class="step-num">4</div><div><div style="font-weight:600">Test your agent</div><div style="font-size:13px;color:var(--text-muted)">Place a test call</div></div></div>
        <div class="progress-bar" style="margin-top:16px"><div class="progress-fill" style="width:50%"></div></div>
        <p style="font-size:13px;color:var(--text-muted);text-align:center">2 of 4 steps complete</p>
      </div>
      <div class="card">
        <div class="section-title">Your intake number</div>
        <p style="font-size:20px;font-weight:700;color:var(--primary);margin:8px 0">(555) 412-9000</p>
        <p style="font-size:13px;color:var(--text-muted)">Forward missed calls to this number to start capturing leads.</p>
        <button class="btn" style="margin-top:12px">Continue setup on web</button>
      </div>
    </div>`,
}

function wrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${content}</body></html>`
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })

  for (const [name, html] of Object.entries(screens)) {
    await page.setContent(wrap(html), { waitUntil: "networkidle" })
    const outPath = path.join(OUT_DIR, `${name}.png`)
    await page.screenshot({ path: outPath, fullPage: false })
    console.log("Wrote", outPath)
  }

  await browser.close()
  console.log("Done — 5 mobile screenshots generated.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
