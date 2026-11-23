import { NODE_BY_ID } from '../../data/graph';
import type { GEdge, Level } from '../../data/types';

/** Map-frame pixels (1688×2184 traced site map) → world units. North = −Z. */
export const SCALE = 20;
export const CX = 850;
export const CY = 1150;
export const FLOOR_H = 2.4;
export const GROUND_Y = -1.25;

export const wx = (x: number) => (x - CX) / SCALE;
export const wz = (y: number) => (y - CY) / SCALE;
export const wy = (level: Level | number) => level * FLOOR_H;

export interface RoutePoint {
  x: number;
  y: number;
  level: Level;
  node?: string;
}

const TUNNEL_VIA: [number, number][] = [
  [330, 2050],
  [520, 1840],
  [700, 1600],
];

/** Polyline (map px + level) for a node path; tunnel and elevator edges get extra vertices. */
export function routePolyline(nodes: string[], edges: GEdge[]): RoutePoint[] {
  const pts: RoutePoint[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = NODE_BY_ID[nodes[i]];
    if (i > 0) {
      const e = edges[i - 1];
      const prev = NODE_BY_ID[nodes[i - 1]];
      if (e.kind === 'tunnel') {
        const via = prev.id === 'GG_EL_T' ? TUNNEL_VIA : [...TUNNEL_VIA].reverse();
        for (const [x, y] of via) pts.push({ x, y, level: -1 });
      }
    }
    pts.push({ x: n.x, y: n.y, level: n.level, node: n.id });
  }
  return pts;
}

export function toWorld(p: RoutePoint, lift = 0.35): [number, number, number] {
  return [wx(p.x), wy(p.level) + lift, wz(p.y)];
}

export function bbox(points: RoutePoint[]) {
  const xs = points.map((p) => wx(p.x));
  const zs = points.map((p) => wz(p.y));
  const ys = points.map((p) => wy(p.level));
  return {
    min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)] as [number, number, number],
    max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)] as [number, number, number],
  };
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
