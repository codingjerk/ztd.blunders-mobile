app.controller('PackCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicLoading, $ionicPopup, $ionicPlatform, $timeout) {
  $scope.unlockedInfo = pack.unlockedInfo()
  $scope.packBlundersInfo = pack.packBlundersInfo()

  $scope.unlockedSpinning = undefined

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
    meta = {typeName:selected.type_name,args:selected.args}

    $scope.unlockedSpinning = selected.$loki
    pack.unlock(meta)
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

  /*
   * This method blocks user input until no packs in local database.
   * It can confuse new user when he starts the application for the first time
   * without internet connection.
   */
  $scope.showNoPacksPopup = function() {
    // Setup the loader
    $ionicLoading.show({
      template: '<p>Downloading puzzles from central server...</p><p>Make sure you connected to internet.</p><div class="ion-load-c ion-spin-animation text-300p"></div>',
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  }

  /* We must ensure cordova is properly loaded and then lunch this code,
     which will trigger database loading from the disk if needed.
     See loki-cordova-fs-adapter.
     If we will use stateChangeSuccess to trigger this, database will failed to
     in the case user starts the application with token existing
   */
  $ionicPlatform.ready(function() {
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
        if(state) {
          $scope.showNoPacksPopup()
        }
        else {
          $timeout(function () {
            $ionicLoading.hide();
          })
        }
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state,
          packLock: state
        })
      }
    })
  });

  $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
    if (!token.exist())
      return

    pack.restart()
  })

});
