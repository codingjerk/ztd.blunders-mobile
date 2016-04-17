app.controller('AnalyzeCtrl', function($rootScope, $scope, $state, $ionicSlideBoxDelegate, $timeout) {
    $scope.blunderId = undefined
    $scope.pv = undefined

    $scope.analyzeShownStatus = false
    $scope.isAnalyzed = false
    $scope.analyzedData = []

    $scope.analizeInProgress = function() {
      return $scope.isTriggered('analyzeBusy');
    }

    $scope.analyzeClicked = function() {
      if ($scope.analizeInProgress()) return;

      api.blunder.analyze({
        token: $scope.token(),
        blunderId: $scope.blunderId,
        line: $scope.pv,
        onSuccess: function(result) {
          if (result.status !== 'ok') {
              notify.error(result.message);
              return;
          }

          $scope.isAnalyzed = true
          $scope.analyzedData = result.data.calculations;
        },
        onFail: function(result) {
          notify.error("Can't connect to server.<br>Check your connection");
        },
        onAnimate: function (state) {
          $scope.triggerSemaphore({
            networkBusy: state,
            analyzeBusy: state
          })
        }
      })

    }

    $rootScope.$on("analyze.hide",function() {
      $scope.analyzeShownStatus = false
      $scope.isAnalyzed = false
    })

    $rootScope.$on("analyze.show",function(event, blunderId, pv) {
      $scope.blunderId = blunderId
      $scope.pv = pv
      $scope.analyzeShownStatus = true
      $scope.isAnalyzed = false
    })

})
