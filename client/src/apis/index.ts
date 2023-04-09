import type {
  FetchAccountChangePwdRequestPayload,
  FetchAccountSignInRequestPayload,
  FetchAccountSignUpRequestPayload
} from '@/types'
import * as urls from './urls'

export function fetchAccountSession () {
  return fetch(urls.account.session, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin'
  }).then(res => res.json())
}

export function fetchAccountSignIn (payload: FetchAccountSignInRequestPayload) {
  return fetch(urls.account.signIn, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin'
  }).then(res => {
    if (!res.ok) {
      throw res
    }
    return res.json()
  })
}

export function fetchAccountSignUp (payload: FetchAccountSignUpRequestPayload) {
  return fetch(urls.account.signUp, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin'
  }).then(res => {
    if (!res.ok) {
      throw res
    }
    return res.json()
  })
}

export function fetchAccountChangePwd (payload: FetchAccountChangePwdRequestPayload) {
  return fetch(urls.account.changePwd, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin'
  }).then(res => {
    if (!res.ok) {
      throw res
    }
    return res.json()
  })
}
