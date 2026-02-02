import type { Hex, HexKey } from '../types';
import { BOARD_RADIUS, HEX_SIZE, HEX_DIRECTIONS } from '../constants';

export function hexAdd(a: Hex, b: Hex): Hex {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function hexSubtract(a: Hex, b: Hex): Hex {
  return { q: a.q - b.q, r: a.r - b.r };
}

export function hexEqual(a: Hex, b: Hex) {
  return a.q === b.q && a.r === b.r;
}

export function hexKey(h: Hex): HexKey {
  return `${h.q},${h.r}`;
}

export function parseHexKey(key: HexKey): Hex {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexDistance(a: Hex, b: Hex) {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
}

export function isOnBoard(h: Hex) {
  return Math.max(Math.abs(h.q), Math.abs(h.r), Math.abs(h.q + h.r)) <= BOARD_RADIUS;
}

export function hexToPixel(h: Hex) {
  const x = HEX_SIZE * (Math.sqrt(3) * h.q + Math.sqrt(3) / 2 * h.r);
  const y = HEX_SIZE * (3 / 2) * h.r;
  return { x, y };
}

export function hexScale(h: Hex, factor: number): Hex {
  return { q: h.q * factor, r: h.r * factor };
}

export function normalizeDirection(d: Hex): Hex | null {
  if (d.q === 0 && d.r === 0) return null;

  for (const dir of HEX_DIRECTIONS) {
    if (dir.q === 0 && dir.r === 0) continue;

    let k: number | null = null;

    if (dir.q !== 0) {
      if (d.q % dir.q !== 0) continue;
      k = d.q / dir.q;
    }
    if (dir.r !== 0) {
      if (d.r % dir.r !== 0) continue;
      const kr = d.r / dir.r;
      if (k !== null && k !== kr) continue;
      k = kr;
    }

    if (k === null) continue;

    if (dir.q === 0 && d.q !== 0) continue;
    if (dir.r === 0 && d.r !== 0) continue;

    return dir;
  }

  return null;
}

export function getDirection(from: Hex, to: Hex): Hex | null {
  const d = hexSubtract(to, from);
  if (hexDistance(from, to) !== 1) return null;
  return normalizeDirection(d);
}

export function areCollinear(hexes: Hex[]) {
  if (hexes.length <= 1) return true;

  const d = hexSubtract(hexes[1], hexes[0]);
  const dir = normalizeDirection(d);
  if (!dir) return false;

  for (let i = 2; i < hexes.length; i++) {
    const di = hexSubtract(hexes[i], hexes[0]);
    if (normalizeDirection(di) === null) return false;
    if (!hexEqual(normalizeDirection(di)!, dir)) return false;
  }

  return true;
}

export function areContiguous(hexes: Hex[]) {
  if (hexes.length <= 1) return true;
  if (!areCollinear(hexes)) return false;

  const dir = normalizeDirection(hexSubtract(hexes[1], hexes[0]))!;

  const sorted = [...hexes].sort((a, b) => {
    const da = hexSubtract(a, hexes[0]);
    const db = hexSubtract(b, hexes[0]);
    const pa = dir.q !== 0 ? da.q / dir.q : da.r / dir.r;
    const pb = dir.q !== 0 ? db.q / dir.q : db.r / dir.r;
    return pa - pb;
  });

  for (let i = 1; i < sorted.length; i++) {
    if (hexDistance(sorted[i - 1], sorted[i]) !== 1) return false;
  }

  return true;
}
