import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_CACHE_SERVICE, ARTUS_FRAMEWORK_WEB_CLIENT } from '../../frameworks/framework-web/types'
import { FrameworkWebClient } from '../../frameworks/framework-web/client'
import { MongoSeed } from '../../frameworks/framework-web/models/casbin/mongo-seed'
import { CacheService } from '../../frameworks/framework-web/services/cache'

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  webClient: FrameworkWebClient

  @Inject(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE)
  cacheService: CacheService

  @LifecycleHook()
  public async willReady() {
    const isCasbinSeedOperated = await this.cacheService.file.exists('model-seeds.txt', 'casbin-operated')
    if (isCasbinSeedOperated) {
      return
    }

    const mongoSeed = this.app.container.get(MongoSeed) as MongoSeed
    // if (await mongoSeed.judgeInitialized()) {
    //   return
    // }

    await mongoSeed
      .init()
      .then(() => {
        return this.cacheService.file.append('model-seeds.txt', 'casbin-operated', { useNewLineOnEOF: true })
      })
      .catch(() => {})
  }
}
