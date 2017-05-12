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

cd ${PROJECT_DIR} && \
   git pull

if [ ${MODE} = "web" ]; then
  echo "Starting local server on port 8080"
  echo "Check http://localhost:8080 to access it"
  rsync -avr --delete ${PROJECT_DIR}/ /tmp/build/
  exec /usr/sbin/nginx -c ${PROJECT_DIR}/misc/docker/mobile/nginx/nginx.conf -g "daemon off;"
elif [ ${MODE} = "local" ]; then
  rsync -avr ${PROJECT_DIR}/ /tmp/build/
  echo "Check build directory to access built project"
  echo "Do not restart the container as it will forcelly override the content"
  echo "Commit first !!!"
elif [ ${MODE} = "apk" ]; then
  echo 'Not implemented yet'
else
  help
fi

echo "Finished successfully"

