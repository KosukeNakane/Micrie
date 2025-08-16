import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  const apiBase = env.VITE_API_BASE_URL

  return {
    plugins: [react()],
    resolve: {
      alias: {
        util: 'util/',
        process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      }
    },
    optimizeDeps: {
      include: ['util', 'process']
    },
    define: {
      'process.env': {},
    },
    server: {
      proxy: {
        '/analyze': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
  };
});
