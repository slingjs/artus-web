FROM node:lts-alpine

LABEL maintainer="wangziling"
LABEL com.docker.compose.project=artus-web

# For better Chinese support.
ENV LANG="C.UTF-8"
ENV DOCKER_BUILDKIT=0
ENV COMPOSE_DOCKER_CLI_BUILD=0

WORKDIR /app/

COPY ./**/package.json ./pnpm-workspace.yaml /app/

RUN npm config set registry=https://mirrors.cloud.tencent.com/npm/ --global

COPY . /app/

RUN npm install -g pnpm pm2 \
    && SHELL=bash pnpm setup \
    && source /root/.bashrc \
    && pnpm i

RUN pnpm run build

EXPOSE 9527

CMD ["/bin/sh", "-c", "pm2-runtime", "pnpm", "--", "start"]
