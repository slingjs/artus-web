import { Get, HTTPController } from '../../../plugins/plugin-http/decorator'
import { Inject } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_APP_SERVICE } from '../types'
import { HTTPMiddleware } from '../../../plugins/plugin-http/types'
import AppService from '../services/app'
import { utils, constants } from '@sling/artus-web-shared'

@HTTPController('', -1)
export class AppController {
  @Inject(ARTUS_FRAMEWORK_WEB_APP_SERVICE)
  appService: AppService

  @Get('/:appPath')
  async handler (...args: Parameters<HTTPMiddleware>) {
    const [ctx, next] = args

    const { input: { params: { params: { appPath } } } } = ctx
    if (utils.compareIgnoreCase(appPath, constants.FILE_BASE_DIR)) {
      return await next()
    }

    const { output: { data } } = ctx
    data.body = await this.appService.render(ctx, appPath!)
  }
}
