import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_PLUGIN_PRISMA_CLIENT } from '../../../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../../../plugins/plugin-prisma/client'
import { filterPluginConfig } from '../utils/plugins'
import { AppConfig } from '../../../types'

@LifecycleHookUnit()
export default class PrismaLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  async willReady () {
    const client = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient
    await client.init(filterPluginConfig((this.app.config as AppConfig).plugin.prisma) as AppConfig['plugin']['http'])

    // Create a demo mysql user.
    // await client.getPrisma(PrismaPluginDataSourceName.MYSQL).user.create({
    //   data: {
    //     id: shared.utils.calcUUID(),
    //     email: 'i@email.com',
    //     name: 'Sling',
    //     roles: [Roles.ANONYMOUS].join()
    //   }
    // })

    // Create a demo mongo user.
    // await client.getPrisma(PrismaPluginDataSourceName.MONGO).user.create({
    //   data: {
    //     id: shared.utils.calcUUID(),
    //     email: 'i@email.com',
    //     name: 'Sling',
    //     roles: [Roles.ANONYMOUS].join()
    //   }
    // })
  }

  @LifecycleHook()
  async beforeClose () {
    await (this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient).disconnect()
  }
}
