#!/usr/bin/env node

import { start } from '../app/bootstrap'

start().catch(e => {
  console.error('[Fatal] Failed to start app.', e)
})
