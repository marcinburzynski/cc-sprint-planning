FROM node:18.16.0-bullseye as base

WORKDIR /app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN corepack enable
RUN yarn install
COPY ssl /ssl


FROM base as dev
ENTRYPOINT ["bash", "-c", "yarn run dev"]


FROM base as prod-builder
COPY . /app
RUN yarn build


FROM nginx:1.23-bullseye as prod
COPY --from=prod-builder /app/dist /app
COPY --from=prod-builder /ssl /ssl
RUN rm /etc/nginx/conf.d/default.conf
COPY config/nginx.conf /etc/nginx/conf.d

CMD ["nginx", "-g", "daemon off;"]
