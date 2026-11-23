import type { Cardinal, GEdge, GNode, Side, Turn } from '../data/types';

/** Degrees in map coordinates (x → east, y → south). East = 0, south = 90, north = -90. */
export const CARD_DEG: Record<Cardinal, number> = { E: 0, SE: 45, S: 90, SW: 135, W: 180, NW: -135, N: -90, NE: -45 };
const CARDS: Cardinal[] = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

export function norm(d: number): number {
  let x = ((d + 180) % 360 + 360) % 360 - 180;
  if (x === -180) x = 180;
  return x;
}

export function opposite(c: Cardinal): Cardinal {
  return snap(CARD_DEG[c] + 180);
}

export function snap(deg: number): Cardinal {
  const i = Math.round(norm(deg) / 45);
  return CARDS[((i % 8) + 8) % 8];
}

export function geoHeading(a: GNode, b: GNode): Cardinal {
  return snap((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI);
}

const pair = (h: Cardinal | [Cardinal, Cardinal]): [Cardinal, Cardinal] => (Array.isArray(h) ? h : [h, h]);

/** [departHeading, arriveHeading] when walking edge from node `from` to the other end. */
export function edgeHeadings(e: GEdge, from: GNode, to: GNode): [Cardinal, Cardinal] {
  const forward = e.a === from.id;
  if (forward) {
    if (e.headAB) return pair(e.headAB);
    return [geoHeading(from, to), geoHeading(from, to)];
  }
  if (e.headBA) return pair(e.headBA);
  if (e.headAB) {
    const [d, a] = pair(e.headAB);
    return [opposite(a), opposite(d)];
  }
  return [geoHeading(from, to), geoHeading(from, to)];
}

/** Turn needed when currently facing `heading` and about to walk toward `next`. */
export function turnBetween(heading: Cardinal | null, next: Cardinal): Turn {
  if (!heading) return 'straight';
  const d = norm(CARD_DEG[next] - CARD_DEG[heading]);
  if (Math.abs(d) < 40) return 'straight';
  if (Math.abs(d) >= 150) return 'back';
  return d < 0 ? 'left' : 'right';
}

/** Which side a door on cardinal `door` is when walking with `heading`. */
export function sideOf(heading: Cardinal, door: Cardinal): Side {
  const d = norm(CARD_DEG[door] - CARD_DEG[heading]);
  if (Math.abs(d) <= 45) return 'ahead';
  if (Math.abs(d) >= 135) return 'behind';
  return d < 0 ? 'left' : 'right';
}

/** Map-pixel distance between two nodes (schematic, NOT metres). */
export function dist(a: GNode, b: GNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
