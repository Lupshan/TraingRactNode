import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
