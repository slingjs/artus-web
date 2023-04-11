/**
 * Password pattern.
 *
 * gte 6, lte 16 characters.
 * At least 1 capital letter.
 * At least 1 lowercase letter.
 * At least 1 special character.
 * At least 1 numeric character.
 */
export const accountPasswordPatternString = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W])[A-Za-z\\d\\W]{6,16}$'
export const accountPasswordPattern = new RegExp(accountPasswordPatternString, 'u')
/**
 * gte 6, lte 60 characters.
 * English letters and numbers.
 */
export const accountNamePatternString = '^[a-zA-Z\d]{6,60}$'
export const accountNamePattern = new RegExp(accountNamePatternString, 'u')

export const accountSignOutCallbackSearchParamKey = 'callback'
