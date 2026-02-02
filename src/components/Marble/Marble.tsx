import { Player } from '../../types';

interface MarbleProps {
  player: Player;
  cx: number;
  cy: number;
  size: number;
}

const COLORS = {
  [Player.Black]: {
    outer: '#3a3a3a',
    mid: '#1a1a1a',
    center: '#050505',
    highlight: '#555555',
  },
  [Player.White]: {
    outer: '#e8e8e8',
    mid: '#d8d8d8',
    center: '#b0b0b0',
    highlight: '#ffffff',
  },
};

export function Marble({ player, cx, cy, size }: MarbleProps) {
  const c = COLORS[player];

  return (
    <g className="marble">
      <circle cx={cx} cy={cy} r={size} fill={c.outer} />
      <circle cx={cx} cy={cy} r={size * 0.75} fill={c.mid} />
      <circle cx={cx} cy={cy} r={size * 0.5} fill={c.center} />
      <circle
        cx={cx - size * 0.2}
        cy={cy - size * 0.2}
        r={size * 0.2}
        fill={c.highlight}
      />
    </g>
  );
}
