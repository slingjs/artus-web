import status from 'http-status'

export const trimEventPathRegExp = /\/+$/g

// 404 is the fallback/default status in koa2.
export const DEFAULT_HTTP_STATUS = status.NOT_FOUND

export const SUCCESS_HTTP_STATUS = status.OK
