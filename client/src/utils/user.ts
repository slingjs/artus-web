import { USER_SIGN_OUT_CAUSED_BY_KEY } from '@/constants'
import { UserSessionSignOutCausedBy } from '@sling/artus-web-shared/types'
import { sessionCache } from '@/utils/cache'

export function setUserSessionSignOutCausedBy (causedBy: UserSessionSignOutCausedBy) {
  return sessionCache.setSessionCache(USER_SIGN_OUT_CAUSED_BY_KEY, causedBy)
}

export function getUserSessionSignOutCausedBy (options?: Partial<{ autoRemove: boolean }>) {
  return sessionCache.getSessionCache(USER_SIGN_OUT_CAUSED_BY_KEY, options) as UserSessionSignOutCausedBy | null
}

export function getUserSessionSignOutCausedByMessage (options?: Partial<{ autoRemove: boolean }>) {
  const result = getUserSessionSignOutCausedBy(options)

  switch (result) {
    case UserSessionSignOutCausedBy.MANUALLY: {
      return ''
    }
    case UserSessionSignOutCausedBy.DISABLE_MULTIPLE_SIGNED_IN_SESSIONS: {
      return 'Your signed-in session has been evicted due to another new sign-in request permitted!'
    }
    case UserSessionSignOutCausedBy.SESSION_DISTRIBUTE_EXPIRED: {
      return 'Your signed-in session expired.'
    }
    case UserSessionSignOutCausedBy.SESSION_CREDENTIAL_MODIFIED: {
      return 'Your signed-in session has been evicted due to your account credential modified.'
    }
  }

  return ''
}
