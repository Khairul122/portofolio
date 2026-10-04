import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
