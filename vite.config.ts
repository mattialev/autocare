import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'autocare';
const base = process.env.GITHUB_PAGES === 'true' ? `/${repositoryName}/` : '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'AutoCare',
        short_name: 'AutoCare',
        description: 'La tua auto, sempre con te.',
        theme_color: '#146EF5',
        background_color: '#F7F9FC',
        display: 'standalone',
        icons: [
          { src: `${base}pwa-192.svg`, sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: `${base}pwa-512.svg`, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
});
