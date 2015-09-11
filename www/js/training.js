(function() {
    'use strict';

    function getTokenAndRedirectIfNotExist() {
        var result = localStorage.getItem('api-token');

        if (!result) {
            location.replace('login.html');
        }

        return result;
    }

    (function prepareLibs() {
        $("#pages").dragend({
            page: 2,
            afterInitialize: function() {
                $('#menu-page').addClass('menu-page-hand-setted-class');
            }
        });

        $.support.cors = true;

        // @TODO: reserve space instead creating dummy board
        new Chessboard('board', ChessUtils.FEN.emptyId);
    })();

    (function updateUserRating() {
        sync.ajax({
            url: url('session/rating'),
            crossDomain : true,
            data: {
                token: getTokenAndRedirectIfNotExist()
            },
            onDone: function(result) {
                if (result.status !== 'ok') return;

                $('#rating-value').html(result.rating);
            }
        });
    })();

    (function setupListeners() {
        $('#menu-button').on('click', function() {
            $('#pages').dragend({
                scrollToPage: 1
            });
        });

        $('#logout-button').on('click', function() {
            localStorage.removeItem('api-token');
            location.replace('login.html');
        });
    })();

    (function initGame() {
        function updateInfoView(data) {
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

            if (data.myFavorite) {
                $('#favorite-button').addClass('favorite-active');
                $('#favorite-button').html('<i id="favorite-icon" class="fa fa-star"></i>');
            } else {
                $('#favorite-button').removeClass('favorite-active');
                $('#favorite-button').html('<i id="favorite-icon" class="fa fa-star-o"></i>');
            }

            if (data.myVote === 1) {
                $('#like-button').addClass('like-active');
                $('#dislike-button').removeClass('dislike-active');
            } else if (data.myVote === -1) {
                $('#dislike-button').addClass('dislike-active');
                $('#like-button').removeClass('like-active');
            } else {
                $('#dislike-button').removeClass('dislike-active');
                $('#like-button').removeClass('like-active');
            }
        }

        function getBlunder(next) {
            sync.ajax({
                selector: 'game-status',
                url: url('blunder/get'),
                crossDomain : true,
                data: {
                    token: getTokenAndRedirectIfNotExist(),
                    type: 'rated'
                },
                onDone: function(result) {
                    var data = result.data;

                    sync.ajax({
                        url: url('blunder/info'),
                        crossDomain : true,
                        data: {
                            token: getTokenAndRedirectIfNotExist(),
                            blunder_id: data.id
                        },
                        onDone: function(result) {
                            if (result.status !== 'ok') return;

                            updateInfoView(result.data);
                        }
                    });

                    next(data);
                }
            });
        }

        function validateBlunder(pv, blunder, next) {
            sync.ajax({
                url: url('blunder/validate'),
                crossDomain : true,
                data: {
                    token: getTokenAndRedirectIfNotExist(),
                    id: blunder.id,
                    line: pv,
                    spentTime: 0,
                    type: 'rated'
                },
                onDone: function(result) {
                    if (result.status !== 'ok') return;

                    $('#rating-value').html(result.data.elo);
                    next();
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

            setupListeners();
            makeAiMove(blunder.blunderMove);

            function updateStatus(statusName) {
                var status = gameStatusList[statusName];
                var statusView = $('#game-status');

                board.enableUserInput(!status.terminate);
                statusView.removeClass().addClass(status.viewClass);
                statusView.html(status.viewText);

                if (status.terminate) {
                    validateBlunder(game.history(), blunder, function() {
                        addNextBlunderListener(statusView);
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
                    game.undo();

                    var rightMove = blunder.forcedLine[game.history().length - 1];
                    chessMove = game.move(rightMove);

                    highlightMove(chessMove, 'success-move-hightlight');

                    return board.fen();
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

            function setupListeners() {
                $('#favorite-button').off('click');
                $('#favorite-button').on('click', function() {
                    sync.ajax({
                        url: url('blunder/favorite'),
                        crossDomain : true,
                        data: {
                            token: getTokenAndRedirectIfNotExist(),
                            blunder_id: blunder.id
                        },
                        onDone: function(result) {
                            if (result.status !== 'ok') return;

                            updateInfoView(result.data);
                        }
                    });
                });

                function voteListener(vote) {
                    return (function() {
                        sync.ajax({
                            url: url('blunder/vote'),
                            crossDomain : true,
                            data: {
                                token: getTokenAndRedirectIfNotExist(),
                                blunder_id: blunder.id,
                                vote: vote
                            },
                            onDone: function(result) {
                                if (result.status !== 'ok') return;

                                updateInfoView(result.data);
                            }
                        });
                    });
                }

                $('#like-button').off('click');
                $('#like-button').on('click', voteListener(1));

                $('#dislike-button').off('click');
                $('#dislike-button').on('click', voteListener(-1));
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
