const { execSync } = require('child_process')

const schemaPaths = [
  '../dist/app/frameworks/framework-web/models/mongo/schema.prisma',
  '../dist/app/frameworks/framework-web/models/mysql/schema.prisma'
]

schemaPaths.forEach(p => {
  execSync('npx prisma generate --schema ' + p, { cwd: __dirname })
})
