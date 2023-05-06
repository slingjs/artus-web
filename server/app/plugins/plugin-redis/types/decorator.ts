export const REDIS_EVENT_SUBSCRIBER_TAG = 'REDIS_KEY_EXPIRED_EVENT_SUBSCRIBER_TAG'
export const REDIS_EVENT_SUBSCRIBER = 'REDIS_KEY_EXPIRED_EVENT_SUBSCRIBER'

export enum RedisEventSubscriberEventNames {
  KEY_EXPIRED = 'KEY_EXPIRED'
}

export type RedisEventSubscriberMetadata<E extends RedisEventSubscriberEventNames = RedisEventSubscriberEventNames> =
  Array<{
    handler: Function
    eventName: E
  }>
