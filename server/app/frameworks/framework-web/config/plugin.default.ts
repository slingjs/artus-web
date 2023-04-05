import path from 'path'
import { PluginsConfig } from '../../../types'

export default {
  http: {
    enable: true,
    path: path.resolve(__dirname, '../../../plugins/plugin-http')
  },
  redis: {
    enable: true,
    path: path.resolve(__dirname, '../../../plugins/plugin-redis')
  },
  cache: {
    enable: true,
    path: path.resolve(__dirname, '../../../plugins/plugin-cache')
  }
} as PluginsConfig
