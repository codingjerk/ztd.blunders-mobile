app.controller('PackCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $timeout) {
  $scope.unlockedInfo = pack.unlockedInfo()
  $scope.packBlundersInfo = pack.packBlundersInfo()

  $scope.removePack = function(packId) {
    console.log('Remove' + packId)
    pack.remove(packId)
  }

  $scope.unlockPack = function(meta) {
    pack.unlock(meta)
  }

  $scope.selectPack = function(packId) {
    console.log('Select' + packId)
    pack.select(packId)
  }

  $scope.isSelectedPack = function(packId) {
    return pack.isSelected(packId)
  }

  $scope.canRemovePack = function(packId) {
    return pack.canRemove(packId)
  }

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
