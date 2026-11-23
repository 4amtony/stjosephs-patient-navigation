import { describe, expect, it } from 'vitest';
import { NODE_BY_ID, EDGES } from '../src/data/graph';
import { CHECKPOINTS, parseCheckpoint } from '../src/data/checkpoints';
import { DESTINATIONS } from '../src/data/destinations';
import { planRoute } from '../src/engine/router';
import { buildSteps, assessRoute } from '../src/engine/steps';
import { summary, validateAll } from '../src/engine/validate';
import { stepText } from '../src/engine/routeText';
import { enTranslator } from '../src/i18n/core';

const turns = (from: string, to: string, opts = {}) => {
  const r = planRoute(from, to, opts);
  if (!r.ok) throw new Error(`no route ${from}→${to}: ${r.reason}`);
  const steps = buildSteps(r.nodes, r.edges);
  return { r, steps, seq: steps.filter((s) => s.turn !== 'straight').map((s) => s.turn), side: steps[steps.length - 1].arrive?.side };
};

describe('graph integrity', () => {
  it('every edge references existing nodes and has evidence', () => {
    for (const e of EDGES) {
      expect(NODE_BY_ID[e.a], e.a).toBeTruthy();
      expect(NODE_BY_ID[e.b], e.b).toBeTruthy();
      expect(e.ev.length).toBeGreaterThan(0);
    }
  });
  it('every public destination is reachable from every entrance', () => {
    for (const d of DESTINATIONS.filter((x) => !x.restricted)) {
      for (const origin of ['E1', 'E2', 'E4']) {
        const r = planRoute(origin, d.node);
        expect(r.ok || (r as { reason: string }).reason === 'same-place', `${origin}→${d.id}`).toBe(true);
      }
    }
  });
  it('every checkpoint resolves to a node', () => {
    for (const c of CHECKPOINTS) expect(NODE_BY_ID[c.node], c.id).toBeTruthy();
  });
});

describe('official direction alignment (demo routes, turn-for-turn)', () => {
  it('Scenario A: Cheapside Entrance 4 → Breast Care D1-112 (right, D elevator, left, left, on the right)', () => {
    const { seq, side, steps } = turns('E4', 'BREAST');
    expect(seq).toEqual(['right', 'left', 'left']);
    expect(side).toBe('right');
    expect(steps.some((s) => s.kind === 'elevator' && s.bank === 'D' && s.levelTo === 1)).toBe(true);
  });
  it('Scenario A: Cheapside garage goes up to C0 first, as published', () => {
    const { r } = turns('CS_PARK', 'BREAST');
    expect(r.nodes.slice(0, 3)).toEqual(['CS_PARK', 'C_EL_G', 'C_EL_0']);
  });
  it('Grosvenor Entrance 1 → Breast Care: right into B, left at compass, left into D, right, on the left', () => {
    const { seq, side } = turns('E1', 'BREAST');
    expect(seq).toEqual(['right', 'left', 'left', 'right']);
    expect(side).toBe('left');
  });
  it('Scenario B: Grosvenor Entrance 2 → MRI B5-204 (B elevator to 5, left, right at compass, closed door, on the right)', () => {
    const { seq, side, steps } = turns('E2', 'MI_B5');
    expect(seq).toEqual(['left', 'right']);
    expect(side).toBe('right');
    expect(steps.some((s) => s.door === 'closed')).toBe(true);
  });
  it('Scenario C: Zone B lift lobby Level 5 → B3-030 re-routes with a ride to Level 3 then left, desk on the right', () => {
    const { steps, seq, side } = turns('B_EL_5', 'B3030');
    expect(steps[0].kind).toBe('elevator');
    expect(steps[0].levelTo).toBe(3);
    expect(seq).toEqual(['left']);
    expect(side).toBe('right');
  });
  it('reproduces most official route variants (regression floor)', () => {
    const s = summary(validateAll());
    expect(s.routed).toBe(s.total);
    expect(s.both / s.total).toBeGreaterThan(0.75);
  });
});

describe('preferences and access are enforced in routing (not cosmetic)', () => {
  it('step-free never uses stairs edges', () => {
    const r = planRoute('GG_EL_P', 'MI_B5', { stepFree: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(assessRoute(buildSteps(r.nodes, r.edges), r.edges).noStairs).toBe(true);
  });
  it('Grosvenor garage routes use the officially "most accessible" tunnel', () => {
    const r = planRoute('GG_EL_P', 'CHAPEL');
    expect(r.ok && r.edges.some((e) => e.kind === 'tunnel')).toBe(true);
  });
  it('restricted fictional lab is blocked without verification, even from its own QR checkpoint', () => {
    expect(planRoute('E2', 'X_LAB')).toEqual({ ok: false, reason: 'restricted' });
    expect(planRoute('X_DOOR', 'X_LAB')).toEqual({ ok: false, reason: 'restricted' });
    const ok = planRoute('E2', 'X_LAB', { accessUnlocked: true });
    expect(ok.ok).toBe(true);
  });
  it('public information desk needs no verification', () => {
    expect(planRoute('E1', 'INFO_E2').ok).toBe(true);
  });
  it('closed entrances are avoided', () => {
    const r = planRoute('GG_EL_P', 'BREAST', { closedNodes: new Set(['E1', 'E1_OUT']) });
    expect(r.ok && !r.nodes.includes('E1')).toBe(true);
  });
});

describe('QR checkpoints are validated, never trusted blindly', () => {
  it('parses known ids case-insensitively', () => {
    const p = parseCheckpoint('zone_b_lift_level_5');
    expect(p.ok && p.checkpoint.node).toBe('B_EL_5');
  });
  it('rejects malformed and unknown values', () => {
    expect(parseCheckpoint('<script>')).toMatchObject({ ok: false, reason: 'malformed' });
    expect(parseCheckpoint('ZONE_Z_LIFT_LEVEL_9')).toMatchObject({ ok: false, reason: 'unknown' });
    expect(parseCheckpoint('')).toMatchObject({ ok: false, reason: 'missing' });
  });
});

describe('English rendering of structured steps', () => {
  it('keeps official sign names and room codes verbatim', () => {
    const { steps } = turns('E2', 'MI_B5');
    const all = steps.map((s, i) => stepText(s, enTranslator, i === 0)).join(' ');
    expect(all).toContain('Grosvenor Entrance 2');
    expect(all).toContain('(B5)');
    expect(all).toContain('B5-204');
    expect(all).not.toMatch(/\{[a-z]+\}/i);
  });
});
