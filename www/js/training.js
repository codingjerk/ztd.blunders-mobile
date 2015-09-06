(function() {
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
            // @TODO: move to makeMove
            var game = new Chess(blunder.fenBefore);
            move = game.move(blunder.blunderMove);
            // @TODO: highlightMove(move)

            var board = new Chessboard(
                'board', 
                {
                    position: game.fen(),
                    eventHandlers: {
                        onPieceSelected: pieceSelected,
                        onMove: pieceMove
                    }
                }
            );

            function pieceMove(move) {
                game.move({
                    from: move.from,
                    to: move.to,
                    promotion: 'q'
                });

                console.log(game.history());
                console.log([blunder.blunderMove].concat(blunder.forcedLine));

                return game.fen();
            }

            function pieceSelected(notationSquare) {
                var i,
                    movesNotation,
                    movesPosition = [];

                movesNotation = game.moves({square: notationSquare, verbose: true});
                for (i = 0; i < movesNotation.length; i++) {
                    movesPosition.push(ChessUtils.convertNotationSquareToIndex(movesNotation[i].to));
                }

                return movesPosition;
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
