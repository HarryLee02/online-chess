import {INPUT_EVENT_TYPE, COLOR, Chessboard, BORDER_TYPE} from "./src/Chessboard.js"
import { Arrows } from "./src/assets/extensions/Arrows.js"
import {MARKER_TYPE, Markers} from "./src/assets/extensions/Markers.js"
import {PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog} from "./src/assets/extensions/PromotionDialog.js"
import {Chess} from "https://cdn.jsdelivr.net/npm/chess.mjs@1/src/chess.mjs/Chess.js"

const chess = new Chess()

let seed = 71;
function random() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function makeEngineMove(chessboard) {
    const possibleMoves = chess.moves({verbose: true})
    if (possibleMoves.length > 0) {
        const randomIndex = Math.floor(random() * possibleMoves.length)
        const randomMove = possibleMoves[randomIndex]
        setTimeout(() => { // smoother with 500ms delay
            chess.move({from: randomMove.from, to: randomMove.to})
            chessboard.setPosition(chess.fen(), true)
            chessboard.enableMoveInput(inputHandler, COLOR.white)
        }, 500)
    }
}

function inputHandler(event) {
    console.log("inputHandler", event)
    if(event.type === INPUT_EVENT_TYPE.movingOverSquare) {
        return // ignore this event
    }
    if(event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
        event.chessboard.removeMarkers(MARKER_TYPE.dot)
        event.chessboard.removeMarkers(MARKER_TYPE.bevel)
    }
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        const moves = chess.moves({square: event.squareFrom, verbose: true})
        for (const move of moves) { // draw dots on possible squares
            if (move.promotion && move.promotion !== "q") {
                continue
            }
            if (event.chessboard.getPiece(move.to)) {
                event.chessboard.addMarker(MARKER_TYPE.bevel, move.to)
            } else {
                event.chessboard.addMarker(MARKER_TYPE.dot, move.to)
            }
        }
        return moves.length > 0
    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        const move = {from: event.squareFrom, to: event.squareTo, promotion: event.promotion}
        const result = chess.move(move)
        if (result) {
            event.chessboard.state.moveInputProcess.then(() => { // wait for the move input process has finished
                event.chessboard.setPosition(chess.fen(), true).then(() => { // update position, maybe castled and wait for animation has finished
                    makeEngineMove(event.chessboard)
                })
            })
        } else {
            // promotion?
            let possibleMoves = chess.moves({square: event.squareFrom, verbose: true})
            for (const possibleMove of possibleMoves) {
                if (possibleMove.promotion && possibleMove.to === event.squareTo) {
                    event.chessboard.showPromotionDialog(event.squareTo, COLOR.white, (result) => {
                        console.log("promotion result", result)
                        if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                            chess.move({from: event.squareFrom, to: event.squareTo, promotion: result.piece.charAt(1)})
                            event.chessboard.setPosition(chess.fen(), true)
                            makeEngineMove(event.chessboard)
                        } else {
                            // promotion canceled
                            event.chessboard.enableMoveInput(inputHandler, COLOR.white)
                            event.chessboard.setPosition(chess.fen(), true)
                        }
                    })
                    return true
                }
            }
        }
        return result
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        if(event.legalMove) {
            event.chessboard.disableMoveInput()
        }
    }
}

const board = new Chessboard(document.getElementById("myBoard"), {
    position: chess.fen(),
    assetsUrl: "./src/assets/",
    style: {borderType: BORDER_TYPE.none, pieces: {file: "pieces/staunty.svg"}, animationDuration: 300},
    orientation: COLOR.white,
    extensions: [
        {class: Markers, autoMarkers: MARKER_TYPE.frame},
        {class: PromotionDialog},
        {class: Arrows}
    ]
})
board.enableMoveInput(inputHandler, COLOR.white)