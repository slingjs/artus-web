import { PrismaClient as PrismaClientMongo } from '../models/mongo/generated/client'
import { PrismaClient as PrismaClientMysql } from '../models/mysql/generated/client'
import { PrismaPluginClientDataSourceItemInstance, PrismaPluginDataSourceName } from '../plugins/plugin-prisma/types'
import { PromiseOrPrimitive, Roles, UserSession } from '@sling/artus-web-shared/types'
import { RedisEventSubscriberEventNames } from '../plugins/plugin-redis/types'

export const ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE = 'ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE'
export const ARTUS_FRAMEWORK_WEB_FILE_SERVICE = 'ARTUS_FRAMEWORK_WEB_FILE_SERVICE'
export const ARTUS_FRAMEWORK_WEB_PAGE_SERVICE = 'ARTUS_FRAMEWORK_WEB_PAGE_SERVICE'
export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE'
export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE'
export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY'
export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_FILE_SYSTEM = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_FILE_SYSTEM'
export const ARTUS_FRAMEWORK_WEB_CASBIN_SERVICE = 'ARTUS_FRAMEWORK_WEB_CASBIN_SERVICE'

export const DistributeCacheEventSubscriberEventNames = RedisEventSubscriberEventNames

export const MemoryCacheWrapSetterValueKey = Symbol('cache:value')
export const MemoryCacheWrapSetterOptionsKey = Symbol('cache:options')
export const MemoryCacheGetSetBypassValue = Symbol('cache:getSet:bypassValue')

export enum ResponseDataStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  WARN = 'WARN'
}

export interface ResponseData {
  status: ResponseDataStatus
  code: string
  message: string
  data: any
}

export type DistributeCacheKey = string

export type DistributeCacheValue = string

export type DistributeCacheDefaultOptions = {
  ttl: number // ms.
  refreshWhenGet: boolean
  refreshWhenExists: boolean
}

export interface DistributeCacheSetOptions {
  ttl: number // ms.
}

export interface DistributeCacheGetOptions {
  needRefresh: boolean
  ttl: number // ms.
}

export interface DistributeCacheExistsOptions {
  needRefresh: boolean
  ttl: number // ms.
}

export interface DistributeCacheRemoveOptions {}

export interface DistributeCacheStaleOptions {}

export interface DistributeCacheExpireOptions {
  ttl: number // ms.
}

export type PersistentDBInstance<T extends PrismaPluginDataSourceName = any> =
  T extends PrismaPluginDataSourceName.MONGO
    ? PrismaClientMongo
    : T extends PrismaPluginDataSourceName.MYSQL
    ? PrismaClientMysql
    : PrismaPluginClientDataSourceItemInstance

export type MemoryCacheKey = string

export type MemoryCacheValue = any

export type MemoryCacheDefaultOptions = {
  ttl: number // ms.
  refreshWhenGet: boolean
  refreshWhenExists: boolean
}

export interface MemoryCacheSetOptions {
  ttl: number // ms.
}

export interface MemoryCacheGetOptions {
  needRefresh: boolean
  ttl: number // ms.
}

export interface MemoryCacheExistsOptions {
  needRefresh: boolean
  ttl: number // ms.
}

export interface MemoryCacheRemoveOptions {}

export interface MemoryCacheStaleOptions {}

export interface MemoryCacheExpireOptions {
  ttl: number // ms.
}

export interface MemoryCacheGetSetOptions extends MemoryCacheGetOptions {
  valueSetJudgement: (curVal: MemoryCacheValue, key: MemoryCacheKey) => boolean
}

export type MemoryCacheGetSetSetter<V = MemoryCacheValue, S = MemoryCacheSetOptions> = (
  curVal: V,
  key: MemoryCacheKey
) => PromiseOrPrimitive<V | symbol | (Record<symbol, V | symbol> & Record<symbol, S>) | any>

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

export enum AccountResponseDataCode {
  // Session.
  SUCCESS_SESSION_FOUND = 'SUCCESS_SESSION_FOUND',
  ERROR_SESSION_UNEXPECTED_ERROR = 'ERROR_SESSION_UNEXPECTED_ERROR',

  // Sign in.
  ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID = 'ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID',
  ERROR_SIGN_IN_ACCOUNT_WRONG_PASSWORD = 'ERROR_SIGN_IN_ACCOUNT_WRONG_PASSWORD',
  ERROR_SIGN_IN_ACCOUNT_NOT_FOUND = 'ERROR_SIGN_IN_ACCOUNT_NOT_FOUND',
  ERROR_SIGN_IN_ACCOUNT_INACTIVE = 'ERROR_SIGN_IN_ACCOUNT_INACTIVE',
  ERROR_SIGN_IN_ALREADY_SIGNED_IN = 'ERROR_SIGN_IN_ALREADY_SIGNED_IN',
  ERROR_SIGN_IN_UNEXPECTED_ERROR = 'ERROR_SIGN_IN_UNEXPECTED_ERROR',
  SUCCESS_SIGN_IN_SUCCESS = 'SUCCESS_SIGN_IN_SUCCESS',

  // Sign up.
  ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID = 'ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID',
  ERROR_SIGN_UP_DUPLICATE = 'ERROR_SIGN_UP_DUPLICATE',
  ERROR_SIGN_UP_UNEXPECTED_ERROR = 'ERROR_SIGN_UP_UNEXPECTED_ERROR',
  SUCCESS_SIGN_UP_SUCCESS = 'SUCCESS_SIGN_UP_SUCCESS',

  // Change pwd.
  ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID = 'ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID',
  ERROR_CHANGE_PWD_ACCOUNT_NOT_FOUND = 'ERROR_CHANGE_PWD_ACCOUNT_NOT_FOUND',
  ERROR_CHANGE_PWD_ACCOUNT_WRONG_OLD_PASSWORD = 'ERROR_CHANGE_PWD_ACCOUNT_WRONG_OLD_PASSWORD',
  ERROR_CHANGE_PWD_UNEXPECTED_ERROR = 'ERROR_CHANGE_PWD_UNEXPECTED_ERROR',
  SUCCESS_CHANGE_PWD_SUCCESS = 'SUCCESS_CHANGE_PWD_SUCCESS'
}

export interface AccountResponseData<AccountType = any> extends ResponseData {
  status: ResponseDataStatus
  code: AccountResponseDataCode
  message: string
  data: {
    account: AccountType
  }
}

export type UserSessionRecords = Array<UserSession['_sessionId']>

export enum UserSessionTamperedFromMethodType {
  CHANGE_PWD = 'change-pwd',
  SIGN_OUT = 'sign-out'
}

export enum UserSessionCertificatedFromMethodType {
  SIGN_IN = 'sign-in'
}

export type CasbinPolicy = {
  id: string
  bizRealm: string
  sec: string
  pType: string
  v0: string | null
  v1: string | null
  v2: string | null
  v3: string | null
  v4: string | null
  v5: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type CasbinModel = {
  id: string
  bizRealm: string
  sec: string
  pType: string
  v0: string | null
  v1: string | null
  v2: string | null
  v3: string | null
  v4: string | null
  v5: string | null
  createdAt: Date | null
  updatedAt: Date | null
}
