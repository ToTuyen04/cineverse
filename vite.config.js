import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7212',
        changeOrigin: true,
        secure: false, // Accepts self-signed certificates
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
