import type { Hex, HexKey, Move, Player } from '../src/types.ts';

export type SerializedGameState = {
  board: Record<HexKey, Player | null>;
  currentPlayer: Player;
  scores: Record<string, number>;
  winner: Player | null;
};

export type ClientMessage =
  | { type: 'create_room' }
  | { type: 'join_room'; code: string }
  | { type: 'reconnect'; code: string; playerId: string }
  | { type: 'execute_move'; move: Move }
  | { type: 'chat'; text: string };

export type ServerMessage =
  | { type: 'room_created'; code: string; playerId: string }
  | { type: 'room_joined'; code: string; playerId: string; player: Player }
  | { type: 'opponent_joined' }
  | { type: 'game_start'; player: Player; state: SerializedGameState }
  | { type: 'game_state'; state: SerializedGameState }
  | { type: 'move_rejected'; reason: string }
  | { type: 'chat'; text: string; from: Player; timestamp: number }
  | { type: 'opponent_disconnected' }
  | { type: 'opponent_reconnected' }
  | { type: 'room_closed'; reason: string }
  | { type: 'error'; message: string };

export type { Hex, HexKey, Move, Player };
