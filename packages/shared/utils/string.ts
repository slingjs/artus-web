import { v4 as uuidV4 } from 'uuid'

export function compareIgnoreCase(str1: any, str2: any) {
  str1 += ''
  str2 += ''

  return str1.toLowerCase() === str2.toLowerCase()
}

export function calcRandomString(len?: number): string {
  len = len || 32
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length

  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }

  return pwd
}

export function calcUUID() {
  return uuidV4()
}
