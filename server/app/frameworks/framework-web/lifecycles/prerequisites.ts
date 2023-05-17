import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from '../types'
import { FrameworkWebClient } from '../client'
import { MongoSeed } from '../models/mongo-seed'

@LifecycleHookUnit()
export default class PrerequisitesLifecycle implements ApplicationLifecycle {
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
