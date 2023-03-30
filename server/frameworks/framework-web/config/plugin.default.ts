import path from 'path'
import { PluginsConfig } from '../../../types'

export default {
  http: {
    enable: true,
    path: path.resolve(__dirname, '../../../plugins/plugin-http')
  }
} as PluginsConfig
