import crypto from 'crypto'
import _ from 'lodash'

export function encryptPassword (password: string, salt: string) {
  const hash = crypto.createHash(
    'MD5',
    {
      encoding: 'utf-8'
    }
  )

  return hash.update(
    [
      // Password, base64 decode.
      password,
      '__',
      salt
    ].join('')
  ).digest('hex')
}

export function rectifyPassword (password: string, options?: Partial<{ preEncrypt: boolean }>) {
  return _.get(options, 'preEncrypt')
    // Base64 decrypt.
    ? Buffer.from(password, 'base64').toString()
    : password
}
