# artus-web
Learn new things to improve myself.

`Artus`, `vue3`, `redis`, `mysql`, `mongodb`, and `Pnpm workspaces`.

# Prerequisites
Used `redis`, `mysql` and `mongodb - replicaSet`.

Please check `./server/app/frameworks/framework-web/models/README.md`.

And the related config is in file `./server/app/config/config.default.ts`.

# Steps.
```shell
pnpm i

pnpm run build

# Generate prisma models.
cd ./server
npx prisma generate --schema ./app/frameworks/framework-web/models/mongo/schema.prisma
npx prisma generate --schema ./app/frameworks/framework-web/models/mysql/schema.prisma
# Windows. Initial mysql dbs.
set MYSQL_URI=mysql://root:123456@localhost:3306/test && npx prisma db push --schema ./app/frameworks/framework-web/models/mysql/schema.prisma

# Start or dev
pnpm run start
```
