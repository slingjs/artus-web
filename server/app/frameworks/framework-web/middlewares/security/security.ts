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

export const apiReqSecurityMiddleware = function apiReqSecurityMiddleware<
  T extends Middleware = HTTPMiddleware
>() {
  return <any | (T extends HTTPMiddleware ? HTTPMiddleware : WebsocketMiddleware)>(
    async function apiReqSecurityMiddleware(ctx, next) {
      const {
        input: {
          params: { app, req }
        }
      } = ctx
      const userService = app.container.get(ARTUS_FRAMEWORK_WEB_ACCOUNT_SERVICE) as AccountService

      // region CSRF Checking.
      const sessionCookieValue = _.get(
        cookie.parse(req.headers.cookie || ''),
        shared.constants.USER_SESSION_KEY
      )

      const isCtxFromHTTP = judgeCtxIsFromHTTP(ctx)
      const csrfRejection = () => {
        ctx.output.data.status = status.UNAUTHORIZED
      }

      const csrfToken = getCsrfToken(ctx)

      if (isCtxFromHTTP) {
        const isReqMethodMatched = csrfInterceptHttpMethods.some((m) =>
          shared.utils.compareIgnoreCase(m, req.method)
        )

        if (!isReqMethodMatched) {
          return await next()
        }

        if (!csrfToken) {
          await csrfRejection()
          return
        }

        let user = await userService.getCtxSession(ctx)
        if (!user) {
          if (!sessionCookieValue) {
            await csrfRejection()
            return
          }

          try {
            user = JSON.parse(
              (await userService.getDistributeSession(sessionCookieValue)) as string
            )
          } catch (e) {}
        }

        if (_.get(user, '_csrfToken') !== csrfToken) {
          await csrfRejection()
          return
        }

        return await next()
      }
      // endregion

      return await next()
    }
  )
}
