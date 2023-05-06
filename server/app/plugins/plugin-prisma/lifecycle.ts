import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_PRISMA_CLIENT } from './types'
import { PluginPrismaClient } from './client'
import { filterPluginConfig } from '../../utils/plugins'
import { AppConfig } from '../../types'

@LifecycleHookUnit()
export default class PrismaLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async didLoad() {
    const client = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient
    await client.init(filterPluginConfig((this.app.config as AppConfig).plugin.prisma) as AppConfig['plugin']['http'])
  }

  @LifecycleHook()
  async beforeClose() {
    await (this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient).disconnect()
  }
}
