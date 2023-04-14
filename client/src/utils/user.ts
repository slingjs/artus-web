import { USER_SIGN_OUT_CAUSED_BY_KEY } from '@/constants'
import _ from 'lodash'
import { UserSessionSignOutCausedBy } from '@sling/artus-web-shared/types'

export function setUserSessionSignOutCausedBy (causedBy: UserSessionSignOutCausedBy) {
  return sessionStorage.setItem(USER_SIGN_OUT_CAUSED_BY_KEY, causedBy)
}

export function getUserSessionSignOutCausedBy (options?: Partial<{ autoReset: boolean }>) {
  const result = sessionStorage.getItem(USER_SIGN_OUT_CAUSED_BY_KEY) as UserSessionSignOutCausedBy | null

  if (_.get(options, 'autoReset')) {
    resetUserSessionSignOutCausedBy()
  }

  return result
}

export function resetUserSessionSignOutCausedBy () {
  return sessionStorage.removeItem(USER_SIGN_OUT_CAUSED_BY_KEY)
}

export function getUserSessionSignOutCausedByMessage (options?: Partial<{ autoReset: boolean }>) {
  const result = getUserSessionSignOutCausedBy(options)

  switch (result) {
    case UserSessionSignOutCausedBy.MANUALLY: {
      return ''
    }
    case UserSessionSignOutCausedBy.DISABLE_MULTIPLE_SIGNED_IN_SESSIONS: {
      return 'Your signed-in session has been evicted!'
    }
    case UserSessionSignOutCausedBy.SESSION_DISTRIBUTE_EXPIRED: {
      return 'Your signed-in session has been expired.'
    }
  }

  return ''
}
