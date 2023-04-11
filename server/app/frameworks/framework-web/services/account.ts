import { Injectable, ScopeEnum } from '@artus/core'
import shared from '@sling/artus-web-shared'
import {
  AccountResponseData,
  AccountResponseDataCode,
  ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE,
  ARTUS_FRAMEWORK_WEB_USER_NAMESPACE,
  DistributeCachePrismaInstance,
  ResponseDataStatus
} from '../types'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import { CacheService } from './cache'
import {
  ACCESSIBLE_ACCOUNT_PROPERTIES, PAGE_PROHIBIT_ACCOUNT_PROPERTIES,
  USER_DISTRIBUTE_CACHE_DEFAULT_TTL,
  USER_SESSION_COOKIE_MAX_AGE,
  USER_SESSION_COOKIE_MAX_AGE_REMEMBERED
} from '../constants'
import { Account } from '../models/mongo/generated/client'
import { ARTUS_PLUGIN_PRISMA_CLIENT, PrismaPluginDataSourceName } from '../../../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../../../plugins/plugin-prisma/client'
import _ from 'lodash'
import { encryptPassword, rectifyPassword } from '../utils/business/account'
import cookie from 'cookie'
import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc'
import {
  validateAccountChangePwdPayload,
  validateAccountSignInPayload,
  validateAccountSignUpPayload
} from '../utils/validation'
import { PromiseFulfilledResult, Roles, UserSession } from '@sling/artus-web-shared/types'
import { formatResponseData } from '../utils/services'

dayjs.extend(dayjsUtc)

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class AccountService {
  private getPrisma (ctx: HTTPMiddlewareContext) {
    const { input: { params: { app } } } = ctx

    const prismaClient = app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient

    return prismaClient.getPrisma<DistributeCachePrismaInstance<PrismaPluginDataSourceName.MONGO>>(
      PrismaPluginDataSourceName.MONGO
    )
  }

  formatResponseData (
    data: Partial<AccountResponseData>,
    account: PromiseFulfilledResult<ReturnType<AccountService['findInPersistent']>> | UserSession = null,
    options?: Partial<{ useCtxAccount: boolean }>
  ) {
    if (account) {
      return formatResponseData(
        _.merge(data, {
          data: {
            account: _.get(options, 'useCtxAccount')
              ? _.omit(account as UserSession, PAGE_PROHIBIT_ACCOUNT_PROPERTIES)
              : _.pick(
                account as PromiseFulfilledResult<ReturnType<AccountService['findInPersistent']>>,
                ACCESSIBLE_ACCOUNT_PROPERTIES
              )
          }
        })
      )
    }

    return formatResponseData<AccountResponseData>(
      _.merge(data, {
        data: {
          account: null
        }
      })
    )
  }

  async initSession (
    _ctx: HTTPMiddlewareContext,
    signedInAccount?: Account,
    options?: Partial<{ _sessionId: string }>
  ): Promise<UserSession> {
    if (!signedInAccount) {
      const uuid = shared.utils.calcUUID()

      return {
        name: shared.utils.calcUUID(),
        roles: [Roles.ANONYMOUS],
        signedIn: false,
        id: uuid,
        email: '',
        _sessionId: _.get(options, '_sessionId') || shared.utils.calcUUID()
      }
    }

    return {
      name: signedInAccount.name,
      // @ts-ignore
      roles: signedInAccount.roles,
      signedIn: true,
      id: signedInAccount.userId,
      email: signedInAccount.email,
      _sessionId: _.get(options, '_sessionId') || shared.utils.calcUUID()
    }
  }

  async handleSessionCertificated (
    ctx: HTTPMiddlewareContext,
    signedInAccount: Account,
    options?: Partial<{ keepSignedIn: boolean }>
  ) {
    const { input: { params: { res, req } } } = ctx

    const ctxPreviousSession = await this.getCtxSession(ctx)
    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const ctxPreviousSessionKeyValue = _.get(ctxPreviousSession, '_sessionId')
    const sessionKeyValue = ctxPreviousSessionKeyValue || sessionCookieValue || shared.utils.calcUUID()
    const session = await this.initSession(ctx, signedInAccount, { _sessionId: sessionKeyValue })
    await this.setCtxSession(ctx, session)

    await this.setDistributeSession(ctx, sessionKeyValue, session)

    // If already set.
    if (sessionCookieValue !== sessionKeyValue) {
      res.setHeader(
        'set-cookie',
        cookie.serialize(
          shared.constants.USER_SESSION_KEY,
          sessionKeyValue,
          {
            path: '/', // Must set this. Otherwise, it will be req.path as default.
            maxAge: _.get(options, 'keepSignedIn')
              ? USER_SESSION_COOKIE_MAX_AGE_REMEMBERED
              : USER_SESSION_COOKIE_MAX_AGE
          }
        )
      )
    }
  }

  async handleCertificatedSessionTampered (ctx: HTTPMiddlewareContext) {
    const { input: { params: { res, req } } } = ctx

    const ctxPreviousSession = await this.getCtxSession(ctx)
    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const ctxPreviousSessionKeyValue = _.get(ctxPreviousSession, '_sessionId')
    const sessionKeyValue = ctxPreviousSessionKeyValue || sessionCookieValue

    if (!sessionKeyValue) {
      return
    }

    await this.staleCtxSession(ctx)

    await this.staleDistributeSession(ctx, sessionKeyValue)

    res.setHeader(
      'set-cookie',
      cookie.serialize(
        shared.constants.USER_SESSION_KEY,
        '',
        {
          path: '/' // Must set this. Otherwise, it will be req.path as default.
        }
      )
    )
  }

  async getCtxSession (ctx: HTTPMiddlewareContext) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    return storage.get('session') as UserSession
  }

  async setCtxSession (ctx: HTTPMiddlewareContext, session: UserSession | null) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    storage.set(session, 'session')

    return storage
  }

  async staleCtxSession (ctx: HTTPMiddlewareContext) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    storage.set(null, 'session')

    return storage
  }

  calcDistributeCacheSessionKey (_ctx: HTTPMiddlewareContext, sessionKeyValue: string) {
    return 'USER.' + sessionKeyValue
  }

  async getDistributeSession (ctx: HTTPMiddlewareContext, sessionKeyValue: string) {
    const { input: { params: { app } } } = ctx

    const cacheService = app.container.get(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE) as CacheService

    return cacheService.distribute.get(
      this.calcDistributeCacheSessionKey(ctx, sessionKeyValue),
      { needRefresh: true, ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL }
    )
  }

  async setDistributeSession (ctx: HTTPMiddlewareContext, sessionKeyValue: string, session: UserSession) {
    const { input: { params: { app } } } = ctx

    const cacheService = app.container.get(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE) as CacheService

    return cacheService.distribute.set(
      this.calcDistributeCacheSessionKey(ctx, sessionKeyValue),
      JSON.stringify(session),
      { ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL }
    )
  }

  async staleDistributeSession (ctx: HTTPMiddlewareContext, sessionKeyValue: string) {
    const { input: { params: { app } } } = ctx

    const cacheService = app.container.get(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE) as CacheService

    return cacheService.distribute.stale(this.calcDistributeCacheSessionKey(ctx, sessionKeyValue))
  }

  async findInPersistent (ctx: HTTPMiddlewareContext, condition: Pick<Account, 'email'>) {
    return this.getPrisma(ctx).account.findFirst({ where: condition })
  }

  async updateOnPersistent (
    ctx: HTTPMiddlewareContext,
    condition: Pick<Account, 'email'>,
    data: Partial<Pick<Account, 'password' | 'name' | 'updatedAt' | 'inactive' | 'inactiveAt'>>
  ) {
    return this.getPrisma(ctx).account.update({
      where: condition,
      data: _.merge({ updatedAt: dayjs.utc().toDate() }, data)
    })
  }

  async signIn (
    ctx: HTTPMiddlewareContext,
    certification: Pick<Account, 'email' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean }>
  ) {
    const password = _.get(certification, 'password')
    if (!(password && typeof password === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const rectifiedPassword = rectifyPassword(
      password,
      { preEncrypt: _.get(options, 'passwordPreEncrypt') }
    )
    const rectifiedCertification = _.merge(
      {},
      certification,
      {
        password: rectifiedPassword
      }
    )
    const validateResult = await validateAccountSignInPayload(rectifiedCertification)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountSignInPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistent(ctx, { email: rectifiedCertification.email })
    if (!foundAccount) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_ACCOUNT_NOT_FOUND,
        status: ResponseDataStatus.FAIL
      })
    }

    if (encryptPassword(rectifiedPassword, foundAccount.salt) !== foundAccount.password) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_ACCOUNT_WRONG_PASSWORD,
        status: ResponseDataStatus.FAIL
      })
    }

    if (foundAccount.inactive) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_ACCOUNT_INACTIVE,
        status: ResponseDataStatus.FAIL
      })
    }

    return this.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SIGN_IN_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      foundAccount
    )
  }

  async signUp (
    ctx: HTTPMiddlewareContext,
    registration: Pick<Account, 'email' | 'name' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean, keepSignIn: boolean }>
  ) {
    const password = _.get(registration, 'password')
    if (!(password && typeof password === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const rectifiedPassword = rectifyPassword(
      password,
      { preEncrypt: _.get(options, 'passwordPreEncrypt') }
    )
    const rectifiedRegistration = _.merge(
      {},
      registration,
      {
        password: rectifiedPassword
      }
    )
    const validateResult = await validateAccountSignUpPayload(rectifiedRegistration)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountSignUpPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistent(ctx, { email: registration.email })
    if (foundAccount) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_DUPLICATE,
        status: ResponseDataStatus.FAIL
      })
    }

    const salt = shared.utils.calcUUID()
    // Password, base64 decode.
    const finalPassword = encryptPassword(
      rectifyPassword(
        registration.password,
        { preEncrypt: _.get(options, 'passwordPreEncrypt') }
      ),
      salt
    )

    const accountData = {
      email: registration.email,
      name: registration.name,
      password: finalPassword,
      salt,
      userId: shared.utils.calcUUID(),
      roles: [Roles.ANONYMOUS]
    } as Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistent']>>, null>
    // Create user.
    await this.getPrisma(ctx).account.create({
      data: accountData
    })

    return this.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SIGN_UP_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      accountData
    )
  }

  async changePwd (
    ctx: HTTPMiddlewareContext,
    certification: Pick<Account, 'email' | 'password'> & { oldPassword: string },
    options?: Partial<{ passwordPreEncrypt: boolean }>
  ) {
    const password = _.get(certification, 'password')
    if (!(password && typeof password === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const oldPassword = _.get(certification, 'oldPassword')
    if (!(oldPassword && typeof oldPassword === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const rectifiedPassword = rectifyPassword(
      password,
      { preEncrypt: _.get(options, 'passwordPreEncrypt') }
    )
    // Currently, we tolerate that new password is the same as the old one.
    const rectifiedOldPassword = rectifyPassword(
      oldPassword,
      { preEncrypt: _.get(options, 'passwordPreEncrypt') }
    )
    const rectifiedCertification = _.merge(
      {},
      certification,
      {
        password: rectifiedPassword,
        oldPassword: rectifiedOldPassword
      }
    )
    const validateResult = await validateAccountChangePwdPayload(rectifiedCertification)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountChangePwdPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistent(ctx, { email: rectifiedCertification.email })
    if (!foundAccount) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_ACCOUNT_NOT_FOUND,
        status: ResponseDataStatus.FAIL
      })
    }

    if (encryptPassword(rectifiedOldPassword, foundAccount.salt) !== foundAccount.password) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_ACCOUNT_WRONG_OLD_PASSWORD,
        status: ResponseDataStatus.FAIL
      })
    }

    // Update.
    const finalPassword = encryptPassword(rectifiedPassword, foundAccount.salt)
    const finalAccount = await this.updateOnPersistent(
      ctx,
      { email: rectifiedCertification.email },
      {
        password: finalPassword
      }
    )

    return this.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_CHANGE_PWD_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      finalAccount
    )
  }
}
