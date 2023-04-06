import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { All, HTTPController, Use } from '../../../../plugins/plugin-http/decorator'
import { AccountService } from '../../services/account'
import { AppConfig } from '../../../../types'
import { ARTUS_FRAMEWORK_WEB_CLIENT, ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE, Roles } from '../../types'
import { initUser, userAuthMiddleware } from '../../middlewares/business/account'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'
import { executionTimeMiddleware } from '../../middlewares/common/execution-time'

@HTTPController('/api/account')
@Use([executionTimeMiddleware(), initUser()])
export default class AccountController {
  @Inject(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE)
  accountService: AccountService

  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  frameworkApp: ArtusApplication

  @All()
  @Use(userAuthMiddleware([Roles.SUPER_ADMIN]))
  async getAll (...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    ctx.output.data.body = JSON.stringify({
      config: this.app.config as AppConfig,
      user: await this.accountService.getCtxSession(ctx)
    })
  }
}
