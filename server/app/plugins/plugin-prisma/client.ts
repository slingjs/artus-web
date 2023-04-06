import { Injectable, ScopeEnum } from '@artus/core'
import {
  ARTUS_PLUGIN_PRISMA_CLIENT,
  PrismaPluginClientConfig,
  PrismaPluginClientConfigDataSourceItem,
  PrismaPluginDataSourceName,
  PrismaPluginDataSources
} from './types'
import _ from 'lodash'

@Injectable({
  id: ARTUS_PLUGIN_PRISMA_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class PluginPrismaClient {
  private dataSources: PrismaPluginDataSources

  async init (config: PrismaPluginClientConfig) {
    this.dataSources = {}

    Object.keys(config.dataSources).forEach(dbName => {
      const datasource = config.dataSources[dbName] as PrismaPluginClientConfigDataSourceItem
      if (!datasource.enable) {
        return
      }

      this.dataSources[dbName] = {
        prisma: new (require(datasource.schemaOutputPath).PrismaClient),
        config: datasource
      }

      // Load envs.
      const envs = _.get(datasource, 'envs')
      if (envs && typeof envs === 'object') {
        Object.keys(envs).forEach(envName => {
          const envVal = envs[envName]
          if (envVal != null) {
            process.env[envName] = envVal
          }
        })
      }
    })

    // Connect. - No need to connect it manually.
    // await Promise.allSettled(
    //   Object.values(this.dataSources).map(ds => ds.prisma.$connect())
    // )
  }

  getPrisma (dataSourceName: PrismaPluginDataSourceName) {
    return _.get(this.dataSources, [dataSourceName, 'prisma'])
  }

  async disconnect () {
    const dataSources = Object.values(this.dataSources)

    // Disconnect.
    await Promise.allSettled(dataSources.map(ds => ds.prisma.$disconnect()))
  }
}
