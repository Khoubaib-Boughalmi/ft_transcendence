# TODO add nginx

FROM node:14.17.1-alpine

WORKDIR /app
COPY . /app/

RUN apk update && apk add bash
RUN yarn install
RUN yarn build
EXPOSE 8080
