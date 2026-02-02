import type { Hex, Player } from '../../types';
import { PALETTE, HEX_SIZE } from '../../constants';
import { hexPolygonPoints } from '../../utils/svg';
import { Marble } from '../Marble/Marble';

interface HexCellProps {
  hex: Hex;
  player: Player | null;
  cx: number;
  cy: number;
  isSelected: boolean;
  isValidMove: boolean;
  isPushed: boolean;
  isPushedOff: boolean;
  onClick: () => void;
}

function getCellClassName(
  isValidMove: boolean,
  isPushed: boolean,
  isPushedOff: boolean,
): string {
  if (isPushedOff) return 'hex-cell hex-cell--pushed-off';
  if (isPushed) return 'hex-cell hex-cell--pushed';
  if (isValidMove) return 'hex-cell hex-cell--valid-move';
  return 'hex-cell';
}

export function HexCell({
  player,
  cx,
  cy,
  isSelected,
  isValidMove,
  isPushed,
  isPushedOff,
  onClick,
}: HexCellProps) {
  const points = hexPolygonPoints(cx, cy);
  const className = getCellClassName(isValidMove, isPushed, isPushedOff);
  const marbleRadius = HEX_SIZE * 0.6;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon
        points={points}
        fill={PALETTE.cellFill}
        stroke={isSelected ? PALETTE.selected : PALETTE.cellStroke}
        strokeWidth={isSelected ? 2.5 : 1}
        className={isSelected ? `${className} hex-selected` : className}
      />
      {player !== null && (
        <Marble player={player} cx={cx} cy={cy} size={marbleRadius} />
      )}
    </g>
  );
}
