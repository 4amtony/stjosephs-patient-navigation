import { DESTINATIONS, OFFICIAL, OFFICIAL_ORIGIN_NODE, officialEntry } from '../data/destinations';
import { planRoute } from './router';
import { buildSteps } from './steps';

/**
 * Cross-checks the graph against the hospital's own wording. For every official route
 * (origin → destination) we extract the ordered left/right turn words and the final side
 * ("… is on the left/right", "straight ahead", "in front of you") and compare them with what the
 * graph-generated route says. Used by tests and by docs/DATA_COVERAGE.md.
 */
export interface RouteCheck {
  dest: string;
  origin: string;
  officialTurns: string[];
  generatedTurns: string[];
  officialSide: string | null;
  generatedSide: string | null;
  turnsMatch: boolean;
  sideMatch: boolean;
  routed: boolean;
}

export function officialTurnWords(lines: string[]): { turns: string[]; side: string | null } {
  const turns: string[] = [];
  for (const raw of lines) {
    const l = raw.toLowerCase();
    // ordered scan of turn phrases within the line
    const re = /(turn (left|right))|(proceed to the (right|left))|(through the zone c lobby to the (left))|(turn around|proceed towards grosvenor entrance 2)|(go around the corner)|(doors to your (left|right))/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(l))) {
      if (m[2]) turns.push(m[2]);
      else if (m[4]) turns.push(m[4]);
      else if (m[6]) turns.push(m[6]);
      else if (m[7]) turns.push('back');
      // "turn left and go around the corner" = a second turn in the same direction
      else if (m[8] && turns.length) turns.push(turns[turns.length - 1]);
      else if (m[10]) turns.push(m[10]);
    }
  }
  const tail = lines.slice(-2).map((x) => x.toLowerCase());
  const sideRe = /(on (the|your) (left|right))|(will be on (the|your|you) (left|right))|straight ahead|in front of you|is here|at the end of the corridor/;
  const last = sideRe.test(tail[tail.length - 1] ?? '') ? tail[tail.length - 1] : tail.join(' ');
  let side: string | null = null;
  if (/on (the|your) left|is on the left|will be on the left/.test(last)) side = 'left';
  else if (/on (the|your) right|is on the right|will be on (the|your|you) right/.test(last)) side = 'right';
  else if (/straight ahead|in front of you|is here|at the end of the corridor/.test(last)) side = 'ahead';
  return { turns, side };
}

export function validateAll(): RouteCheck[] {
  const out: RouteCheck[] = [];
  for (const d of DESTINATIONS) {
    const e = officialEntry(d);
    if (!e) continue;
    for (const r of e.routes) {
      const originNode = OFFICIAL_ORIGIN_NODE[r.origin];
      if (!originNode) continue;
      // "Follow directions From Cheapside Entrance 4" — a cross-reference, not a full step list
      if (r.steps.some((s) => /follow directions/i.test(s.text))) continue;
      const off = officialTurnWords(r.steps.filter((s) => !s.note).map((s) => s.text));
      const res = planRoute(originNode, d.node);
      if (!res.ok) {
        out.push({ dest: d.id, origin: r.origin, officialTurns: off.turns, generatedTurns: [], officialSide: off.side, generatedSide: null, turnsMatch: false, sideMatch: false, routed: false });
        continue;
      }
      const steps = buildSteps(res.nodes, res.edges);
      const gen = steps.filter((s) => s.turn !== 'straight').map((s) => s.turn as string);
      const last = steps[steps.length - 1];
      const gSide = last?.arrive?.side ?? null;
      out.push({
        dest: d.id, origin: r.origin, officialTurns: off.turns, generatedTurns: gen, officialSide: off.side, generatedSide: gSide,
        turnsMatch: gen.join(',') === off.turns.join(','),
        sideMatch: off.side == null || off.side === gSide,
        routed: true,
      });
    }
  }
  return out;
}

export function summary(checks: RouteCheck[]) {
  const routed = checks.filter((c) => c.routed).length;
  const turns = checks.filter((c) => c.turnsMatch).length;
  const sides = checks.filter((c) => c.sideMatch && c.officialSide).length;
  const sideTotal = checks.filter((c) => c.officialSide).length;
  const both = checks.filter((c) => c.turnsMatch && c.sideMatch).length;
  return { total: checks.length, routed, turns, sides, sideTotal, both, officialEntries: OFFICIAL.entries.length };
}
