import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_PAGE_SERVICE } from '../types'
import { HTTPMiddlewareContext } from '../plugins/plugin-http/types'
import { ARTUS_PLUGIN_VIEW_CLIENT } from '../plugins/plugin-view/types'
import { ViewClient } from '../plugins/plugin-view/client'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_PAGE_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class PageService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_PLUGIN_VIEW_CLIENT)
  viewClient: ViewClient

  async render(_ctx: HTTPMiddlewareContext, data: Record<string, any>, _appPath: string) {
    return this.viewClient.render('index.html', data)
  }
}
