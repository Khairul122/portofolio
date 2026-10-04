import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cspForMeta, securityHeaders } from './scripts/security-headers.mjs'

// Production only: the dev server needs inline scripts and a websocket for HMR,
// which a strict CSP would block. Real headers (see public/_headers and
// vercel.json) are stronger; this meta copy is the baseline on hosts without them.
const cspMeta = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: cspForMeta },
      injectTo: 'head-prepend',
    },
  ],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cspMeta],
  // `npm run preview` serves the built site with the same headers as production.
  preview: { headers: securityHeaders },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          const path = id.replaceAll('\\', '/')
          if (!path.includes('/node_modules/')) return undefined
          if (/\/node_modules\/(three|@react-three|postprocessing|three-stdlib|maath|troika)/.test(path)) return 'vendor-three'
          if (/\/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(path)) return 'vendor-motion'
          return undefined
        },
      },
    },
  },
})
