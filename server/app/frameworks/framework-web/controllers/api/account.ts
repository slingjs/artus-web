import { ArtusApplication, ArtusInjectEnum, Inject } from '@artus/core'
import { HTTPController, HTTPRoute, Post, Use } from '../../../../plugins/plugin-http/decorator'
import { AccountService } from '../../services/account'
import {
  AccountResponseDataCode,
  ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  ResponseDataStatus,
  UserSessionCertificatedFromMethodType,
  UserSessionTamperedFromMethodType
} from '../../types'
import { initUser } from '../../middlewares/business/account'
import { HTTPMethod, HTTPMiddleware } from '../../../../plugins/plugin-http/types'
import { executionTimeMiddleware } from '../../middlewares/common/execution-time'
import _ from 'lodash'
import status from 'http-status'
import { bypassInitUserMiddlewareFilter } from '../../utils/business/account'
import { filterXSS } from 'xss'
import shared from '@sling/artus-web-shared'
import { apiReqSecurityMiddleware } from '../../middlewares/security/security'

@HTTPController('/api/account')
@Use([
  executionTimeMiddleware<HTTPMiddleware>(),
  initUser<HTTPMiddleware>({ bypassFilter: bypassInitUserMiddlewareFilter }),
  apiReqSecurityMiddleware<HTTPMiddleware>()
])
export default class AccountApiController {
  @Inject(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE)
  accountService: AccountService

  @Inject(ArtusInjectEnum.Application)
  app: ArtusApplication

  @Post('/session')
  async session(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const {
      output: { data }
    } = ctx
    const ctxSession = await this.accountService.getCtxSession(ctx)

    if (!ctxSession) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData({
        code: AccountResponseDataCode.ERROR_SESSION_UNEXPECTED_ERROR,
        status: ResponseDataStatus.FAIL
      })

      return
    }

    data.status = status.OK
    data.body = this.accountService.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SESSION_FOUND,
        status: ResponseDataStatus.SUCCESS
      },
      ctxSession,
      {
        useCtxAccount: true
      }
    )
  }

  @Post('/sign-in', { useBodyParser: true })
  async signIn(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const {
      input: {
        params: { req }
      },
      output: { data }
    } = ctx
    let ctxSession = await this.accountService.getCtxSession(ctx)
    if (ctxSession.signedIn) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_ALREADY_SIGNED_IN,
        status: ResponseDataStatus.FAIL
      })

      return
    }

    /**
     * Sign in invoker.
     * Password should be a base64 encrypt string.
     *
     * Here only show an example. No matter password encrypted or not.
     *
     * fetch('/api/account/sign-in', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'i@test.com', password: '1qaz!QAZ' }) })
     */
    const result = await this.accountService
      .signIn(req.body, { passwordPreEncrypt: true })
      .catch((e) => {
        this.app.logger.error('[Error] Failed to sign in.', e)

        return this.accountService.formatResponseData({
          code: AccountResponseDataCode.ERROR_SIGN_IN_UNEXPECTED_ERROR,
          status: ResponseDataStatus.FAIL
        })
      })

    const accountData = _.get(result, 'data.account')
    if (!accountData) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData(_.omit(result, 'data.account'))

      return
    }

    const relatedConfig = await this.accountService.getConfig()
    // @ts-ignore
    await this.accountService.handleSessionCertificated(ctx, accountData, {
      enableMultipleSignedInSessions: !!_.get(relatedConfig, 'enableMultipleSignedInSessions'),
      enableRecordMultipleSignedInSessions: !!_.get(
        relatedConfig,
        'enableRecordMultipleSignedInSessions'
      ),
      methodType: UserSessionCertificatedFromMethodType.SIGN_IN
    })

    ctxSession = await this.accountService.getCtxSession(ctx)
    data.status = status.OK
    data.body = this.accountService.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SIGN_IN_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      ctxSession,
      {
        useCtxAccount: true
      }
    )

    return
  }

  @Post('/sign-up', { useBodyParser: true })
  async signUp(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args

    const {
      input: {
        params: { req }
      },
      output: { data }
    } = ctx
    const ctxSession = await this.accountService.getCtxSession(ctx)
    if (ctxSession.signedIn) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_ALREADY_SIGNED_IN,
        status: ResponseDataStatus.FAIL
      })

      return
    }

    /**
     * Sign up invoker.
     * Password should be a base64 encrypt string.
     *
     * Here only show an example. No matter password encrypted or not.
     *
     * fetch('/api/account/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'i@test.com', password: '1qaz!QAZ', name: 'YouAreMySunShine' }) })
     */
    const result = await this.accountService
      .signUp(req.body, { passwordPreEncrypt: true })
      .catch((e) => {
        this.app.logger.error('[Error] Failed to sign up.', e)

        return this.accountService.formatResponseData({
          code: AccountResponseDataCode.ERROR_SIGN_UP_UNEXPECTED_ERROR,
          status: ResponseDataStatus.FAIL
        })
      })

    const accountData = _.get(result, 'data.account')
    if (!accountData) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData(_.omit(result, 'data.account'))
      return
    }

    const relatedConfig = await this.accountService.getConfig()
    // @ts-ignore
    await this.accountService.handleSessionCertificated(ctx, accountData, {
      enableMultipleSignedInSessions: !!_.get(relatedConfig, 'enableMultipleSignedInSessions'),
      enableRecordMultipleSignedInSessions: !!_.get(
        relatedConfig,
        'enableRecordMultipleSignedInSessions'
      )
    })

    data.status = status.OK
    data.body = this.accountService.formatResponseData({
      code: AccountResponseDataCode.SUCCESS_SIGN_UP_SUCCESS,
      status: ResponseDataStatus.SUCCESS
    })
  }

  @HTTPRoute({
    path: '/sign-out',
    method: [HTTPMethod.POST, HTTPMethod.GET]
  })
  async signOut(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args
    const {
      input: {
        params: { searchParams, res }
      },
      output: { data }
    } = ctx

    const relatedConfig = await this.accountService.getConfig()
    await this.accountService.signOut(ctx, {
      enableMultipleSignedInSessions: !!_.get(relatedConfig, 'enableMultipleSignedInSessions'),
      enableRecordMultipleSignedInSessions: !!_.get(
        relatedConfig,
        'enableRecordMultipleSignedInSessions'
      ),
      methodType: UserSessionTamperedFromMethodType.SIGN_OUT
    })

    // If callback.
    const callback = filterXSS(
      _.get(searchParams, shared.constants.accountSignOutCallbackSearchParamKey) || ''
    )
    if (callback) {
      // Redirect.
      data.status = status.FOUND
      res.setHeader('Location', callback)
      return
    }

    data.status = status.OK
    data.body = 'OK.'
  }

  // Need signed in.
  @Post('/change-pwd', { useBodyParser: true })
  // @Use([userAuthMiddleware()])
  async changePwd(...args: Parameters<HTTPMiddleware>) {
    const [ctx, _next] = args
    const {
      input: {
        params: { req }
      },
      output: { data }
    } = ctx

    /**
     * Change pwd invoker.
     * Password should be a base64 encrypt string.
     * Currently, we tolerate that new password is the same as the old one.
     *
     * Here only show an example. No matter password encrypted or not.
     *
     * fetch('/api/account/change-pwd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'i@test.com', password: '1qaz!QAZ', oldPassword: '1qaz!QAZ' }) })
     */
    const result = await this.accountService
      .changePwd(req.body, { passwordPreEncrypt: true })
      .catch((e) => {
        this.app.logger.error('[Error] Failed to change pwd.', e)

        return this.accountService.formatResponseData({
          code: AccountResponseDataCode.ERROR_CHANGE_PWD_UNEXPECTED_ERROR,
          status: ResponseDataStatus.FAIL
        })
      })

    const accountData = _.get(result, 'data.account')
    if (!accountData) {
      data.status = status.BAD_REQUEST
      data.body = this.accountService.formatResponseData(_.omit(result, 'data.account'))
      return
    }

    const relatedConfig = await this.accountService.getConfig()
    await this.accountService.handleCertificatedSessionTampered(ctx, {
      enableMultipleSignedInSessions: !!_.get(relatedConfig, 'enableMultipleSignedInSessions'),
      enableRecordMultipleSignedInSessions: !!_.get(
        relatedConfig,
        'enableRecordMultipleSignedInSessions'
      ),
      fallbackSessionRecordsPersistentDBCondition: _.pick(req.body, 'email') as any,
      methodType: UserSessionTamperedFromMethodType.CHANGE_PWD
    })

    data.status = status.OK
    data.body = this.accountService.formatResponseData({
      code: AccountResponseDataCode.SUCCESS_CHANGE_PWD_SUCCESS,
      status: ResponseDataStatus.SUCCESS
    })
  }
}
