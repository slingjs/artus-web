import { ArrayMember } from '@sling/artus-web-shared/types'
import {
  REDIS_EVENT_SUBSCRIBER,
  REDIS_EVENT_SUBSCRIBER_TAG,
  RedisEventSubscriberEventNames,
  RedisEventSubscriberMetadata
} from './types'
import { addTag } from '@artus/core'

export function SubscribeRedisEventUnit (): ClassDecorator {
  return function(target) {
    addTag(REDIS_EVENT_SUBSCRIBER_TAG, target)
  }
}

export function SubscribeRedisEvent (eventName: RedisEventSubscriberEventNames) {
  return function(
    _target: Object,
    _key: string | symbol,
    descriptor: TypedPropertyDescriptor<ArrayMember<RedisEventSubscriberMetadata>['handler']>
  ) {
    const subscriberMetadata: RedisEventSubscriberMetadata = (
      Reflect.getMetadata(REDIS_EVENT_SUBSCRIBER, descriptor.value!) ?? []
    )

    subscriberMetadata.push({
      handler: descriptor.value!,
      eventName: eventName
    })

    Reflect.defineMetadata(REDIS_EVENT_SUBSCRIBER, subscriberMetadata, descriptor.value!)
  }
}
