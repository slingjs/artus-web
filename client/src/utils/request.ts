import _ from 'lodash'
import shared from '@sling/artus-web-shared'

let csrfToken = ''

export function setCsrfToken(token: string) {
  csrfToken = token

  const tokenDom = document.querySelector<HTMLMetaElement>('meta[name="_token"]')
  if (tokenDom) {
    tokenDom.content = token
  }
}

export function getCsrfToken() {
  if (!csrfToken) {
    csrfToken = _.get(document.querySelector('meta[name="_token"]'), 'content') || ''
  }

  return csrfToken
}

export function formatFetchHeaders(headers?: Record<string, any>) {
  return _.merge(
    {
      [shared.constants.USER_CSRF_TOKEN_KEY]: getCsrfToken(),
      'Content-Type': 'application/json'
    },
    headers
  )
}

export function formatWsHeaders(headers?: Record<string, any>) {
  return _.merge(
    {
      [shared.constants.USER_CSRF_TOKEN_KEY]: getCsrfToken()
    },
    headers
  )
}
