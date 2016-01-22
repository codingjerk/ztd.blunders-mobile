app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    if (localStorage.getItem('api-token')) $state.go('training');

    $scope.authInProgress = false;

    $scope.login = function(username, password) {
        api.session.login({
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

                localStorage.setItem('api-token', result.token);
                $state.go('training');
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    };

    $scope.signup = function(username, password, email) {
        api.session.signup({
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

                localStorage.setItem('api-token', result.token);
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
