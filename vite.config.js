// vite.config.js
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'prompt', // Ask user before updating
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
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,                  // Auto-remove old caches
        globPatterns: ['index.html', 'assets/**/*.{js,css,png,svg}'], // Only real files
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'document' ||
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'image' ||
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'her-voice-cache',
              expiration: { maxEntries: 200 },
            }
          }
        ]
      }
    })
  ]
}
