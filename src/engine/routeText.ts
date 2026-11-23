import { NODE_BY_ID } from '../data/graph';
import { DEST_BY_NODE } from '../data/destinations';
import { zoneById } from '../data/zones';
import type { GNode, Level, ZoneId } from '../data/types';
import type { MessageKey, Translator } from '../i18n/core';
import type { RouteStep } from './steps';

/**
 * Turns a structured RouteStep into a list of localized sentences. Values that must match the
 * physical signage (entrance names, department names, room codes, elevator codes) are emitted as
 * `{ sign }` and rendered verbatim in English (isolated with <bdi lang="en"> in the UI).
 */
export type PV = string | number | { sign: string } | { k: MessageKey; p?: Record<string, PV> } | { list: PV[] };
export interface Sentence {
  k: MessageKey;
  p?: Record<string, PV>;
}

export function levelCode(zone: ZoneId | string, level: Level): string {
  if (level === -1) return zone === 'A' ? 'T' : 'B';
  return `${zone}${level}`;
}

export function placeOf(n: GNode, isDest: boolean): PV {
  const d = DEST_BY_NODE[n.id];
  if (d && (isDest || n.kind === 'destination')) return { sign: `${d.name} (${d.room})` };
  if (n.kind === 'elevator' || n.lm === 'elevators') return { k: 'pl.elevators', p: { zone: n.zone } };
  switch (n.lm) {
    case 'compass': return { k: 'pl.compass' };
    case 'lobby': return { k: 'pl.lobby', p: { zone: n.zone } };
    case 'corridorEnd': return { k: 'pl.corridorEnd' };
    case 'stairsOpening': return { k: 'pl.stairsOpening' };
    case 'aquarium': return { k: 'pl.aquarium' };
    case 'column': return { k: 'pl.column' };
    case 'museumCases': return { k: 'pl.museumCases' };
    case 'infoDesk': return { k: 'pl.infoDesk' };
    case 'trainingDoor': return { k: 'pl.trainingDoor' };
    case 'walkway': return { k: 'pl.walkway' };
    case 'doubleDoors': return { k: 'pl.doubleDoors' };
    case 'timHortons': return { sign: 'On the Go / Tim Hortons' };
  }
  if (n.label) return { sign: n.label };
  return { k: 'pl.junction' };
}

const colourKey = (z: ZoneId): MessageKey => `colour.${zoneById(z)?.colourName ?? 'grey'}` as MessageKey;

export function sentencesForStep(step: RouteStep, isFirst: boolean): Sentence[] {
  const out: Sentence[] = [];
  const from = NODE_BY_ID[step.from];
  const to = NODE_BY_ID[step.to];
  if (step.turn === 'left') out.push({ k: 'r.turnLeft' });
  if (step.turn === 'right') out.push({ k: 'r.turnRight' });
  if (step.turn === 'back') out.push({ k: 'r.turnBack' });

  switch (step.kind) {
    case 'elevator': {
      if (step.bank === 'GG') {
        out.push({ k: (step.levelTo ?? 0) < step.level ? 'r.garageDown' : 'r.garageUp' });
        return out;
      }
      const lv = step.levelTo as Level;
      out.push({
        k: 'r.takeElevator',
        p: {
          bank: { k: 'pl.elevators', p: { zone: step.bank! } },
          level: lv === -1 ? 'B' : lv,
          code: { sign: levelCode(step.bank!, lv) },
        },
      });
      out.push({ k: 'r.exitElevator' });
      return out;
    }
    case 'tunnel':
      out.push({ k: 'r.tunnel' });
      return out;
    case 'outdoor':
      out.push({ k: to.id === 'E1_OUT' ? 'r.crossStreet' : 'r.walkOutside', p: { place: { sign: to.label ?? '' } } });
      return out;
    case 'enter': {
      const ent = from.kind === 'entrance' ? from : to;
      out.push({ k: 'r.enter', p: { entrance: { sign: ent.label ?? ent.id } } });
      if (step.door === 'sliding') out.push({ k: 'r.slidingDoors' });
      break;
    }
    case 'restricted':
      out.push({ k: 'r.restricted' });
      break;
    default:
      if (isFirst && from.kind === 'garage' && from.id === 'CS_PARK') {
        out.push({ k: 'r.garageToElevators' });
        return out;
      }
      if (from.id === 'GG_EL_P' && to.id === 'GG_STREET') {
        out.push({ k: 'r.streetExit' });
        return out;
      }
      if (step.door === 'sliding') out.push({ k: 'r.slidingDoors' });
  }
  if (step.door === 'closed') out.push({ k: 'r.closedDoor' });
  if (step.door === 'open') out.push({ k: 'r.openDoor' });
  if (step.door === 'double') out.push({ k: 'r.doubleDoors' });
  if (step.zoneFrom && step.zoneTo) {
    out.push({ k: 'r.zoneChange', p: { from: step.zoneFrom, to: step.zoneTo, fromColour: { k: colourKey(step.zoneFrom) }, toColour: { k: colourKey(step.zoneTo) } } });
  }
  const passed = step.passed.map((id) => NODE_BY_ID[id]).filter((n) => n && n.lm && n.id !== step.to);
  if (passed.length) out.push({ k: 'r.walkPast', p: { places: { list: passed.map((n) => placeOf(n, false)) } } });

  if (step.arrive) {
    const place = placeOf(NODE_BY_ID[step.arrive.node], true);
    const key: MessageKey = step.arrive.side === 'left' ? 'r.arriveLeft' : step.arrive.side === 'right' ? 'r.arriveRight' : step.arrive.side === 'behind' ? 'r.arriveBehind' : 'r.arriveAhead';
    out.push({ k: key, p: { place } });
  } else if (step.elevatorSide) {
    out.push({ k: step.elevatorSide === 'left' ? 'r.elevatorsLeft' : 'r.elevatorsRight', p: { zone: to.zone } });
  } else if (step.kind !== 'enter' || to.kind !== 'junction' || to.lm) {
    out.push({ k: 'r.walkTo', p: { place: placeOf(to, false) } });
  }
  return out;
}

/* ---------- plain-text rendering (TTS, print, tests) ---------- */
function pvText(v: PV, tr: Translator): string {
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if ('sign' in v) return v.sign;
  if ('list' in v) return v.list.map((x) => pvText(x, tr)).join(', ');
  return sentenceText({ k: v.k, p: v.p }, tr);
}

export function sentenceText(s: Sentence, tr: Translator): string {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(s.p ?? {})) params[k] = pvText(v, tr);
  return tr.t(s.k, params);
}

export function stepText(step: RouteStep, tr: Translator, isFirst: boolean): string {
  return sentencesForStep(step, isFirst).map((s) => sentenceText(s, tr)).join(' ');
}
