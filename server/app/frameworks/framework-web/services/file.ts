import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_FILE_SERVICE } from '../types'
import send from 'send'
import { AppConfig } from '../../../types'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_FILE_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class FileService {
  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  async sendFile (ctx: HTTPMiddlewareContext, filePath: string) {
    const { input: { params: { req } } } = ctx

    return send(req, filePath, { root: (this.app.config as AppConfig).framework.web.distDir, index: false })
  }
}
