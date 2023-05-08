import { describe, expect, it, assert, vi } from 'vitest'
import { LocalTestContext } from '../index'
import _ from 'lodash'
import fetch from 'node-fetch'
import shared from '@sling/artus-web-shared'
import { UserSession } from '@sling/artus-web-shared/types'
import * as ws from 'ws'
import type { Event } from 'ws'
import appConfig from '../../app/config/config.default'

describe('Check server running correctly', () => {
  const url = require('url')

  vi.stubGlobal('config', appConfig)

  it<LocalTestContext>('Check HTTP service', async () => {
    // Check the server be running or not.
    let hostname = global.config.plugin.http.host
    const port = global.config.plugin.http.port

    if (hostname === '0.0.0.0') {
      hostname = '127.0.0.1'
    }

    const http = require('http')
    const { p, resolve } = shared.utils.generateOperablePromise()
    const req = http.get((global.httpUri = url.format({ hostname, port, protocol: 'http' })))

    req.on('response', res => {
      const setCookies = res.headers['set-cookie'] ?? []

      _.set(
        global,
        'request.headers.Cookie',
        setCookies
          .map(v => v.split(';')[0])
          .filter(Boolean)
          .join(';')
      )

      _.set(
        global,
        `request.headers.${shared.constants.USER_CSRF_TOKEN_KEY}`,
        global.config.framework.web.security.csrf.supremeToken
      )

      resolve(res)
    })

    await shared.utils.promiseTimeout(p, { timeout: 3000 })

    req.end()
  })

  it('Check Websocket service', async () => {
    // Check the server be running or not.
    let hostname = global.config.plugin.websocket.host
    const port = global.config.plugin.websocket.port

    if (hostname === '0.0.0.0') {
      hostname = '127.0.0.1'
    }

    const websocket = new ws.WebSocket(
      (global.websocketUri = url.format({ hostname, port, protocol: 'ws' })),
      global.request
    )
    const { p, resolve, reject } = shared.utils.generateOperablePromise<Event>()
    websocket.onopen = resolve.bind(websocket)
    websocket.onerror = reject.bind(websocket)

    await shared.utils.promiseTimeout(p, { timeout: 3000 })

    websocket.close()
  })
})

describe<LocalTestContext>('Account certificates', () => {
  const url = require('url')
  const accountCertificate = {
    name: 'SomeTimesNaive',
    email: 'i@test.com',
    password: Buffer.from('1qaz!QAZ', 'utf-8').toString('base64')
  }
  const accountCertificateNewPwd = Buffer.from('1qaz!QAZ1', 'utf-8').toString('base64')
  let accountAlreadySignedUp = false
  const websocketObserveMessages: string[] = []
  let websocketClient: ws.WebSocket | undefined

  it<LocalTestContext>('Sign-up', async () => {
    const signUpUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/sign-up'
      })
    )

    const result = await fetch(
      signUpUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_.pick(accountCertificate, ['email', 'password', 'name']))
        },
        global.request
      )
    ).then(res => {
      const setCookies = res.headers.get('set-cookie') ?? ''
      if (setCookies) {
        _.set(global, 'request.headers.Cookie', setCookies.split(';')[0] ?? '')
      }

      return res.json()
    })

    if (_.get(result, 'code') === 'ERROR_SIGN_UP_DUPLICATE') {
      accountAlreadySignedUp = true
      accountCertificate.password = accountCertificateNewPwd
      return
    }

    assert(_.get(result, 'status') === 'SUCCESS')
  })

  it<LocalTestContext>('Session', async () => {
    const sessionUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/session'
      })
    )

    const session = await fetch(
      sessionUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        global.request
      )
    ).then(res => {
      const setCookies = res.headers.get('set-cookie') ?? ''
      if (setCookies) {
        _.set(global, 'request.headers.Cookie', setCookies.split(';')[0] ?? '')
      }

      return res.json()
    })

    assert(_.get(session, 'status') === 'SUCCESS')

    const account = _.get(session, 'data.account')! as UserSession
    expect(account)

    assert(account.signedIn === !accountAlreadySignedUp)
  })

  it<LocalTestContext>('Sign-out', async () => {
    const signOutUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/sign-out'
      })
    )

    await fetch(
      signOutUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {}
        },
        global.request
      )
    )
  })

  it<LocalTestContext>('Change-Pwd', async () => {
    const changePwdUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/change-pwd'
      })
    )

    const result = await fetch(
      changePwdUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            _.merge(_.pick(accountCertificate, 'email'), {
              oldPassword: _.get(accountCertificate, 'password'),
              password: accountCertificateNewPwd
            })
          )
        },
        global.request
      )
    ).then(res => res.json())

    assert(_.get(result, 'status') === 'SUCCESS')

    // Update pwd.
    accountCertificate.password = accountCertificateNewPwd
  })

  it<LocalTestContext>('Sign-In', async () => {
    const signInUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/sign-in'
      })
    )

    const result = await fetch(
      signInUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_.pick(accountCertificate, ['email', 'password']))
        },
        global.request
      )
    ).then(res => {
      const setCookies = res.headers.get('set-cookie') ?? ''
      if (setCookies) {
        _.set(global, 'request.headers.Cookie', setCookies.split(';')[0] ?? '')
      }

      return res.json()
    })

    assert(_.get(result, 'status') === 'SUCCESS')

    const account = _.get(result, 'data.account')! as UserSession
    expect(account)
    assert(account.signedIn === true)
  })

  it<LocalTestContext>('Account-Observe', async () => {
    const accountObserveUri = url.format(
      _.merge(url.parse(global.websocketUri), {
        pathname: '/ws/account/observe'
      })
    )

    websocketClient = new ws.WebSocket(accountObserveUri, global.request)
    const { p, resolve, reject } = shared.utils.generateOperablePromise<Event>()
    websocketClient.onopen = resolve.bind(websocketClient)
    websocketClient.onerror = resolve.bind(reject)

    await shared.utils.promiseTimeout(p, { timeout: 3000 })

    websocketClient!.addEventListener(
      'message',
      async function onMessage(event) {
        websocketObserveMessages.push(event.data)
      }.bind(websocketClient)
    )
  })

  it<LocalTestContext>('Try-Sign-In-Again-After-Signed-In', async () => {
    const signInUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/sign-in'
      })
    )

    const result = await fetch(
      signInUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_.pick(accountCertificate, ['email', 'password']))
        },
        global.request
      )
    ).then(res => {
      const setCookies = res.headers.get('set-cookie') ?? ''
      if (setCookies) {
        _.set(global, 'request.headers.Cookie', setCookies.split(';')[0] ?? '')
      }

      return res.json()
    })

    assert(_.get(result, 'status') === 'FAIL')
    assert(_.get(result, 'code') === 'ERROR_SIGN_IN_ALREADY_SIGNED_IN')
  })

  it<LocalTestContext>('Try-Sign-In-Incognito', async () => {
    const signInUri = url.format(
      _.merge(url.parse(global.httpUri), {
        pathname: '/api/account/sign-in'
      })
    )

    // Another event.
    websocketClient!.addEventListener(
      'message',
      async function onMessage(event) {
        try {
          const commandInfo = JSON.parse(event.data)
          // The previous session will be evicted.
          if (commandInfo.command === 'session-evict') {
            // No need this. It will be automatically closed.
            // Due to the server side terminate the ws session unilaterally.
            // // await websocketClient!.close()
          }
        } catch (e) {}
      }.bind(websocketClient)
    )

    // New sign in request.
    // Will evict the previous signed-in session.
    // Will manufacture a new session cookie key.
    const result = await fetch(
      signInUri,
      _.merge(
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_.pick(accountCertificate, ['email', 'password']))
        },
        _.omit(global.request, 'headers.Cookie')
      )
    ).then(res => {
      const setCookies = res.headers.get('set-cookie') ?? ''
      if (setCookies) {
        _.set(global, 'request.headers.Cookie', setCookies.split(';')[0] ?? '')
      }

      return res.json()
    })

    // Wait a little, the websocket will handle the 'session-evicted' command and be closed.
    await shared.utils.promiseDelay(100)

    assert(_.get(result, 'status') === 'SUCCESS')
    expect(websocketClient)
    assert(websocketClient!.readyState === websocketClient!.CLOSED)
    assert(_.last(websocketObserveMessages)!.includes('DISABLE_MULTIPLE_SIGNED_IN_SESSIONS'))
  })
})
