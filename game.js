
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $opening = $('#opening')

var whiteSquareGrey = '#4f8252'
var blackSquareGrey = '#9ec991'


function makeRandomMove () { // random move
    var possibleMoves = game.moves()
    // game over
    if (possibleMoves.length === 0) return
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    var move = game.move(possibleMoves[randomIdx])
    if (move.captured){
        var audio = new Audio('sound/capture.mp3')
        audio.play()
    }
    else if (game.turn() === 'w'){
        var audio = new Audio('sound/move-self.mp3')
        audio.play()
    } else {
        var audio = new Audio('sound/move-opponent.mp3')
        audio.play()
    }
    board.position(game.fen())
}

function makeCaptureMove () { // capture everything if possible
    var possibleMoves = game.moves()
    // game over
    if (possibleMoves.length === 0) return

    var move
    var flag = 0
    for (let x in possibleMoves){
        if (possibleMoves[x].includes('x'))
        {
            move = game.move(possibleMoves[x])
            flag = 1
            break
        }
    }
    if (flag === 0)
    {
        var randomIdx = Math.floor(Math.random() * possibleMoves.length)
        move = game.move(possibleMoves[randomIdx])
    }
    board.position(game.fen())

    
    if (move.captured){
        var audio = new Audio('sound/capture.mp3')
        audio.play()
    }
    else if (game.turn() === 'w'){
        var audio = new Audio('sound/move-self.mp3')
        audio.play()
    } else {
        var audio = new Audio('sound/move-opponent.mp3')
        audio.play()
    }
    board.position(game.fen())
}


function removeGreySquares () {
    $('#myBoard .square-55d63').css('background', '')
}
  
function greySquare (square) {
    var $square = $('#myBoard .square-' + square)
  
    var background = whiteSquareGrey
    if ($square.hasClass('black-3c85d')) {
      background = blackSquareGrey
    }
  
    $square.css('background', background)
}

function onMouseoverSquare (square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true
    })
  
    // exit if there are no moves available for this square
    if (moves.length === 0) return
  
    // highlight the square they moused over
    greySquare(square)
  
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to)
    }
}
  
function onMouseoutSquare (square, piece) {
    removeGreySquares()
}

function onDragStart (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (source, target) {
    // see if the move is legal
    var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'
    window.setTimeout(makeCaptureMove, 250)
    if (move.captured){
        var audio = new Audio('sound/capture.mp3')
        audio.play()
    }
    else if (game.turn() === 'w'){
        var audio = new Audio('sound/move-self.mp3')
        audio.play()
    } else {
        var audio = new Audio('sound/move-opponent.mp3')
        audio.play()
    }
    updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
    board.position(game.fen())
}

function updateStatus () {
    var status = ''

    var moveColor = 'White'
    if (game.turn() === 'b') {
        moveColor = 'Black'
    }

// checkmate?
    if (game.game_over())
    {
        if (game.in_checkmate()) {
            var audio = new Audio('sound/move-check.mp3')
            var audio1 = new Audio('sound/game-end.mp3')
            audio.play()
            setTimeout(function(){audio1.play();},800)
            status = 'Game over, ' + moveColor + ' is in checkmate.'
            }
            // draw?
            else if (game.in_draw()) {
                if (game.in_stalemate())
                {
                    status = 'Stalemate, Bad luck'
                }
                else if (game.insufficient_material())
                {
                    status = 'Insufficient material.'
                }
                else if (game.in_threefold_repetition())
                {
                    status = 'Threefold repetition'
                }
                var audio1 = new Audio('sound/game-end.mp3')
                audio1.play()
            }
           
    }
    
    // game still on
    else {
        status = moveColor + ' to move'
        // check?
        if (game.in_check()) {
            var audio = new Audio('sound/move-check.mp3')
            audio.play()
            status += ', ' + moveColor + ' is in check'
        }
    }

    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn())
    $opening.html()
}


var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)


$('#startPosition').on('click', board.start)
$('#clearBoard').on('click', board.clear)
$('#flip').on('click', board.flip)
$('#Restart').on('click', function (){
    board = null
    game = new Chess()
    $fen.empty()
    $pgn.empty()
    board = Chessboard('myBoard', config)
    board.start()
    board.orientation('white');
    
    
})

$('#RuyLopez').on('click', function () {
    board.position('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R')
})
$('#QueensGambit').on('click', function () {
    board.position('rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR')
})
updateStatus()