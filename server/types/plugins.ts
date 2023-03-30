import { PluginConfigItem } from '@artus/core'

export enum PluginsEnum {
  http = 'http'
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
