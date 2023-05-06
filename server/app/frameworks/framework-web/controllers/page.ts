import { Get, HTTPController, Use } from '../../../plugins/plugin-http/decorator'
import { Inject } from '@artus/core'
import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE, ARTUS_FRAMEWORK_WEB_PAGE_SERVICE } from '../types'
import { HTTPMiddleware } from '../../../plugins/plugin-http/types'
import { PageService } from '../services/page'
import shared from '@sling/artus-web-shared'
import { initUser } from '../middlewares/business/account'
import { AccountService } from '../services/account'

@HTTPController('', {
  order: Infinity // Put it at the last.
})
@Use(initUser<HTTPMiddleware>())
export class PageController {
  @Inject(ARTUS_FRAMEWORK_WEB_PAGE_SERVICE)
  pageService: PageService

  @Inject(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE)
  userService: AccountService

  @Get('/:appPath')
  async handler(...args: Parameters<HTTPMiddleware>) {
    const [ctx, next] = args

    const {
      input: {
        params: {
          params: { appPath }
        }
      }
    } = ctx
    if (shared.utils.compareIgnoreCase(appPath, shared.constants.FILE_BASE_DIR)) {
      return await next()
    }

    const {
      output: { data }
    } = ctx
    const userSession = await this.userService.getCtxSession(ctx)

    data.body = await this.pageService.render(
      ctx,
      {
        csrfToken: userSession._csrfToken
      },
      appPath!
    )
  }
}
