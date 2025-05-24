import { Board } from './board';
import type { Position, Piece } from '../types/types';
import type { ChessEvent } from '../types/events';
import { validateMove } from './movement';

export class Game {
  private board: Board;
  private currentTurn: 'white' | 'black';
  private moveHistory: ChessEvent[];
  private selectedPosition: Position | null;

  constructor() {
    this.moveHistory = [];
    this.currentTurn = 'white';
    this.selectedPosition = null;
    this.board = new Board(this.handleEvent.bind(this));
  }

  private handleEvent(event: ChessEvent) {
    this.moveHistory.push(event);
    // Switch turn after a successful move or castling
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
  }

  public getBoardState() {
    return this.board.getBoardState();
  }

  public getCurrentTurn() {
    return this.currentTurn;
  }

  public getMoveHistory() {
    return this.moveHistory;
  }

  public getPieceAt(position: Position): Piece | null {
    return this.board.getPiece(position);
  }

  public selectPosition(position: Position) {
    const piece = this.board.getPiece(position);
    if (piece && piece.color === this.currentTurn) {
      this.selectedPosition = position;
    } else {
      this.selectedPosition = null;
    }
  }

  public getSelectedPosition() {
    return this.selectedPosition;
  }

  public getValidMoves(position: Position): Position[] {
    const piece = this.board.getPiece(position);
    if (!piece || piece.color !== this.currentTurn) {
      return [];
    }
    const validMoves: Position[] = [];
    const files = ['a','b','c','d','e','f','g','h'];
    for (const file of files) {
      for (let rank = 1; rank <= 8; rank++) {
        if (position.file === file && position.rank === rank) {
          continue; // same square
        }
        const targetPos: Position = { file: file as Position['file'], rank: rank as Position['rank'] };
        const { valid } = validateMove(
          piece,
          position,
          targetPos,
          (pos) => this.board.getPiece(pos),
          (pos) => {
            const p = this.board.getPiece(pos);
            return p ? p.hasMoved : false;
          }
        );
        if (valid) {
          validMoves.push(targetPos);
        }
      }
    }
    return validMoves;
  }

  public movePiece(start: Position, end: Position): boolean {
    const piece = this.board.getPiece(start);
    if (!piece || piece.color !== this.currentTurn) {
      return false;
    }
    const success = this.board.movePiece(start, end);
    if (success) {
      this.selectedPosition = null;
    }
    return success;
  }
}