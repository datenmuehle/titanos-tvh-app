import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/titanos-tvh-app/', // Replace with your GitHub repository name
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9981',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})