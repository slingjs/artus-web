import path from 'path'
import { PluginsConfig } from '../../../types'
import { get__dirname } from '../../../utils/compatibility'

export default {
  http: {
    enable: true,
    path: path.resolve(get__dirname(), '../../../plugins/plugin-http')
  },
  redis: {
    enable: true,
    path: path.resolve(get__dirname(), '../../../plugins/plugin-redis')
  },
  cache: {
    enable: true,
    path: path.resolve(get__dirname(), '../../../plugins/plugin-cache')
  },
  websocket: {
    enable: true,
    path: path.resolve(get__dirname(), '../../../plugins/plugin-websocket')
  },
  prisma: {
    enable: true,
    path: path.resolve(get__dirname(), '../../../plugins/plugin-prisma')
  }
} as PluginsConfig
