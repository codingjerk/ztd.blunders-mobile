app.controller('TrainingCtrl', function($rootScope, $scope, $state, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $timeout) {
    $scope.token = function() {
        //This function redirects to login page if token not exist
        if(!token.exist())
          $state.go('login');

        return token.get()
    }

    function updateInfoView(info) {
        $timeout(function () {
            $scope.info = info;
        });
    }

    $scope.vote = function(vote) {
        if (!$scope.blunderId) return;
        if ($scope.isTriggered('voteLock')) return;

        blunderId = $scope.blunderId

        buffer.blunder.vote({
            token: $scope.token(),
            blunderId: $scope.blunderId,
            vote: vote,
            onAnimate: function(state) {
                $scope.triggerSemaphore({
                  networkBusy: state,
                  voteLock: state
                })
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                if (blunderId != $scope.blunderId)
                    return; // User skipped this blunder, no need to update view

                updateInfoView(result.data);
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    }

    $scope.favorite = function() {
        if (!$scope.blunderId) return;
        if ($scope.isTriggered('favoriteLock')) return;

        blunderId = $scope.blunderId

        buffer.blunder.favorite({
            token: $scope.token(),
            blunderId: $scope.blunderId,
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state,
                favoriteLock: state
              })
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                if (blunderId != $scope.blunderId)
                    return; // User skipped this blunder, no need to update view

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
                $timeout(function () {
                    $rootScope.$emit("analyze.hide");
                    $scope.blunderId = blunder.id;
                    $scope.unlockedInfo = pack.unlockedInfo()
                    $scope.packBlundersInfo = pack.packBlundersInfo()
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
                    $timeout(function () {
                        $scope.status.onClick = function() {
                            $scope.blunderId = null;

                            board.nextBlunder();
                        }
                    });

                    return;
                }

                $timeout(function () {
                    $scope.status = stateNameToState[statusName];
                });
            },
            onUserRatingChanged: function(rating) {
                $scope.setUserRating(rating)
            },
            onInfoChanged: function(info) {
                updateInfoView(info);
            },
            onTokenRefused: function() {
                console.log("Token refused") //TODO: check if fail!!!
                $state.go('login');
            },
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state
              })
            },
            onTimerUpdate: function(value) {
                // @TODO: now not used by app
            },
            showAnalyze: function(boardId, pv) {
                $rootScope.$emit( "analyze.show", boardId, pv);
            },
            token: $scope.token, // This function redirects to login page on fail so need controller state
        });
    };

    $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
        if (to.name === 'training') {
            $scope.startGame();
        }
    });

    $scope.$on('$ionicView.enter', function(){
      //disable accessing side menu by dragging
      $ionicSideMenuDelegate.canDragContent(false);
    });
    $scope.$on('$ionicView.leave', function(){
        $ionicSideMenuDelegate.canDragContent(true);
    });

    window.onresize = function(event) {
        $ionicSlideBoxDelegate.update();
    };
});
