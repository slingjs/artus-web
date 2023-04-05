import { Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_CACHE_CLIENT, CacheConfig } from './types'
import LRUCache from 'lru-cache'

@Injectable({
  id: ARTUS_PLUGIN_CACHE_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class CacheClient {
  private cache: LRUCache<any, any, any>

  async init (options: CacheConfig) {
    this.cache = new LRUCache(options)
  }

  getCache () {
    return this.cache
  }
}
