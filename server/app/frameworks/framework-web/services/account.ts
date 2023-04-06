import { Injectable, ScopeEnum } from '@artus/core'
import shared from '@sling/artus-web-shared'
import {
  ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE,
  ARTUS_FRAMEWORK_WEB_USER_NAMESPACE,
  Roles,
  UserSession
} from '../types'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import { CacheService } from './cache'
import { ACCESSIBLE_ACCOUNT_PROPERTIES, USER_DISTRIBUTE_CACHE_DEFAULT_TTL } from '../constants'
import { Account } from '../models/mongo/generated/client'
import { ARTUS_PLUGIN_PRISMA_CLIENT, PrismaPluginDataSourceName } from '../../../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../../../plugins/plugin-prisma/client'
import _ from 'lodash'
import { encryptPassword } from '../utils/business/account'
import cookie from 'cookie'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class AccountService {
  private getPrisma (ctx: HTTPMiddlewareContext) {
    const { input: { params: { app } } } = ctx

    const prismaClient = app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient

    return prismaClient.getPrisma(PrismaPluginDataSourceName.MONGO)
  }

  async initSession (
    _ctx: HTTPMiddlewareContext,
    signedInAccount?: Account,
    options?: Partial<{ _sessionId: string }>
  ): Promise<UserSession> {
    if (!signedInAccount) {
      const uuid = shared.utils.calcUUID()

      return {
        name: uuid,
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

  async handleSessionCertificated (ctx: HTTPMiddlewareContext, signedInAccount: Account) {
    const { input: { params: { res } } } = ctx

    const ctxPreviousSession = await this.getCtxSession(ctx)
    const sessionKeyValue = _.get(ctxPreviousSession, '_sessionId') || shared.utils.calcUUID()
    const session = await this.initSession(ctx, signedInAccount, { _sessionId: sessionKeyValue })
    await this.setCtxSession(ctx, session)

    await this.setDistributeSession(ctx, sessionKeyValue, session)

    res.setHeader(
      'set-cookie',
      cookie.serialize(shared.constants.USER_SESSION_KEY, sessionKeyValue)
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

  async find (ctx: HTTPMiddlewareContext, condition: Pick<Account, 'email'>) {
    return this.getPrisma(ctx).account.findFirst({ where: condition })
  }

  async signIn (
    ctx: HTTPMiddlewareContext,
    certification: Pick<Account, 'email' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean }>
  ) {
    const foundAccount = await this.find(ctx, { email: certification.email })
    if (!foundAccount) {
      return {
        account: null,
        code: 'ERROR_SIGN_IN_ACCOUNT_NOT_FOUND',
        status: 'FAIL'
      }
    }

    const finalPassword = _.get(options, 'passwordPreEncrypt')
      ? Buffer.from(certification.password, 'base64').toString()
      : certification.password
    if (encryptPassword(finalPassword, foundAccount.salt) !== foundAccount.password) {
      return {
        account: null,
        code: 'ERROR_SIGN_IN_ACCOUNT_WRONG_PASSWORD',
        status: 'FAIL'
      }
    }

    if (foundAccount.inactive) {
      return {
        account: null,
        code: 'ERROR_SIGN_IN_ACCOUNT_INACTIVE',
        status: 'FAIL'
      }
    }

    return {
      account: _.pick(foundAccount, ACCESSIBLE_ACCOUNT_PROPERTIES),
      code: 'ERROR_SIGN_IN_SUCCESS',
      status: 'SUCCESS'
    }
  }

  async signUp (
    ctx: HTTPMiddlewareContext,
    registration: Pick<Account, 'email' | 'name' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean }>
  ) {
    const foundAccount = await this.find(ctx, { email: registration.email })
    if (foundAccount) {
      return {
        account: null,
        code: 'ERROR_SIGN_UP_DUPLICATE',
        status: 'FAIL'
      }
    }

    const salt = shared.utils.calcUUID()
    // Password, base64 decode.
    const finalPassword = encryptPassword(
      _.get(options, 'passwordPreEncrypt')
        ? Buffer.from(registration.password, 'base64').toString()
        : registration.password,
      salt
    )

    const userData = {
      email: registration.email,
      name: registration.name,
      password: finalPassword,
      salt,
      userId: shared.utils.calcUUID(),
      roles: Roles.ANONYMOUS
    }
    // Create user.
    await this.getPrisma(ctx).account.create({
      data: userData
    })

    return {
      account: _.pick(userData, ACCESSIBLE_ACCOUNT_PROPERTIES),
      code: 'SUCCESS_SIGN_UP_SUCCESS',
      status: 'SUCCESS'
    }
  }
}
