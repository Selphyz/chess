import { Game } from '../../src/utils/game';
import { Board } from '../../src/utils/board';
import type { Position, Piece } from '../../src/types/types';
import { validateMove } from '../../src/utils/movement';

jest.mock('../../src/utils/board');
jest.mock('../../src/utils/movement');

// Store the event callback when Board is instantiated
let capturedEventCallback: Function;

const mockBoardInstance = {
  getPiece: jest.fn(),
  movePiece: jest.fn(),
  getBoardState: jest.fn(),
  setPiece: jest.fn(),
};

(Board as jest.Mock).mockImplementation(function (this: any, eventCallback: any) {
  capturedEventCallback = eventCallback; // Capture the callback for use in tests
  Object.assign(this, mockBoardInstance);
  this.eventCallback = eventCallback;
  this.getPiece = mockBoardInstance.getPiece;
  this.movePiece = mockBoardInstance.movePiece;
  this.getBoardState = mockBoardInstance.getBoardState;
  this.setPiece = mockBoardInstance.setPiece;
  this.initialize = jest.fn();
});

describe('Game', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Board mock instance methods
    Object.values(mockBoardInstance).forEach(fn => (fn as jest.Mock).mockReset());
  });

  test('test_move_piece_switches_turn_and_updates_history', () => {
    // Arrange
    const game = new Game();
    const start: Position = { file: 'e', rank: 2 };
    const end: Position = { file: 'e', rank: 4 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    mockBoardInstance.getPiece.mockImplementation((pos: Position) =>
      pos.file === 'e' && pos.rank === 2 ? piece : null
    );
    mockBoardInstance.movePiece.mockImplementation((startPos, endPos) => {
      // This simulates what the real Board class would do:
      // When a move is successful, it should trigger the event callback
      const mockEvent = {
        type: 'move',
        piece,
        from: startPos,
        to: endPos
      };
      // Call the event callback that was captured during Board construction
      capturedEventCallback(mockEvent);
      return true;
    });

    // Act
    const result = game.movePiece(start, end);

    // Assert
    expect(result).toBe(true);
    expect(game.getMoveHistory().length).toBe(1);
    expect(game.getCurrentTurn()).toBe('black');
    expect(mockBoardInstance.movePiece).toHaveBeenCalledWith(start, end);
  });

  test('test_select_position_sets_selected_for_current_player_piece', () => {
    // Arrange
    const game = new Game();
    const pos: Position = { file: 'e', rank: 2 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    mockBoardInstance.getPiece.mockReturnValue(piece);

    // Act
    game.selectPosition(pos);

    // Assert
    expect(game.getSelectedPosition()).toEqual(pos);
  });

  test('test_get_valid_moves_returns_legal_moves_for_current_player_piece', () => {
    // Arrange
    const game = new Game();
    const pos: Position = { file: 'e', rank: 2 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    mockBoardInstance.getPiece.mockImplementation((p: Position) =>
      p.file === 'e' && p.rank === 2 ? piece : null
    );
    // Mock validateMove to only allow e2->e3 and e2->e4
    (validateMove as jest.Mock).mockImplementation((pieceArg, start, end) => {
      if (
        start.file === 'e' &&
        start.rank === 2 &&
        ((end.file === 'e' && end.rank === 3) || (end.file === 'e' && end.rank === 4))
      ) {
        return { valid: true };
      }
      return { valid: false };
    });

    // Act
    const moves = game.getValidMoves(pos);

    // Assert
    expect(moves).toEqual(
      expect.arrayContaining([
        { file: 'e', rank: 3 },
        { file: 'e', rank: 4 },
      ])
    );
    expect(moves.length).toBe(2);
  });

  test('test_move_piece_wrong_turn_does_not_update_board', () => {
    // Arrange
    const game = new Game();
    // Set up so it's black's turn
    (game as any).currentTurn = 'black';
    const start: Position = { file: 'e', rank: 2 };
    const end: Position = { file: 'e', rank: 4 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    mockBoardInstance.getPiece.mockReturnValue(piece);

    // Act
    const result = game.movePiece(start, end);

    // Assert
    expect(result).toBe(false);
    expect(mockBoardInstance.movePiece).not.toHaveBeenCalled();
    expect(game.getCurrentTurn()).toBe('black');
    expect(game.getMoveHistory().length).toBe(0);
  });

  test('test_select_position_invalid_selection_clears_selected', () => {
    // Arrange
    const game = new Game();
    // Empty square
    mockBoardInstance.getPiece.mockReturnValueOnce(null);
    game.selectPosition({ file: 'a', rank: 3 });
    expect(game.getSelectedPosition()).toBeNull();

    // Opponent's piece
    const blackPiece: Piece = { type: 'pawn', color: 'black', hasMoved: false };
    mockBoardInstance.getPiece.mockReturnValueOnce(blackPiece);
    game.selectPosition({ file: 'a', rank: 7 });
    expect(game.getSelectedPosition()).toBeNull();
  });

  test("test_get_valid_moves_for_invalid_selection_returns_empty_list", () => {
    // Arrange
    const game = new Game();
    // Empty square
    mockBoardInstance.getPiece.mockReturnValueOnce(null);
    let moves = game.getValidMoves({ file: 'a', rank: 3 });
    expect(moves).toEqual([]);

    // Opponent's piece
    const blackPiece: Piece = { type: 'pawn', color: 'black', hasMoved: false };
    mockBoardInstance.getPiece.mockReturnValueOnce(blackPiece);
    moves = game.getValidMoves({ file: 'a', rank: 7 });
    expect(moves).toEqual([]);
  });

  test('test_move_piece_clears_selected_position_on_success', () => {
    // Arrange
    const game = new Game();
    const start: Position = { file: 'e', rank: 2 };
    const end: Position = { file: 'e', rank: 4 };
    const piece: Piece = { type: 'pawn', color: 'white', hasMoved: false };
    mockBoardInstance.getPiece.mockImplementation((pos: Position) =>
      pos.file === 'e' && pos.rank === 2 ? piece : null
    );
    mockBoardInstance.movePiece.mockImplementation(() => true);

    // Select a piece first
    (game as any).selectedPosition = start;

    // Act
    const result = game.movePiece(start, end);

    // Assert
    expect(result).toBe(true);
    expect(game.getSelectedPosition()).toBeNull();
  });

  test('test_move_piece_from_empty_square_does_nothing', () => {
    // Arrange
    const game = new Game();
    const start: Position = { file: 'a', rank: 3 };
    const end: Position = { file: 'a', rank: 4 };
    mockBoardInstance.getPiece.mockReturnValue(null);

    // Select a piece first
    (game as any).selectedPosition = start;

    // Act
    const result = game.movePiece(start, end);

    // Assert
    expect(result).toBe(false);
    expect(mockBoardInstance.movePiece).not.toHaveBeenCalled();
    expect(game.getSelectedPosition()).toEqual(start);
  });
});