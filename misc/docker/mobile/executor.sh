#!/bin/bash

PROJECT_DIR=/root/blunders/ztd.blunders-mobile

MODE=$1

function help {
  echo 'local - build a project and copies web version to build/'
  echo 'apk   - build an APK and copies it to build/'
  echo 'help  - show this help'
}

if [ -z "${MODE}" ]; then
  help
fi

if [ ${MODE} = "local" ]; then
  cd ${PROJECT_DIR} && \
  git pull && \
  ionic setup sass && \
  rsync -ar --progress --delete ${PROJECT_DIR}/www/ /root/build/
elif [ ${MODE} = "apk" ]; then
  cd ${PROJECT_DIR} && \
  git pull && \
  ionic setup sass && \
  echo 'Not implemented yet'
else
  help
fi

echo "Finished successfully"

