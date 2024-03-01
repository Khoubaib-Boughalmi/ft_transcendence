FROM node:21-alpine3.18

WORKDIR /app

COPY . /app/

RUN apk update; apk add --no-cache bash nginx

RUN npm install --silent

RUN npm run build --silent

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /usr/share/nginx/html

RUN cp -r ./.next /usr/share/nginx/html

EXPOSE 8080

# ENTRYPOINT [ "npm", "run", "dev" ]