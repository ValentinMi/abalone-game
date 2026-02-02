import { Player } from '../../types';

interface Props {
  winner: Player;
  onNewGame: () => void;
}

export function GameOverDialog({ winner, onNewGame }: Props) {
  const label = winner === Player.Black ? 'BLACK' : 'WHITE';
  return (
    <div className="game-over-overlay">
      <div className="game-over-dialog">
        <h2>GAME OVER</h2>
        <p>{label} WINS!</p>
        <button className="btn-new-game" onClick={onNewGame}>
          NEW GAME
        </button>
      </div>
    </div>
  );
}
