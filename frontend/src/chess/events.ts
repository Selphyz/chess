import type { Position, PieceColor } from './types';

/**
 * Base interface for a piece movement event
 */
export interface PieceMoveEvent {
  type: 'move';
  pieceColor: PieceColor;
  start: Position;
  end: Position;
  capturedPiece?: boolean; // true if this move captures an enemy piece
}

/**
 * Interface for castling event
 * Castling involves moving both king and rook
 */
export interface CastlingEvent {
  type: 'castling';
  pieceColor: PieceColor;
  kingStart: Position;
  kingEnd: Position;
  rookStart: Position;
  rookEnd: Position;
}

/**
 * Union type for all possible piece movement events
 */
export type ChessEvent = PieceMoveEvent | CastlingEvent;