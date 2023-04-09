import { JSONSchemaType } from 'ajv'
import { AccountChangePwdPayload, AccountSignInPayload, AccountSignUpPayload } from '../types'
import shared from '@sling/artus-web-shared'

export const accountSignUpPayloadSchema: JSONSchemaType<AccountSignUpPayload> = {
  type: 'object',
  properties: {
    password: { type: 'string', pattern: shared.constants.accountPasswordPatternString },
    email: { type: 'string', format: 'email' },
    name: { type: 'string', pattern: shared.constants.accountNamePatternString },
    roles: { type: 'array', items: { type: 'string', enum: Object.values(shared.types.Roles) }, nullable: true }
  },
  required: ['name', 'password', 'email'],
  additionalProperties: false
}

export const accountSignInPayloadSchema: JSONSchemaType<AccountSignInPayload> = {
  type: 'object',
  properties: {
    password: { type: 'string', pattern: shared.constants.accountPasswordPatternString },
    email: { type: 'string', format: 'email' }
  },
  required: ['password', 'email'],
  additionalProperties: false
}

export const accountChangePwdPayloadSchema: JSONSchemaType<AccountChangePwdPayload> = {
  type: 'object',
  properties: {
    password: { type: 'string', pattern: shared.constants.accountPasswordPatternString },
    oldPassword: { type: 'string', pattern: shared.constants.accountPasswordPatternString },
    email: { type: 'string', format: 'email' }
  },
  required: ['email', 'password', 'oldPassword'],
  additionalProperties: false
}
