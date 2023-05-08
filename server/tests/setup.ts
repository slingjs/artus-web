import { vi } from 'vitest'
import dotEnv from 'dotenv'

dotEnv.config()

vi.stubGlobal('config', {})
vi.stubGlobal('request', {})
vi.stubGlobal('httpUri', '')
vi.stubGlobal('websocketUri', '')
