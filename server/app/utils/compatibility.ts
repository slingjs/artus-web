import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function get__filename () {
  return typeof __filename === 'undefined'
    // @ts-ignore
    ? fileURLToPath(import.meta.url)
    : __filename
}

export function get__dirname () {
  return typeof __dirname === 'undefined'
    // @ts-ignore
    ? path.dirname(fileURLToPath(import.meta.url))
    : __dirname
}
