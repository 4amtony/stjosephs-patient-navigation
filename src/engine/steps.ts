import { BANKS, NODE_BY_ID } from '../data/graph';
import type { BankId, Cardinal, Evidence, GEdge, GNode, Level, Provenance, Side, StepFree, Turn, ZoneId } from '../data/types';
import { edgeHeadings, sideOf, turnBetween } from './geometry';

/**
 * Structured, language-neutral route step. UI renders it from localized sentence templates
 * (src/i18n), keeping official English sign names verbatim. No free-text generation here.
 */
export interface RouteStep {
  i: number;
  kind: 'enter' | 'walk' | 'elevator' | 'tunnel' | 'outdoor' | 'restricted';
  turn: Turn;
  from: string;
  to: string;
  /** every node this step covers (for 3D highlight) */
  nodes: string[];
  level: Level;
  levelTo?: Level;
  bank?: BankId;
  /** first zone change inside this step */
  zoneFrom?: ZoneId;
  zoneTo?: ZoneId;
  door?: GEdge['door'];
  /** named landmarks passed straight through */
  passed: string[];
  /** arrival info if the step ends at the destination */
  arrive?: { node: string; side: Side };
  /** for 'side-approach' elevator banks: the elevators are on this side (no turn needed) */
  elevatorSide?: 'left' | 'right';
  status: Provenance;
  stepFree: StepFree;
  evidence: Evidence[];
}

const RANK: Provenance[] = ['OFFICIAL', 'DERIVED', 'SCHEMATIC', 'UNVERIFIED', 'CONFLICTING', 'FICTIONAL'];
function weaker(a: Provenance, b: Provenance): Provenance {
  return RANK.indexOf(a) >= RANK.indexOf(b) ? a : b;
}
function weakerSF(a: StepFree, b: StepFree): StepFree {
  const r: StepFree[] = ['yes', 'unknown', 'no'];
  return r.indexOf(a) >= r.indexOf(b) ? a : b;
}

export function startHeading(n: GNode, facing?: Cardinal): Cardinal | null {
  if (facing) return facing;
  if (n.inHeading) return n.inHeading;
  if (n.bank) return BANKS[n.bank].exit;
  return null;
}

const NAMED = new Set(['compass', 'elevators', 'timHortons', 'lobby', 'aquarium', 'stairsOpening', 'column', 'museumCases']);

export function buildSteps(nodes: string[], edges: GEdge[], facing?: Cardinal): RouteStep[] {
  const steps: RouteStep[] = [];
  let heading = startHeading(NODE_BY_ID[nodes[0]], facing);
  let cur: RouteStep | null = null;
  const destId = nodes[nodes.length - 1];

  const close = () => {
    if (cur) steps.push(cur);
    cur = null;
  };

  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const a = NODE_BY_ID[nodes[i]];
    const b = NODE_BY_ID[nodes[i + 1]];

    if (e.kind === 'elevator') {
      close();
      const bank = (a.bank ?? b.bank) as BankId;
      steps.push({
        i: steps.length, kind: 'elevator', turn: 'straight', from: a.id, to: b.id, nodes: [a.id, b.id],
        level: a.level, levelTo: b.level, bank, passed: [], status: e.status, stepFree: e.stepFree, evidence: e.ev,
      });
      heading = BANKS[bank].exit;
      continue;
    }

    const [dep, arr] = edgeHeadings(e, a, b);
    let turn = turnBetween(heading, dep);
    // "Watch for the elevators on your right" — approaching a side-approach bank right before riding it
    const next = edges[i + 1];
    let elevatorSide: 'left' | 'right' | undefined;
    if (b.bank && BANKS[b.bank].approach === 'side' && next?.kind === 'elevator' && (turn === 'left' || turn === 'right') && a.kind !== 'elevator') {
      elevatorSide = turn;
      turn = 'straight';
    }
    const kind: RouteStep['kind'] = b.kind === 'entrance' && a.kind === 'outdoor' ? 'enter'
      : e.kind === 'tunnel' ? 'tunnel'
      : e.kind === 'outdoor' ? 'outdoor'
      : e.kind === 'restricted' ? 'restricted'
      : i === 0 && a.kind === 'entrance' ? 'enter'
      : 'walk';
    const zoneChange = a.zone !== b.zone && !['OUT', 'GG', 'CG'].includes(a.zone) && !['OUT', 'GG', 'CG'].includes(b.zone);

    const c = cur as RouteStep | null;
    const canMerge = !!c && c.kind === 'walk' && kind === 'walk' && turn === 'straight' && !e.door && !(zoneChange && c.zoneFrom);
    if (canMerge && c) {
      if (elevatorSide) c.elevatorSide = elevatorSide;
      if (NAMED.has(a.lm ?? '') || (a.kind === 'destination' && a.id !== destId)) {
        if (NAMED.has(a.lm ?? '')) c.passed.push(a.id);
      }
      c.to = b.id;
      c.nodes.push(b.id);
      if (zoneChange) {
        c.zoneFrom = a.zone;
        c.zoneTo = b.zone;
      }
      c.status = weaker(c.status, e.status);
      c.stepFree = weakerSF(c.stepFree, e.stepFree);
      c.evidence.push(...e.ev);
    } else {
      close();
      cur = {
        i: steps.length, kind, turn, from: a.id, to: b.id, nodes: [a.id, b.id], level: a.level,
        zoneFrom: zoneChange ? a.zone : undefined, zoneTo: zoneChange ? b.zone : undefined,
        door: e.door, passed: [], status: e.status, stepFree: e.stepFree, evidence: [...e.ev], elevatorSide,
      };
      // an 'enter' step absorbs the next straight walk (e.g. through the sliding doors into the lobby)
    }
    heading = arr;
    if (b.id === destId) {
      const step = cur as RouteStep | null;
      if (step && b.door) step.arrive = { node: b.id, side: sideOf(arr, b.door) };
      else if (step) step.arrive = { node: b.id, side: 'ahead' };
    }
  }
  close();
  steps.forEach((s, i) => (s.i = i));
  return steps;
}

export interface RouteQuality {
  status: Provenance;
  stepFree: StepFree;
  noStairs: boolean;
  unknownSegments: number;
  doors: number;
  elevatorRides: number;
  levels: Level[];
}

export function assessRoute(steps: RouteStep[], edges: GEdge[]): RouteQuality {
  let status: Provenance = 'OFFICIAL';
  let sf: StepFree = 'yes';
  for (const s of steps) {
    status = weaker(status, s.status);
    sf = weakerSF(sf, s.stepFree);
  }
  const levels = Array.from(new Set(steps.flatMap((s) => s.nodes.map((n) => NODE_BY_ID[n].level)))).sort((a, b) => a - b) as Level[];
  return {
    status,
    stepFree: sf,
    noStairs: !edges.some((e) => e.kind === 'stairs'),
    unknownSegments: edges.filter((e) => e.stepFree === 'unknown').length,
    doors: edges.filter((e) => e.door === 'closed' || e.door === 'double').length,
    elevatorRides: steps.filter((s) => s.kind === 'elevator').length,
    levels,
  };
}
