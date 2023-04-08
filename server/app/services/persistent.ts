import {
  ARTUS_PLUGIN_PRISMA_CLIENT,
  PrismaPluginDataSourceName
} from '../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../plugins/plugin-prisma/client'
import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_PERSISTENT_SERVICE } from '../types'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_PERSISTENT_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class PersistentService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  // @ts-ignore
  getClient<R = void> (sourceName: PrismaPluginDataSourceName) {
    const prismaClient = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient

    return prismaClient.getPrisma<R, typeof sourceName>(sourceName)
  }
}
