import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import shared from '@sling/artus-web-shared'
import { transformHTMLPlugin } from './.build/vite'
import _ from 'lodash'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env.
  const env = loadEnv(mode, './.build/env')
  _.merge(process.env, env)

  return {
    plugins: [vue(), vueJsx(), transformHTMLPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    envDir: '.',
    base: shared.utils.judgeBuildModeInProduction() ? shared.constants.FILE_BASE_PATH : '/',
    server: {
      port: shared.constants.CLIENT_PORT,
      proxy: {
        '^/api': {
          target: `http://127.0.0.1:${shared.constants.SERVER_PORT}`,
          changeOrigin: true
        },
        '^/ws': {
          target: `ws://127.0.0.1:${shared.constants.SERVER_PORT}`,
          changeOrigin: true
        }
      }
    }
  }
})
