import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { All, HTTPController } from '../../../plugins/plugin-http/decorator'
import UserService from '../services/user'
import { HTTPHandler } from '../../../plugins/plugin-http/types'
import { AppConfig } from '../../../types'
import { ARTUS_FRAMEWORK_WEB_CLIENT } from '../types/client'

@HTTPController('/user')
export default class UserController {
  @Inject()
  userService: UserService

  // @Inject(ArtusInjectEnum.Config)
  // config: AppConfig

  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CLIENT)
  frameworkApp: ArtusApplication

  @All()
  async getAll (...args: Parameters<HTTPHandler>): Promise<ReturnType<HTTPHandler>> {
    const [_, res] = args
    const user = await this.userService.info()

    res.statusCode = 400
    res.end(JSON.stringify({
      config: this.app.config as AppConfig,
      user
    }))
  }
}
