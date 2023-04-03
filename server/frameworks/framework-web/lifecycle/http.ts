import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_HTTP_CLIENT, ARTUS_PLUGIN_HTTP_TRIGGER, HTTPConfig } from '../../../plugins/plugin-http/types'
import { PluginHTTPClient } from '../../../plugins/plugin-http/client'
import { AppConfig } from '../../../types'
import { executionTimeMiddleware } from '../middlewares/common/execution-time'
import { HTTPTrigger } from '../../../plugins/plugin-http/trigger'

@LifecycleHookUnit()
export default class HTTPLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  // 在 Artus 生命周期 willReady 时启动 HTTP server
  @LifecycleHook()
  public async didLoad () {
    const client = this.app.container.get(ARTUS_PLUGIN_HTTP_CLIENT) as PluginHTTPClient
    await client.init((this.app.config as AppConfig).plugins.http as HTTPConfig)

    const trigger = this.app.container.get(ARTUS_PLUGIN_HTTP_TRIGGER) as HTTPTrigger
    await trigger.use(executionTimeMiddleware);
  }
}
