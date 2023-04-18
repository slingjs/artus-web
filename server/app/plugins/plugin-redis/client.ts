import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import {
  ARTUS_PLUGIN_REDIS_CLIENT,
  REDIS_EVENT_SUBSCRIBER,
  REDIS_EVENT_SUBSCRIBER_TAG,
  RedisConfig,
  RedisEventSubscriberEventNames,
  RedisEventSubscriberMetadata
} from './types'
import { Redis } from 'ioredis'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'

@Injectable({
  id: ARTUS_PLUGIN_REDIS_CLIENT,
  scope: ScopeEnum.SINGLETON
})
export class RedisClient {
  @Inject(ArtusInjectEnum.Application)
  private readonly app: ArtusApplication

  private redis: Redis

  private subscriber: Redis | null = null

  async init(config: RedisConfig) {
    this.redis = new Redis(config)

    const eventMetadataRecords: Record<
      RedisEventSubscriberEventNames,
      RedisEventSubscriberMetadata
    > = {} as any

    const redisOperablePromise = shared.utils.generateOperablePromise<Redis>()
    this.redis.once('ready', async () => {
      const eventSubscriberControllerClazzs = this.app.container.getInjectableByTag(
        REDIS_EVENT_SUBSCRIBER_TAG
      ) as FunctionConstructor[]
      if (
        !(Array.isArray(eventSubscriberControllerClazzs) && eventSubscriberControllerClazzs.length)
      ) {
        return redisOperablePromise.resolve(this.redis)
      }

      for (const eventSubscriberControllerClazz of eventSubscriberControllerClazzs) {
        const eventSubscriberHandlerDescriptorList = Object.getOwnPropertyDescriptors(
          eventSubscriberControllerClazz.prototype
        )
        const eventSubscriberController = this.app.container.get(eventSubscriberControllerClazz)

        for (const key of Object.keys(eventSubscriberHandlerDescriptorList)) {
          const handlerDescriptor = eventSubscriberHandlerDescriptorList[key]

          const redisEventSubscriberMetadata = Reflect.getMetadata(
            REDIS_EVENT_SUBSCRIBER,
            handlerDescriptor.value
          ) as RedisEventSubscriberMetadata
          if (!Array.isArray(redisEventSubscriberMetadata)) {
            continue
          }

          for (const eventMetadata of redisEventSubscriberMetadata) {
            let eventMetadataRecord = eventMetadataRecords[eventMetadata.eventName]
            if (!eventMetadataRecord) {
              eventMetadataRecords[eventMetadata.eventName] = eventMetadataRecord =
                [] as RedisEventSubscriberMetadata
            }

            eventMetadataRecord.push({
              ...eventMetadata,
              handler: eventMetadata.handler.bind(eventSubscriberController)
            })
          }
        }
      }

      redisOperablePromise.resolve(this.redis)
    })
    this.redis.once('error', redisOperablePromise.reject)
    await redisOperablePromise.p

    if (_.isEmpty(eventMetadataRecords)) {
      return this
    }

    const subscriberOperablePromise = shared.utils.generateOperablePromise<Redis>()
    this.subscriber = new Redis(config)
    this.subscriber.once('ready', async () => {
      subscriberOperablePromise.resolve(this.subscriber!)
    })
    this.subscriber.once('error', subscriberOperablePromise.reject)

    await subscriberOperablePromise.p
    await this.handleSubscribeKeyExpiredEvent(
      eventMetadataRecords[RedisEventSubscriberEventNames.KEY_EXPIRED]
    )

    return this
  }

  private async handleSubscribeKeyExpiredEvent(
    eventMetadata: RedisEventSubscriberMetadata<RedisEventSubscriberEventNames.KEY_EXPIRED>
  ) {
    if (!(Array.isArray(eventMetadata) && eventMetadata.length)) {
      return
    }

    const subscribeChannel = '__keyevent@0__:expired' as const
    this.subscriber!.config('SET', 'notify-keyspace-events', 'Ex')
    this.subscriber!.subscribe(subscribeChannel)
    this.subscriber!.on('message', async (channel: typeof subscribeChannel, key: string) => {
      if (channel !== subscribeChannel) {
        return
      }

      for (const metadata of eventMetadata) {
        await metadata.handler(key)
      }
    })
  }

  getRedis() {
    return this.redis
  }

  getSubscriber() {
    return this.subscriber
  }
}
