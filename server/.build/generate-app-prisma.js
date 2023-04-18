const { execSync } = require('child_process')
const fs = require('fs-extra')
const path = require('path')

const job = function () {
  // If not exists
  if (!fs.existsSync(path.resolve(__dirname, '../app'))) {
    return
  }

  const schemaPaths = [
    '../app/frameworks/framework-web/models/mongo/schema.prisma',
    '../app/frameworks/framework-web/models/mysql/schema.prisma'
  ]

  schemaPaths.forEach((p) => {
    execSync('npx prisma generate --schema ' + p, { cwd: __dirname })
  })
}

job()
