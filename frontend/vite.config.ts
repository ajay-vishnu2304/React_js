import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/admin': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/carts': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/cart-items': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/wishlists': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/wishlist-items': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/reviews': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/coupons': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/address': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: [
        ['text', { maxCols: 100 }],
        ['text', { file: 'coverage-report.txt' }],
        'lcov',
      ],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/main.tsx', 'src/**/*.css'],
    },
  },
})
