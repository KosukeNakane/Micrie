import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  const apiBase = env.VITE_API_BASE_URL

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/analyze': {
          target: apiBase,
          changeOrigin: true,
        },
      },
    },
  }
});

