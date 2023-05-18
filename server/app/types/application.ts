export type FrameworkConfig = {
  cacheDir: string
  distDir: string
  api?: Partial<{
    account: Partial<{
      enableMultipleSignedInSessions: boolean
      enableRecordMultipleSignedInSessions: boolean
    }>
  }>
  security?: Partial<{
    csrf: Partial<{
      supremeToken: string
    }>
  }>
}
