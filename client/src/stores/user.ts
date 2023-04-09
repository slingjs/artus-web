import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { fetchAccountChangePwd, fetchAccountSession, fetchAccountSignIn, fetchAccountSignUp } from '@/apis'
import _ from 'lodash'
import type { UserSession } from '@sling/artus-web-shared/types'
// import type { Reactive } from 'vue'

export const useUserStore = defineStore('user', {
  state () {
    const session = reactive({} as UserSession)

    return {
      session
    }
  },
  actions: {
    setSession (session: typeof this.session) {
      this.session = session
    },
    judgeSessionSignedIn (session: typeof this.session) {
      return !!_.get(session, 'signedIn')
    },
    async fetchSession (...args: Parameters<typeof fetchAccountSession>) {
      const sessionResult = await fetchAccountSession()

      this.setSession(sessionResult.data)
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
    }
  }
})
