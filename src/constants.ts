import type { Hex } from './types';

export const BOARD_RADIUS = 4;

export const HEX_DIRECTIONS: Hex[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export const HEX_SIZE = 28;

export const PALETTE = {
  bg: '#0a0a2e',
  boardBg: '#12123a',
  cellFill: '#1a1a4e',
  cellStroke: '#2a2a6e',
  cellHover: '#2a2a7e',
  black: '#1a1a1a',
  blackLight: '#3a3a3a',
  blackDark: '#050505',
  white: '#e8e8e8',
  whiteLight: '#ffffff',
  whiteDark: '#b0b0b0',
  selected: '#ffcc00',
  validMove: '#00ff88',
  pushed: '#ff8800',
  pushedOff: '#ff2244',
  text: '#e0e0e0',
  textDim: '#6a6a8a',
};

export const SCORE_TO_WIN = 6;
