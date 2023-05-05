import { ISODateString } from './base'

export enum Roles {
  ANONYMOUS = 'ANONYMOUS',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface UserSession {
  name: string
  roles: Array<Roles>
  signedIn: boolean
  id: string
  email: string
  _sessionId: string
  lastSignedInAt: ISODateString
  _csrfToken: string
}

export enum WebsocketUserSessionClientCommandType {
  SET_COOKIE = 'set-cookie',
  SESSION_EVICT = 'session-evict',
  MESSAGE_NOTIFY = 'MESSAGE_NOTIFY'
}

export enum WebsocketUserSessionClientCommandTrigger {
  SYSTEM = 'system',
  CLIENT = 'client'
}

export interface WebsocketUserSessionClientCommandInfo {
  trigger: WebsocketUserSessionClientCommandTrigger
  command: WebsocketUserSessionClientCommandType
  value: string
}

export enum UserSessionSignOutCausedBy {
  DISABLE_MULTIPLE_SIGNED_IN_SESSIONS = 'DISABLE_MULTIPLE_SIGNED_IN_SESSIONS',
  MANUALLY = 'MANUALLY',
  SESSION_DISTRIBUTE_EXPIRED = 'SESSION_DISTRIBUTE_EXPIRED',
  SESSION_CREDENTIAL_MODIFIED = 'SESSION_CREDENTIAL_MODIFIED'
}

export type WebsocketUserSessionClientCommandMessageNotifyValue =
  | string
  | {
      message: string
      [key: string]: any
    }
