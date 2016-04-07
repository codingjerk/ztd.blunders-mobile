app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    if (token.exist()) {
      $state.go('training');
    }

    $scope.authInProgress = false;

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

    $scope.signup = function(username, password, email) {
        if ($scope.isTriggered('loginLock')) return;

        buffer.session.signup({
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
        $('#user-elo').html('-');
    });

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.next();
    };
});
