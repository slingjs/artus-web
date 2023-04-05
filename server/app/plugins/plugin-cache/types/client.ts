import LRUCache from 'lru-cache'

export const ARTUS_PLUGIN_CACHE_CLIENT = 'ARTUS_PLUGIN_CACHE_CLIENT'

export type CacheConfig<K = any, V = any, FC = any> = LRUCache.Options<K, V, FC>
