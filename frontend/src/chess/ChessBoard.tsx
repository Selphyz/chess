import React, { useState, useEffect } from 'react';
import { Game } from './game';
import type { Position, Piece } from './types';

// Import piece SVGs
import bishopB from '../assets/bishop-b.svg';
import bishopW from '../assets/bishop-w.svg';
import kingB from '../assets/king-b.svg';
import kingW from '../assets/king-w.svg';
import knightB from '../assets/knight-b.svg';
import knightW from '../assets/knight-w.svg';
import pawnB from '../assets/pawn-b.svg';
import pawnW from '../assets/pawn-w.svg';
import queenB from '../assets/queen-b.svg';
import queenW from '../assets/queen-w.svg';
import rookB from '../assets/rook-b.svg';
import rookW from '../assets/rook-w.svg';

const pieceImages: Record<string, string> = {
  'pawn-white': pawnW,
  'pawn-black': pawnB,
  'rook-white': rookW,
  'rook-black': rookB,
  'knight-white': knightW,
  'knight-black': knightB,
  'bishop-white': bishopW,
  'bishop-black': bishopB,
  'queen-white': queenW,
  'queen-black': queenB,
  'king-white': kingW,
  'king-black': kingB,
};

interface SquareProps {
  position: Position;
  piece: Piece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  onClick: (pos: Position) => void;
}

const Square: React.FC<SquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
}) => {
  const isLightSquare =
    (position.file.charCodeAt(0) + position.rank) % 2 === 0;

  const bgColor = isLightSquare ? '#f0d9b5' : '#b58863';
  const borderColor = isSelected
    ? 'yellow'
    : isValidMove
    ? 'lightgreen'
    : isLastMove
    ? 'orange'
    : 'transparent';

  return (
    <div
      onClick={() => onClick(position)}
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: bgColor,
        border: `3px solid ${borderColor}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        cursor: piece ? 'pointer' : isValidMove ? 'pointer' : 'default',
      }}
      data-testid={`square-${position.file}${position.rank}`}
    >
      {piece && (
        <img
          src={pieceImages[`${piece.type}-${piece.color}`]}
          alt={`${piece.color} ${piece.type}`}
          style={{ width: '50px', height: '50px', userSelect: 'none' }}
          draggable={false}
        />
      )}
    </div>
  );
};

export const ChessBoard: React.FC = () => {
  const [game] = useState(() => new Game());
  const [boardState, setBoardState] = useState(game.getBoardState());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [currentTurn, setCurrentTurn] = useState(game.getCurrentTurn());

  useEffect(() => {
    // Subscribe to move history changes by polling or event callback
    // Since Game does not have event emitter, we update after moves
    // This effect runs once on mount
  }, []);

  const onSquareClick = (pos: Position) => {
    const piece = game.getPieceAt(pos);
    if (selectedPos) {
      // Try to move piece from selectedPos to pos
      if (
        validMoves.some(
          (move) => move.file === pos.file && move.rank === pos.rank
        )
      ) {
        const moved = game.movePiece(selectedPos, pos);
        if (moved) {
          setBoardState(game.getBoardState());
          setLastMove({ from: selectedPos, to: pos });
          setSelectedPos(null);
          setValidMoves([]);
          setCurrentTurn(game.getCurrentTurn());
          return;
        }
      }
      // If clicked on another piece of current turn, select it
      if (piece && piece.color === currentTurn) {
        setSelectedPos(pos);
        setValidMoves(game.getValidMoves(pos));
      } else {
        // Deselect
        setSelectedPos(null);
        setValidMoves([]);
      }
    } else {
      // No piece selected yet
      if (piece && piece.color === currentTurn) {
        setSelectedPos(pos);
        setValidMoves(game.getValidMoves(pos));
      }
    }
  };

  const files: Position['file'][] = ['a','b','c','d','e','f','g','h'];
  const ranks: Position['rank'][] = [8,7,6,5,4,3,2,1]; // Render from top to bottom

  return (
    <div>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Current turn: {currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 60px)',
          gridTemplateRows: 'repeat(8, 60px)',
          border: '2px solid black',
          width: '480px',
          userSelect: 'none',
        }}
      >
        {ranks.map((rank) =>
          files.map((file) => {
            const pos: Position = { file, rank };
            const piece = boardState.get(`${file}${rank}`) || null;
            const isSelected =
              selectedPos !== null &&
              selectedPos.file === file &&
              selectedPos.rank === rank;
            const isValidMove = validMoves.some(
              (move) => move.file === file && move.rank === rank
            );
            const isLastMove =
              lastMove !== null &&
              ((lastMove.from.file === file && lastMove.from.rank === rank) ||
                (lastMove.to.file === file && lastMove.to.rank === rank));
            return (
              <Square
                key={`${file}${rank}`}
                position={pos}
                piece={piece}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isLastMove={isLastMove}
                onClick={onSquareClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
};