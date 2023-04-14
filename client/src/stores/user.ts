import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { fetchAccountChangePwd, fetchAccountSession, fetchAccountSignIn, fetchAccountSignUp } from '@/apis'
import _ from 'lodash'
import type { UserSession } from '@sling/artus-web-shared/types'
import type { WsHandler, WsHandlers } from '@/types'
import { wsCommunicateAccountObserve } from '@/wss'
import { handleAccountObserveWsMessage } from '@/utils/wss'

export const useUserStore = defineStore('user', {
  state () {
    const session = reactive({} as UserSession)
    const wsHandlers = reactive({} as WsHandlers)

    return {
      session,
      wsHandlers
    }
  },
  actions: {
    setSession (session: typeof this.session) {
      this.session = session
    },
    async setWsHandler (wsHandler: WsHandler) {
      const existedWsHandler = _.get(this.wsHandlers, wsHandler.handlerPath)
      if (existedWsHandler) {
        await existedWsHandler.ws.close()
      }

      this.wsHandlers[wsHandler.handlerPath] = wsHandler
    },
    judgeSessionSignedIn (session: typeof this.session) {
      return !!_.get(session, 'signedIn')
    },
    async fetchSession (...args: Parameters<typeof fetchAccountSession>) {
      const sessionResult = await fetchAccountSession()

      this.setSession(_.get(sessionResult.data, 'account'))
    },
    async fetchSignIn (...args: Parameters<typeof fetchAccountSignIn>) {
      await fetchAccountSignIn(...args)
      await this.fetchSession()
    },
    async fetchSignUp (...args: Parameters<typeof fetchAccountSignUp>) {
      await fetchAccountSignUp(...args)
      await this.fetchSession()
    },
    async fetchChangePwd (...args: Parameters<typeof fetchAccountChangePwd>) {
      await fetchAccountChangePwd(...args)
      await this.fetchSession()
    },
    async wsCommunicateAccountObserve (...args: Parameters<typeof wsCommunicateAccountObserve>) {
      const handler = await wsCommunicateAccountObserve()

      handler.ws.onmessage = handleAccountObserveWsMessage

      await this.setWsHandler(handler)
    },
    async beforeUnload () {
      await Promise.allSettled(Object.values(this.wsHandlers).map(handler => handler.ws.close()))
    }
  }
})
