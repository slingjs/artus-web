import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { All, HTTPController, Use } from '../../../plugins/plugin-http/decorator'
import UserService from '../services/user'
import { AppConfig } from '../../../types'
import { ARTUS_FRAMEWORK_WEB_CLIENT, ARTUS_FRAMEWORK_WEB_USER_SERVICE, Roles } from '../types'
import { initUser, userAuthMiddleware } from '../middlewares/business/user'
import { getSession } from '../utils/business/user'
import { HTTPMiddleware } from '../../../plugins/plugin-http/types'

@HTTPController('/user')
@Use(initUser())
export default class UserController {
  @Inject(ARTUS_FRAMEWORK_WEB_USER_SERVICE)
  userService: UserService

  // @Inject(ArtusInjectEnum.Config)
  // config: AppConfig

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
      user: getSession(ctx)
    })
  }
}
