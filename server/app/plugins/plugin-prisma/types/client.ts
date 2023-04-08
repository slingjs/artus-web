import type { getPrismaClient } from '@prisma/client/runtime'

export const ARTUS_PLUGIN_PRISMA_CLIENT = 'ARTUS_PLUGIN_PRISMA_CLIENT'

export enum PrismaPluginDataSourceName {
  MONGO = 'mongo',
  MYSQL = 'mysql'
}

export type PrismaPluginClientConfigDataSourceItem = {
  schemaOutputPath: string // Vital.
  envs: Record<string, any> // Will check or be register in 'process.env'
  enable: boolean // Use or not?
}

// The last 'any' is used for mute some weired ts annotation error infos.
export type PrismaPluginClientDataSourceItemInstance = InstanceType<ReturnType<typeof getPrismaClient>> | any

export type PrismaPluginDataSources = {
  [key: string]: {
    prisma: PrismaPluginClientDataSourceItemInstance,
    config: PrismaPluginClientConfigDataSourceItem
  }
}

export type PrismaPluginClientConfig = {
  dataSources: Record<PrismaPluginDataSourceName, PrismaPluginClientConfigDataSourceItem>
}
