app.controller('PackCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicPopup, $ionicPlatform, $timeout) {
  $scope.unlockedInfo = pack.unlockedInfo()
  $scope.packBlundersInfo = pack.packBlundersInfo()

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

  $scope.unlockPack = function(meta) {
    if ($scope.isTriggered('packLock')) return;

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
          });
      },
      goChessboardSlide: function() {
        $ionicSlideBoxDelegate.slide(1)
      },
      reloadGame: function() {
        $scope.startGame()
      },
      onAnimate: function(state) {
        $scope.triggerSemaphore({
          networkBusy: state,
          packLock: state
        })
      }
    })
  });

});
