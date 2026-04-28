import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel/vite'
import { getVercelEntries } from 'vite-plugin-vercel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(async () => ({
  logLevel: 'info', // Show build info
  plugins: [
    react(),
    vercel({
        entries: (await getVercelEntries('api', {})).filter(e => !e.id.includes('.test.') && !e.id.includes('lib/'))
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  vercel: {
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html',
      },
    ],
  },
}))