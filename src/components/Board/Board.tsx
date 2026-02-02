import { useMemo } from 'react';
import type { Hex, Player, Board as BoardType, Move, HexKey } from '../../types';
import { HEX_SIZE } from '../../constants';
import { hexToPixel, hexKey, hexEqual, hexAdd } from '../../utils/hex';
import { getAllHexes } from '../../logic/board';
import { HexCell } from '../HexCell/HexCell';

interface BoardProps {
  board: BoardType;
  selectedMarbles: Hex[];
  validMoves: Move[];
  onCellClick: (hex: Hex) => void;
  onExecuteMove: (move: Move) => void;
}

function deriveHighlights(validMoves: Move[], selectedMarbles: Hex[]) {
  const destinations = new Set<HexKey>();
  const pushed = new Set<HexKey>();
  const pushedOff = new Set<HexKey>();

  const selectedKeys = new Set(selectedMarbles.map(m => hexKey(m)));

  const destinationToMove = new Map<HexKey, Move>();

  for (const move of validMoves) {
    for (const marble of move.marbles) {
      const dest = hexAdd(marble, move.direction);
      const key = hexKey(dest);

      if (selectedKeys.has(key)) continue;

      destinations.add(key);
      if (!destinationToMove.has(key)) {
        destinationToMove.set(key, move);
      }
    }

    if (move.pushed) {
      for (const h of move.pushed) {
        const key = hexKey(h);
        pushed.add(key);
        if (!destinationToMove.has(key)) {
          destinationToMove.set(key, move);
        }
      }
    }

    if (move.pushedOff) {
      for (const h of move.pushedOff) {
        const key = hexKey(h);
        pushedOff.add(key);
        if (!destinationToMove.has(key)) {
          destinationToMove.set(key, move);
        }
      }
    }
  }

  return { destinations, pushed, pushedOff, destinationToMove };
}

function computeViewBox(): string {
  const allHexes = getAllHexes();
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const hex of allHexes) {
    const { x, y } = hexToPixel(hex);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const pad = HEX_SIZE + 4;
  const vx = minX - pad;
  const vy = minY - pad;
  const vw = maxX - minX + pad * 2;
  const vh = maxY - minY + pad * 2;

  return `${vx} ${vy} ${vw} ${vh}`;
}

const VIEW_BOX = computeViewBox();

export function Board({ board, selectedMarbles, validMoves, onCellClick, onExecuteMove }: BoardProps) {
  const allHexes = getAllHexes();
  const { destinations, pushed, pushedOff, destinationToMove } = useMemo(
    () => deriveHighlights(validMoves, selectedMarbles),
    [validMoves, selectedMarbles],
  );

  const handleCellClick = (hex: Hex) => {
    const key = hexKey(hex);

    const isHighlighted = destinations.has(key) || pushed.has(key) || pushedOff.has(key);
    if (isHighlighted) {
      const move = destinationToMove.get(key);
      if (move) {
        onExecuteMove(move);
        return;
      }
    }

    onCellClick(hex);
  };

  return (
    <svg
      viewBox={VIEW_BOX}
      className="board-svg"
      width="100%"
      style={{ maxWidth: 600, display: 'block', margin: '0 auto' }}
    >
      {allHexes.map((hex) => {
        const key = hexKey(hex);
        const { x, y } = hexToPixel(hex);
        const player: Player | null = board.get(key) ?? null;
        const isSelected = selectedMarbles.some((s) => hexEqual(s, hex));
        const isValidMove = destinations.has(key);
        const isPushed = pushed.has(key);
        const isPushedOff = pushedOff.has(key);

        return (
          <HexCell
            key={key}
            hex={hex}
            player={player}
            cx={x}
            cy={y}
            isSelected={isSelected}
            isValidMove={isValidMove}
            isPushed={isPushed}
            isPushedOff={isPushedOff}
            onClick={() => handleCellClick(hex)}
          />
        );
      })}
    </svg>
  );
}
