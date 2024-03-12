FROM node:18.18.0-alpine

# Upgrade npm to version 10.5.0
RUN npm install -g npm@10.5.0

WORKDIR /app

COPY . /app/

RUN apk update; apk add --no-cache bash nginx

RUN npm install

RUN npm run build

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html

RUN cp -r ./.next /usr/share/nginx/html

EXPOSE 8080
