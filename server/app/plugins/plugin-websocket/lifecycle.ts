import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_WEBSOCKET_CLIENT } from './types'
import { WebsocketClient } from './client'
import { AppConfig, ARTUS_WEB_SHARED_HTTP_SERVER } from '../../types'
import http from 'http'
import { filterPluginConfig } from '../../utils/plugins'

@LifecycleHookUnit()
export default class WebsocketLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad () {
    const client = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_CLIENT) as WebsocketClient

    let sharedServer: http.Server | undefined
    try {
      sharedServer = this.app.container.get(ARTUS_WEB_SHARED_HTTP_SERVER) as http.Server
    } catch (e) {}

    await client.init(
      filterPluginConfig((this.app.config as AppConfig).plugin.websocket) as AppConfig['plugin']['websocket'],
      { existedServer: sharedServer }
    )

    if (!sharedServer) {
      const server = client.getServer()
      this.app.container.set({
        id: ARTUS_WEB_SHARED_HTTP_SERVER,
        value: server
      })
    }
  }

  @LifecycleHook()
  async beforeClose () {
    const client = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_CLIENT) as WebsocketClient

    client.getWsServer()?.close()

    const server = client.getServer()
    // Maybe already closed.
    try {
      server.close()
    } catch (e) {}
  }
}
