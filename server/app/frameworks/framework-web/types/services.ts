import { Roles } from './roles'
import {
  PrismaPluginClientDataSourceItemInstance,
  PrismaPluginDataSourceName
} from '../../../plugins/plugin-prisma/types'
import { PrismaClient as PrismaClientMongo } from '../models/mongo/generated/client'
import { PrismaClient as PrismaClientMysql } from '../models/mysql/generated/client'

export const ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE = 'ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE'

export const ARTUS_FRAMEWORK_WEB_FILE_SERVICE = 'ARTUS_FRAMEWORK_WEB_FILE_SERVICE'

export const ARTUS_FRAMEWORK_WEB_PAGE_SERVICE = 'ARTUS_FRAMEWORK_WEB_PAGE_SERVICE'

export interface UserSession {
  name: string
  roles: Array<Roles>
  signedIn: boolean
  id: string
  email: string
  _sessionId: string
}

export interface AccountSignUpPayload {
  email: string
  name: string
  password: string
  roles?: Roles[]
}

export interface AccountSignInPayload {
  email: string
  password: string
}

export interface AccountChangePwdPayload {
  email: string
  password: string
  oldPassword: string
}

export type AccountPersistentDataSource<T extends PrismaPluginDataSourceName = any> = T extends PrismaPluginDataSourceName.MONGO
  ? PrismaClientMongo
  : T extends PrismaPluginDataSourceName.MYSQL
    ? PrismaClientMysql
    : PrismaPluginClientDataSourceItemInstance
