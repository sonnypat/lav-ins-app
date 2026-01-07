import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Use a different port to avoid conflicts
    open: true, // Automatically open browser
    proxy: {
      '/api/socotra-proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
