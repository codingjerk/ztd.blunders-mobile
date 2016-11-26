"use strict";

app.controller('MainCtrl', function($scope, $state, $ionicSideMenuDelegate, $timeout) {
    $scope.toggleMenu = function() {
        if (!token.exist()) return;

        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.logout = function() {
        token.remove()
        $state.go('login');
        $ionicSideMenuDelegate.toggleLeft(false);
    };

    /*
     * This code is common mechanism handles semaphore(lock) API
     * for various uses in the application
     */
    $scope.lockSemaphore = {
      networkBusy: 0,
      voteLock: 0,
      favoriteLock: 0,
      commentLock:0,
      loginLock: 0,
      packLock: 0,
      analyzeBusy: 0
    }

    $scope.triggerSemaphore = function(status) {
      $timeout(function () {
        if('networkBusy' in status)
          $scope.lockSemaphore['networkBusy'] += (status['networkBusy'] ? 1 : -1)
        if('voteLock' in status)
          $scope.lockSemaphore['voteLock'] += (status['voteLock'] ? 1 : -1)
        if('favoriteLock' in status)
          $scope.lockSemaphore['favoriteLock'] += (status['favoriteLock'] ? 1 : -1)
        if('commentLock' in status)
          $scope.lockSemaphore['commentLock'] += (status['commentLock'] ? 1 : -1)
        if('loginLock' in status)
          $scope.lockSemaphore['loginLock'] += (status['loginLock'] ? 1 : -1)
        if('packLock' in status)
          $scope.lockSemaphore['packLock'] += (status['packLock'] ? 1 : -1)
        if('analyzeBusy' in status)
          $scope.lockSemaphore['analyzeBusy'] += (status['analyzeBusy'] ? 1 : -1)
      })
    }

    $scope.isTriggered = function(key) {
      return $scope.lockSemaphore[key] > 0
    }

    $scope.userRating = '-'

    $scope.setUserRating = function(rating) {
      $timeout(function () {
        $scope.userRating = rating
      })
    }

    $scope.getUserRating = function() {
      return $scope.userRating
    }

    /*
     * Function returns current user token stored in local cache
     * If for some reason this token is not available, user is being
     * redirected to the login screen
     */
    $scope.token = function() {
        //This function redirects to login page if token not exist
        if(!token.exist())
          $state.go('login');

        return token.get()
    }

    /*
     * This funtion handles case when some error has thrown
     * Simpliest behaviour is to show an alert
     */
    $scope.processError = function(data) {
      if (data.message === 'Invalid API token') {
        $state.go('login');
        return;
      }

      notify.error(data.message);
    }
});
