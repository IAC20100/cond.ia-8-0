import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'COND.IA 7.0',
          short_name: 'COND.IA',
          description: 'Sistema de gerenciamento de condomínios',
          theme_color: '#004a7c',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'https://api.iconify.design/lucide:database.svg?color=%23004a7c&v=1',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'https://api.iconify.design/lucide:database.svg?color=%23004a7c&v=1',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
