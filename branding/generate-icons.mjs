// Rasterizes the brand SVGs into the PNG sizes the PWA + Electron need.
// Run: node branding/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const pub = resolve(root, 'public')
const buildDir = resolve(root, 'build')
mkdirSync(pub, { recursive: true })
mkdirSync(buildDir, { recursive: true })

const icon = readFileSync(resolve(here, 'icon.svg'))
const maskable = readFileSync(resolve(here, 'icon-maskable.svg'))

const jobs = [
  { src: icon, size: 192, out: 'pwa-192x192.png' },
  { src: icon, size: 512, out: 'pwa-512x512.png' },
  { src: maskable, size: 512, out: 'pwa-maskable-512x512.png' },
  { src: icon, size: 180, out: 'apple-touch-icon.png' },
  { src: icon, size: 512, out: 'icon.png' }, // used by electron-builder
  { src: icon, size: 32, out: 'favicon-32x32.png' },
]

for (const { src, size, out } of jobs) {
  await sharp(src).resize(size, size).png().toFile(resolve(pub, out))
  console.log('wrote public/', out, `${size}x${size}`)
}

// 1024px master icon for electron-builder (it derives platform icons from this).
await sharp(icon).resize(1024, 1024).png().toFile(resolve(buildDir, 'icon.png'))
console.log('wrote build/icon.png 1024x1024')
console.log('done')
