import type { WebsocketUserSessionClientCommandInfo } from '@sling/artus-web-shared/types'
import { UserSessionSignOutCausedBy, WebsocketUserSessionClientCommandType } from '@sling/artus-web-shared/types'
import Cookies from 'js-cookie'
import shared from '@sling/artus-web-shared'
import type { useUserStore } from '@/stores/user'
import { setUserSessionSignOutCausedBy } from '@/utils/user'

export const handleAccountObserveWsMessage = function(
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
    case WebsocketUserSessionClientCommandType.SESSION_EVICT: {
      const value = commandInfo.value as UserSessionSignOutCausedBy
      if (value) {
        setUserSessionSignOutCausedBy(value)
        userStore.fetchSignOut()
      }

      break
    }
  }
}
