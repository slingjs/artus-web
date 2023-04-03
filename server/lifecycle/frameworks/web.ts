import {
  ApplicationLifecycle,
  ArtusApplication,
  ArtusInjectEnum,
  Inject,
  LifecycleHook,
  LifecycleHookUnit,
  ScopeEnum
} from '@artus/core'
import { AppConfig } from '../../types'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from '../../frameworks/framework-web/types'
import { FrameworkWebClient } from '../../frameworks/framework-web/client'

@LifecycleHookUnit()
export default class FrameworkWebLifecycle implements ApplicationLifecycle {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  // 在 Artus 生命周期 willReady 时启动 HTTP server
  @LifecycleHook()
  public async willReady () {
    const client = new FrameworkWebClient()
    await client.init(this.app, (this.app.config as AppConfig).frameworks.web)

    // Singleton.
    this.app.container.set({
      id: ARTUS_FRAMEWORK_WEB_CLIENT,
      scope: ScopeEnum.SINGLETON,
      value: client,
      type: FrameworkWebClient
    })
  }
}
