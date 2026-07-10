import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// Web deploy serves the app under /app/ (marketing landing lives at root).
// Electron loads over file:// and needs relative paths, so it builds with './'.
const base = process.env.VITE_BASE || './'
const webScope = base === './' ? '/' : base

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // We register the service worker manually (web only) from main.tsx so the
      // Electron build — which loads over file:// — never tries to install one.
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' ||
              url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'PT Time Block Timeline',
        short_name: 'PT Timeline',
        description:
          'All-in-one productivity, health, and planning workspace — projects, tasks, time blocking, timeline, vision board, and health, in one focused app.',
        id: webScope,
        start_url: webScope,
        scope: webScope,
        display: 'standalone',
        orientation: 'any',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        categories: ['productivity', 'lifestyle', 'health'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  base,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
