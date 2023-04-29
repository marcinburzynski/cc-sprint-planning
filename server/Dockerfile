FROM node:18.16.0-bullseye as base

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
COPY prisma ./prisma

RUN corepack enable
RUN yarn install
COPY ssl /ssl


FROM base as prod
COPY src ./src
RUN yarn run generate-prisma
RUN yarn run compile
ENTRYPOINT ["bash", "-c", "yarn run start-server"]


FROM base as dev
RUN yarn run generate-prisma
COPY nodemon.json nodemon.json
ENTRYPOINT ["bash", "-c", "yarn dev"]
