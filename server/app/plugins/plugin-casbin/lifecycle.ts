import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_CASBIN_CLIENT } from './types'
import { PluginCasbinClient } from './client'
import { filterPluginConfig } from '../../utils/plugins'
import { AppConfig } from '../../types'

@LifecycleHookUnit()
export default class CasbinLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad() {
    const client = this.app.container.get(ARTUS_PLUGIN_CASBIN_CLIENT) as PluginCasbinClient

    await client.init(filterPluginConfig((this.app.config as AppConfig).plugin.casbin) as AppConfig['plugin']['casbin'])
  }
}
