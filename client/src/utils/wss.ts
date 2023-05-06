import type { WebsocketUserSessionClientCommandInfo } from '@sling/artus-web-shared/types'
import { UserSessionSignOutCausedBy, WebsocketUserSessionClientCommandType } from '@sling/artus-web-shared/types'
import type { WebsocketUserSessionClientCommandMessageNotifyValue } from '@sling/artus-web-shared/types'
import Cookies from 'js-cookie'
import shared from '@sling/artus-web-shared'
import type { useUserStore } from '@/stores/user'
import { setUserSessionSignOutCausedBy } from '@/utils/user'
import _ from 'lodash'
import { setCsrfToken } from '@/utils/request'

export const handleAccountObserveWsMessage = function (
  userStore: ReturnType<typeof useUserStore>,
  ...args: Parameters<Exclude<WebSocket['onmessage'], null>>
) {
  const [event] = args
  const eventData = event.data
  let commandInfo: WebsocketUserSessionClientCommandInfo | undefined

  try {
    commandInfo = JSON.parse(eventData)
  } catch (e) {
    // Nothing.
  }

  if (!commandInfo) {
    return
  }

  switch (commandInfo.command) {
    case WebsocketUserSessionClientCommandType.SET_COOKIE: {
      Cookies.set(shared.constants.USER_SESSION_KEY, commandInfo.value)

      break
    }
    case WebsocketUserSessionClientCommandType.SET_CSRF_TOKEN: {
      setCsrfToken(commandInfo.value)

      break
    }
    case WebsocketUserSessionClientCommandType.SESSION_EVICT: {
      const value = commandInfo.value as UserSessionSignOutCausedBy
      if (value) {
        setUserSessionSignOutCausedBy(value)
      }

      userStore.fetchSignOut()

      break
    }
    case WebsocketUserSessionClientCommandType.MESSAGE_NOTIFY: {
      if (userStore.messageHandler) {
        const value = commandInfo.value as WebsocketUserSessionClientCommandMessageNotifyValue
        typeof value === 'object'
          ? userStore.messageHandler.create(value.message, _.omit(value, 'message'))
          : userStore.messageHandler.info(value)
      }

      break
    }
  }
}
