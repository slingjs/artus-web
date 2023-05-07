import { compareIgnoreCase } from './string'
import { DEVELOPMENT_MODE, PRODUCTION_MODE } from '../constants'

export function judgeBuildMode(targetMode: string) {
  return compareIgnoreCase(process.env.NODE_ENV, targetMode)
}

export function judgeBuildModeInProduction() {
  return judgeBuildMode(PRODUCTION_MODE)
}

export function judgeBuildModeInDevelopment() {
  return judgeBuildMode(DEVELOPMENT_MODE)
}

export function getSupremeCsrfToken() {
  return process.env.VITE_SUPREME_CSRF_TOKEN || process.env.SUPREME_CSRF_TOKEN || ''
}
