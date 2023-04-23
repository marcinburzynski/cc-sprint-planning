FROM node:18.16.0-bullseye as base

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN corepack enable
RUN yarn install


FROM base as dev

ENTRYPOINT ["bash", "-c", "yarn run dev"]


FROM base as prod-builder

COPY . /app
ENV TEST_ENV_SOCKET_HOST=ws://localhost:3000
RUN yarn build


FROM nginx:1.23-bullseye as prod

COPY --from=prod-builder /app/dist /app
RUN rm /etc/nginx/conf.d/default.conf
COPY ../data/nginx/nginx.conf /etc/nginx/conf.d

#ENTRYPOINT ["tail", "-f", "/dev/null"]
CMD ["nginx", "-g", "daemon off;"]
