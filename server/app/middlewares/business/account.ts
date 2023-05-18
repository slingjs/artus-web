import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE } from '../../types'
import { AccountService } from '../../services/account'
import cookie from 'cookie'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'
import { HTTPMiddleware } from '../../plugins/plugin-http/types'
import { Roles } from '@sling/artus-web-shared/types'
import status from 'http-status'
import { Middleware } from '@artus/pipeline'
import { WebsocketMiddleware } from '../../plugins/plugin-websocket/types'
import { judgeCtxIsFromHTTP } from '../../utils/middlewares'

export const initUser = <T extends Middleware = HTTPMiddleware>(
  options?: Partial<{
    bypassFilter: (ctx: Parameters<T>[0]) => boolean
  }>
) => {
  return <any | (T extends HTTPMiddleware ? HTTPMiddleware : WebsocketMiddleware)>async function initUser(ctx, next) {
    const {
      input: {
        params: { app, req }
      }
    } = ctx

    const bypassFilter = _.get(options, 'bypassFilter')
    if (typeof bypassFilter === 'function' && (await bypassFilter(ctx))) {
      return await next()
    }

    const isCtxFromHTTP = judgeCtxIsFromHTTP(ctx)
    if (isCtxFromHTTP) {
      if (_.get(ctx.input.params.metadata, 'route.options.bypassInitUserMiddleware')) {
        return await next()
      }
    }

    const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)
    const userService = app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

    const initNewSession = async function initNewSession(sessionCookieValue?: string) {
      const newSession = await userService.initSession(undefined, {
        _sessionId: sessionCookieValue
      })
      await userService.setDistributeSession(newSession._sessionId, newSession)
      await userService.setCtxSession(ctx, newSession)
      await userService.setClientSession(ctx, newSession)

      if (!isCtxFromHTTP) {
        const {
          input: {
            params: { socket }
          }
        } = ctx
        await userService.setWsSocketSessionKey(socket, newSession)
      }
    }

    if (!sessionCookieValue) {
      await initNewSession()

      return await next()
    }

    const sessionString = await userService.getDistributeSession(sessionCookieValue)
    if (!sessionString) {
      await initNewSession()

      return await next()
    }

    try {
      const session = JSON.parse(sessionString)
      await userService.setCtxSession(ctx, session)

      if (!isCtxFromHTTP) {
        const {
          input: {
            params: { socket }
          }
        } = ctx
        await userService.setWsSocketSessionKey(socket, session)
      }
    } catch (e) {
      await initNewSession()

      return await next()
    }

    await next()
  }
}

export const authUser = (roles?: Roles[]): HTTPMiddleware | WebsocketMiddleware => {
  return async function userAuthMiddleware(ctx, next) {
    const {
      input: {
        params: { app }
      }
    } = ctx
    const userService = app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

    const session = await userService.getCtxSession(ctx)
    if (!(session && session.signedIn)) {
      ctx.output.data.status = status.UNAUTHORIZED

      return
    }

    if (!(Array.isArray(session.roles) && session.roles.length && Array.isArray(roles))) {
      await next()
      return
    }

    if (!roles.every(r => session.roles.some(sR => shared.utils.compareIgnoreCase(sR, r)))) {
      ctx.output.data.status = status.UNAUTHORIZED

      return
    }

    await next()
  }
}
