import { Player } from '../../types';
import { SCORE_TO_WIN } from '../../constants';

interface Props {
  scores: Record<Player, number>;
}

export function ScoreBoard({ scores }: Props) {
  return (
    <div className="scoreboard">
      <div className="score-item">
        <span className="marble-icon" style={{ backgroundColor: '#1a1a1a', border: '1px solid #555' }} />
        <span>{scores[Player.Black]} / {SCORE_TO_WIN}</span>
      </div>
      <div className="score-item">
        <span className="marble-icon" style={{ backgroundColor: '#e8e8e8' }} />
        <span>{scores[Player.White]} / {SCORE_TO_WIN}</span>
      </div>
    </div>
  );
}
