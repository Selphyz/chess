import { validateMove } from './movement';
import type { Position, Piece, PieceColor, PieceType } from './types';
import type { ChessEvent } from './events';

/**
 * Board representation for the chess game
 */
export class Board {
  // Map positions as string keys (e.g. "a1") to pieces or null if empty
  private squares: Map<string, Piece | null>;

  // Event callback to emit chess events
  private eventCallback: (event: ChessEvent) => void;

  constructor(eventCallback: (event: ChessEvent) => void) {
    this.squares = new Map();
    this.eventCallback = eventCallback;
    this.initialize();
  }

  /**
   * Initialize the board with the standard chess starting position
   */
  private initialize() {
    // Clear board
    this.squares.clear();

    // Helper to set piece at position
    const setPiece = (file: string, rank: number, piece: Piece) => {
      const posKey = `${file}${rank}`;
      this.squares.set(posKey, piece);
    };

    // Place pawns
    for (const file of ['a','b','c','d','e','f','g','h']) {
      setPiece(file, 2, { type: 'pawn', color: 'white', hasMoved: false });
      setPiece(file, 7, { type: 'pawn', color: 'black', hasMoved: false });
    }

    // Place other pieces
    const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    backRank.forEach((type, index) => {
      const file = String.fromCharCode('a'.charCodeAt(0) + index);
      setPiece(file, 1, { type, color: 'white', hasMoved: false });
      setPiece(file, 8, { type, color: 'black', hasMoved: false });
    });

    // Empty squares
    for (let rank = 3; rank <= 6; rank++) {
      for (const file of ['a','b','c','d','e','f','g','h']) {
        const posKey = `${file}${rank}`;
        this.squares.set(posKey, null);
      }
    }
  }

  /**
   * Get the piece at a given position
   * @param position Position object
   * @returns Piece or null if empty
   */
  public getPiece(position: Position): Piece | null {
    const posKey = `${position.file}${position.rank}`;
    return this.squares.get(posKey) || null;
  }

  /**
   * Set a piece at a given position
   * @param position Position object
   * @param piece Piece or null to clear
   */
  public setPiece(position: Position, piece: Piece | null): void {
    const posKey = `${position.file}${position.rank}`;
    this.squares.set(posKey, piece);
  }

  /**
   * Get the full board state as a map of position keys to pieces
   */
  public getBoardState(): Map<string, Piece | null> {
    return new Map(this.squares);
  }

  /**
   * Check if a piece at a position has moved
   */
  private hasMoved(position: Position): boolean {
    const piece = this.getPiece(position);
    return piece ? piece.hasMoved : false;
  }

  /**
   * Move a piece from start to end position if valid
   * Handles normal moves, captures, and castling
   * Emits appropriate events
   */
  public movePiece(start: Position, end: Position): boolean {
    const piece = this.getPiece(start);
    if (!piece) {
      return false; // No piece at start
    }

    const { valid, event } = validateMove(
      piece,
      start,
      end,
      (pos) => this.getPiece(pos),
      (pos) => this.hasMoved(pos)
    );

    if (!valid || !event) {
      return false; // Invalid move
    }

    if (event.type === 'castling') {
      // Move king
      this.setPiece(event.kingEnd, piece);
      this.setPiece(event.kingStart, null);
      // Move rook
      const rook = this.getPiece(event.rookStart);
      if (rook) {
        this.setPiece(event.rookEnd, { ...rook, hasMoved: true });
        this.setPiece(event.rookStart, null);
      }
      // Update king hasMoved
      this.setPiece(event.kingEnd, { ...piece, hasMoved: true });
      // Emit castling event
      console.log('Chess Event Emitted:', event);
      this.eventCallback(event);
      return true;
    }

    if (event.type === 'move') {
      // Handle capture if any
      if (event.capturedPiece) {
        this.setPiece(end, null); // Remove captured piece
      }
      // Move piece
      this.setPiece(end, { ...piece, hasMoved: true });
      this.setPiece(start, null);
      // Emit move event
      console.log('Chess Event Emitted:', event);
      this.eventCallback(event);
      return true;
    }

    return false;
  }
}