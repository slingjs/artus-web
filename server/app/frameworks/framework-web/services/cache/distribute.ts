import { Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_REDIS_CLIENT } from '../../../../plugins/plugin-redis/types'
import { RedisClient } from '../../../../plugins/plugin-redis/client'
import {
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE,
  DistributeCacheDefaultOptions,
  DistributeCacheExistsOptions,
  DistributeCacheExpireOptions,
  DistributeCacheGetOptions,
  DistributeCacheKey,
  DistributeCacheRemoveOptions,
  DistributeCacheSetOptions,
  DistributeCacheStaleOptions,
  DistributeCacheValue
} from '../../types'
import _ from 'lodash'
import { ArrayOrPrimitive } from '@sling/artus-web-shared/types'
import {
  DISTRIBUTE_CACHE_CLEAR_SUCCESS_VALUE,
  DISTRIBUTE_CACHE_DEFAULT_TTL,
  DISTRIBUTE_CACHE_SET_SUCCESS_VALUE,
  DISTRIBUTE_CACHE_SUCCESS_VALUE
} from '../../constants'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_CACHE_SERVICE_DISTRIBUTE,
  scope: ScopeEnum.SINGLETON
})
export class DistributeCache {
  @Inject(ARTUS_PLUGIN_REDIS_CLIENT)
  private readonly redisClient: RedisClient

  private defaultOptions: DistributeCacheDefaultOptions = {
    ttl: DISTRIBUTE_CACHE_DEFAULT_TTL, // ms.
    refreshWhenGet: true,
    refreshWhenExists: false
  }

  private get client () {
    return this.redisClient.getRedis()
  }

  mergeDefaultOptions (options: Partial<DistributeCacheDefaultOptions>) {
    _.merge(this.defaultOptions, options)
  }

  async get (key: DistributeCacheKey, options?: Partial<DistributeCacheGetOptions>) {
    const needRefresh = _.get(options, 'needRefresh') ||
      _.get(this.defaultOptions, 'refreshWhenGet')
    if (needRefresh) {
      let ttl = _.get(options, 'ttl')
      if (ttl == null) {
        ttl = _.get(this.defaultOptions, 'ttl')
      }

      return this.client.getex(key, 'PX', ttl)
    }

    return this.client.get(key)
  }

  async set (
    key: DistributeCacheKey,
    value: DistributeCacheValue,
    options?: Partial<DistributeCacheSetOptions>
  ) {
    let ttl = _.get(options, 'ttl')
    if (ttl == null) {
      ttl = _.get(this.defaultOptions, 'ttl')
    }

    return await this.client.set(key, value, 'PX', ttl) === DISTRIBUTE_CACHE_SET_SUCCESS_VALUE
  }

  async exists (key: DistributeCacheKey, options?: Partial<DistributeCacheExistsOptions>) {
    const needRefresh = _.get(options, 'needRefresh') || _.get(this.defaultOptions, 'refreshWhenExists')
    if (needRefresh) {
      let ttl = _.get(options, 'ttl')
      if (ttl == null) {
        ttl = _.get(this.defaultOptions, 'ttl')
      }

      return await Promise.allSettled([this.client.exists(key), this.client.pexpire(key, ttl!)])
        .then(res => {
          const existsRes = res[0]
          if (existsRes.status === 'rejected') {
            return false
          }

          return existsRes.value === DISTRIBUTE_CACHE_SUCCESS_VALUE
        })
    }

    return await this.client.exists(key) === DISTRIBUTE_CACHE_SUCCESS_VALUE
  }

  async remove (key: ArrayOrPrimitive<DistributeCacheKey>, _options?: Partial<DistributeCacheRemoveOptions>) {
    return await this.client.del(key as Array<DistributeCacheKey>) === DISTRIBUTE_CACHE_SUCCESS_VALUE
  }

  async stale (key: ArrayOrPrimitive<DistributeCacheKey>, _options?: Partial<DistributeCacheStaleOptions>) {
    if (Array.isArray(key)) {
      return Promise.allSettled(key.map(k => this.client.pexpire(k, -1)))
        .then(res => {
          return res.every(r => r.status === 'fulfilled' && r.value === DISTRIBUTE_CACHE_SUCCESS_VALUE)
        })
    }

    return await this.client.expire(key, -1) === DISTRIBUTE_CACHE_SUCCESS_VALUE
  }

  async expire (key: ArrayOrPrimitive<DistributeCacheKey>, options?: Partial<DistributeCacheExpireOptions>) {
    let ttl = _.get(options, 'ttl')
    if (ttl == null) {
      ttl = _.get(this.defaultOptions, 'ttl')
    }

    if (Array.isArray(key)) {
      return Promise.allSettled(key.map(k => this.client.pexpire(k, ttl!)))
        .then(res => {
          return res.every(r => r.status === 'fulfilled' && r.value === DISTRIBUTE_CACHE_SUCCESS_VALUE)
        })
    }

    return await this.client.expire(key, ttl!) === DISTRIBUTE_CACHE_SUCCESS_VALUE
  }

  async clear () {
    return await this.client.flushdb() === DISTRIBUTE_CACHE_CLEAR_SUCCESS_VALUE
  }
}
