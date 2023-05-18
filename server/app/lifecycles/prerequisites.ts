import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit
} from '@artus/core'
import { MongoSeed } from '../models/mongo-seed'

@LifecycleHookUnit()
export default class PrerequisitesLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @LifecycleHook()
  public async willReady() {
    const mongoSeed = this.app.container.get(MongoSeed) as MongoSeed
    // if (await mongoSeed.judgeInitialized()) {
    //   return
    // }

    await mongoSeed.init().catch(() => {})
  }
}
