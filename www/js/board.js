var board = {};

board.init = function(options) {
    var counter = utils.counter(1000, function () {
        var totalSeconds = counter.total();
        
        var formatted = utils.timePrettyFormat(totalSeconds);

        options.onTimerUpdate(formatted);
    });

    function getTokenAndRedirectIfNotExist() {
        var result = localStorage.getItem('api-token');

        if (!result) {
            options.onTokenRefused();
        }

        return result;
    }

    (function updateUserRating() {
        sync.ajax({
            url: settings.url('session/rating'),
            crossDomain : true,
            data: {
                token: getTokenAndRedirectIfNotExist()
            },
            onSuccess: function(result) {
                if (result.status !== 'ok') {
                    notify.error(result.message);
                    return;
                }

                options.onUserRatingChanged(result.rating);
            },
            onFail: function(result) {
                notify.error("Can't connect to server.<br>Check your connection");
            }
        });
    })();

    (function initGame() {
        function getBlunder(next) {
            sync.repeat({
                url: settings.url('blunder/get'),
                crossDomain : true,
                data: {
                    token: getTokenAndRedirectIfNotExist(),
                    type: 'rated'
                },
                onAnimate: options.onAnimate,
                onSuccess: function(result) {
                    if (result.status !== 'ok') {
                        notify.error(result.message);
                        return;
                    }

                    var data = result.data;

                    sync.repeat({
                        url: settings.url('blunder/info'),
                        crossDomain : true,
                        data: {
                            token: getTokenAndRedirectIfNotExist(),
                            blunder_id: data.id
                        },
                        onSuccess: function(result) {
                            if (result.status !== 'ok') {
                                notify.error(result.message);
                                return;
                            }

                            options.onInfoChanged(result.data);
                        },
                        onFail: function(result) {
                            notify.error("Can't connect to server.<br>Check your connection");
                        }
                    });

                    next(data);
                },
                onFail: function(result) {
                    notify.error("Can't connect to server.<br>Check your connection");
                }
            });
        }

        function validateBlunder(pv, blunder, next) {
            sync.repeat({
                url: settings.url('blunder/validate'),
                crossDomain : true,
                onAnimate: options.onAnimate,
                data: {
                    token: getTokenAndRedirectIfNotExist(),
                    id: blunder.id,
                    line: pv,
                    spentTime: counter.total(),
                    type: 'rated'
                },
                onSuccess: function(result) {
                    if (result.status !== 'ok') {
                        notify.error(result.message);
                        return;
                    } else {
                        options.onUserRatingChanged(result.data.elo);
                    }

                    next();
                },
                onFail: function(result) {
                    notify.error("Can't connect to server.<br>Check your connection");
                }
            });
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
