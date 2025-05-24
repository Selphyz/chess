import { Board } from '../../src/utils/board';
import { validateMove as originalValidateMove } from '../../src/utils/movement';
import type { Position, Piece } from '../../src/types/types';

jest.mock('../../src/utils/movement');


const mockedValidateMove = jest.mocked(originalValidateMove);

describe('Board', () => {
  let eventCallback: jest.Mock;

  beforeEach(() => {
    eventCallback = jest.fn();
    mockedValidateMove.mockReset();
  });

  it('should_move_piece_and_emit_event_on_valid_move', () => {
    const board = new Board(eventCallback);

    const start: Position = { file: 'e', rank: 2 };
    const end: Position = { file: 'e', rank: 4 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };

    // Place pawn at e2
    board.setPiece(start, piece);

    // Mock validateMove to return valid move event
    mockedValidateMove.mockReturnValue({
      valid: true,
      event: {
        type: 'move',
        pieceColor: 'white',
        start,
        end,
        capturedPiece: false,
      },
    });

    const result = board.movePiece(start, end);

    expect(result).toBe(true);
    expect(board.getPiece(end)).toEqual({ ...piece, hasMoved: true });
    expect(board.getPiece(start)).toBeNull();
    expect(eventCallback).toHaveBeenCalledWith({
      type: 'move',
      pieceColor: 'white',
      start,
      end,
      capturedPiece: false,
    });
  });

  it('should_handle_castling_and_emit_castling_event', () => {
    const board = new Board(eventCallback);

    const kingStart: Position = { file: 'e', rank: 1 };
    const kingEnd: Position = { file: 'g', rank: 1 };
    const rookStart: Position = { file: 'h', rank: 1 };
    const rookEnd: Position = { file: 'f', rank: 1 };

    const king: Piece = { type: 'king', color: 'white', hasMoved: false };
    const rook: Piece = { type: 'rook', color: 'white', hasMoved: false };

    board.setPiece(kingStart, king);
    board.setPiece(rookStart, rook);

    mockedValidateMove.mockReturnValue({
      valid: true,
      event: {
        type: 'castling',
        pieceColor: 'white',
        kingStart,
        kingEnd,
        rookStart,
        rookEnd,
      },
    });

    const result = board.movePiece(kingStart, kingEnd);

    expect(result).toBe(true);
    expect(board.getPiece(kingEnd)).toEqual({ ...king, hasMoved: true });
    expect(board.getPiece(kingStart)).toBeNull();
    expect(board.getPiece(rookEnd)).toEqual({ ...rook, hasMoved: true });
    expect(board.getPiece(rookStart)).toBeNull();
    expect(eventCallback).toHaveBeenCalledWith({
      type: 'castling',
      pieceColor: 'white',
      kingStart,
      kingEnd,
      rookStart,
      rookEnd,
    });
  });

  it('should_capture_piece_and_emit_event_on_valid_capture', () => {
    const board = new Board(eventCallback);

    const start: Position = { file: 'd', rank: 4 };
    const end: Position = { file: 'e', rank: 5 };
    const attacker: Piece = { type: 'queen', color: 'white', hasMoved: false };
    const defender: Piece = { type: 'rook', color: 'black', hasMoved: false };

    board.setPiece(start, attacker);
    board.setPiece(end, defender);

    mockedValidateMove.mockReturnValue({
      valid: true,
      event: {
        type: 'move',
        pieceColor: 'white',
        start,
        end,
        capturedPiece: true,
      },
    });

    const result = board.movePiece(start, end);

    expect(result).toBe(true);
    expect(board.getPiece(end)).toEqual({ ...attacker, hasMoved: true });
    expect(board.getPiece(start)).toBeNull();
    expect(eventCallback).toHaveBeenCalledWith({
      type: 'move',
      pieceColor: 'white',
      start,
      end,
      capturedPiece: true,
    });
  });

  it('should_not_move_when_start_square_is_empty', () => {
    const board = new Board(eventCallback);

    const start: Position = { file: 'a', rank: 3 };
    const end: Position = { file: 'a', rank: 4 };

    // Ensure start square is empty
    board.setPiece(start, null);

    const result = board.movePiece(start, end);

    expect(result).toBe(false);
    expect(board.getPiece(start)).toBeNull();
    expect(board.getPiece(end)).toBeNull();
    expect(eventCallback).not.toHaveBeenCalled();
    expect(mockedValidateMove).not.toHaveBeenCalled();
  });

  it('should_not_allow_move_to_same_position', () => {
    const board = new Board(eventCallback);

    const pos: Position = { file: 'b', rank: 2 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    board.setPiece(pos, piece);

    mockedValidateMove.mockReturnValue({
      valid: false,
    });

    const result = board.movePiece(pos, pos);

    expect(result).toBe(false);
    expect(board.getPiece(pos)).toEqual(piece);
    expect(eventCallback).not.toHaveBeenCalled();
    expect(mockedValidateMove).toHaveBeenCalled();
  });

  it('should_not_update_board_or_emit_event_on_invalid_move', () => {
    const board = new Board(eventCallback);

    const start: Position = { file: 'c', rank: 1 };
    const end: Position = { file: 'c', rank: 4 };
    const piece: Piece = { type: 'rook', color: 'white', hasMoved: false };
    board.setPiece(start, piece);

    mockedValidateMove.mockReturnValue({
      valid: false,
    });

    const result = board.movePiece(start, end);

    expect(result).toBe(false);
    expect(board.getPiece(start)).toEqual(piece);
    expect(board.getPiece(end)).toBeNull();
    expect(eventCallback).not.toHaveBeenCalled();
  });
});