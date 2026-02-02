import type { Board, HexKey, Move, Player } from '../src/types.ts';
import type { SerializedGameState } from './protocol.ts';
import type { GameState } from '../src/types.ts';
import { hexEqual } from '../src/utils/hex.ts';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function serializeBoard(board: Board): Record<HexKey, Player | null> {
  const obj: Record<HexKey, Player | null> = {};
  for (const [key, value] of board) {
    obj[key] = value;
  }
  return obj;
}

export function deserializeBoard(obj: Record<HexKey, Player | null>): Board {
  return new Map(Object.entries(obj)) as Board;
}

export function serializeGameState(state: GameState): SerializedGameState {
  return {
    board: serializeBoard(state.board),
    currentPlayer: state.currentPlayer,
    scores: state.scores,
    winner: state.winner,
  };
}

function hexArrayEqual(a: { q: number; r: number }[], b: { q: number; r: number }[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!hexEqual(a[i], b[i])) return false;
  }
  return true;
}

export function moveEqual(a: Move, b: Move): boolean {
  if (a.type !== b.type) return false;
  if (!hexEqual(a.direction, b.direction)) return false;
  if (!hexArrayEqual(a.marbles, b.marbles)) return false;
  return true;
}

export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}
