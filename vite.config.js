import react from '@vitejs/plugin-react'
import vercel from 'vite-plugin-vercel';
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
        react(),
        vercel()
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
});
