#!/bin/sh

set -e

npm run build; cp -r /app/.next /usr/share/nginx/html

npm run start
