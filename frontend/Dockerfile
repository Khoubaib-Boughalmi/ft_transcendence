FROM node:21-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm audit fix --force

COPY . .

RUN apk update; apk add --no-cache nginx

RUN npm install

RUN npm audit fix --force

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html

COPY ./init.sh /usr/local/bin

RUN chmod 755 /usr/local/bin/init.sh

ENTRYPOINT [ "init.sh" ]
