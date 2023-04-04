import { FrameworksEnum, PluginsEnum } from './plugins'

export interface AppConfig {
  cacheDir: string
  plugin: Record<PluginsEnum, any>
  framework: Record<FrameworksEnum, any>
}

export const ARTUS_WEB_APP = 'ARTUS_WEB_APP'
