import { Injectable, ScopeEnum } from '@artus/core'
import shared from '@sling/artus-web-shared'
import {
  ARTUS_FRAMEWORK_WEB_CACHE_SERVICE,
  ARTUS_FRAMEWORK_WEB_USER_NAMESPACE,
  ARTUS_FRAMEWORK_WEB_USER_SERVICE,
  Roles,
  UserSession
} from '../types'
import { HTTPMiddlewareContext } from '../../../plugins/plugin-http/types'
import { CacheService } from './cache'
import { USER_DISTRIBUTE_CACHE_DEFAULT_TTL } from '../constants'

@Injectable({
  id: ARTUS_FRAMEWORK_WEB_USER_SERVICE,
  scope: ScopeEnum.SINGLETON
})
export class UserService {
  async initSession (_ctx: HTTPMiddlewareContext) {
    const uuid = shared.utils.calcUUID()

    return {
      name: uuid,
      roles: [Roles.ANONYMOUS],
      loggedIn: false,
      id: uuid,
      email: 'test@test.com'
    } as UserSession
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
}
