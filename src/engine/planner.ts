import { NODE_BY_ID } from '../data/graph';
import { officialRouteFrom, officialShortestOrigin, type Destination } from '../data/destinations';
import { ENTRANCES, GARAGES, isBusyWindow, minutesToClose, openAt, type Garage, type OpenState, type Weekday, type EntranceInfo } from '../data/parking';
import type { MessageKey, Params } from '../i18n/core';
import { planRoute, type RouteOk } from './router';
import { buildSteps } from './steps';

/**
 * Parking / entrance recommendation. Rule-based and explainable: every reason is a translatable
 * message key backed by an official fact. No distances, no live occupancy, no AI.
 */
export interface Reason {
  key: MessageKey;
  params?: Params;
  tone: 'good' | 'warn' | 'bad' | 'info';
}

export interface PlanContext {
  dest: Destination;
  day: Weekday | null;
  time: string | null;
  stepFree: boolean;
}

export interface GarageOption {
  garage: Garage;
  open: OpenState;
  route: RouteOk | null;
  rides: number;
  zoneChanges: number;
  stepCount: number;
  score: number;
  reasons: Reason[];
  recommended: boolean;
  usesTunnel: boolean;
}

/** Entrance (and outside drop-off node) ids closed at the given time. */
export function closedNodesAt(day: Weekday | null, time: string | null): Set<string> {
  const s = new Set<string>();
  for (const e of ENTRANCES) {
    if (e.hours.length && openAt(e.hours, day, time) === 'closed') {
      s.add(e.node);
      s.add(e.outside);
    }
  }
  return s;
}

function summarise(route: RouteOk | null) {
  if (!route) return { rides: 0, zoneChanges: 0, stepCount: 0 };
  const steps = buildSteps(route.nodes, route.edges);
  return {
    rides: steps.filter((s) => s.kind === 'elevator').length,
    zoneChanges: steps.filter((s) => s.zoneFrom).length,
    stepCount: steps.length,
  };
}

export function compareGarages(ctx: PlanContext): GarageOption[] {
  const closed = closedNodesAt(ctx.day, ctx.time);
  const zone = ctx.dest.zone;
  const opts: GarageOption[] = GARAGES.map((g) => {
    const open = openAt(g.hours, ctx.day, ctx.time);
    const r = planRoute(g.node, ctx.dest.node, { stepFree: ctx.stepFree, closedNodes: closed });
    const route = r.ok ? r : null;
    const sum = summarise(route);
    const reasons: Reason[] = [];
    let score = 0;
    if (g.id === 'cheapside') {
      reasons.push({ key: 'park.hoursCheapside', tone: open === 'closed' ? 'bad' : 'info' });
      if (open === 'closed') {
        score -= 100;
        reasons.unshift({ key: ctx.day === 0 || ctx.day === 6 ? 'park.weekendNote' : 'park.closedAt', tone: 'bad' });
      } else {
        const m = minutesToClose(g.hours, ctx.day, ctx.time);
        if (m != null && m < 150) reasons.push({ key: 'park.closesSoon', params: { min: m }, tone: 'warn' });
      }
      if (zone === 'C' || zone === 'D') {
        score += 30;
        reasons.push({ key: 'park.officialClosestCD', tone: 'good' });
      }
      reasons.push({ key: 'park.elevatorDirect', tone: 'info' });
      reasons.push({ key: 'park.spaces', params: { n: g.spaces }, tone: 'info' });
      reasons.push({ key: 'park.accessibleCheapside', tone: 'info' });
      reasons.push({ key: 'park.ratesCheapside', tone: 'info' });
    } else {
      reasons.push({ key: 'park.hoursGrosvenor', tone: 'info' });
      if (zone === 'A' || zone === 'B' || zone === 'E') {
        score += 25;
        reasons.push({ key: 'park.mainSide', tone: 'good' });
      }
      reasons.push({ key: 'park.tunnel', tone: ctx.stepFree ? 'good' : 'info' });
      if (ctx.stepFree) score += 12;
      reasons.push({ key: 'park.street', tone: 'info' });
      reasons.push({ key: 'park.spaces', params: { n: g.spaces }, tone: 'info' });
      reasons.push({ key: 'park.accessibleGrosvenor', tone: ctx.stepFree ? 'good' : 'info' });
      reasons.push({ key: 'park.ratesGrosvenor', tone: 'info' });
      reasons.push({ key: 'park.replacement', tone: 'info' });
    }
    if (route) {
      reasons.push({ key: 'park.routeSummary', params: { rides: sum.rides, zones: sum.zoneChanges }, tone: 'info' });
      score -= route.cost / 25;
    }
    if (isBusyWindow(ctx.day, ctx.time)) reasons.push({ key: 'park.busy', tone: 'warn' });
    const usesTunnel = !!route?.edges.some((e) => e.kind === 'tunnel');
    return { garage: g, open, route, ...sum, score, reasons, recommended: false, usesTunnel };
  });
  const usable = opts.filter((o) => o.open !== 'closed' && o.route);
  const best = (usable.length ? usable : opts).slice().sort((a, b) => b.score - a.score)[0];
  if (best && best.open !== 'closed') best.recommended = true;
  return opts.sort((a, b) => Number(b.recommended) - Number(a.recommended) || b.score - a.score);
}

export interface EntranceOption {
  entrance: EntranceInfo;
  open: OpenState;
  officialShortest: boolean;
  longWay: boolean;
  hasOfficialRoute: boolean;
  route: RouteOk | null;
  stepCount: number;
  rides: number;
  recommended: boolean;
}

export function compareEntrances(ctx: PlanContext, mode: 'dropoff' | 'transit'): EntranceOption[] {
  const shortest = officialShortestOrigin(ctx.dest);
  const list = ENTRANCES.filter((e) => e.dropOff || e.node === shortest);
  const out = list.map((e) => {
    const open = e.hours.length ? openAt(e.hours, ctx.day, ctx.time) : 'unknown';
    const off = officialRouteFrom(ctx.dest, e.node);
    const r = planRoute(e.node, ctx.dest.node, { stepFree: ctx.stepFree });
    const route = r.ok ? r : null;
    const sum = summarise(route);
    return {
      entrance: e, open, officialShortest: shortest === e.node, longWay: !!off?.longWay, hasOfficialRoute: !!off,
      route, stepCount: sum.stepCount, rides: sum.rides, recommended: false,
    } as EntranceOption;
  });
  const rank = (o: EntranceOption) =>
    (o.open === 'closed' ? -100 : 0) + (o.officialShortest ? 30 : 0) - (o.longWay ? 10 : 0) - (o.route ? o.route.cost / 25 : 50) +
    (mode === 'transit' && o.entrance.id === 'ENTRANCE_4' ? 3 : 0);
  const sorted = out.slice().sort((a, b) => rank(b) - rank(a));
  if (sorted[0] && sorted[0].open !== 'closed') sorted[0].recommended = true;
  return sorted;
}

export function nodeName(id: string): string {
  return NODE_BY_ID[id]?.label ?? id;
}
