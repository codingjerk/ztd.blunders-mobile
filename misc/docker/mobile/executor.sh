#!/bin/bash

PROJECT_DIR=/root/blunders/ztd.blunders-mobile

cd ${PROJECT_DIR} && \
git pull && \
ionic setup sass #&& \
#cordova build --release android

echo "Copying build result to external lib"
rsync -ar --progress --delete ${PROJECT_DIR}/www/ /root/build/

echo "Finished successfully"

