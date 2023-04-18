import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_PAGE_SERVICE } from '../types'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import send from 'send'
import { AppConfig } from '../../../types'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_PAGE_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class PageService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  render(ctx: HTTPMiddlewareContext, _appPath: string) {
    const {
      input: {
        params: { req }
      }
    } = ctx

    return send(req, 'index.html', { root: (this.app.config as AppConfig).framework.web.distDir })
  }
}
