FROM node:21-alpine3.18

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm audit fix --force

COPY . .

COPY ./init.sh /usr/local/bin

RUN chmod 755 /usr/local/bin/init.sh

ENTRYPOINT [ "init.sh" ]
