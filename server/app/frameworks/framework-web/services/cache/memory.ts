import { Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_CACHE_CLIENT } from '../../../../plugins/plugin-cache/types'
import { CacheClient } from '../../../../plugins/plugin-cache/client'
import {
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY,
  MemoryCacheDefaultOptions,
  MemoryCacheExistsOptions,
  MemoryCacheExpireOptions,
  MemoryCacheGetOptions,
  MemoryCacheKey,
  MemoryCacheRemoveOptions,
  MemoryCacheSetOptions,
  MemoryCacheStaleOptions,
  MemoryCacheValue
} from '../../types'
import { MEMORY_CACHE_DEFAULT_TTL } from '../../constants'
import _ from 'lodash'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_MEMORY,
  scope: ScopeEnum.SINGLETON
})
export class MemoryCache {
  @Inject(ARTUS_PLUGIN_CACHE_CLIENT)
  private readonly cacheClient: CacheClient

  private defaultOptions: MemoryCacheDefaultOptions = {
    ttl: MEMORY_CACHE_DEFAULT_TTL,
    refreshWhenGet: true,
    refreshWhenExists: false
  }

  private get client() {
    return this.cacheClient.getCache()
  }

  mergeDefaultOptions(options: Partial<MemoryCacheDefaultOptions>) {
    _.merge(this.defaultOptions, options)
  }

  async get(key: MemoryCacheKey, options?: Partial<MemoryCacheGetOptions>) {
    const needRefresh =
      _.get(options, 'needRefresh') || _.get(this.defaultOptions, 'refreshWhenGet')

    if (needRefresh) {
      let ttl = _.get(options, 'ttl')
      if (ttl == null) {
        ttl = _.get(this.defaultOptions, 'ttl')
      }

      return this.client.get(key, { status: { remainingTTL: ttl! } })
    }

    return this.client.get(key)
  }

  async set(
    key: MemoryCacheKey,
    value: MemoryCacheValue,
    options?: Partial<MemoryCacheSetOptions>
  ) {
    let ttl = _.get(options, 'ttl')
    if (ttl == null) {
      ttl = _.get(this.defaultOptions, 'ttl')
    }

    try {
      this.client.set(key, value, { status: { ttl: ttl! } })
    } catch (e) {
      return false
    }

    return true
  }

  async exists(key: MemoryCacheKey, options?: Partial<MemoryCacheExistsOptions>) {
    const needRefresh =
      _.get(options, 'needRefresh') || _.get(this.defaultOptions, 'refreshWhenExists')

    this.client.has(key, { updateAgeOnHas: needRefresh })
  }

  async remove(key: MemoryCacheKey, _options?: Partial<MemoryCacheRemoveOptions>) {
    return this.client.delete(key)
  }

  async stale(key: MemoryCacheKey, _options?: Partial<MemoryCacheStaleOptions>) {
    return this.client.delete(key)
  }

  async expire(key: MemoryCacheKey, options?: Partial<MemoryCacheExpireOptions>) {
    let ttl = _.get(options, 'ttl')
    if (ttl == null) {
      ttl = _.get(this.defaultOptions, 'ttl')
    }

    return this.client.has(key, { updateAgeOnHas: true, status: { remainingTTL: ttl! } })
  }

  async clear() {
    return this.client.clear()
  }
}
