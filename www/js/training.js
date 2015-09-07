(function() {
    'use strict';

    (function prepareLibs() {
        $("#pages").dragend();
        $.support.cors = true;

        // @TODO: reserve space instead creating dummy board
        new Chessboard('board', ChessUtils.FEN.emptyId);
    })();

    (function initGame() {
        function getBlunder(next) {
            $.ajax({
                url: "http://blunders.ztd.io/api/blunder/get",
                method: 'POST',
                crossDomain: true,
                contentType: 'application/json',
                data: JSON.stringify({type: 'rated'}),
                success: function(result) {
                    var data = result.data;

                    $.ajax({
                        url: "http://blunders.ztd.io/api/blunder/info",
                        method: 'POST',
                        crossDomain: true,
                        contentType: 'application/json',
                        data: JSON.stringify({blunder_id: data.id}),
                        success: function(result) {
                            var data = result.data;

                            var info = data['game-info'];
                            $("#white-player").html(info.White);
                            $("#black-player").html(info.Black);

                            grid.update({
                                'white-name-value': info.White,
                                'white-elo-value':  info.WhiteElo,
                                'black-name-value': info.Black,
                                'black-elo-value':  info.BlackElo
                            });

                            var successRate = (data.totalTries !== 0)? (data.successTries * 100 / data.totalTries): 0; 
                            grid.update({
                                'blunder-rating': data.elo,
                                'success-played': data.successTries,
                                'total-played': data.totalTries,
                                'success-rate': successRate.toFixed(1)
                            });

                            grid.update({
                                'blunder-votes': data.likes - data.dislikes,
                                'blunder-favorite-count': data.favorites
                            });
                        }
                    });

                    next(data);
                }
            });
        }

        function startGame(blunder) {
            var highlightClasses = [
                'ai-move-hightlight',
                'player-move-hightlight',
                'success-move-hightlight',
                'fail-move-hightlight'
            ];

            var gameStatusList = {
                'fail': {
                    terminate: true,
                    viewClass: 'failed-status',
                    viewText:  'Fail. Next <i class="fa fa-angle-double-right"></i>'
                },
                'success': {
                    terminate: true,
                    viewClass: 'success-status',
                    viewText:  'Success. Next <i class="fa fa-angle-double-right"></i>'
                },
                'white-move': {
                    terminate: false,
                    viewClass: 'white-to-move-status',
                    viewText:  'White to move'
                },
                'black-move': {
                    terminate: false,
                    viewClass: 'black-to-move-status',
                    viewText:  'Black to move'
                }
            }

            var game = new Chess(blunder.fenBefore);
            var board = new Chessboard(
                'board', 
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
                var statusView = $('#game-status');

                board.enableUserInput(!status.terminate);
                statusView.removeClass().addClass(status.viewClass);
                statusView.html(status.viewText);

                if (status.terminate) {
                    addNextBlunderListener(statusView);
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
                board.setPosition(game.fen());
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
                    highlightMove(chessMove, 'fail-move-hightlight');
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

            function addNextBlunderListener(view) {
                view.on('click', function() {
                    getBlunder(startGame);
                    view.off('click');
                })
            }
        }

        getBlunder(startGame);
    })();

    (function generateStructure() {
        var model = [
            {
                id: 'blunder-block',
                caption: 'Blunder',
                cells: 3,
                rows: [
                    {
                        type: 'cell',
                        label: 'Rating',
                        id: 'blunder-rating',
                        additional: 'Elo'
                    },
                    {
                        type: 'cell',
                        label: 'Rating',
                        id: 'blunder-votes',
                        additional: 'votes'
                    },
                    {
                        type: 'cell',
                        label: 'Favorite for',
                        id: 'blunder-favorite-count',
                        additional: 'users'
                    },
                    {
                        type: 'cell',
                        label: 'Success',
                        id: 'success-played',
                        additional: 'played'
                    },
                    {
                        type: 'cell',
                        label: 'Total',
                        id: 'total-played',
                        additional: 'played'
                    },
                    {
                        type: 'cell',
                        label: 'Success rate',
                        id: 'success-rate',
                        additional: 'percents'
                    }
                ]
            },
            {
                id: 'game-block',
                caption: 'Game',
                cells: 2,
                rows: [
                    {
                        type: 'cell',
                        label: 'White',
                        id: 'white-name-value',
                        additional: 'player'
                    },
                    {
                        type: 'cell',
                        label: 'Black',
                        id: 'black-name-value',
                        additional: 'player'
                    },
                    {
                        type: 'cell',
                        label: 'White',
                        id: 'white-elo-value',
                        additional: 'Elo'
                    },
                    {
                        type: 'cell',
                        label: 'Black',
                        id: 'black-elo-value',
                        additional: 'Elo'
                    }
                ]
            }
        ];

        var html = grid.generate(model);
        $('#info-page').html(html);
    })();
})();
