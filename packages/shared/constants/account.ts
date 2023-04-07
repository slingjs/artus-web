/**
 * Password pattern.
 *
 * At least 8 characters long
 * At least 1 capital letter
 * At least 1 lowercase letter
 * At least 1 special character
 * At least 1 numeric character
 */
export const accountPasswordPatternString = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W])[A-Za-z\\d\\W]{6,16}$'
export const accountNamePatternString = '^[a-zA-Z\d]{6,60}$'
