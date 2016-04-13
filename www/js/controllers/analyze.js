app.controller('AnalyzeCtrl', function($scope, $state, $ionicSlideBoxDelegate, $timeout) {
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

      $scope.isAnalyzed = true
    }
})
