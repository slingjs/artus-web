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
}
