export function compareIgnoreCase (str1: any, str2: any) {
  str1 += ''
  str2 += ''

  return str1.toLowerCase() === str2.toLowerCase()
}
