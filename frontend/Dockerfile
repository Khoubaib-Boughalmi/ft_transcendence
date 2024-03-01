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
# FROM node:14.17.1-alpine

# WORKDIR /app
# COPY . /app/

# RUN apk update && apk add bash
# RUN apk add nginx
# RUN yarn install
# RUN yarn build
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# RUN mkdir /usr/share/nginx
# RUN cp -r ./build /usr/share/nginx/html
# EXPOSE 8080


# # FROM nginx:1.21.1-alpine

# # WORKDIR /app
# # # COPY . /app/

# # COPY ./build /usr/share/nginx/html
# # COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# # CMD ["nginx", "-g", "daemon off;"]

# # EXPOSE 8080
