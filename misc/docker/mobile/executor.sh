#!/bin/bash

PROJECT_DIR=/home/blunders/ztd.blunders-mobile

MODE=$1

function help {
  echo 'local - build a project and use nginx to show it'
  echo 'apk   - build an APK and copies it to build/'
  echo 'help  - show this help'
}

if [ -z "${MODE}" ]; then
  help
fi

if [ ${MODE} = "local" ]; then
  cd ${PROJECT_DIR} && \
  git pull
  echo "Starting local server on port 80"
  exec /usr/sbin/nginx -c ${PROJECT_DIR}/misc/docker/mobile/nginx/nginx.conf -g "daemon off;"
elif [ ${MODE} = "apk" ]; then
  cd ${PROJECT_DIR} && \
  git pull && \
  echo 'Not implemented yet'
else
  help
fi

echo "Finished successfully"

