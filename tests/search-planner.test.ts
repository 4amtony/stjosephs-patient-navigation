import { describe, expect, it } from 'vitest';
import { searchDestinations } from '../src/engine/search';
import { compareGarages, compareEntrances, closedNodesAt } from '../src/engine/planner';
import { DEST_BY_ID } from '../src/data/destinations';
import { openAt, GARAGES } from '../src/data/parking';

const id = (q: string) => {
  const r = searchDestinations(q);
  return r.kind === 'match' ? r.dest.id : r.kind;
};

describe('destination search / intent', () => {
  it('matches room codes in several spellings', () => {
    expect(id('D1-112')).toBe('breast-care');
    expect(id('d1 112')).toBe('breast-care');
    expect(id('b5204')).toBe('mri-b5');
  });
  it('understands natural language and lay terms', () => {
    expect(id('where is the MRI')).toBe('mri-b5');
    expect(id('I have an appointment for a mammogram')).toBe('breast-care');
    expect(id('blood test')).toBe('lab-test');
    expect(id('stress test')).toBe('b3-outpatient');
  });
  it('accepts non-English queries', () => {
    expect(id('核磁共振在哪里')).toBe('mri-b5');
    expect(id('乳腺')).toBe('breast-care');
    expect(id('الرنين المغناطيسي')).toBe('mri-b5');
    expect(id('radiographie')).toBe('medical-imaging-c0');
  });
  it('asks instead of guessing for ambiguous terms', () => {
    expect(searchDestinations('physio').kind).toBe('ambiguous');
    expect(searchDestinations('endocrinology').kind).toBe('ambiguous');
  });
  it('reports no match honestly', () => {
    expect(searchDestinations('zzqqxx').kind).toBe('none');
  });
  it('does not surface the fictional restricted lab for unrelated queries', () => {
    const r = searchDestinations('lab');
    expect(r.kind === 'match' ? r.dest.id : '').toBe('lab-test');
  });
});

describe('parking and entrance planner (Scenario A rules)', () => {
  const dest = DEST_BY_ID['breast-care'];
  it('Cheapside garage: open weekdays 05:30–17:30, closed weekends', () => {
    const cs = GARAGES.find((g) => g.id === 'cheapside')!;
    expect(openAt(cs.hours, 2, '10:30')).toBe('open');
    expect(openAt(cs.hours, 2, '18:00')).toBe('closed');
    expect(openAt(cs.hours, 6, '10:30')).toBe('closed');
  });
  it('weekday Zone D appointment → Cheapside recommended (official "closest for Zones C and D")', () => {
    const g = compareGarages({ dest, day: 2, time: '10:30', stepFree: false });
    expect(g[0].garage.id).toBe('cheapside');
    expect(g[0].recommended).toBe(true);
    expect(g[0].reasons.some((r) => r.key === 'park.officialClosestCD')).toBe(true);
    expect(g.some((o) => o.reasons.some((r) => r.key === 'park.busy'))).toBe(true);
  });
  it('weekend → Cheapside closed, Grosvenor recommended, route avoids closed Entrance 1', () => {
    const g = compareGarages({ dest, day: 6, time: '10:30', stepFree: false });
    const cs = g.find((o) => o.garage.id === 'cheapside')!;
    expect(cs.open).toBe('closed');
    expect(cs.recommended).toBe(false);
    const gg = g.find((o) => o.garage.id === 'grosvenor')!;
    expect(gg.recommended).toBe(true);
    expect(gg.route?.nodes.includes('E1')).toBe(false);
  });
  it('Zone B destination → Grosvenor preferred on weekdays', () => {
    const g = compareGarages({ dest: DEST_BY_ID['mri-b5'], day: 3, time: '09:00', stepFree: false });
    expect(g[0].garage.id).toBe('grosvenor');
  });
  it('drop-off: the official shortest-route entrance is recommended when open', () => {
    const e = compareEntrances({ dest: DEST_BY_ID['mri-b5'], day: 2, time: '10:00', stepFree: false }, 'dropoff');
    expect(e[0].entrance.id).toBe('ENTRANCE_2');
    expect(e[0].officialShortest).toBe(true);
  });
  it('entrance hours: E1/E4 closed on weekends, E2 open 7–16', () => {
    const c = closedNodesAt(0, '12:00');
    expect(c.has('E1') && c.has('E4') && !c.has('E2')).toBe(true);
  });
});
