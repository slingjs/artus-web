import { vi } from 'vitest'
import appConfig from '../app/config/config.default'

vi.stubGlobal('config', appConfig)
vi.stubGlobal('request', {})
vi.stubGlobal('httpUri', '')
vi.stubGlobal('websocketUri', '')
