import { HEX_SIZE } from '../constants';

export function hexPolygonPoints(cx: number, cy: number, size = HEX_SIZE) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i + 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');
}
