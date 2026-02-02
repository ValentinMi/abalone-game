import type { GameState, Move, Player } from '../src/types.ts';
import { gameReducer, createInitialState } from '../src/logic/game.ts';
import { generateValidMoves } from '../src/logic/moves.ts';
import { hexKey } from '../src/utils/hex.ts';
import { moveEqual, serializeGameState } from './utils.ts';
import type { SerializedGameState } from './protocol.ts';

export class GameSession {
  private state: GameState;

  constructor() {
    this.state = createInitialState();
  }

  getState(): GameState {
    return this.state;
  }

  getSerializedState(): SerializedGameState {
    return serializeGameState(this.state);
  }

  get currentPlayer(): Player {
    return this.state.currentPlayer;
  }

  get winner(): Player | null {
    return this.state.winner;
  }

  tryMove(move: Move, player: Player): { success: boolean; reason?: string } {
    if (this.state.currentPlayer !== player) {
      return { success: false, reason: 'Not your turn' };
    }

    if (this.state.winner) {
      return { success: false, reason: 'Game is already over' };
    }

    for (const marble of move.marbles) {
      const cell = this.state.board.get(hexKey(marble));
      if (cell !== player) {
        return { success: false, reason: 'Invalid marble selection' };
      }
    }

    const validMoves = generateValidMoves(this.state.board, move.marbles, player);

    const matchingMove = validMoves.find(vm => moveEqual(vm, move));
    if (!matchingMove) {
      return { success: false, reason: 'Invalid move' };
    }

    this.state = gameReducer(this.state, { type: 'EXECUTE_MOVE', move: matchingMove });

    return { success: true };
  }
}
