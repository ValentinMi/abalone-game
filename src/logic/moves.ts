import { type Hex, Player, type Board, type Move, MoveType } from '../types';
import { HEX_DIRECTIONS } from '../constants';
import {
  hexAdd,
  hexKey,
  hexEqual,
  hexSubtract,
  isOnBoard,
  normalizeDirection,
} from '../utils/hex';

export function generateValidMoves(
  board: Board,
  selectedMarbles: Hex[],
  currentPlayer: Player,
): Move[] {
  if (selectedMarbles.length === 0) return [];

  const opponent = currentPlayer === Player.Black ? Player.White : Player.Black;

  const sorted = sortAlongLine(selectedMarbles);

  const moves: Move[] = [];

  for (const dir of HEX_DIRECTIONS) {
    const inline = tryInlineMove(board, sorted, dir, currentPlayer, opponent);
    if (inline) moves.push(inline);

    if (sorted.length >= 2) {
      const broadside = tryBroadsideMove(board, sorted, dir);
      if (broadside) moves.push(broadside);
    }
  }

  return moves;
}

function tryInlineMove(
  board: Board,
  marbles: Hex[],
  direction: Hex,
  currentPlayer: Player,
  opponent: Player,
): Move | null {
  if (marbles.length === 1) {
    const dest = hexAdd(marbles[0], direction);
    if (!isOnBoard(dest)) return null;

    const content = board.get(hexKey(dest));
    if (content !== null) return null;

    return { type: MoveType.InLine, marbles: [...marbles], direction };
  }

  const lineDir = lineDirection(marbles);
  if (!lineDir) return null;

  if (!isParallel(direction, lineDir)) return null;

  const front = leadMarble(marbles, direction);
  const ahead = hexAdd(front, direction);

  if (!isOnBoard(ahead)) return null;

  const aheadContent = board.get(hexKey(ahead));

  if (aheadContent === null) {
    return { type: MoveType.InLine, marbles: [...marbles], direction };
  }

  if (aheadContent === currentPlayer) return null;

  const opponentChain = countChain(board, ahead, direction, opponent);

  if (marbles.length <= opponentChain.length) return null;

  const behindLast = hexAdd(opponentChain[opponentChain.length - 1], direction);

  if (isOnBoard(behindLast)) {
    const behindContent = board.get(hexKey(behindLast));
    if (behindContent !== null && behindContent !== undefined) return null;
  }

  const pushedOff = !isOnBoard(behindLast)
    ? [opponentChain[opponentChain.length - 1]]
    : undefined;

  return {
    type: MoveType.InLine,
    marbles: [...marbles],
    direction,
    pushed: [...opponentChain],
    pushedOff,
  };
}

function tryBroadsideMove(
  board: Board,
  marbles: Hex[],
  direction: Hex,
): Move | null {
  if (marbles.length < 2) return null;

  const lineDir = lineDirection(marbles);
  if (!lineDir) return null;

  if (isParallel(direction, lineDir)) return null;

  for (const marble of marbles) {
    const dest = hexAdd(marble, direction);
    if (!isOnBoard(dest)) return null;

    const content = board.get(hexKey(dest));

    if (content !== null && content !== undefined) {
      if (!marbles.some(m => hexEqual(m, dest))) return null;
    }
  }

  return { type: MoveType.Broadside, marbles: [...marbles], direction };
}

function lineDirection(marbles: Hex[]): Hex | null {
  if (marbles.length < 2) return null;
  return normalizeDirection(hexSubtract(marbles[1], marbles[0]));
}

function isParallel(a: Hex, b: Hex) {
  return hexEqual(a, b) || hexEqual(a, { q: -b.q, r: -b.r });
}

function leadMarble(marbles: Hex[], direction: Hex): Hex {
  let best = marbles[0];
  let bestProj = dot(best, direction);
  for (let i = 1; i < marbles.length; i++) {
    const proj = dot(marbles[i], direction);
    if (proj > bestProj) {
      bestProj = proj;
      best = marbles[i];
    }
  }
  return best;
}

function countChain(
  board: Board,
  start: Hex,
  direction: Hex,
  player: Player,
): Hex[] {
  const chain: Hex[] = [];
  let pos = start;

  while (isOnBoard(pos) && board.get(hexKey(pos)) === player) {
    chain.push(pos);
    pos = hexAdd(pos, direction);
  }

  return chain;
}

function sortAlongLine(marbles: Hex[]): Hex[] {
  if (marbles.length <= 1) return [...marbles];

  const dir = normalizeDirection(hexSubtract(marbles[1], marbles[0]));
  if (!dir) return [...marbles];

  return [...marbles].sort((a, b) => dot(a, dir) - dot(b, dir));
}

function dot(h: Hex, d: Hex) {
  return h.q * d.q + h.r * d.r;
}
