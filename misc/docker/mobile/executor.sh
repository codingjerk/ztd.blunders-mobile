#!/bin/bash

PROJECT_DIR=/home/blunders/ztd.blunders-mobile

MODE=$1
PASSPHRASE=$2

function help {
  echo 'web   - access on port 8080 by web server from within a container' 
  echo 'local - build a project and use nginx to show it'
  echo 'apk   - build an APK and copies it to build/'
  echo 'help  - show this help'
}

for i in "$@"
do
case $i in
    -m=*|--mode=*)
      export MODE="${i#*=}"
      shift # past argument=value
      ;;
    -p=*|--passphrase=*)
      export PASSPHRASE="${i#*=}"
      shift # past argument=value
      ;;
    *)
      echo "Unknown option met: ${i}"
      help
      exit 1
      ;;
esac
done

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
  if [ -z "${PASSPHRASE}" ]; then
    echo "Passphrase is missed"
    exit 1
  fi
  KEY=/run/secrets/free.keystore
  ZIPALIGN=$(find /opt/AndroidSDK/ -name zipalign)

  cordova build --release android && \
  cp ./platforms/android/build/outputs/apk/android-release-unsigned.apk ./ && \
  echo "${PASSPHRASE}" | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${KEY} ./android-release-unsigned.apk alias_name && \
  ${ZIPALIGN} -v 4 ./android-release-unsigned.apk ./blunders-signed.apk && \
  rsync -av ./blunders-signed.apk /tmp/build/
  
else
  help
fi

echo "Finished successfully"

