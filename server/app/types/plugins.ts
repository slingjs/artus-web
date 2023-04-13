import { PluginConfigItem } from '@artus/core'

export const ARTUS_WEB_SHARED_HTTP_SERVER = 'ARTUS_WEB_SHARED_HTTP_SERVER'

export enum PluginsEnum {
  http = 'http',
  redis = 'redis',
  cache = 'cache',
  prisma = 'prisma',
  websocket = 'websocket'
}

export type PluginsConfig = {
  [key in PluginsEnum]: PluginConfigItem
}

export enum FrameworksEnum {
  web = 'web'
}

export type FrameworksConfig = {
  [key in FrameworksEnum]: PluginConfigItem
}
