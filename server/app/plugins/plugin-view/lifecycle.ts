import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ViewClient } from './client'
import { ARTUS_PLUGIN_VIEW_CLIENT } from './types'
import { filterPluginConfig } from '../../utils/plugins'
import { AppConfig } from '../../types'

@LifecycleHookUnit()
export default class ViewLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad() {
    const client = this.app.container.get(ARTUS_PLUGIN_VIEW_CLIENT) as ViewClient

    await client
      .init(filterPluginConfig((this.app.config as AppConfig).plugin.view) as AppConfig['plugin']['view'])
      .catch(e => {
        this.app.logger.error(e)
      })
  }
}
