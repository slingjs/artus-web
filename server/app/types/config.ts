import { PluginsEnum } from './plugins'
import { FrameworkConfig } from './application'

export interface AppConfig {
  cacheDir: string
  distDir: string
  plugin: Record<PluginsEnum, any>
  framework: FrameworkConfig
}

export const ARTUS_WEB_APP = 'ARTUS_WEB_APP'
