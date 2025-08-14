import { defineConfig, loadEnv } from 'vite'
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