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

app.run(function($ionicPlatform, $ionicPopup, $state) {
    document.addEventListener("deviceready", function() {
        console.log('NOW AWAKE!!!');
        window.plugins.insomnia.keepAwake();
    }, false);

    if(localStorage.getItem('api-token')) {
        $state.go('training');
    } else {
        $state.go('login');
    }

    $ionicPlatform.registerBackButtonAction(function(event) {
        $ionicPopup.confirm({
            title: 'System warning',
            template: 'Are you sure you want to exit?'
        }).then(function(res) {
            if (res) {
                ionic.Platform.exitApp();
            }
        });
    }, 100);
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
    if (localStorage.getItem('api-token')) $state.go('training');

    $scope.authInProgress = false;

    $scope.login = function(username, password) {
        sync.ajax({
            url: settings.url('session/login'),
            crossDomain: true,
            data: {
                username: username || '',
                password: password || '',
            },
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
        sync.ajax({
            url: settings.url('session/signup'),
            crossDomain: true,
            data: {
                username: username || '',
                password: password || '',
                email: email || ''
            },
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

app.controller('TrainingCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    function updateInfoView(info) {
        $scope.$apply(function () {
            $scope.info = info;
        });
    }

    $scope.vote = function(vote) {
        if (!$scope.blunder_id) return;

        sync.ajax({
            url: settings.url('blunder/vote'),
            crossDomain : true,
            data: {
                token: localStorage.getItem('api-token'),
                blunder_id: $scope.blunder_id,
                vote: vote
            },
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#dislike-button').toggleClass('disabled', state);
                $('#like-button').toggleClass('disabled', state);
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                updateInfoView(result.data);
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    }

    $scope.favorite = function() {
        if (!$scope.blunder_id) return;

        sync.ajax({
            url: settings.url('blunder/favorite'),
            crossDomain : true,
            data: {
                token: localStorage.getItem('api-token'),
                blunder_id: $scope.blunder_id
            },
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
                $('#favorite-button').toggleClass('disabled', state);
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                updateInfoView(result.data);
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    }

    $scope.successRate = function(info) {
        var result = 0;

        if (info && info.totalTries) result = info.successTries / info.totalTries;

        return result.toFixed(1);
    }

    $scope.player = function(info, color) {
        if (!info || !info['game-info']) return '???';

        var result = (color === 'white')? info['game-info'].White: info['game-info'].Black;
        if (!result) return '???';

        return result;
    }

    $scope.elo = function(info, color) {
        if (!info || !info['game-info']) return '?';

        var result = (color === 'white')? info['game-info'].WhiteElo: info['game-info'].BlackElo;
        if (!result) return '?';

        return result;
    }

    $scope.startGame = function() {
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
                        viewText: 'Failed. Next',
                        viewClass: 'button-assertive',
                        terminate: true,
                        onClick: function() {}
                    },
                    'success': {
                        viewText: 'Success. Next',
                        viewClass: 'button-balanced',
                        terminate: true,
                        onClick: function() {}
                    },
                    'white-move': {
                        viewText: 'White to Move',
                        viewClass: 'button-white',
                        terminate: false,
                        onClick: function() {}
                    },
                    'black-move': {
                        viewText: 'Black to Move',
                        viewClass: 'button-dark',
                        terminate: false,
                        onClick: function() {}
                    }
                };

                if (statusName === 'ready-to-new-game') {
                    $scope.$apply(function () {
                        $scope.status.onClick = function() {
                            $scope.blunder_id = null;

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
                updateInfoView(info);
            },
            onTokenRefused: function() {
                $state.go('login');
            },
            onAnimate: function(state) {
                $('#loading-indicator').toggle(state);
            },
            onTimerUpdate: function(value) {
            	// @TODO: now not used by app
            }
        });
    };

    $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
        if (to.name === 'training') {
            $scope.startGame();
        }
    });

    window.onresize = function(event) {
        $ionicSlideBoxDelegate.update();
    };
});

