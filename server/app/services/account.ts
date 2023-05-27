import { ArtusApplication, ArtusInjectEnum, Inject, Injectable, ScopeEnum } from '@artus/core'
import shared from '@sling/artus-web-shared'
import {
  AccountResponseData,
  AccountResponseDataCode,
  ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE,
  ARTUS_FRAMEWORK_WEB_USER_NAMESPACE,
  AppConfig,
  DistributeCacheEventSubscriberEventNames,
  PersistentDBInstance,
  ResponseDataStatus,
  UserSessionCertificatedFromMethodType,
  UserSessionRecords,
  UserSessionTamperedFromMethodType
} from '../types'
import { HTTPMiddlewareContext } from '../plugins/plugin-http/types'
import { CacheService } from './cache'
import {
  ACCESSIBLE_ACCOUNT_PROPERTIES,
  PAGE_PROHIBIT_ACCOUNT_PROPERTIES,
  USER_DISTRIBUTE_CACHE_DEFAULT_TTL,
  USER_SESSION_COOKIE_MAX_AGE,
  USER_SESSION_COOKIE_MAX_AGE_REMEMBERED,
  USER_SESSION_COOKIE_MAX_AGE_REMOVED,
  userSessionIdPattern,
  userSessionIdReplacePattern,
  WEBSOCKET_ACCOUNT_OBSERVE_REQUEST_PATH
} from '../constants'
import { Account } from '../models/mongo/generated/client'
import { ARTUS_PLUGIN_PRISMA_CLIENT, PrismaPluginDataSourceName } from '../plugins/plugin-prisma/types'
import { PluginPrismaClient } from '../plugins/plugin-prisma/client'
import _ from 'lodash'
import { encryptPassword, rectifyPassword } from '../utils/business/account'
import { encryptCsrfToken } from '../utils/security'
import cookie from 'cookie'
import dayjs from 'dayjs'
import dayjsUtc from 'dayjs/plugin/utc'
import {
  validateAccountChangePwdPayload,
  validateAccountSignInPayload,
  validateAccountSignUpPayload
} from '../utils/validation'
import {
  PromiseFulfilledResult,
  Roles,
  UserSession,
  UserSessionSignOutCausedBy,
  WebsocketUserSessionClientCommandInfo,
  WebsocketUserSessionClientCommandTrigger,
  WebsocketUserSessionClientCommandType
} from '@sling/artus-web-shared/types'
import { formatResponseData } from '../utils/services'
import {
  ARTUS_PLUGIN_WEBSOCKET_CLIENT,
  ARTUS_PLUGIN_WEBSOCKET_TRIGGER,
  WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY,
  WEBSOCKET_SOCKET_REQUEST_USER_SESSION_KEY,
  WebsocketMiddlewareContext
} from '../plugins/plugin-websocket/types'
import { judgeCtxIsFromHTTP } from '../utils/middlewares'
import { WebsocketClient } from '../plugins/plugin-websocket/client'
import { WebsocketTrigger } from '../plugins/plugin-websocket/trigger'
import url from 'url'
import { SubscribeDistributeCacheEvent, SubscribeDistributeCacheEventUnit } from './cache/distribute'
import { ARTUS_PLUGIN_CASBIN_CLIENT } from '../plugins/plugin-casbin/types'
import { PluginCasbinClient } from '../plugins/plugin-casbin/client'
import fsExtra from 'fs-extra'

dayjs.extend(dayjsUtc)

@SubscribeDistributeCacheEventUnit()
@Injectable({
  id: ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class AccountService {
  @Inject(ArtusInjectEnum.Application)
  private readonly app: ArtusApplication

  @Inject(ARTUS_FRAMEWORK_WEB_CACHE_SERVICE)
  private readonly cacheService: CacheService

  async getConfig() {
    return this.cacheService.memory.getSet(
      'framework.api.account.config',
      () => _.get(this.app.config as AppConfig, 'framework.api.account') as any
    )
  }

  private getPrisma() {
    const prismaClient = this.app.container.get(ARTUS_PLUGIN_PRISMA_CLIENT) as PluginPrismaClient

    return prismaClient.getPrisma<PersistentDBInstance<PrismaPluginDataSourceName.MONGO>>(
      PrismaPluginDataSourceName.MONGO
    )
  }

  // @ts-ignore
  async getCasbinEnforcer(options?: Partial<{ withCache: boolean }>): ReturnType<PluginCasbinClient['newEnforcer']> {
    if (!_.get(options, 'withCache')) {
      const casbin = this.app.container.get(ARTUS_PLUGIN_CASBIN_CLIENT) as PluginCasbinClient
      const modelStr = await this.cacheService.memory.getSet<string>(
        'framework.api.account.config.casbinModelPath',
        async () => fsExtra.readFileSync((await this.getConfig()).casbinModelPath).toString('utf-8')
      )

      return casbin.newEnforcer(modelStr)
    }

    return this.cacheService.memory.getSet('framework.api.account.casbin', async () => {
      const casbin = this.app.container.get(ARTUS_PLUGIN_CASBIN_CLIENT) as PluginCasbinClient
      const modelStr = await this.cacheService.memory.getSet<string>(
        'framework.api.account.config.casbinModelPath',
        async () => fsExtra.readFileSync((await this.getConfig()).casbinModelPath).toString('utf-8')
      )

      return casbin.newEnforcer(modelStr)
    })
  }

  formatResponseData(
    data: Partial<AccountResponseData>,
    account: PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>> | UserSession = null,
    options?: Partial<{ useCtxAccount: boolean }>
  ) {
    if (account) {
      return formatResponseData(
        _.merge(data, {
          data: {
            account: _.get(options, 'useCtxAccount')
              ? _.omit(account as UserSession, PAGE_PROHIBIT_ACCOUNT_PROPERTIES)
              : _.pick(
                  account as PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>,
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

  async setClientSession(
    ctx: HTTPMiddlewareContext | WebsocketMiddlewareContext,
    session: UserSession | null,
    options?: Partial<{
      keepSignedIn: boolean
    }>
  ) {
    // HTTP.
    if (judgeCtxIsFromHTTP(ctx)) {
      const {
        input: {
          params: { res }
        }
      } = ctx
      if (!session) {
        res.setHeader(
          'set-cookie',
          cookie.serialize(shared.constants.USER_SESSION_KEY, '', {
            path: '/', // Must set this. Otherwise, it will be req.path as default.
            maxAge: USER_SESSION_COOKIE_MAX_AGE_REMOVED
          })
        )

        return
      }

      const maxAge = session.signedIn
        ? _.get(options, 'keepSignedIn')
          ? USER_SESSION_COOKIE_MAX_AGE_REMEMBERED
          : USER_SESSION_COOKIE_MAX_AGE
        : USER_SESSION_COOKIE_MAX_AGE
      res.setHeader(
        'set-cookie',
        cookie.serialize(shared.constants.USER_SESSION_KEY, session._sessionId, {
          path: '/', // Must set this. Otherwise, it will be req.path as default.
          maxAge
        })
      )
      return
    }

    // Websocket.
    const {
      input: {
        params: { trigger, socket }
      }
    } = ctx
    if (!session) {
      const cookieValue = cookie.parse(
        cookie.serialize(shared.constants.USER_SESSION_KEY, '', {
          path: '/', // Must set this. Otherwise, it will be req.path as default.
          maxAge: USER_SESSION_COOKIE_MAX_AGE_REMOVED
        })
      )
      await trigger.send(socket, {
        trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
        command: WebsocketUserSessionClientCommandType.SET_COOKIE,
        value: _.get(cookieValue, shared.constants.USER_SESSION_KEY)
      } as WebsocketUserSessionClientCommandInfo)

      return
    }

    const maxAge = session.signedIn
      ? _.get(options, 'keepSignedIn')
        ? USER_SESSION_COOKIE_MAX_AGE_REMEMBERED
        : USER_SESSION_COOKIE_MAX_AGE
      : USER_SESSION_COOKIE_MAX_AGE
    const cookieValue = cookie.serialize(shared.constants.USER_SESSION_KEY, session._sessionId, {
      path: '/', // Must set this. Otherwise, it will be req.path as default.
      maxAge
    })
    await trigger.send(socket, {
      trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
      command: WebsocketUserSessionClientCommandType.SET_COOKIE,
      value: _.get(cookieValue, shared.constants.USER_SESSION_KEY)
    })
  }

  async broadcastStaleClientSessions(
    sessionRecords: UserSessionRecords,
    sessionClientCommandInfo: WebsocketUserSessionClientCommandInfo
  ) {
    const websocketClient = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_CLIENT) as WebsocketClient
    const websocketClientTrigger = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_TRIGGER) as WebsocketTrigger

    const foundOtherSameReqPathSockets = websocketClient.filterWsServerSockets({
      filter: s => {
        const socketReqUrlObj = _.get(s, WEBSOCKET_SOCKET_REQUEST_URL_OBJ_KEY) as url.UrlWithStringQuery
        if (!socketReqUrlObj) {
          return false
        }

        // Find the same account signed-in session's related sockets.
        return (
          socketReqUrlObj.path === WEBSOCKET_ACCOUNT_OBSERVE_REQUEST_PATH &&
          sessionRecords.includes(this.getWsSocketSessionKey(s))
        )
      }
    })

    for (const socket of foundOtherSameReqPathSockets) {
      await websocketClientTrigger.send(socket, sessionClientCommandInfo)

      await socket.terminate()

      // No need this.
      // const cookieValue = cookie.parse(
      //   cookie.serialize(
      //     shared.constants.USER_SESSION_KEY,
      //     '',
      //     {
      //       path: '/', // Must set this. Otherwise, it will be req.path as default.
      //       maxAge: USER_SESSION_COOKIE_MAX_AGE_REMOVED
      //     }
      //   )
      // )
      // websocketClientTrigger.send(s, sessionClientCommandInfo)
    }
  }

  async staleClientSession(sessionKeyValue: string, sessionClientCommandInfo: WebsocketUserSessionClientCommandInfo) {
    const websocketClient = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_CLIENT) as WebsocketClient
    const websocketClientTrigger = this.app.container.get(ARTUS_PLUGIN_WEBSOCKET_TRIGGER) as WebsocketTrigger

    const wsServerSocket = websocketClient.findWsServerSocket({
      find: s => {
        const sessionId = _.get(s, WEBSOCKET_SOCKET_REQUEST_USER_SESSION_KEY) as UserSession['_sessionId']
        if (sessionId == null) {
          return false
        }

        // Find the same account signed-in session's related sockets.
        return sessionId === sessionKeyValue
      }
    })

    if (!wsServerSocket) {
      return
    }

    await websocketClientTrigger.send(wsServerSocket, sessionClientCommandInfo)

    await wsServerSocket.terminate()

    // No need this.
    // const cookieValue = cookie.parse(
    //   cookie.serialize(
    //     shared.constants.USER_SESSION_KEY,
    //     '',
    //     {
    //       path: '/', // Must set this. Otherwise, it will be req.path as default.
    //       maxAge: USER_SESSION_COOKIE_MAX_AGE_REMOVED
    //     }
    //   )
    // )
    // websocketClientTrigger.send(s, sessionClientCommandInfo)
  }

  async initSession(
    signedInAccount?: Account,
    options?: Partial<{ _sessionId: string; _csrfToken: string }>
  ): Promise<UserSession> {
    const sessionId = _.get(options, '_sessionId') || shared.utils.calcUUID()
    const csrfToken = _.get(options, '_csrfToken') || encryptCsrfToken(shared.utils.calcUUID(), sessionId)

    if (!signedInAccount) {
      const uuid = shared.utils.calcUUID()

      return {
        name: shared.utils.calcUUID(),
        roles: [Roles.ANONYMOUS],
        signedIn: false,
        id: uuid,
        email: '',
        _sessionId: sessionId,
        lastSignedInAt: '',
        _csrfToken: csrfToken
      }
    }

    return {
      name: signedInAccount.name,
      // @ts-ignore
      roles: signedInAccount.roles,
      signedIn: true,
      id: signedInAccount.userId,
      email: signedInAccount.email,
      _sessionId: sessionId,
      lastSignedInAt: signedInAccount.lastSignedInAt ? dayjs.utc(signedInAccount.lastSignedInAt).toISOString() : '',
      _csrfToken: csrfToken
    }
  }

  async handleSessionCertificated(
    ctx: HTTPMiddlewareContext,
    signedInAccount: Account,
    options?: Partial<{
      keepSignedIn: boolean
      enableMultipleSignedInSessions: boolean
      enableRecordMultipleSignedInSessions: boolean
      methodType: UserSessionCertificatedFromMethodType
    }>
  ) {
    const {
      input: {
        params: { req }
      }
    } = ctx

    const ctxPreviousSession = await this.getCtxSession(ctx)
    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const ctxPreviousSessionKeyValue = _.get(ctxPreviousSession, '_sessionId')
    const sessionKeyValue = ctxPreviousSessionKeyValue || sessionCookieValue || shared.utils.calcUUID()
    const session = await this.initSession(signedInAccount, {
      _sessionId: sessionKeyValue,
      _csrfToken: _.get(ctxPreviousSession, '_csrfToken')
    })
    await this.setCtxSession(ctx, session)

    const enableMultipleSignedInSessions = _.get(options, 'enableMultipleSignedInSessions')
    const enableRecordMultipleSignedInSessions = _.get(options, 'enableRecordMultipleSignedInSessions')
    if (!enableMultipleSignedInSessions) {
      const foundSessionRecordsString = await this.getDistributeSessionRecords(session.id)
      let foundSessionRecords: UserSessionRecords | null = null
      if (foundSessionRecordsString != null) {
        try {
          foundSessionRecords = JSON.parse(foundSessionRecordsString || '')
        } catch (e) {}
      }

      // Stale all related sessions.
      if (Array.isArray(foundSessionRecords)) {
        await this.broadcastStaleClientSessions(foundSessionRecords, {
          trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
          command: WebsocketUserSessionClientCommandType.SESSION_EVICT,
          value: UserSessionSignOutCausedBy.DISABLE_MULTIPLE_SIGNED_IN_SESSIONS
        } as WebsocketUserSessionClientCommandInfo)
        await Promise.allSettled(foundSessionRecords!.filter(Boolean).map(r => this.staleDistributeSession(r)))

        // Rest entirely..
        foundSessionRecords = []
      }

      // Currently no need always to store the records.
      // Only we didn't enable multiple signed-in sessions.
      await this.setDistributeSessionRecords(session.id, (foundSessionRecords || []).concat(sessionKeyValue))
    } else {
      if (enableRecordMultipleSignedInSessions) {
        const foundSessionRecordsString = await this.getDistributeSessionRecords(session.id)
        let foundSessionRecords: UserSessionRecords | null = null
        if (foundSessionRecordsString != null) {
          try {
            foundSessionRecords = JSON.parse(foundSessionRecordsString || '')
          } catch (e) {}
        }

        await this.setDistributeSessionRecords(session.id, (foundSessionRecords || []).concat(sessionKeyValue))
      }
    }

    await this.setDistributeSession(sessionKeyValue, session)

    // If already set.
    if (sessionCookieValue !== sessionKeyValue) {
      await this.setClientSession(ctx, session)
    }
  }

  async handleCertificatedSessionTampered(
    ctx: HTTPMiddlewareContext,
    options?: Partial<{
      enableMultipleSignedInSessions: boolean
      enableRecordMultipleSignedInSessions: boolean
      fallbackSessionRecordsPersistentDBCondition: Parameters<AccountService['findInPersistentDB']>
      methodType: UserSessionTamperedFromMethodType
    }>
  ) {
    const {
      input: {
        params: { req }
      }
    } = ctx

    const ctxPreviousSession = await this.getCtxSession(ctx)
    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const ctxPreviousSessionKeyValue = _.get(ctxPreviousSession, '_sessionId')
    const sessionKeyValue = ctxPreviousSessionKeyValue || sessionCookieValue

    if (!sessionKeyValue) {
      return
    }

    const getFormattedSessionRecordsWithFallbackUserSession = async (
      userSession: UserSession,
      options?: Partial<{
        fallbackSessionRecordsPersistentDBCondition: Parameters<AccountService['findInPersistentDB']>
      }>
    ): Promise<{
      fallbackUserSession: UserSession | null
      foundSessionRecords: UserSessionRecords | null
    }> => {
      let foundSessionRecordsString = await this.getDistributeSessionRecords(userSession.id)
      let foundSessionRecords: UserSessionRecords | null = null
      let fallbackUserSession: UserSession | null = null
      if (foundSessionRecordsString != null) {
        try {
          foundSessionRecords = JSON.parse(foundSessionRecordsString || '')
        } catch (e) {}
      }

      if (!_.isEmpty(foundSessionRecords)) {
        return {
          fallbackUserSession,
          foundSessionRecords
        }
      }

      const fallbackSessionRecordsPersistentDBCondition = _.get(options, 'fallbackSessionRecordsPersistentDBCondition')
      if (_.isEmpty(fallbackSessionRecordsPersistentDBCondition)) {
        return {
          fallbackUserSession,
          foundSessionRecords
        }
      }

      const foundMatchedPersistentDBAccount = await this.findInPersistentDB(
        fallbackSessionRecordsPersistentDBCondition as any
      )
      if (!foundMatchedPersistentDBAccount) {
        return {
          fallbackUserSession,
          foundSessionRecords
        }
      }

      fallbackUserSession = await this.initSession(foundMatchedPersistentDBAccount, {
        _sessionId: userSession.id,
        _csrfToken: _.get(userSession, '_csrfToken')
      })
      foundSessionRecordsString = await this.getDistributeSessionRecords(fallbackUserSession.id)
      if (foundSessionRecordsString != null) {
        try {
          return {
            fallbackUserSession,
            foundSessionRecords: JSON.parse(foundSessionRecordsString || '') as UserSessionRecords
          }
        } catch (e) {}
      }

      return {
        fallbackUserSession,
        foundSessionRecords
      }
    }

    const enableMultipleSignedInSessions = _.get(options, 'enableMultipleSignedInSessions')
    const enableRecordMultipleSignedInSessions = _.get(options, 'enableRecordMultipleSignedInSessions')
    if (!enableMultipleSignedInSessions) {
      let foundSession = ctxPreviousSession
      try {
        foundSession = JSON.parse((await this.getDistributeSession(sessionKeyValue)) || '')
      } catch (e) {}

      if (foundSession) {
        const { fallbackUserSession, foundSessionRecords } = await getFormattedSessionRecordsWithFallbackUserSession(
          foundSession,
          options
        )
        if (fallbackUserSession) {
          foundSession = fallbackUserSession
        }

        // Stale all related sessions.
        if (Array.isArray(foundSessionRecords)) {
          const sessionClientCommandInfo =
            _.get(options, 'methodType') === UserSessionTamperedFromMethodType.CHANGE_PWD
              ? {
                  trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
                  command: WebsocketUserSessionClientCommandType.SESSION_EVICT,
                  value: UserSessionSignOutCausedBy.SESSION_CREDENTIAL_MODIFIED
                }
              : {
                  trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
                  command: WebsocketUserSessionClientCommandType.SESSION_EVICT,
                  value: UserSessionSignOutCausedBy.DISABLE_MULTIPLE_SIGNED_IN_SESSIONS
                }
          await this.broadcastStaleClientSessions(
            foundSessionRecords,
            sessionClientCommandInfo as WebsocketUserSessionClientCommandInfo
          )
          await Promise.allSettled(foundSessionRecords!.filter(Boolean).map(r => this.staleDistributeSession(r)))
        }

        // Stale records.
        await this.staleDistributeSessionRecords(foundSession.id)
      }
    } else {
      if (enableRecordMultipleSignedInSessions) {
        let foundSession = ctxPreviousSession
        try {
          foundSession = JSON.parse((await this.getDistributeSession(sessionKeyValue)) || '')
        } catch (e) {}

        if (foundSession) {
          const { fallbackUserSession, foundSessionRecords } = await getFormattedSessionRecordsWithFallbackUserSession(
            foundSession,
            options
          )
          if (fallbackUserSession) {
            foundSession = fallbackUserSession
          }

          if (Array.isArray(foundSessionRecords)) {
            _.remove(foundSessionRecords!, r => r === sessionKeyValue)
            await this.staleDistributeSession(sessionKeyValue)

            foundSessionRecords!.length
              ? await this.setDistributeSessionRecords(foundSession.id, foundSessionRecords)
              : await this.staleDistributeSessionRecords(foundSession.id)
          }
        }
      }
    }

    await this.staleCtxSession(ctx)

    await this.staleDistributeSession(sessionKeyValue)

    await this.setClientSession(ctx, null)
  }

  getWsSocketSessionKey(socket: WebsocketMiddlewareContext['input']['params']['socket']) {
    return _.get(socket, WEBSOCKET_SOCKET_REQUEST_USER_SESSION_KEY) as UserSession['_sessionId']
  }

  async getCtxSession(ctx: HTTPMiddlewareContext) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    return storage.get('session') as UserSession
  }

  setWsSocketSessionKey(socket: WebsocketMiddlewareContext['input']['params']['socket'], session: UserSession | null) {
    if (!session) {
      return
    }

    _.set(socket, WEBSOCKET_SOCKET_REQUEST_USER_SESSION_KEY, session._sessionId)
  }

  async setCtxSession(ctx: HTTPMiddlewareContext, session: UserSession | null) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    storage.set(session, 'session')

    return storage
  }

  async staleCtxSession(ctx: HTTPMiddlewareContext) {
    const storage = ctx.namespace(ARTUS_FRAMEWORK_WEB_USER_NAMESPACE)
    storage.set(null, 'session')

    return storage
  }

  calcDistributeCacheSessionKey(sessionKeyValue: string) {
    return 'USER:' + sessionKeyValue
  }

  calcDistributeCacheSessionRecordsKey(
    userId: Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>, null>['userId']
  ) {
    return 'USER-SESSIONS:' + userId
  }

  async getDistributeSession(sessionKeyValue: string) {
    return this.cacheService.distribute.get(this.calcDistributeCacheSessionKey(sessionKeyValue), {
      needRefresh: true,
      ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL
    })
  }

  async getDistributeSessionRecords(
    userId: Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>, null>['userId']
  ) {
    return this.cacheService.distribute.get(this.calcDistributeCacheSessionRecordsKey(userId), {
      needRefresh: true,
      ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL
    })
  }

  async setDistributeSession(sessionKeyValue: string, session: UserSession) {
    return this.cacheService.distribute.set(
      this.calcDistributeCacheSessionKey(sessionKeyValue),
      JSON.stringify(session),
      {
        ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL
      }
    )
  }

  async setDistributeSessionRecords(
    userId: Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>, null>['userId'],
    sessionRecords: UserSessionRecords
  ) {
    return this.cacheService.distribute.set(
      this.calcDistributeCacheSessionRecordsKey(userId),
      JSON.stringify(sessionRecords),
      { ttl: USER_DISTRIBUTE_CACHE_DEFAULT_TTL }
    )
  }

  async staleDistributeSession(sessionKeyValue: string) {
    return this.cacheService.distribute.stale(this.calcDistributeCacheSessionKey(sessionKeyValue))
  }

  async staleDistributeSessionRecords(
    userId: Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>, null>['userId']
  ) {
    return this.cacheService.distribute.stale(this.calcDistributeCacheSessionRecordsKey(userId))
  }

  async findInPersistentDB(condition: Pick<Account, 'email'>) {
    return this.getPrisma().account.findFirst({ where: condition })
  }

  async updateOnPersistentDB(
    condition: Pick<Account, 'email'>,
    data: Partial<Pick<Account, 'password' | 'name' | 'updatedAt' | 'inactive' | 'inactiveAt' | 'lastSignedInAt'>>
  ) {
    return this.getPrisma().account.update({
      where: condition,
      data
    })
  }

  async createUponPersistentDB(data: Account) {
    return this.getPrisma().account.create({ data })
  }

  @SubscribeDistributeCacheEvent(DistributeCacheEventSubscriberEventNames.KEY_EXPIRED)
  async handleDistributeSessionKeyExpired(sessionKeyValue: string) {
    if (!(sessionKeyValue && userSessionIdPattern.test(sessionKeyValue))) {
      return
    }

    return this.staleClientSession(sessionKeyValue.replace(userSessionIdReplacePattern, ''), {
      trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM,
      command: WebsocketUserSessionClientCommandType.SESSION_EVICT,
      value: UserSessionSignOutCausedBy.SESSION_DISTRIBUTE_EXPIRED
    } as WebsocketUserSessionClientCommandInfo)
  }

  async signIn(
    certification: Pick<Account, 'email' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean; enableMultipleSignedInSessions: boolean }>
  ) {
    const password = _.get(certification, 'password')
    if (!(password && typeof password === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const rectifiedPassword = rectifyPassword(password, {
      preEncrypt: _.get(options, 'passwordPreEncrypt')
    })
    const rectifiedCertification = _.merge({}, certification, {
      password: rectifiedPassword
    })
    const validateResult = await validateAccountSignInPayload(rectifiedCertification)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountSignInPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_IN_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistentDB({ email: rectifiedCertification.email })
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

    // Update.
    await this.updateOnPersistentDB({ email: foundAccount.email }, { lastSignedInAt: dayjs.utc().toDate() })

    return this.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SIGN_IN_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      foundAccount
    )
  }

  async signUp(
    registration: Pick<Account, 'email' | 'name' | 'password'>,
    options?: Partial<{ passwordPreEncrypt: boolean; enableMultipleSignedInSessions: boolean }>
  ) {
    const password = _.get(registration, 'password')
    if (!(password && typeof password === 'string')) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const rectifiedPassword = rectifyPassword(password, {
      preEncrypt: _.get(options, 'passwordPreEncrypt')
    })
    const rectifiedRegistration = _.merge({}, registration, {
      password: rectifiedPassword
    })
    const validateResult = await validateAccountSignUpPayload(rectifiedRegistration)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountSignUpPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistentDB({ email: registration.email })
    if (foundAccount) {
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_SIGN_UP_DUPLICATE,
        status: ResponseDataStatus.FAIL
      })
    }

    const salt = shared.utils.calcUUID()
    // Password, base64 decode.
    const finalPassword = encryptPassword(
      rectifyPassword(registration.password, { preEncrypt: _.get(options, 'passwordPreEncrypt') }),
      salt
    )

    const accountData = {
      email: registration.email,
      name: registration.name,
      password: finalPassword,
      salt,
      userId: shared.utils.calcUUID(),
      roles: [Roles.ANONYMOUS],
      createdAt: dayjs.utc().toDate(),
      updatedAt: dayjs.utc().toDate()
    } as Exclude<PromiseFulfilledResult<ReturnType<AccountService['findInPersistentDB']>>, null>
    // Create user.
    await this.createUponPersistentDB(accountData)

    return this.formatResponseData(
      {
        code: AccountResponseDataCode.SUCCESS_SIGN_UP_SUCCESS,
        status: ResponseDataStatus.SUCCESS
      },
      accountData
    )
  }

  async signOut(...args: Parameters<AccountService['handleCertificatedSessionTampered']>) {
    return this.handleCertificatedSessionTampered(...args)
  }

  async changePwd(
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

    const rectifiedPassword = rectifyPassword(password, {
      preEncrypt: _.get(options, 'passwordPreEncrypt')
    })
    // Currently, we tolerate that new password is the same as the old one.
    const rectifiedOldPassword = rectifyPassword(oldPassword, {
      preEncrypt: _.get(options, 'passwordPreEncrypt')
    })
    const rectifiedCertification = _.merge({}, certification, {
      password: rectifiedPassword,
      oldPassword: rectifiedOldPassword
    })
    const validateResult = await validateAccountChangePwdPayload(rectifiedCertification)
    if (!validateResult) {
      // @ts-ignore
      const errors = validateAccountChangePwdPayload.errors
      return this.formatResponseData({
        code: AccountResponseDataCode.ERROR_CHANGE_PWD_PAYLOAD_SCHEMA_INVALID,
        status: ResponseDataStatus.FAIL
      })
    }

    const foundAccount = await this.findInPersistentDB({ email: rectifiedCertification.email })
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
    const finalAccount = await this.updateOnPersistentDB(
      { email: rectifiedCertification.email },
      {
        password: finalPassword,
        updatedAt: dayjs.utc().toDate()
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
