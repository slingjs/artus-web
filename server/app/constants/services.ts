import { HTTPMethod } from '../plugins/plugin-http/types'

export const DISTRIBUTE_CACHE_SUCCESS_VALUE = 1
export const DISTRIBUTE_CACHE_SET_SUCCESS_VALUE = 'OK'
export const DISTRIBUTE_CACHE_CLEAR_SUCCESS_VALUE = 'OK'

export const DISTRIBUTE_CACHE_DEFAULT_TTL = 5 * 60 * 1000 // ms.
export const MEMORY_CACHE_DEFAULT_TTL = 5 * 60 * 1000 // ms.

export const USER_DISTRIBUTE_CACHE_DEFAULT_TTL = 30 * 60 * 1000 // ms.

export const ACCESSIBLE_ACCOUNT_PROPERTIES = ['email', 'name', 'roles', 'userId', 'lastSignedInAt'] as const
export const USER_SESSION_COOKIE_MAX_AGE = 60 * 30 // s.
export const USER_SESSION_COOKIE_MAX_AGE_REMEMBERED = 60 * 60 * 24 // s.
export const USER_SESSION_COOKIE_MAX_AGE_REMOVED = -1 // s.
export const PAGE_PROHIBIT_ACCOUNT_PROPERTIES = ['_sessionId', 'roles', '_csrfToken']

export const SERVICE_DEFAULT_RESPONSE_CODE = 'SUCCESS'
export const SERVICE_DEFAULT_RESPONSE_MESSAGE = 'ok'

export const WEBSOCKET_ACCOUNT_OBSERVE_REQUEST_PATH = '/ws/account/observe'

export const userSessionIdPattern = /^USER:[A-Za-z\d\-]+$/
export const userSessionIdReplacePattern = /^USER:/

export const csrfInterceptHttpMethods = [HTTPMethod.DELETE, HTTPMethod.PUT, HTTPMethod.POST, HTTPMethod.PATCH]

export const fileNewLineOnEOFPattern = /\r\n$/
export const fileNewLineMark = '\r\n'
