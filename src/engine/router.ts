import { EDGES, NODE_BY_ID, ORIGIN_VIA } from '../data/graph';
import type { GEdge, GNode } from '../data/types';
import { dist } from './geometry';

export interface RouteOptions {
  /** avoid stairs; penalise segments whose step-free status is unknown (e.g. street crossings) */
  stepFree?: boolean;
  /** fictional staff verification completed (security demo) */
  accessUnlocked?: boolean;
  /** node ids that must not be used (e.g. entrances closed at the planned time) */
  closedNodes?: Set<string>;
}

export type RouteFailure = 'unknown-node' | 'same-place' | 'restricted' | 'no-path';

export interface RouteOk {
  ok: true;
  nodes: string[];
  edges: GEdge[];
  cost: number;
}
export interface RouteFail {
  ok: false;
  reason: RouteFailure;
}
export type RouteResult = RouteOk | RouteFail;

interface Adj {
  to: string;
  edge: GEdge;
}

const ADJ: Record<string, Adj[]> = {};
for (const e of EDGES) {
  (ADJ[e.a] ??= []).push({ to: e.b, edge: e });
  if (!e.oneway) (ADJ[e.b] ??= []).push({ to: e.a, edge: e });
}

export function edgeCost(e: GEdge, a: GNode, b: GNode, opts: RouteOptions): number {
  if (e.kind === 'elevator') return 30 + 4 * Math.abs(a.level - b.level);
  let c = dist(a, b) / 10;
  if (e.kind === 'outdoor') c *= 1.4;
  if (e.costMul) c *= e.costMul;
  if (e.status === 'DERIVED') c *= 1.1;
  if (e.status === 'CONFLICTING') c *= 1.5;
  if (opts.stepFree && e.stepFree === 'unknown' && (e.kind === 'outdoor' || e.kind === 'stairs')) c *= 2.5;
  return c + 0.5;
}

export function isRestrictedNode(id: string): boolean {
  const n = NODE_BY_ID[id];
  return !!n && (n.kind === 'restricted' || n.zone === 'X');
}

/** Dijkstra over the source-backed graph. Deterministic; no AI involved in route decisions. */
export function findRoute(from: string, to: string, opts: RouteOptions = {}): RouteResult {
  if (!NODE_BY_ID[from] || !NODE_BY_ID[to]) return { ok: false, reason: 'unknown-node' };
  if (from === to) return { ok: false, reason: 'same-place' };
  if (isRestrictedNode(to) && !opts.accessUnlocked) return { ok: false, reason: 'restricted' };

  const distMap = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, { node: string; edge: GEdge }>();
  const done = new Set<string>();
  // tiny graph (~150 nodes): an array scan is plenty fast and keeps this dependency-free
  const open = new Set<string>([from]);
  while (open.size) {
    let cur = '';
    let best = Infinity;
    for (const id of open) {
      const d = distMap.get(id)!;
      if (d < best) {
        best = d;
        cur = id;
      }
    }
    open.delete(cur);
    if (cur === to) break;
    done.add(cur);
    for (const { to: nxt, edge } of ADJ[cur] ?? []) {
      if (done.has(nxt)) continue;
      if (edge.kind === 'restricted' && !opts.accessUnlocked) continue;
      if (opts.stepFree && (edge.kind === 'stairs' || edge.stepFree === 'no')) continue;
      if (opts.closedNodes?.has(nxt) && nxt !== to) continue;
      const c = best + edgeCost(edge, NODE_BY_ID[cur], NODE_BY_ID[nxt], opts);
      if (c < (distMap.get(nxt) ?? Infinity)) {
        distMap.set(nxt, c);
        prev.set(nxt, { node: cur, edge });
        open.add(nxt);
      }
    }
  }
  if (!prev.has(to)) return { ok: false, reason: 'no-path' };
  const nodes = [to];
  const edges: GEdge[] = [];
  let c = to;
  while (c !== from) {
    const p = prev.get(c)!;
    edges.unshift(p.edge);
    nodes.unshift(p.node);
    c = p.node;
  }
  return { ok: true, nodes, edges, cost: distMap.get(to)! };
}

/**
 * Public entry point: like findRoute, but honours official-route anchoring (ORIGIN_VIA) so that
 * a route from an official origin follows the officially published first leg.
 */
export function planRoute(from: string, to: string, opts: RouteOptions = {}): RouteResult {
  const via = ORIGIN_VIA[from];
  if (!via || via === to) return findRoute(from, to, opts);
  const first = findRoute(from, via, opts);
  const second = findRoute(via, to, opts);
  if (!first.ok || !second.ok) return findRoute(from, to, opts);
  return { ok: true, nodes: [...first.nodes, ...second.nodes.slice(1)], edges: [...first.edges, ...second.edges], cost: first.cost + second.cost };
}
