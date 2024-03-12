FROM node:18.18.0-alpine

RUN npm install -g npm@10.5.0

WORKDIR /app

COPY . /app/

RUN npm install

RUN npm run build

EXPOSE 3000
