// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'Her Voice 💞',
        short_name: 'HerVoice',
        description: 'Her Voice - Your music player PWA',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4caf50',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff2}'
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['document', 'script', 'style', 'image', 'font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'her-voice-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } // 30 days
            }
          }
        ]
      }
    })
  ]
})
