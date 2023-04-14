import { WebsocketUserSessionClientCommandType } from '@sling/artus-web-shared/types'
import type { WebsocketUserSessionClientCommandInfo } from '@sling/artus-web-shared/types'
import Cookies from 'js-cookie'
import shared from '@sling/artus-web-shared'

export const handleAccountObserveWsMessage: WebSocket['onmessage'] = function(event) {
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
  }
}
