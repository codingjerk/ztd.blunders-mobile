"use strict";

app.controller('CoachTabCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicTabsDelegate, $ionicLoading, $ionicPopup, $ionicPlatform, $timeout) {
  $scope.coachTabHidden = true; // by default hidden. Will be activared when connecting to coach websocket
  $scope.coachMessagesInfo = []

  if (settings.coach.enabled == false )
    return;

  message.init({
    token: $scope.token,
    processError: $scope.processError,
    onMessagesChanged: function() {
        $timeout(function () {
            $scope.coachMessagesInfo = message.coachMessagesInfo()
        });
    },
    onConnect: function() {
      $timeout(function () {
          $scope.coachTabHidden = false
          $scope.coachMessagesInfo = []
      });
    },
    onDisconnect: function() {
      $timeout(function () {
          $scope.coachTabHidden = true
          $scope.coachMessagesInfo = []
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
        $scope.coachMessagesInfo = message.coachMessagesInfo()
    })
  }

  $scope.selectMessage = function(message_id, selected) {
    message.selectMessage(message_id, selected)
  }

});
