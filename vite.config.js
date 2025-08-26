// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Her Voice💞',
        short_name: 'HerVoice💞',
        description: 'Her Voice - Your music player PWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4caf50',
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['index.html', 'assets/**/*.{js,css,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              ['document','script','style','image','font'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'her-voice-cache',
              expiration: { maxEntries: 200 }
            }
          }
        ]
      }
    })
  ]
})
