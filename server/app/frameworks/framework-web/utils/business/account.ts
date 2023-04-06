import crypto from 'crypto'

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
