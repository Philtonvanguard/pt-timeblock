# PT Time Block Timeline — Launch Handoff

What started as a Linux-only Electron app is now a launchable product that opens on
**phone, tablet, laptop, and desktop**, re-skinned to Vipelex black & gold.

---

## Live right now

| What | URL |
|---|---|
| Web app + landing (live) | https://timeblock.vipelex.com |
| The app directly | https://timeblock.vipelex.com/app/ |
| Pages default URL | https://pt-timeblock.pages.dev |
| LLM proxy Worker | https://pt-timeblock-llm.vipelex01.workers.dev |
| Blog tab link added | https://blog.vipelex.com (nav → "PT Time Block") |

**Done:** custom domain is live, email capture persists to KV
(`SUBSCRIBERS`, id `a80fa5531b8f471d859e5a70f63e5ee6`), and the blog nav links to it.

The web app works on every device. On a phone, open it and use the browser's
**"Add to Home Screen"** to install it like a native app (offline-capable PWA).

---

## Desktop installers ship from GitHub (set up 2026-07-09)

Repo: https://github.com/Philtonvanguard/pt-timeblock

`.github/workflows/release.yml` builds **Windows .exe, macOS .dmg, and Linux
AppImage + .deb** on three CI runners and attaches them to a GitHub Release
whenever a `v*` tag is pushed:

```bash
npm version patch          # or minor/major — bumps package.json + creates the tag
git push origin main --tags
```

The landing page download buttons use `releases/latest/download/<file>` URLs, so
they always serve the newest release without editing the site. Artifact names are
pinned in package.json (`artifactName`): `PT-Time-Block-Timeline-Setup.exe`,
`PT-Time-Block-Timeline.dmg`, `PT-Time-Block-Timeline.AppImage`, `.deb`.

The macOS build is unsigned (no Apple Developer cert) — first launch is
right-click → Open; the landing page says so on the macOS card.

### (Optional) Forward signups to Emailit
Signups already persist to the `SUBSCRIBERS` KV namespace. To also push them into
Emailit, set `EMAILIT_API_KEY` and `EMAILIT_LIST_ID` in the Pages project
(Settings → Environment variables). Read stored emails anytime with:
```bash
npx wrangler kv key list --namespace-id a80fa5531b8f471d859e5a70f63e5ee6 --remote
```

---

## How to rebuild & redeploy the web app

```bash
cd pt-timeblock
node scripts/build-site.mjs          # builds app under /app/, assembles ./deploy
npx wrangler pages deploy deploy --project-name=pt-timeblock --branch=main
```
The AI proxy URL is baked in from `.env` (`VITE_LLM_PROXY_URL`).

## Redeploy the LLM proxy Worker

```bash
cd pt-timeblock/worker
npx wrangler deploy
```

---

## Desktop installers

Built locally with electron-builder. The desktop build keeps the full feature set,
including the Automation hub (email triage / RSS), which is hidden on the web build.

```bash
npm run dist:win     # Windows .exe  (built — see installers/)
npm run dist:mac     # macOS .dmg    (must run on macOS)
npm run dist:linux   # Linux AppImage + .deb (must run on Linux)
```
Cross-OS note: Windows can only build the Windows installer. macOS and Linux builds
must run on those operating systems (or in CI, e.g. GitHub Actions matrix).

---

## What changed from the original

- **Web/PWA build** added (installable, offline, responsive down to phone widths).
- **Responsive shell**: sidebar becomes a slide-in drawer with a hamburger on
  small screens; the Electron title bar only shows in the desktop build.
- **Vipelex black & gold** re-skin (theme tokens in `src/styles/globals.css`).
- **Platform gating**: the Automation hub and the Email/RSS settings are hidden on
  the web build (they need a desktop runtime); shown in Electron.
- **AI**: bring-your-own-key, now routed through a Cloudflare Worker so it works in
  browsers (CORS) without exposing a shared key. This also fixed a bug where the
  original code called Anthropic's nonexistent `/chat/completions` endpoint — the
  Worker translates to Anthropic's native Messages API.
- **Brand icons** generated from `branding/icon.svg` (`npm run icons`).

## Key files

- `src/lib/platform.ts` — `isElectron` / `isWeb` detection
- `src/hooks/useMediaQuery.ts` — responsive breakpoint hook
- `vite.config.ts` — PWA config; `VITE_BASE` switches web (`/app/`) vs Electron (`./`)
- `worker/` — the LLM proxy Worker
- `functions/api/subscribe.js` — email capture Pages Function
- `site/index.html` — marketing + download landing page
- `scripts/build-site.mjs` — assembles the full deployment
- `branding/` — icon source + generator
