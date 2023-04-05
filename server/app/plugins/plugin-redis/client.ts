import { Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_PLUGIN_REDIS_CLIENT, RedisConfig } from './types'
import { Redis } from 'ioredis'

@Injectable({
  id: ARTUS_PLUGIN_REDIS_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class RedisClient {
  private redis: Redis

  async init (config: RedisConfig) {
    this.redis = new Redis(config)
  }

  getRedis () {
    return this.redis
  }
}
