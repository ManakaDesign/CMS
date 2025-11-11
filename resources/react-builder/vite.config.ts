import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // Use BASE_PATH environment variable for deployment configuration
  // For GitHub Pages demo, use: BASE_PATH=/CMS/ npm run build:demo
  // For Laravel production, it defaults to /public/admin/
  const base = process.env.BASE_PATH || '/public/admin/';

  return {
    plugins: [react()],
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      // Make BASE_PATH available to the app as well
      'import.meta.env.VITE_BASE_PATH': JSON.stringify(base),
    }
  }
})
