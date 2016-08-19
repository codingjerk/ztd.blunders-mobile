# Ztd.Blunders Mobile

## Try it
Ztd.Blunders available on [chessblunders.org](https://chessblunders.org) and this is our main server.

Also you can find us on Google Play and (soon) on App Store.

## Mobile client
Ztd.Blunders Mobile is just cross-platform mobile client, written on JavaScript with [Ionic Framework](http://ionicframework.com). To use this client you need working [Ztd.Blunders Web](https://bitbucket.org/ziltoidteam/ztd.blunders-web) server.

## Installation
You can compile application if you want to:

```
#!bash
git submodule init
git submodule update
cordova platform add android
```
Copy keystore to */build/ztd.blunders-mobile.keystore*. If you don't have keystore or you just don't know what it is please [read this article](http://ionicframework.com/docs/guide/publishing.html).
Run following script to compile application:
```
#!bash
/bin/bash build/build.sh 
```


## Why we want money for Open Source App?
Since we are releasing source code under the MIT license, you are free to compile and use the application without any violations.

Paid app in the store - just an easy way to donate a small amount for us and works for the server, receiving a nice bonus - the last stable working assembly.