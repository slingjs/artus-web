import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from './types'
import { ARTUS_PLUGIN_HTTP_CLIENT } from '../../plugins/plugin-http/types'
import { PluginHTTPClient } from '../../plugins/plugin-http/client'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class FrameworkWebClient {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  isListening () {
    const client = this.app.container.get(ARTUS_PLUGIN_HTTP_CLIENT) as PluginHTTPClient
    const server = client.getServer()

    return server?.listening
  }
}
