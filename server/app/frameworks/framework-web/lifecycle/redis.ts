import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { AppConfig } from '../../../types'
import { ARTUS_PLUGIN_REDIS_CLIENT } from '../../../plugins/plugin-redis/types'
import { RedisClient } from '../../../plugins/plugin-redis/client'
import { filterPluginConfig } from '../utils/plugins'

@LifecycleHookUnit()
export default class RedisLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async willReady () {
    const client = this.app.container.get(ARTUS_PLUGIN_REDIS_CLIENT) as RedisClient
    await client.init(filterPluginConfig((this.app.config as AppConfig).plugin.redis) as AppConfig['plugin']['redis'])

    // If failed.
    client.getRedis().once('error', e => {
      this.app.logger.error(e)
      this.app.close(true)
    })
  }

  @LifecycleHook()
  beforeClose () {
    const redis = (this.app.container.get(ARTUS_PLUGIN_REDIS_CLIENT) as RedisClient).getRedis()

    redis?.disconnect()
  }
}