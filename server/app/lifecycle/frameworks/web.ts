import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from '../../frameworks/framework-web/types'
import { FrameworkWebClient } from '../../frameworks/framework-web/client'
import { MongoSeed } from '../../frameworks/framework-web/models/mongo-seed'

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  webClient: FrameworkWebClient

  @LifecycleHook()
  public async willReady() {
    const mongoSeed = this.app.container.get(MongoSeed) as MongoSeed
    // if (await mongoSeed.judgeInitialized()) {
    //   return
    // }

    await mongoSeed.init().catch(() => {})
  }
}
