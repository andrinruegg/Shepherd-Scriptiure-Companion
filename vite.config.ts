
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '')
  
  // SYSTEM KEY ROTATION
  // Keys have been removed for security. 
  // Users must provide their own API Key in Settings or set VITE_API_KEY in environment.
  const MULTI_KEYS = "";

  return {
    // Expose the API Key(s) to the client-side code
    define: {
      'process.env.API_KEY': JSON.stringify(MULTI_KEYS)
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg'],
        devOptions: {
          enabled: true
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true
        },
        manifest: {
          name: 'Shepherd Scripture Companion',
          short_name: 'Shepherd',
          description: 'A peaceful, intelligent Bible verse assistant.',
          theme_color: '#1e1b4b',
          background_color: '#1e1b4b',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait',
          icons: [
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable'
            }
          ]
        }
      })
    ]
  }
})
