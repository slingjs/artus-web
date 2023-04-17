import { describe, expect, it, assert } from 'vitest'
import { LocalTestContext } from '../index'
import _ from 'lodash'
import fetch from 'node-fetch'
import shared from '@sling/artus-web-shared'
import { UserSession } from '@sling/artus-web-shared/types'

describe('Check server running correctly', () => {
  const url = require('url')

  it<LocalTestContext>('Check HTTP service', async () => {
    // Check the server be running or not.
    let hostname = global.config.plugin.http.host
    const port = global.config.plugin.http.port

    if (hostname === '0.0.0.0') {
      hostname = '127.0.0.1'
    }

    const http = require('http')
    const { p, resolve } = shared.utils.generateOperablePromise()
    const req = http.get(
      global.httpUri = url.format({ hostname, port, protocol: 'http' })
    )

    req.on('response', res => {
      const setCookies = res.headers['set-cookie'] ?? []

      _.set(global, 'request.headers.Cookie', setCookies.map(v => v.split(';')[0]).filter(Boolean).join(';'))

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

    const ws = require('ws')

    const websocket = new ws.WebSocket(
      global.websocketUri = url.format({ hostname, port, protocol: 'ws' }),
      global.request
    )
    const { p, resolve } = shared.utils.generateOperablePromise<typeof ws.WebSocket.Event>()
    websocket.onopen = resolve.bind(websocket)

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

  it<LocalTestContext>('Sign-up', async () => {
    const signUpUri = url.format(_.merge(url.parse(global.httpUri), {
      pathname: '/api/account/sign-up'
    }))

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
        _.set(global, 'request.headers.cookie', setCookies.split(';')[0]).filter(Boolean).join(';')
      }

      return res.json()
    })

    assert(_.get(result, 'status') === 'SUCCESS')
  })

  it<LocalTestContext>('Session', async () => {
    const sessionUri = url.format(_.merge(url.parse(global.httpUri), {
      pathname: '/api/account/session'
    }))

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
    ).then(res => res.json())

    assert(_.get(session, 'status') === 'SUCCESS')

    const account = _.get(session, 'data.account')! as UserSession
    expect(account)
    assert(account.signedIn === true)
  })

  it<LocalTestContext>('Sign-out', async () => {
    const signOutUri = url.format(_.merge(url.parse(global.httpUri), {
      pathname: '/api/account/sign-out'
    }))

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
    const newPwd = Buffer.from('1qaz!QAZ1', 'utf-8').toString('base64')
    const changePwdUri = url.format(_.merge(url.parse(global.httpUri), {
      pathname: '/api/account/change-pwd'
    }))

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
              password: newPwd
            })
          )
        },
        global.request
      )
    ).then(res => res.json())

    assert(_.get(result, 'status') === 'SUCCESS')

    // Update pwd.
    accountCertificate.password = newPwd
  })

  it<LocalTestContext>('Sign-In', async () => {
    const signInUri = url.format(_.merge(url.parse(global.httpUri), {
      pathname: '/api/account/sign-in'
    }))

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
    ).then(res => res.json())

    assert(_.get(result, 'status') === 'SUCCESS')

    const account = _.get(result, 'data.account')! as UserSession
    expect(account)
    assert(account.signedIn === true)
  })
})
