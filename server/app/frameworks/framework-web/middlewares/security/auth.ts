import { judgeCtxIsFromHTTP } from '../../utils/middlewares'
import { HTTPMiddleware } from '../../../../plugins/plugin-http/types'
import status from 'http-status'
import _ from 'lodash'
import cookie from 'cookie'
import shared from '@sling/artus-web-shared'
import { csrfInterceptHttpMethods } from '../../constants'
import { ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE } from '../../types'
import { AccountService } from '../../services/account'
import { getCsrfToken } from '../../utils/security'
import { Middleware } from '@artus/pipeline'
import { WebsocketMiddleware } from '../../../../plugins/plugin-websocket/types'
import {
  WebsocketUserSessionClientCommandInfo,
  WebsocketUserSessionClientCommandTrigger,
  WebsocketUserSessionClientCommandType
} from '@sling/artus-web-shared/types'
import { AppConfig } from '../../../../types'

export const authSecurityMiddleware = function authSecurityMiddleware<T extends Middleware = HTTPMiddleware>() {
  return <any | (T extends HTTPMiddleware ? HTTPMiddleware : WebsocketMiddleware)>(
    async function authSecurityMiddleware(ctx, next) {
      const {
        input: {
          params: { app, req }
        }
      } = ctx
      const userService = app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

      // region CSRF Checking.
      const sessionCookieValue = _.get(cookie.parse(req.headers.cookie || ''), shared.constants.USER_SESSION_KEY)

      const isCtxFromHTTP = judgeCtxIsFromHTTP(ctx)
      const csrfRejection = async () => {
        if (isCtxFromHTTP) {
          ctx.output.data.status = status.UNAUTHORIZED

          return
        }

        await ctx.input.params.trigger.response(ctx, {
          command: WebsocketUserSessionClientCommandType.MESSAGE_NOTIFY,
          value: 'Invalid csrf token!',
          trigger: WebsocketUserSessionClientCommandTrigger.SYSTEM
        } as WebsocketUserSessionClientCommandInfo)
        await ctx.input.params.trigger.response(ctx, 'Socket shutting down...')
        // Terminate the socket.
        ctx.input.params.socket.terminate()
      }

      const csrfToken = getCsrfToken(ctx)

      if (isCtxFromHTTP) {
        const isReqMethodMatched = csrfInterceptHttpMethods.some(m => shared.utils.compareIgnoreCase(m, req.method))

        if (!isReqMethodMatched) {
          return await next()
        }
      }

      if (!csrfToken) {
        await csrfRejection()
        return
      }

      // Supreme csrf token. For client dev.
      const supremeCsrfToken = _.get((app.config as AppConfig).framework.web, 'security.csrf.supremeToken')
      if (supremeCsrfToken && csrfToken === supremeCsrfToken) {
        return await next()
      }

      let user = await userService.getCtxSession(ctx)
      if (!user) {
        if (!sessionCookieValue) {
          await csrfRejection()
          return
        }

        try {
          user = JSON.parse((await userService.getDistributeSession(sessionCookieValue)) as string)
        } catch (e) {}
      }

      if (_.get(user, '_csrfToken') !== csrfToken) {
        await csrfRejection()
        return
      }

      // endregion

      return await next()
    }
  )
}
