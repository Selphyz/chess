import type { Position, Piece } from '../types/types';
import type { PieceMoveEvent, CastlingEvent } from '../types/events';

/**
 * Utility to convert file character to number (a=1, b=2, ..., h=8)
 */
export function fileToNumber(file: string): number {
  return file.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

/**
 * Utility to check if two positions are equal
 */
function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.file === pos2.file && pos1.rank === pos2.rank;
}

/**
 * Utility to check if a position is within board bounds
 */
function isValidPosition(pos: Position): boolean {
  return pos.file >= 'a' && pos.file <= 'h' && pos.rank >= 1 && pos.rank <= 8;
}

/**
 * Calculate the difference in files and ranks between two positions
 */
function positionDelta(start: Position, end: Position): { fileDelta: number; rankDelta: number } {
  return {
    fileDelta: fileToNumber(end.file) - fileToNumber(start.file),
    rankDelta: end.rank - start.rank,
  };
}

/**
 * Check if path between start and end is clear (no pieces blocking)
 * This function requires a callback to check if a square is occupied.
 * It excludes start and end positions.
 */
function isPathClear(
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean
): boolean {
  const { fileDelta, rankDelta } = positionDelta(start, end);
  const fileStep = fileDelta === 0 ? 0 : fileDelta / Math.abs(fileDelta);
  const rankStep = rankDelta === 0 ? 0 : rankDelta / Math.abs(rankDelta);

  let currentFile = fileToNumber(start.file) + fileStep;
  let currentRank = start.rank + rankStep;

  while (currentFile !== fileToNumber(end.file) || currentRank !== end.rank) {
    const pos: Position = { file: String.fromCharCode('a'.charCodeAt(0) + currentFile - 1) as Position['file'], rank: currentRank as Position['rank'] };
    if (isOccupied(pos)) {
      return false;
    }
    currentFile += fileStep;
    currentRank += rankStep;
  }
  return true;
}

/**
 * Validate pawn move
 */
function validatePawnMove(
  piece: Piece,
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean,
  isEnemy: (pos: Position) => boolean
): boolean {
  const direction = piece.color === 'white' ? 1 : -1;
  const { fileDelta, rankDelta } = positionDelta(start, end);

  // Normal move forward
  if (fileDelta === 0) {
    if (rankDelta === direction && !isOccupied(end)) {
      return true;
    }
    // First move can move two squares
    if (rankDelta === 2 * direction && !piece.hasMoved) {
      // Check intermediate square is empty
      const intermediatePos: Position = { file: start.file, rank: (start.rank + direction) as Position['rank'] };
      if (!isOccupied(intermediatePos) && !isOccupied(end)) {
        return true;
      }
    }
  }

  // Capture move (diagonal by 1)
  if (Math.abs(fileDelta) === 1 && rankDelta === direction && isEnemy(end)) {
    return true;
  }

  return false;
}

/**
 * Validate rook move
 */
function validateRookMove(
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean
): boolean {
  const { fileDelta, rankDelta } = positionDelta(start, end);
  if (fileDelta !== 0 && rankDelta !== 0) {
    return false;
  }
  return isPathClear(start, end, isOccupied);
}

/**
 * Validate knight move
 */
function validateKnightMove(start: Position, end: Position): boolean {
  const { fileDelta, rankDelta } = positionDelta(start, end);
  const absFile = Math.abs(fileDelta);
  const absRank = Math.abs(rankDelta);
  return (absFile === 2 && absRank === 1) || (absFile === 1 && absRank === 2);
}

/**
 * Validate bishop move
 */
function validateBishopMove(
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean
): boolean {
  const { fileDelta, rankDelta } = positionDelta(start, end);
  if (Math.abs(fileDelta) !== Math.abs(rankDelta)) {
    return false;
  }
  return isPathClear(start, end, isOccupied);
}

/**
 * Validate queen move
 */
function validateQueenMove(
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean
): boolean {
  // Queen moves like rook or bishop
  return (
    validateRookMove(start, end, isOccupied) ||
    validateBishopMove(start, end, isOccupied)
  );
}

/**
 * Validate king move (excluding castling)
 */
function validateKingMove(
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean
): boolean {
  const { fileDelta, rankDelta } = positionDelta(start, end);
  const absFile = Math.abs(fileDelta);
  const absRank = Math.abs(rankDelta);
  if (absFile <= 1 && absRank <= 1) {
    // Normal king move one square any direction
    return true;
  }
  return false;
}

/**
 * Validate castling move
 * Returns rook start and end positions if castling is valid, else null
 */
function validateCastling(
  piece: Piece,
  start: Position,
  end: Position,
  isOccupied: (pos: Position) => boolean,
  hasMoved: (pos: Position) => boolean
): { rookStart: Position; rookEnd: Position } | null {
  if (piece.type !== 'king' || piece.hasMoved) {
    return null;
  }
  const rank = piece.color === 'white' ? 1 : 8;
  if (start.rank !== rank || end.rank !== rank) {
    return null;
  }
  const fileDelta = fileToNumber(end.file) - fileToNumber(start.file);

  // Castling king side
  if (fileDelta === 2) {
    const rookStart: Position = { file: 'h', rank };
    const rookEnd: Position = { file: 'f', rank };
    // Check rook has not moved and path is clear
    if (
      !hasMoved(rookStart) &&
      !isOccupied({ file: 'f', rank }) &&
      !isOccupied({ file: 'g', rank })
    ) {
      return { rookStart, rookEnd };
    }
  }

  // Castling queen side
  if (fileDelta === -2) {
    const rookStart: Position = { file: 'a', rank };
    const rookEnd: Position = { file: 'd', rank };
    if (
      !hasMoved(rookStart) &&
      !isOccupied({ file: 'b', rank }) &&
      !isOccupied({ file: 'c', rank }) &&
      !isOccupied({ file: 'd', rank })
    ) {
      return { rookStart, rookEnd };
    }
  }

  return null;
}

/**
 * Main function to validate a move and return event info
 */
export function validateMove(
  piece: Piece,
  start: Position,
  end: Position,
  getPieceAt: (pos: Position) => Piece | null,
  hasMoved: (pos: Position) => boolean
): { valid: boolean; event?: PieceMoveEvent | CastlingEvent } {
  if (!isValidPosition(start) || !isValidPosition(end)) {
    return { valid: false };
  }
  if (positionsEqual(start, end)) {
    return { valid: false };
  }

  const targetPiece = getPieceAt(end);
  const isOccupied = (pos: Position) => getPieceAt(pos) !== null;
  const isEnemy = (pos: Position) => {
    const p = getPieceAt(pos);
    return p !== null && p.color !== piece.color;
  };

  // Castling check
  const castling = validateCastling(piece, start, end, isOccupied, hasMoved);
  if (castling) {
    const event: CastlingEvent = {
      type: 'castling',
      pieceColor: piece.color,
      kingStart: start,
      kingEnd: end,
      rookStart: castling.rookStart,
      rookEnd: castling.rookEnd,
    };
    return { valid: true, event };
  }

  // Validate move by piece type
  let valid = false;
  switch (piece.type) {
    case 'pawn':
      valid = validatePawnMove(piece, start, end, isOccupied, isEnemy);
      break;
    case 'rook':
      valid = validateRookMove(start, end, isOccupied);
      break;
    case 'knight':
      valid = validateKnightMove(start, end);
      break;
    case 'bishop':
      valid = validateBishopMove(start, end, isOccupied);
      break;
    case 'queen':
      valid = validateQueenMove(start, end, isOccupied);
      break;
    case 'king':
      valid = validateKingMove(start, end, isOccupied);
      break;
  }

  if (!valid) {
    return { valid: false };
  }

  // If valid, create move event
  const event: PieceMoveEvent = {
    type: 'move',
    pieceColor: piece.color,
    start,
    end,
    capturedPiece: targetPiece !== null && targetPiece.color !== piece.color,
  };

  return { valid: true, event };
}
export * as default from './movement';