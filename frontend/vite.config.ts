import { defineConfig } from 'vite'
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
      '/admin': {
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
    }
  }
})
