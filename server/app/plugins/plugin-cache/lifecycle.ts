import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { AppConfig } from '../../types'
import { filterPluginConfig } from '../../utils/plugins'
import { CacheClient } from './client'
import { ARTUS_PLUGIN_CACHE_CLIENT } from './types'

@LifecycleHookUnit()
export default class CacheLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad() {
    const client = this.app.container.get(ARTUS_PLUGIN_CACHE_CLIENT) as CacheClient
    await client.init(
      filterPluginConfig(
        (this.app.config as AppConfig).plugin.cache
      ) as AppConfig['plugin']['cache']
    )
  }

  @LifecycleHook()
  beforeClose() {
    const cache = (this.app.container.get(ARTUS_PLUGIN_CACHE_CLIENT) as CacheClient).getCache()

    cache?.clear()
  }
}
