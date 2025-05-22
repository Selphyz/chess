/**
 * Core TypeScript types and interfaces for the chess game
 */

/**
 * Position on the chess board
 * Represented by file (a-h) and rank (1-8)
 */
export interface Position {
  file: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
  rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

/**
 * Enum for piece types
 */
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

/**
 * Enum for piece colors
 */
export type PieceColor = 'white' | 'black';

/**
 * Interface for a chess piece
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved: boolean; // useful for castling and pawn first move
}