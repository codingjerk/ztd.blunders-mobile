
# Source: http://ionicframework.com/docs/guide/publishing.html

# Run this script in root app directory, the same as git root
# source ./build/build.sh /path/to/key
# Don't forget to edit id in config.xml to match correct version(io.ztd.blunders.free for example)
# Don't forget to increase version before production

if [ -z "$1" ]; then
    echo "Argument missed - google key"
    exit 1
fi

KEY=$1

rm -f build/*.apk

cordova build --release android
# Enabling FS adapter for LokiJS
# If not installed well, will not show permission for Local storage during installation
bower install lokijs --save
cordova plugin add cordova-plugin-file

cp ./platforms/android/build/outputs/apk/android-release-unsigned.apk build/

echo 'Place app key into build directory. Rename it to ztd.blunders-mobile.keystore if need'
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${KEY} ./build/android-release-unsigned.apk alias_name

echo 'We assume sdk root directory is /opt/android-sdk, as is in Arch linux. Change if needed'
/opt/android-sdk/build-tools/23.0.2/zipalign -v 4 ./build/android-release-unsigned.apk ./build/blunders-signed.apk

telegram-cli -W -e "send_document @jackalsh ./build/blunders-signed.apk"
