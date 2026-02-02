import { type Hex, Player, type Board } from '../types';
import { hexKey } from '../utils/hex';
import { BOARD_RADIUS } from '../constants';

export function getAllHexes(): Hex[] {
  const hexes: Hex[] = [];
  for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q++) {
    for (let r = -BOARD_RADIUS; r <= BOARD_RADIUS; r++) {
      if (Math.abs(q + r) <= BOARD_RADIUS) {
        hexes.push({ q, r });
      }
    }
  }
  return hexes;
}

export function createInitialBoard(): Board {
  const board: Board = new Map();

  for (const hex of getAllHexes()) {
    board.set(hexKey(hex), null);
  }

  for (let q = 0; q <= 4; q++) board.set(hexKey({ q, r: -4 }), Player.Black);
  for (let q = -1; q <= 4; q++) board.set(hexKey({ q, r: -3 }), Player.Black);
  for (let q = 0; q <= 2; q++) board.set(hexKey({ q, r: -2 }), Player.Black);

  for (let q = -4; q <= 0; q++) board.set(hexKey({ q, r: 4 }), Player.White);
  for (let q = -4; q <= 1; q++) board.set(hexKey({ q, r: 3 }), Player.White);
  for (let q = -2; q <= 0; q++) board.set(hexKey({ q, r: 2 }), Player.White);

  return board;
}
