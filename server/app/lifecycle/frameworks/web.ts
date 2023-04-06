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

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  webClient: FrameworkWebClient

  @LifecycleHook()
  public async didReady () {

  }
}
