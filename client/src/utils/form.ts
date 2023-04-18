import type { FormItemRule } from 'naive-ui'
import shared from '@sling/artus-web-shared'
import _ from 'lodash'

export function validatePassword(rule: FormItemRule, value: string) {
  if (!shared.constants.accountPasswordPattern.test(value)) {
    /**
     * gte 6, lte 16 characters.
     * At least 1 capital letter.
     * At least 1 lowercase letter.
     * At least 1 special character.
     * At least 1 numeric character.
     */
    return new Error(
      'Password should be 6 to 16 characters long, at least contain 1 lowercase letter, 1 uppercase letter, 1 special character and 1 numeric character.'
    )
  }
}

export function validateName(rule: FormItemRule, value: string) {
  if (!shared.constants.accountNamePattern.test(value)) {
    /**
     * gte 6, lte 60 characters.
     * English letters and numbers.
     */
    return new Error(
      'Name should be 6 to 60 characters long, only numeric characters and (lowercase or uppercase) letters permitted.'
    )
  }
}

export function validateConfirmPasswordGenerator(formModel: {
  password: string
  [key: string]: any
}) {
  return function validateConfirmPassword(rule: FormItemRule, value: string) {
    if (!_.isEqual(formModel.password, value)) {
      return new Error('Please enter the content which is the same as the password.')
    }
  }
}
