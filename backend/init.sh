#!/bin/sh

set -e

npm run migrate

npm run build; npm run start