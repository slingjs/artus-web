import { FrameworksEnum, PluginsEnum } from './plugins'

export interface AppConfig {
  cacheDir: string
  plugins: Record<PluginsEnum, any>
  frameworks: Record<FrameworksEnum, any>
}

export const ARTUS_WEB_APP = 'ARTUS_WEB_APP'
