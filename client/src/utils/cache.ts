import _ from 'lodash'

export class SessionCache {
  setSessionCache (key: string, value: string) {
    return sessionStorage.setItem(key, value)
  }

  getSessionCache (key: string, options?: Partial<{ autoRemove: boolean }>) {
    const result = sessionStorage.getItem(key)

    if (_.get(options, 'autoRemove')) {
      this.removeSessionCache(key)
    }

    return result
  }

  removeSessionCache (key: string) {
    return sessionStorage.removeItem(key)
  }
}

export const sessionCache = new SessionCache()
