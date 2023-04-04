import path from 'path'
import dotEnv from 'dotenv'
import { AppConfig } from '../types'
import { FILE_BASE_DIR } from '@sling/artus-web-shared/constants/client'

dotEnv.config()

const cacheDir = path.resolve(process.cwd(), './.cache')
const distDir = path.resolve(process.cwd(), '../client/', FILE_BASE_DIR)
export default {
  cacheDir,

  plugin: {
    http: {
      host: '0.0.0.0',
      port: 9527, // Will use this.
      cacheDir: path.resolve(cacheDir, 'plugins/http')
    }
  },

  framework: {
    web: {
      cacheDir: path.resolve(cacheDir, 'frameworks/web'),
      distDir
    }
  }
} as AppConfig
