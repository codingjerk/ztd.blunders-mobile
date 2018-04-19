"use strict";

app.controller('LoginCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate) {
    if (token.exist()) {
      $state.go('training');
    }

    $scope.authInProgress = false;  //TODO: is needed????

    $scope.goToLogin = function() {
        $ionicSlideBoxDelegate.slide(0);
    };

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.slide(1);
    };

    $scope.goToValidate = function() {
        $ionicSlideBoxDelegate.slide(2);
    };

    $scope.login = function(username, password) {
        if ($scope.isTriggered('loginLock')) return;

        buffer.session.login({
            username: username,
            password: password,
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state,
                loginLock: state
              })
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                token.set(result.token)
                $state.go('training');
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.validate = function(username, password, email) {
        if ($scope.isTriggered('loginLock')) return;

        buffer.session.validate({
            username: username,
            password: password,
            email: email,
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state,
                loginLock: state
              })
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                $scope.goToValidate()
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.signup = function(username, password, email, validation_code) {
        if ($scope.isTriggered('loginLock')) return;

        buffer.session.signup({
            username: username,
            password: password,
            email: email,
            validation_code: validation_code,
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state,
                loginLock: state
              })
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                token.set(result.token)
                $state.go('training');
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
        // No need to show rating when unlogining
        if (to.name === 'login') {
          // cannot get to side menu by swapping left
          $ionicSideMenuDelegate.canDragContent(false);

          $scope.goToLogin()
          $scope.setUserRating('-')
        }
    });
});
