export function preEncryptPassword(password: string) {
  return btoa(password)
}
