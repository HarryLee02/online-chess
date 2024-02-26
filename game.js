var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

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
    if (game.in_checkmate()) {
        var audio = new Audio('sound/move-check.mp3')
        var audio1 = new Audio('sound/game-end.mp3')
        audio.play()
        setTimeout(function(){audio1.play();},800)
        
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
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
}


var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)


$('#startPosition').on('click', board.start)
$('#clearBoard').on('click', board.clear)
$('#flip').on('click', board.flip)
$('#RuyLopez').on('click', function () {
    board.position('r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R')
})
$('#QueensGambit').on('click', function () {
    board.position('rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR')
  })
updateStatus()