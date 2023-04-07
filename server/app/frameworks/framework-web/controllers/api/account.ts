import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { HTTPController, Post, Use } from '../../../../plugins/plugin-http/decorator'
import { AccountService } from '../../services/account'
import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE } from '../../types'
import { initUser, userAuthMiddleware } from '../../middlewares/business/account'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'
import { executionTimeMiddleware } from '../../middlewares/common/execution-time'
import _ from 'lodash'

@HTTPController('/api/account')
@Use([executionTimeMiddleware(), initUser()])
export default class AccountController {
  @Inject(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE)
  accountService: AccountService

  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Post('/sign-in', { useBodyParser: true })
  async signIn (...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const { input: { params: { req } }, output: { data } } = ctx
    const ctxSession = await this.accountService.getCtxSession(ctx)
    if (ctxSession.signedIn) {
      data.status = 400
      data.body = {
        code: 'ERROR_SIGN_IN_ALREADY_SIGNED_IN',
        status: 'FAIL'
      }

      return
    }

    const result = await this.accountService.signIn(ctx, req.body, { passwordPreEncrypt: true })
    if (!result.account) {
      data.status = 400
      data.body = _.omit(result, 'account')

      return
    }

    // @ts-ignore
    await this.accountService.handleSessionCertificated(ctx, result.account)

    data.status = 200
    data.body = _.omit(result, 'account')

    return
  }

  @Post('/sign-up', { useBodyParser: true })
  async signUp (...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const { input: { params: { req } }, output: { data } } = ctx
    const ctxSession = await this.accountService.getCtxSession(ctx)
    if (ctxSession.signedIn) {
      data.status = 400
      data.body = {
        code: 'ERROR_SIGN_UP_ALREADY_SIGNED_IN',
        status: 'FAIL'
      }

      return
    }

    const result = await this.accountService.signUp(ctx, req.body, { passwordPreEncrypt: true })
      .catch(e => {
        this.app.logger.error('[Error] Failed to sign up.', e)
        return {
          account: null,
          code: 'ERROR_SIGN_IN_UNEXPECTED_ERROR',
          status: 'FAIL'
        }
      })

    if (!result.account) {
      data.status = 400
      data.body = _.omit(result, 'account')
      return
    }

    // @ts-ignore
    await this.accountService.handleSessionCertificated(ctx, result.account)

    data.status = 200
    data.body = {
      code: 'SUCCESS_SIGN_UP_SUCCESS',
      status: _.omit(result, 'account')
    }
  }

  // Need signed in.
  @Post('/change-pwd', { useBodyParser: true })
  @Use([userAuthMiddleware()])
  async changePwd (...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args
    const { input: { params: { req } }, output: { data } } = ctx

    const result = await this.accountService.changePwd(ctx, req.body, { passwordPreEncrypt: true })
      .catch(e => {
        this.app.logger.error('[Error] Failed to change pwd.', e)
        return {
          account: null,
          code: 'ERROR_CHANGE_PWD_UNEXPECTED_ERROR',
          status: 'FAIL'
        }
      })

    if (!result.account) {
      data.status = 400
      data.body = _.omit(result, 'account')
      return
    }

    await this.accountService.handleCertificatedSessionTampered(ctx)
    data.status = 200
    data.body = _.omit(result, 'account')
  }
}
