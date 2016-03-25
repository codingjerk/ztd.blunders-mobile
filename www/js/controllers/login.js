app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    if (token.exist())
      $state.go('training');

    $scope.authInProgress = false;

    $scope.login = function(username, password) {
        buffer.session.login({
            username: username,
            password: password,
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#login-button').toggleClass('disabled', state);
                $('#signup-button').toggleClass('disabled', state);
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                token.set(result.token)
                pack.init() //Reinit the database
                $state.go('training');
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.signup = function(username, password, email) {
        buffer.session.signup({
            username: username,
            password: password,
            email: email,
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#login-button').toggleClass('disabled', state);
                $('#signup-button').toggleClass('disabled', state);
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                token.set(result.token)
                pack.init() //Reinit the database
                $state.go('training');
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.next();
    };
});
