import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_HTTP_CLIENT, HTTPConfig } from './types'
import { PluginHTTPClient } from './client'
import { AppConfig, ARTUS_WEB_SHARED_HTTP_SERVER } from '../../types'
import { filterPluginConfig } from '../../utils/plugins'

@LifecycleHookUnit()
export default class HTTPLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  public async didLoad () {
    const client = this.app.container.get(ARTUS_PLUGIN_HTTP_CLIENT) as PluginHTTPClient
    await client.init(filterPluginConfig((this.app.config as AppConfig).plugin.http as HTTPConfig) as AppConfig['plugin']['http'])

    // const trigger = this.app.container.get(ARTUS_PLUGIN_HTTP_TRIGGER) as HTTPTrigger
    // await trigger.use(httpExecutionTimeMiddleware())

    // Register shared http server.
    this.app.container.set({
      id: ARTUS_WEB_SHARED_HTTP_SERVER,
      value: client.getServer()
    })
  }

  @LifecycleHook()
  public async beforeClose () {
    const client = this.app.container.get(ARTUS_PLUGIN_HTTP_CLIENT) as PluginHTTPClient
    const server = client.getServer()

    // Close server.
    server?.close()
  }
}
