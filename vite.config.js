import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // en dev, l'API de la bibliothèque de motifs communautaire est servie
    // par `wrangler dev` (cf. `npm run dev:worker`), pas par Vite
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setupTests.js',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      all: true,
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/__tests__/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
