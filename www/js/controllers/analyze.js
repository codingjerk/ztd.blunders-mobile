app.controller('AnalyzeCtrl', function($rootScope, $scope, $state, $ionicSlideBoxDelegate, $timeout) {
    $scope.boardId = undefined
    $scope.pv = undefined

    $scope.analyzeShownStatus = false
    $scope.isAnalyzed = false
    $scope.analyzedData = [{
        'score': 1.44,
        'pv'   : '1. e2-e4 2. d7-d5 1. e2-e4 2. d7-d5 1. e2-e4 2. d7-d5 ',
        'css'  : ''
      },
      {
        'score': -5.32,
        'pv'   : '1. e2-e4 2. d7-d5 1. e2-e4 2. d7-d5 1. e2-e4 2. d7-d5 ',
        'css'  : ''
      }
    ]

    $scope.analyzeClicked = function() {

      console.log("Analyze clicked")
      setTimeout(function() {
          $timeout(function() {
            $scope.isAnalyzed = true
            console.log($scope.boardId, $scope.pv)
          })
      }, 5000)

    }

    $rootScope.$on("analyze.hide",function() {
      console.log("HIDE")
      $scope.analyzeShownStatus = false
      $scope.isAnalyzed = false
    })

    $rootScope.$on("analyze.show",function(event, boardId, pv) {
      $scope.boardId = boardId
      $scope.pv = pv
      console.log("SHOW")
      $scope.analyzeShownStatus = true
      $scope.isAnalyzed = false
    })

})
