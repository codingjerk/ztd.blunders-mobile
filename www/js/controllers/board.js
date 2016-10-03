app.controller('BoardCtrl', function($rootScope, $scope, $state, $timeout) {
  /*
   * This is HACK!!!
   * Without this, board not shown correctly, because it is drawn by jQuery.
   */
  $scope.startGame();
})
