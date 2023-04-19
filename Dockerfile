FROM node:lts-alpine

LABEL maintainer="wangziling"
LABEL com.docker.compose.project=artus-web

# For better Chinese support.
ENV LANG="C.UTF-8"

WORKDIR /app/

COPY ./**/package.json ./pnpm-workspace.yaml /app/

RUN npm config set registry=https://registry.npmmirror.com --global

COPY . /app/

RUN npm install -g pnpm pm2 \
    && SHELL=bash pnpm setup \
    && source /root/.bashrc \
    && pnpm i --shamefully-hoist

RUN pnpm run build

EXPOSE 9527

CMD ["/bin/sh", "-c", "pm2-runtime start '/app/docker-pm2-process.config.js'"]
