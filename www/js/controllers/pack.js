app.controller('PackCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate) {
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
    new Promise(function(resolve){ //Without promise ''$apply already in progress' error
      pack.select(packId)
      resolve()
    }).then(function(){
      $scope.startGame()
    })
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
        $scope.$apply(function () {
            $scope.unlockedInfo = pack.unlockedInfo()
            $scope.packBlundersInfo = pack.packBlundersInfo()
        });
    },
    goChessboardSlide: function() {
      $ionicSlideBoxDelegate.slide(1)
    }

  })
});
