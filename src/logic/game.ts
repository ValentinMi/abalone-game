import { type GameState, type Action, Player } from '../types';
import type { HexKey } from '../types';
import { hexKey, hexEqual, hexAdd, areCollinear, areContiguous, isOnBoard } from '../utils/hex';
import { createInitialBoard } from './board';
import { generateValidMoves } from './moves';
import { SCORE_TO_WIN } from '../constants';

export function createInitialState(): GameState {
  const board = createInitialBoard();
  return {
    board,
    currentPlayer: Player.Black,
    scores: { [Player.Black]: 0, [Player.White]: 0 },
    selectedMarbles: [],
    validMoves: [],
    winner: null,
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  if (state.winner && action.type !== 'NEW_GAME') return state;

  switch (action.type) {
    case 'SELECT_MARBLE': {
      const { hex } = action;
      const key = hexKey(hex);
      const cellPlayer = state.board.get(key);

      if (cellPlayer !== state.currentPlayer) return state;

      if (state.selectedMarbles.some(m => hexEqual(m, hex))) return state;

      if (state.selectedMarbles.length >= 3) return state;

      const newSelection = [...state.selectedMarbles, hex];

      if (newSelection.length > 1) {
        if (!areCollinear(newSelection) || !areContiguous(newSelection)) {
          return state;
        }
      }

      const validMoves = generateValidMoves(state.board, newSelection, state.currentPlayer);

      return { ...state, selectedMarbles: newSelection, validMoves };
    }

    case 'DESELECT_MARBLE': {
      const { hex } = action;
      const newSelection = state.selectedMarbles.filter(m => !hexEqual(m, hex));

      if (newSelection.length > 1 && (!areCollinear(newSelection) || !areContiguous(newSelection))) {
        return { ...state, selectedMarbles: [], validMoves: [] };
      }

      const validMoves = newSelection.length > 0
        ? generateValidMoves(state.board, newSelection, state.currentPlayer)
        : [];

      return { ...state, selectedMarbles: newSelection, validMoves };
    }

    case 'CLEAR_SELECTION':
      return { ...state, selectedMarbles: [], validMoves: [] };

    case 'EXECUTE_MOVE': {
      const { move } = action;
      const newBoard = new Map(state.board);
      const newScores = { ...state.scores };

      if (move.pushedOff && move.pushedOff.length > 0) {
        for (const h of move.pushedOff) {
          newBoard.set(hexKey(h), null);
        }
        newScores[state.currentPlayer] += move.pushedOff.length;
      }

      if (move.pushed && move.pushed.length > 0) {
        const pushed = [...move.pushed];
        for (let i = pushed.length - 1; i >= 0; i--) {
          const from = pushed[i];
          const to = hexAdd(from, move.direction);
          const fromKey = hexKey(from);
          const toKey = hexKey(to);
          if (isOnBoard(to)) {
            newBoard.set(toKey, newBoard.get(fromKey)!);
          }
          newBoard.set(fromKey, null);
        }
      }

      const sortedMarbles = [...move.marbles].sort((a, b) => {
        const da = a.q * move.direction.q + a.r * move.direction.r;
        const db = b.q * move.direction.q + b.r * move.direction.r;
        return db - da;
      });

      for (const marble of sortedMarbles) {
        const from = hexKey(marble);
        const to = hexKey(hexAdd(marble, move.direction));
        newBoard.set(to, state.currentPlayer);
        newBoard.set(from, null);
      }

      const winner = newScores[state.currentPlayer] >= SCORE_TO_WIN ? state.currentPlayer : null;

      const nextPlayer = state.currentPlayer === Player.Black ? Player.White : Player.Black;

      return {
        ...state,
        board: newBoard,
        currentPlayer: winner ? state.currentPlayer : nextPlayer,
        scores: newScores,
        selectedMarbles: [],
        validMoves: [],
        winner,
      };
    }

    case 'NEW_GAME':
      return createInitialState();

    case 'SET_SERVER_STATE': {
      const { board: boardObj, currentPlayer, scores, winner } = action.state;
      const board = new Map(Object.entries(boardObj)) as Map<HexKey, Player | null>;
      return {
        board,
        currentPlayer,
        scores: scores as Record<Player, number>,
        selectedMarbles: [],
        validMoves: [],
        winner,
      };
    }

    default:
      return state;
  }
}
