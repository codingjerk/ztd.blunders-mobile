"use strict";

app.controller('TrainingCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicPopup, $timeout) {

    $scope.dateNiceFormat = utils.dateNiceFormat

    $scope.getBlunderInfoHistory = function() {
        var history = $scope.info.my.history;

        if (history.length == 0) {
            return "You see this puzzle for a first time"
        }

        var maximum = history.maximum(function(a,b) {
            return new Date(a.date) < new Date(b.date)
        })

        var lastDateString = $scope.dateNiceFormat(maximum.date)

        if (history.length == 1) {
            return "You " + ((maximum.score == 1) ? 'correctly solved' : "failed") +
                   " this puzzle last time at " + lastDateString;
        }

        if (history.length >= 2) {
            return "You was challenged this puzzle " + history.length + " times at the past." +
                   " Last time was at " + lastDateString +
                   " when you " + ((maximum.score == 1) ? 'correctly solved' : "failed") + " it";
        }

        return "Unknown" // Never reach here
    }

    $scope.getBlunderInfoCommentsOrderBy = function(comment) {
        return new Date(comment.date).getTime();
    }

    $scope.getBlunderInfoDistributionView = function(column, variation) {
        if(column == 'line') {
            return variation.line.join(' ')
        } else if(column == 'times') {
            if(variation.total == 0)
                return '0%'

            return Math.round(100.0*(variation.times / $scope.info.history.total)) + "%"
        } else if(column == 'icon my history') {
            var found = $scope.info.my.history.find(function(element, index, array){
                return element.line.equals(variation.line)
            })

            if(found) {
                return 'ion-person'
            }
        } else if(column = 'icon correct') {
            if(variation.hasOwnProperty('correct') && variation.correct == true )
                return 'ion-checkmark'
        }

        return "unknown"
    }

    $scope.getBlunderInfoDistributionOrderBy = function(variation) {
        return (- variation.times);
    }

    function updateInfoView(info) {
        $timeout(function () {
            $scope.info = info;
        });
    }

    $scope.vote = function(vote) {
        if (!$scope.blunderId) return;
        if ($scope.isTriggered('voteLock')) return;

        var blunderId = $scope.blunderId

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

        var blunderId = $scope.blunderId

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

    $scope.comment = function() {
      if (!$scope.blunderId) return;
      if ($scope.isTriggered('commentLock')) return;

      var blunderId = $scope.blunderId

      $scope.commentData = {};

      // An elaborate, custom popup
      var popupComment = $ionicPopup.show({
        template: '<textarea rows="5" ng_model="commentData.text" placeholder="What do you think about this position?">',
        title: 'Comment',
        //subTitle: 'What do you think about this position?',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Post</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.commentData.text) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.commentData.text;
              }
            }
          }
        ]
      });

      popupComment.then(function(res) {
        if(res == undefined) return;

        buffer.comment.send({
          token: $scope.token(),
          blunderId: $scope.blunderId,
          commentId: 0, // This is father comment, not supported yet for mobile
          userInput: res,
          onAnimate: function(state) {
            $scope.triggerSemaphore({
              networkBusy: state,
              commentLock: state
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
        })
      });
     };

    $scope.successRate = function(info) {
        var result = 0;

        if (info && info.totalTries)
            result = 100*(info.successTries / info.totalTries);

        return result.toFixed(0);
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

    $scope.popupPromotion = function(){

      return new Promise(function(resolve) {
          var popupPromotion = $ionicPopup.show({
            template: '',
            scope: $scope,
            buttons: [
              {
                text: '<i class = "no-padding icon"><img src="img/pieces/wN.svg"></i>',
                onTap: function(e) {
                  resolve('n');
                }
              },
              {
                text: '<i class = "button-full icon"><img src="img/pieces/wB.svg"></i>',
                onTap: function(e) {
                  resolve('b');
                }
              },
              {
                text: '<i class = "icon"><img src="img/pieces/wR.svg"></i>',
                onTap: function(e) {
                  resolve('r');
                }
              },
              {
                text: '<i class = "icon"><img src="img/pieces/wQ.svg"></i>',
                onTap: function(e) {
                  resolve('q');
                }
              },
            ]
          });
        });
    }

    $scope.startGame = function() {
        board.init({
            id: 'board',
            onBlunderChanged: function(blunder) {
                $timeout(function () {
                    $scope.$emit("analyze.hide");
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
            onAnimate: function(state) {
              $scope.triggerSemaphore({
                networkBusy: state
              })
            },
            onTimerUpdate: function(value) {
                // @TODO: now not used by app
            },
            showAnalyze: function(blunderId, pv) {
                $scope.$emit( "analyze.show", blunderId, pv);
            },
            popupPromotion: function() {
              return $scope.popupPromotion()
            },
            processError: $scope.processError,
            token: $scope.token, // This function redirects to login page on fail so need controller state
        });
    };

    /*
     * Set up user rating when application starts
     * This function is self and once called when application starts
     * On fail we do not trigger an error, because this have negative
     * effect on user expirience
     */
    $scope.updateUserRating = function() {
      if(!token.exist())
        return;

      buffer.session.rating({
        token: $scope.token(),
        onSuccess: function(result) {
          if (result.status !== 'ok') {
            return $scope.processError(result);
          }
          $scope.setUserRating(result.rating);
        },
        onFail: function(result) {
          // Just ignore rating error, leave old rating as is
          //notify.error("Can't connect to server.<br>Check your connection");
        }
      });
    }

    $scope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
        if (to.name === 'training') {
            // cannot get to side menu by swapping left
            $ionicSideMenuDelegate.canDragContent(false);

            $scope.updateUserRating()
        }
    });
});
