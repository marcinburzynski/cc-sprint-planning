FROM node:18.16.0-bullseye

WORKDIR /app

COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
COPY nodemon.json nodemon.json

RUN corepack enable
RUN yarn install
RUN npx prisma generate

ENTRYPOINT ["bash", "-c", "yarn dev"]
