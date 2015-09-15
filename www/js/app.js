var app = angular.module('Ztd.Blunders Mobile', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    });

    $stateProvider.state('training', {
        url: '/training',
        templateUrl: 'training.html',
        controller: 'TrainingCtrl'
    });

    $urlRouterProvider.otherwise('/login');
});

app.controller('MainCtrl', function($scope, $state, $ionicSideMenuDelegate) {
    $scope.isTokenExist = function() {
        return localStorage.getItem('api-token') !== null;
    };

    $scope.toggleMenu = function() {
        if (!$scope.isTokenExist()) return;

        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.logout = function() {
        localStorage.removeItem('api-token');
        $state.go('login');
        $ionicSideMenuDelegate.toggleLeft(false);
    };
});

app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    $scope.authInProgress = false;

    $scope.login = function(username, password) {
        sync.ajax({
            url: settings.url('session/login'),
            crossDomain: true,
            data: {
                username: username,
                password: password,
            },
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#login-button').toggleClass('disabled', state);
                $('#signup-button').toggleClass('disabled', state);
            },
            onDone: function(result) {
                console.log(result);
                if (result.status === 'ok') {
                    localStorage.setItem('api-token', result.token);
                    $state.go('training')
                }
            }
        });
    };

    $scope.signup = function(username, password, email) {
        sync.ajax({
            url: settings.url('session/signup'),
            crossDomain: true,
            data: {
                username: username,
                password: password,
                email: email || ''
            },
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#login-button').toggleClass('disabled', state);
                $('#signup-button').toggleClass('disabled', state);
            },
            onDone: function(result) {
                console.log(result);
                if (result.status === 'ok') {
                    localStorage.setItem('api-token', result.token);
                    $state.go('training')
                }
            }
        });
    };

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.next();
    };
});

app.controller('TrainingCtrl', function($scope, $state) {
    $scope.whitePlayer = 'Kasparov M. I.';
    $scope.blackPlayer = 'Kasparov M. I.';

    $scope.value = 1000;

    $scope.$on('$ionicView.loaded', function() {
        new Chessboard('board', ChessUtils.FEN.initial);
    });
});
