// Assembles the full web deployment into ./deploy
//   /            -> marketing + download landing (site/index.html)
//   /app/        -> the PWA app (vite build with base=/app/)
//   /downloads/  -> desktop installers (if present)
//
// Run: node scripts/build-site.mjs
// Then: npx wrangler pages deploy deploy --project-name pt-timeblock
import { execSync } from 'node:child_process'
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const deploy = resolve(root, 'deploy')

// 1. Build the app served under /app/ (carries through VITE_LLM_PROXY_URL if set).
console.log('› Building app with base=/app/ …')
execSync('npx vite build', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, VITE_BASE: '/app/' },
})

// 2. Fresh deploy dir.
rmSync(deploy, { recursive: true, force: true })
mkdirSync(deploy, { recursive: true })

// 3. Landing page at root.
cpSync(resolve(root, 'site/index.html'), resolve(deploy, 'index.html'))

// 4. Icons the landing references (from public/).
for (const f of ['favicon-32x32.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png']) {
  const src = resolve(root, 'public', f)
  if (existsSync(src)) cpSync(src, resolve(deploy, f))
}

// 5. The app under /app/.
cpSync(resolve(root, 'dist'), resolve(deploy, 'app'), { recursive: true })

// 6. Stage the desktop installer for handoff (NOT into deploy/: Cloudflare Pages
//    rejects files over 25 MiB, and the installer is ~106 MB). Host it on R2 or a
//    GitHub Release and point the landing's download link there.
const candidates = [resolve(root, 'dist-electron'), 'C:/pt-build/out']
let exe
for (const dir of candidates) {
  if (existsSync(dir)) {
    const found = readdirSync(dir).find((f) => f.toLowerCase().endsWith('.exe'))
    if (found) { exe = resolve(dir, found); break }
  }
}
if (exe) {
  const installers = resolve(root, 'installers')
  mkdirSync(installers, { recursive: true })
  cpSync(exe, resolve(installers, 'PT-Time-Block-Timeline-Setup.exe'))
  console.log('› Staged Windows installer for handoff:', resolve(installers, 'PT-Time-Block-Timeline-Setup.exe'))
} else {
  console.log('› No .exe found — run "npm run dist:win" first if you want the installer staged.')
}

console.log('✓ Assembled', deploy)
