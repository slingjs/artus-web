import path from 'path'
import dotEnv from 'dotenv'
import { AppConfig } from '../types'

dotEnv.config()

const cacheDir = path.resolve(process.cwd(), './.cache')
export default {
  cacheDir,

  plugins: {
    http: {
      host: '0.0.0.0',
      port: 3000,
      cacheDir: path.resolve(cacheDir, 'plugins/http')
    }
  },

  frameworks: {
    web: {
      cacheDir: path.resolve(cacheDir, 'frameworks/web')
    }
  }
} as AppConfig
