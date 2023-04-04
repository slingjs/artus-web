import path from 'path'
import dotEnv from 'dotenv'
import { AppConfig } from '../types'

dotEnv.config()

const cacheDir = path.resolve(process.cwd(), './.cache')
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
      cacheDir: path.resolve(cacheDir, 'frameworks/web')
    }
  }
} as AppConfig
