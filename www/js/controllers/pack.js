app.controller('PackCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $timeout) {
  $scope.unlockedInfo = pack.unlockedInfo()
  $scope.packBlundersInfo = pack.packBlundersInfo()

  $scope.removePack = function(packId) {
    if(pack.locked())
      return;

    if(!$scope.canRemovePack(packId))
      return;

    pack.remove(packId)
  }

  $scope.unlockPack = function(meta) {
    if(pack.locked())
      return;

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

  $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
    if (!localStorage.getItem('api-token'))
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
      }
    })
  });

});
