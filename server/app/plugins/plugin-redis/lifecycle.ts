import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { AppConfig } from '../../types'
import { ARTUS_PLUGIN_REDIS_CLIENT } from './types'
import { RedisClient } from './client'
import { filterPluginConfig } from '../../utils/plugins'

@LifecycleHookUnit()
export default class RedisLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad() {
    const client = this.app.container.get(ARTUS_PLUGIN_REDIS_CLIENT) as RedisClient
    await client
      .init(
        filterPluginConfig(
          (this.app.config as AppConfig).plugin.redis
        ) as AppConfig['plugin']['redis']
      )
      .catch((e) => {
        this.app.logger.error(e)
      })

    // If failed.
    client.getRedis().once('error', (e) => {
      this.app.logger.error(e)
      this.app.close(true)
    })

    client.getSubscriber()?.once('error', (e) => {
      this.app.logger.error(e)
      this.app.close(true)
    })
  }

  @LifecycleHook()
  beforeClose() {
    const redis = (this.app.container.get(ARTUS_PLUGIN_REDIS_CLIENT) as RedisClient).getRedis()

    redis?.disconnect()
  }
}
