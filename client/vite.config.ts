import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import shared from '@sling/artus-web-shared'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: shared.utils.judgeBuildModeInProduction() ? shared.constants.FILE_BASE_PATH : '/',
  server: {
    port: shared.constants.CLIENT_PORT,
    proxy: {
      '^/api': {
        target: `http://127.0.0.1:${ shared.constants.SERVER_PORT }`,
        changeOrigin: true
      }
    }
  }
})
