import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'

const job = function() {
  // If not exists
  if (!fs.existsSync(path.resolve(__dirname, '../app'))) {
    return
  }

  const schemaPaths = [
    '../app/frameworks/framework-web/models/mongo/schema.prisma',
    '../app/frameworks/framework-web/models/mysql/schema.prisma'
  ]

  schemaPaths.forEach(p => {
    execSync('npx prisma generate --schema ' + p, { cwd: __dirname })
  })
}

job()
