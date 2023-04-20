FROM node:lts-alpine

LABEL maintainer="wangziling"
LABEL com.docker.compose.project=artus-web

# For better Chinese support.
ENV LANG="C.UTF-8"

WORKDIR /app/

COPY ./sling-artus-web-*.tgz /app/

#COPY ./docker-pm2-process.config.js /app/

RUN tar -xzf *.tgz -C ./ \
    && mv ./package/* . \
    && rm -rf ./package \
    && rm -rf ./sling-artus-web-*.tgz

RUN npm config set registry=https://registry.npmmirror.com --global \
    && npm install -g pnpm pm2 \
    && SHELL=bash pnpm setup \
    && source /root/.bashrc \
    && pnpm i

#EXPOSE 9527

# Seems redis could only be accessed by this host or 'redis-server'.
ENV REDIS_HOST="redis"
ENV MONGO_URI="mongodb://mongo-0:27017,mongo-1:27017,mongo-2:27017/test?replicaSet=rs0"

# The follow commented-out command will always throw errors...
# Don't know why. So I make compromise to sunset it.
#CMD ["/bin/bash", "-c", "pm2-runtime start '/app/docker-pm2-process.config.js'"]

CMD ["/bin/bash", "-c", "pnpm start"]
