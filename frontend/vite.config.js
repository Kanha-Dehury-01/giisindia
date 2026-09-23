import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Matches `php -S localhost:8000 -t backend` from the README's
      // quickest local setup path. Override this if running behind a
      // different backend port/vhost.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // React/ReactDOM/React Router change far less often than the app's
        // own code — splitting them into their own chunk means a deploy
        // that only touches app code doesn't invalidate the browser cache
        // for this (large, rarely-changing) vendor code (spec §41/§53).
        // This project's Vite build (rolldown) requires the function form —
        // the plain-object form Rollup also accepts throws at build time here.
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
