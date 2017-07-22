"use strict";

app.controller('PackTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicLoading, $ionicPopup, $ionicPlatform, $timeout) {
  $scope.unlockedInfo = pack.unlockedInfo()
  $scope.packBlundersInfo = pack.packBlundersInfo()

  $scope.unlockedSpinning = undefined

  $scope.argsSelect = {}

  $scope.removePack = function(packId) {
    if ($scope.isTriggered('packLock')) return;

    if(!$scope.canRemovePack(packId))
      return;

    var confirmPopup = $ionicPopup.confirm({
         title: 'Removing pack',
         template: 'Do you want to fail this pack?'
       });

   confirmPopup.then(function(res) {
     if(res) {
       pack.remove(packId)
     }
   });
  }

  $scope.unlockPack = function(selected) {
    if ($scope.isTriggered('packLock')) return;

    // Prepare args due to user selects
    if (selected.args != undefined) {
        var final_args = {}
        for (var key in selected.args) {
            if (selected.args.hasOwnProperty(key)) {
                final_args[key] = $scope.argsSelect[selected.type_name][key].value
            }
        }
    }

    var meta = {typeName:selected.type_name,args:final_args}

    console.log($scope.argsSelect);

    //$scope.unlockedSpinning = selected.$loki
    //pack.unlock(meta)
  }

  $scope.selectPack = function(packId) {
    pack.select(packId)
  }

  $scope.isSelectedPack = function(packId) {
    return pack.isSelected(packId)
  }

  $scope.canRemovePack = function(packId) {
    return pack.canRemove(packId)
  }

  /**
   * Transform data for unlockedPacks, received from server to array,
   * suitable for ng-repeat.
   */
  $scope.listArgs = function(pack) {
      var args = pack.args

      if(args == undefined)
        return []

      var keys = Object.keys(args);
      var values = keys.map(function(key) {
          var dict = args[key]
          dict['property'] = key
          return dict;
      });

      values.forEach(function(value) {
              if (pack.type_name in $scope.argsSelect == false)
                  $scope.argsSelect[pack.type_name] = {}

              if (value.property in $scope.argsSelect[pack.type_name] == false)
                  $scope.argsSelect[pack.type_name][value.property] = {}

              if ('value' in $scope.argsSelect[pack.type_name][value.property] == false) {
                  $timeout(function () {
                      $scope.argsSelect[pack.type_name][value.property].value = value.default
                  })
              }
  })

      return values;
  }

  /*
   * This method blocks user input until no packs in local database.
   * It can confuse new user when he starts the application for the first time
   * without internet connection.
   */
  $scope.showNoPacksPopup = function(state) {
    if(state) {
      $ionicLoading.show({
        template: '<p>Downloading puzzles from central server...</p><p>Make sure you connected to internet.</p><div class="ion-load-c ion-spin-animation text-300p"></div>',
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }
    else {
      $timeout(function () {
        $ionicLoading.hide();
      })
    }
  }

  /* We must ensure cordova is properly loaded and then lunch this code,
     which will trigger database loading from the disk if needed.
     See loki-cordova-fs-adapter.
     If we will use stateChangeSuccess to trigger this, database will failed to
     in the case user starts the application with token existing
   */
  $scope.startPacks = function() {
    if (!token.exist()) // TODO: may be redirect to login?
      return

    pack.init({
      token: $scope.token,
      onPacksChanged: function() {
          $timeout(function () {
              $scope.unlockedInfo = pack.unlockedInfo()
              $scope.packBlundersInfo = pack.packBlundersInfo()
              $scope.unlockedSpinning = undefined
          });
      },
      goChessboardSlide: function() {
        $ionicTabsDelegate.select(1)
      },
      reloadGame: function() {
        $scope.startGame()
      },
      onEmptyDatabase: function(state) {
        $scope.showNoPacksPopup(state)
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state,
          packLock: state
        })
      }
    })
  };

  var main = function(callback) {
    lstorage.init({
      token: $scope.token
    },function(){
      $scope.startPacks();
      $scope.startGame();

      if (callback) callback()
    })
  }

  /* Here is the entrypoint to all the application.
   * There is huge difference between running in browser and
   * mobile device, because we use different lokijs storage engine.
   * We need to wait for ionic platform readyness to initialize
   * loki storage, otherwise it will simply fail.
   * After this we call for pack driver, which use lokijs as dependence.
   * ionic readiness -> pack driver -> application controllers
   */

  $ionicPlatform.ready(function() {
    if (!token.exist())
      return

    main(function() {
      // After full initialization only we allow method
      // $scope.$on('$stateChangeSuccess' to reload
      $scope.triggerSemaphore({
        cordovaReady: true // Never to turn off
      })
    })
  })

  // We need this if user log out and re-login, need to reload database
  $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
      if (to.name === 'training') {
        if (!token.exist())
          return

        if(!$scope.isTriggered('cordovaReady'))
          return; // To avoid duplicates with $ionicPlatform.ready

        main()
      }
  });

});
