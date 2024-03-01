FROM node:21-alpine3.18

WORKDIR /app

COPY . /app/

RUN apk update; apk --no-cache add bash --virtual builds-deps build-base 

RUN apk --no-cache add --virtual python

RUN npm install --silent

RUN npm run build --silent

EXPOSE 3000

# ENTRYPOINT [ "npm", "run", "start:dev"]
