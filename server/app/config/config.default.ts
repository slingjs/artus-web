import path from 'path'
import { AppConfig } from '../types'
import shared from '@sling/artus-web-shared'

const cacheDir = path.resolve(process.cwd(), './.cache')
const distDir = path.resolve(process.cwd(), './node_modules/@sling/artus-web-client', shared.constants.FILE_BASE_DIR)
export default {
  cacheDir,

  plugin: {
    http: {
      host: process.env.HTTP_HOST || '0.0.0.0',
      port: +process.env.HTTP_PORT! || 9527, // Will use this.
      cacheDir: path.resolve(cacheDir, 'plugins/http')
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: +process.env.REDIS_PORT! || 6379,
      db: +process.env.REDIS_DB! || 0,
      username: process.env.REDIS_USERNAME || '',
      password: process.env.REDIS_PASSWORD || '123456'
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
