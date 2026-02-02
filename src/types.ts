export type Hex = { q: number; r: number };

export type HexKey = string;

export const Player = {
  Black: 'B',
  White: 'W',
} as const;
export type Player = (typeof Player)[keyof typeof Player];

export type Board = Map<HexKey, Player | null>;

export const MoveType = {
  InLine: 'inline',
  Broadside: 'broadside',
} as const;
export type MoveType = (typeof MoveType)[keyof typeof MoveType];

export type Move = {
  type: MoveType;
  marbles: Hex[];
  direction: Hex;
  pushed?: Hex[];
  pushedOff?: Hex[];
};

export type GameState = {
  board: Board;
  currentPlayer: Player;
  scores: Record<Player, number>;
  selectedMarbles: Hex[];
  validMoves: Move[];
  winner: Player | null;
};

export type SerializedGameState = {
  board: Record<HexKey, Player | null>;
  currentPlayer: Player;
  scores: Record<string, number>;
  winner: Player | null;
};

export type Action =
  | { type: 'SELECT_MARBLE'; hex: Hex }
  | { type: 'DESELECT_MARBLE'; hex: Hex }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'EXECUTE_MOVE'; move: Move }
  | { type: 'NEW_GAME' }
  | { type: 'SET_SERVER_STATE'; state: SerializedGameState };
