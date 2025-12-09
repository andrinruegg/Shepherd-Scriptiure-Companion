
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '')
  
  // SYSTEM KEY ROTATION
  // We combine the keys provided by the user into a single comma-separated string.
  // The app will rotate through these to avoid hitting rate limits (429 Errors).
  // 10 Keys Total
  const MULTI_KEYS = "AIzaSyBq96IkhqMxLpgWVtqiM7WsGq5sr_jMuBg,AIzaSyDSoXpvhvuctDfF2oS9xjs23Wh8C4MLLRk,AIzaSyDqqaImRT8PSLw3tPsr3btwXE6y4bPXjas,AIzaSyA_rsHQzfafZxZRH-SaxhkuOrGnJVW5II8,AIzaSyCnW2OsdKS3odsH8mzpf2WCCUl8Ag_Bk40,AIzaSyDWgzYDIi59O3Nl6i-JYk_VKowO0jCT5RU,AIzaSyCwrpGTEve7A08IOSW5t3VGWTeRzdNLOAw,AIzaSyBCTQX2crmiE3LLhgxA_ziOBubSSKA8OXo,AIzaSyAuwE90oiL-uiAZG3TAf7yArSErOMxUcBA,AIzaSyBw1C1FwAEENkOwkz8sD2Uh7AniCG1Wzwg";

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
