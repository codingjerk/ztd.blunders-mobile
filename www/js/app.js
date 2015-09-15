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
                    $state.go('training');
                }
            }
        });
    };

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.next();
    };
});

app.controller('TrainingCtrl', function($scope, $state) {
    $scope.dislike = function(blunder_id) {
        console.log('dislike', blunder_id);
    }

    $scope.favorite = function(blunder_id) {
        console.log('favorite', blunder_id);
    }

    $scope.like = function(blunder_id) {
        console.log('like', blunder_id);
    }

    $scope.successRate = function(info) {
        var result = 0;

        if (info && info.totalTries) result = info.successTries / info.totalTries;

        return result.toFixed(1);
    }

    $scope.player = function(info, color) {
        if (!info || !info['game-info']) return '???';

        var result = (color === 'white')? info['game-info'].WhitePlayer: info['game-info'].BlackPlayer;
        if (!result) return '???';

        return result;
    }

    $scope.elo = function(info, color) {
        if (!info || !info['game-info']) return '?';

        var result = (color === 'white')? info['game-info'].WhiteElo: info['game-info'].BlackElo;
        if (!result) return '?';

        return result;
    }

    $scope.$on('$ionicView.loaded', function() {
        board.init({
            id: 'board',
            onBlunderChanged: function(blunder) {
                $scope.$apply(function () {
                    $scope.blunder_id = blunder.id;
                });
            },
            onStatusChanged: function(statusName) {
                var stateNameToState = {
                    'fail': {
                        viewText: 'Failed. Next >>',
                        viewClass: 'failed-status',
                        onClick: function() {}
                    },
                    'success': {
                        viewText: 'Success. Next >>',
                        viewClass: 'success-status',
                        onClick: function() {}
                    },
                    'white-move': {
                        viewText: 'White to Move',
                        viewClass: 'white-to-move-status',
                        onClick: function() {}
                    },
                    'black-move': {
                        viewText: 'Black to Move',
                        viewClass: 'black-to-move-status',
                        onClick: function() {}
                    }
                };

                if (statusName === 'ready-to-new-game') {
                    $scope.$apply(function () {
                        $scope.status.onClick = function() {
                            board.nextBlunder();
                        }
                    });

                    return;
                }

                $scope.$apply(function () {
                    $scope.status = stateNameToState[statusName];
                });
            },
            onUserRatingChanged: function(rating) {
                $('#user-elo').html(rating);
            },
            onInfoChanged: function(info) {
                $scope.$apply(function () {
                    $scope.info = info;
                });
            },
            onTokenRefused: function() {
                $state.go('login');
            }
        });
    });
});
