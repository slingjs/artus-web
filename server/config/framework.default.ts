import path from 'path'
import { FrameworksConfig } from '../types'

export default {
  web: {
    enable: true,
    package: path.resolve(__dirname, '../frameworks/framework-web/client.ts')
  }
} as FrameworksConfig
