import path from 'path'
import dotEnv from 'dotenv'
import { AppConfig } from '../types'
import shared from '@sling/artus-web-shared'

dotEnv.config()

const cacheDir = path.resolve(process.cwd(), './.cache')
const distDir = path.resolve(process.cwd(), './node_modules/@sling/artus-web-client', shared.constants.FILE_BASE_DIR)
export default {
  cacheDir,

  plugin: {
    http: {
      host: '0.0.0.0',
      port: 9527, // Will use this.
      cacheDir: path.resolve(cacheDir, 'plugins/http')
    },
    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
      username: '',
      password: '123456'
    },
    cache: {
      maxSize: 5000,
      max: 500,
      ttl: 1000 * 60 * 5,
      allowStale: false,
      updateAgeOnGet: false,
      updateAgeOnHas: false
    }
  },

  framework: {
    web: {
      cacheDir: path.resolve(cacheDir, 'frameworks/web'),
      distDir
    }
  }
} as AppConfig
