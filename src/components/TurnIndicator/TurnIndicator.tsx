import { Player } from '../../types';

interface Props {
  currentPlayer: Player;
}

export function TurnIndicator({ currentPlayer }: Props) {
  const color = currentPlayer === Player.Black ? '#1a1a1a' : '#e8e8e8';
  const label = currentPlayer === Player.Black ? 'BLACK' : 'WHITE';
  return (
    <div className="turn-indicator">
      <span className="marble-icon" style={{ backgroundColor: color, border: currentPlayer === Player.Black ? '1px solid #555' : 'none' }} />
      <span>{label}'S TURN</span>
    </div>
  );
}
