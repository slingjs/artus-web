export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE'

export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE'

export const ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY = 'ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY'

export const ARTUS_FRAMEWORK_WEB_PERSISTENT_SERVICE = 'ARTUS_FRAMEWORK_WEB_PERSISTENT_SERVICE'

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

export type MemoryCacheKey = string

export type MemoryCacheValue = string

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
