import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/doubao': {
            target: 'https://ark.cn-beijing.volces.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/doubao/, '/api/v3'),
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.DOUBAO_API_KEY': JSON.stringify(env.DOUBAO_API_KEY),
        'process.env.DOUBAO_MODEL': JSON.stringify(env.DOUBAO_MODEL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
