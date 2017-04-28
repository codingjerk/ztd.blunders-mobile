FROM library/centos

RUN yum install epel-release -y
RUN yum update -y

RUN yum install -y \
    git unzip \
    nodejs npm \
    java-1.8.0-openjdk java-1.8.0-openjdk-devel

RUN yum install -y \
    nginx

WORKDIR /opt/AndroidSDK
RUN curl https://dl.google.com/android/repository/tools_r25.2.3-linux.zip -o ./tools_r25.2.3-linux.zip && \
    unzip ./tools_r25.2.3-linux.zip && \
    ( sleep 5 && while [ 1 ]; do sleep 1; echo y; done ) | \
    /opt/AndroidSDK/tools/android update sdk --no-ui --all --filter tools,platform-tools,build-tools-25.0.2,android-25

ENV ANDROID_HOME=/opt/AndroidSDK
ENV  PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

RUN npm install -g cordova ionic bower gulp

RUN useradd -m blunders 
RUN usermod -a -G blunders nginx # nginx must read uwsgi sockets

USER blunders
ARG GIT_BRANCH
RUN git clone -b $GIT_BRANCH https://bitbucket.org/ziltoidteam/ztd.blunders-mobile.git /home/blunders/ztd.blunders-mobile
WORKDIR /home/blunders/ztd.blunders-mobile
RUN git submodule init && \
    git submodule update

#ADD ztd.blunders-mobile.keystore /home/blunders/ztd.blunders-mobile/build/ztd.blunders-mobile.keystore 

RUN cordova platform add android || echo "Ok"
RUN cordova plugin add cordova-plugin-splashscreen --save
RUN ionic resources --splash

RUN bower install lokijs --save
RUN cordova plugin add cordova-plugin-file --save
RUN ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git
RUN cordova plugin add https://github.com/EddyVerbruggen/Insomnia-PhoneGap-Plugin.git --save

RUN bower install angular-nvd3 --save

RUN cordova prepare

# Theoretically sass can change so you might want to rebuild sass
# each time into executor, hovewer, it is much faster to make it once
RUN ionic setup sass

RUN rm -rf www/third-party/lokijs/docs
RUN rm -rf www/lib/lokijs/docs

#RUN cordova build --release android

USER root
ADD executor.sh /root/executor.sh

EXPOSE 8080

ENTRYPOINT ["/root/executor.sh"]
CMD ["help"]
