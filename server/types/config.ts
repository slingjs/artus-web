import { FrameworksEnum, PluginsEnum } from './plugins'

export interface AppConfig {
  cacheDir: string
  plugins: Record<PluginsEnum, any>
  frameworks: Record<FrameworksEnum, any>
}
