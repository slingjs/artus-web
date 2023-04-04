import { Inject } from '@artus/core'
import { Get, HTTPController } from '../../../plugins/plugin-http/decorator'
import { HTTPMiddleware } from '../../../plugins/plugin-http/types'
import FileService from '../services/file'
import { ARTUS_FRAMEWORK_WEB_FILE_SERVICE } from '../types'
import { FILE_BASE_PATH } from '@sling/artus-web-shared/constants/client'

@HTTPController(FILE_BASE_PATH)
export class FileController {
  @Inject(ARTUS_FRAMEWORK_WEB_FILE_SERVICE)
  fileService: FileService

  @Get('/*')
  async handler (...args: Parameters<HTTPMiddleware>) {
    const [ctx, next] = args

    const { input: { params: { params: { '*': filePath } } }, output: { data } } = ctx
    if (!filePath) {
      return await next()
    }

    data.body = await this.fileService.sendFile(ctx, '/' + filePath!)
  }
}