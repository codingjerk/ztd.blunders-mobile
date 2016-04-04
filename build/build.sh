
# Source: http://ionicframework.com/docs/guide/publishing.html

# Run this script in root app directory, the same as git root
# source ./build/build.sh
# Don't forget to edit id in config.xml to match correct version(io.ztd.blunders.free for example)
# Don't forget to increase version before production

rm -f build/*.apk

cordova build --release android

cp ./platforms/android/build/outputs/apk/android-release-unsigned.apk build/

echo 'Place app key into build directory. Rename it to ztd.blunders-mobile.keystore if need'
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./build/ztd.blunders-mobile.keystore ./build/android-release-unsigned.apk alias_name

echo 'We assume sdk root directory is /opt/android-sdk, as is in Arch linux. Change if needed'
/opt/android-sdk/build-tools/23.0.2/zipalign -v 4 ./build/android-release-unsigned.apk ./build/blunders-signed.apk
