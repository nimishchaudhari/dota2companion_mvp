import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base path configuration
  // In production, set base to repository name for GitHub Pages deployment
  // In development, use root path for local development
  base: process.env.NODE_ENV === 'production' ? '/dota2companion_mvp/' : '/',
})
