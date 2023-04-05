import { RedisOptions } from 'ioredis'

export const ARTUS_PLUGIN_REDIS_CLIENT = 'ARTUS_PLUGIN_REDIS_CLIENT'

export interface RedisConfig extends RedisOptions {
  host: string
  port: number
  username?: string
  password?: string
  db: number
}
