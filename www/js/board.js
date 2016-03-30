var board = {};

board.init = function(options) {
    var counter = utils.counter(1000, function () {
        var totalSeconds = counter.total();

        var formatted = utils.timePrettyFormat(totalSeconds);

        options.onTimerUpdate(formatted);
    });

    function processError(data) {
        if (data.message === 'Invalid API token') {
            options.onTokenRefused();
            return;
        }

        notify.error(data.message);
    }

    (function updateUserRating() {
        buffer.session.rating({
          token: options.token(),
          onSuccess: function(result) {
              if (result.status !== 'ok') {
                  return processError(result);
              }
              options.onUserRatingChanged(result.rating);
          },
          onFail: function(result) {
              // Just ignore rating error, leave old rating as is
              //notify.error("Can't connect to server.<br>Check your connection");
          }
        });
    })();

    (function initGame() {
        function getBlunder(next) {
            buffer.blunder.get({
              token: options.token(),
              onSuccess: function(result) {
                  if (result.status !== 'ok') {
                      return processError(result);
                  }
                  var data = result.data;

                  buffer.blunder.info({
                    token: options.token(),
                    blunderId: data.id,
                    onSuccess: function(result) {
                        if (result.status !== 'ok') {
                            return processError(result);
                        }
                        options.onInfoChanged(result.data);
                    },
                    onFail: function(result) {
                        notify.error("Can't connect to server.<br>Check your connection");
                    }
                  })
                  next(data);
              },
              onFail: function(result) {
                  notify.error("Can't connect to server.<br>Check your connection");
              },
              onAnimate: options.onAnimate
            })
        }

        function validateBlunder(pv, blunder, next) {
          buffer.blunder.validate({
            token: options.token(),
            blunderId: blunder.id,
            pv: pv,
            spentTime: counter.total(),
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    processError(result);
                } else {
                    options.onUserRatingChanged(result.data.elo);
                }

                next();
            },
            onFail:function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            },
            onAnimate: options.onAnimate
          })
        }

        function startGame(blunder) {
            options.onBlunderChanged(blunder);

            var highlightClasses = [
                'ai-move-hightlight',
                'player-move-hightlight',
                'success-move-hightlight',
                'fail-move-hightlight'
            ];

            var gameStatusList = {
                'fail': {
                    terminate: true,
                },
                'success': {
                    terminate: true,
                },
                'white-move': {
                    terminate: false,
                },
                'black-move': {
                    terminate: false,
                },
                'ready-to-new-game': {
                    terminate: true,
                }
            }

            var game = new Chess(blunder.fenBefore);
            var chessboard = new Chessboard(
                options.id,
                {
                    position: blunder.fenBefore,
                    eventHandlers: {
                        onPieceSelected: pieceSelected,
                        onMove: pieceMove
                    }
                }
            );

            makeAiMove(blunder.blunderMove);

            function updateStatus(statusName) {
                var status = gameStatusList[statusName];

                chessboard.enableUserInput(!status.terminate);

                options.onStatusChanged(statusName);

                if (status.terminate) {
                    validateBlunder(game.history(), blunder, function() {
                        counter.stop();
                        options.onStatusChanged('ready-to-new-game');
                    });
                }
            }

            function removeAllHightlints() {
                highlightClasses.forEach(function(c) {
                    $('.' + c).removeClass(c);
                })
            }

            function highlightSquare(square, highlightClass) {
                var squareToId = ChessUtils.convertNotationSquareToIndex
                var squareId = 'board_chess_square_' + squareToId(square);
                $('#' + squareId).addClass(highlightClass);
            }

            function highlightMove(move, highlightClass) {
                removeAllHightlints();

                highlightSquare(move.from, highlightClass);
                highlightSquare(move.to, highlightClass);
            }

            function makeAiMove(move) {
                var chessMove = game.move(move);
                chessboard.setPosition(game.fen());
                var turnStatus = (game.turn() === 'w')? 'white-move': 'black-move';
                updateStatus(turnStatus);

                highlightMove(chessMove, 'ai-move-hightlight');
            }

            function checkLines() {
                var rightLine = [blunder.blunderMove].concat(blunder.forcedLine);
                var userLine = game.history();
                var rightLineTruncated = rightLine.slice(0, userLine.length);

                if (userLine.toString() !== rightLineTruncated.toString()) {
                    updateStatus('fail');
                    return 'fail';
                } else if (userLine.toString() === rightLine.toString()) {
                    updateStatus('success');
                    return 'success';
                }

                return 'in-progress';
            }

            function pieceMove(move) {
                var chessMove = game.move({
                    from: move.from,
                    to: move.to,
                    promotion: 'q'
                });

                var gameStatus = checkLines();
                if (gameStatus === 'fail') {
                    game.undo();

                    var rightMove = blunder.forcedLine[game.history().length - 1];
                    chessMove = game.move(rightMove);

                    highlightMove(chessMove, 'success-move-hightlight');

                    return chessboard.fen();
                } else if (gameStatus === 'success') {
                    highlightMove(chessMove, 'success-move-hightlight');
                } else {
                    highlightMove(chessMove, 'player-move-hightlight');

                    setTimeout(function() {
                        makeAiMove(blunder.forcedLine[game.history().length - 1]);
                    }, 500);
                }

                return game.fen();
            }

            function pieceSelected(square) {
                return game.moves({square: square, verbose: true}).map(function(e) {
                    return ChessUtils.convertNotationSquareToIndex(e.to);
                });
            }

            counter.start();
        }

        board.nextBlunder = function() {
            getBlunder(startGame);
        };

        new Chessboard('board', ChessUtils.FEN.emptyId);

        board.nextBlunder();
    })();
}
