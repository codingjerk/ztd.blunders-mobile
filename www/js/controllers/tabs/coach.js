"use strict";

app.controller('CoachTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicLoading, $ionicPopup, $ionicPlatform, $timeout) {

  $scope.coachMessagesInfo = []

  message.init({
    token: $scope.token,
    processError: $scope.processError,
    onMessagesChanged: function() {
        $timeout(function () {
            $scope.coachMessagesInfo = message.coachMessagesInfo()
        });
    },
    onAnimate: function(state) {
      $scope.triggerSemaphore({
        networkBusy: state
      })
    }
  })

  $scope.reloadPlayTab = function() {
    $timeout(function () {
      //if ($scope.coachMessagesInfo.length == 0)
        $scope.coachMessagesInfo = message.coachMessagesInfo()
    })
  }

  $scope.selectMessage = function(message_id, selected) {
    message.selectMessage(message_id, selected)
  }

});
