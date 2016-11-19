"use strict";

app.controller('PlayTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $timeout) {

  $scope.reloadPlayTab = function() {
    /*
     * Chessboard.js uses jQuery to update the board model.
     * This bad for ionic, so we need this function to be called each time
     * Play tab is shown to refresh the model.
     * Without this hack, board will be looking very weird
     * https://github.com/jtblin/angular-chart.js/issues/29
     */
    if($("#board").hasOwnProperty(length) == false) {
      $timeout(function(){
        $scope.startGame()
      });
    }
    else {
      $timeout(function(){
        window.dispatchEvent(new Event('resize'));
      });
    }
  }
})
