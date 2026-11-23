import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LANGUAGES } from '../src/i18n/languages';
import { makeTranslator, interpolate } from '../src/i18n/core';
import { reducer, DEFAULT_PREFS, type Session } from '../src/state/session';
import { planRoute } from '../src/engine/router';
import { buildSteps } from '../src/engine/steps';
import { stepText } from '../src/engine/routeText';

const DIR = join(__dirname, '../src/i18n/locales');
const en = JSON.parse(readFileSync(join(DIR, 'en-CA.json'), 'utf8')) as Record<string, string>;
const ph = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');

describe('i18n catalogs', () => {
  it('ships exactly the 20 required locales', () => {
    const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')).sort();
    expect(files).toEqual(LANGUAGES.map((l) => l.code).sort());
    expect(LANGUAGES).toHaveLength(20);
  });
  for (const l of LANGUAGES) {
    it(`${l.code}: key parity + placeholder parity with en-CA`, () => {
      const cat = JSON.parse(readFileSync(join(DIR, `${l.code}.json`), 'utf8')) as Record<string, string>;
      const missing = Object.keys(en).filter((k) => typeof cat[k] !== 'string' || !cat[k].trim());
      expect(missing, `missing in ${l.code}`).toEqual([]);
      const bad = Object.keys(en).filter((k) => ph(cat[k]) !== ph(en[k]));
      expect(bad, `placeholder mismatch in ${l.code}`).toEqual([]);
    });
  }
  it('RTL is declared for Arabic, Urdu and Persian only', () => {
    expect(LANGUAGES.filter((l) => l.dir === 'rtl').map((l) => l.code).sort()).toEqual(['ar', 'fa', 'ur']);
  });
  it('safety-critical route sentences are translated (not English) in every locale', () => {
    const critical = ['r.turnLeft', 'r.turnRight', 'r.takeElevator', 'r.arriveLeft', 'r.arriveRight', 'navi.stepFreeWarn', 'help.emergencyBody', 'sec.locked'];
    for (const l of LANGUAGES.filter((x) => x.code !== 'en-CA')) {
      const cat = JSON.parse(readFileSync(join(DIR, `${l.code}.json`), 'utf8')) as Record<string, string>;
      for (const k of critical) expect(cat[k], `${l.code} ${k}`).not.toBe(en[k]);
    }
  });
  it('falls back to English and records the fallback when a key is missing', () => {
    const tr = makeTranslator('fr-CA', {});
    expect(tr.t('r.turnLeft')).toBe('Turn left.');
    expect(tr.fallbacks.has('r.turnLeft')).toBe(true);
  });
  it('interpolates params and leaves unknown params visible', () => {
    expect(interpolate('Room {room} {x}', { room: 'B3-030' })).toBe('Room B3-030 {x}');
  });
  it('localized route text keeps official English sign names and codes in every locale', () => {
    const r = planRoute('E2', 'MI_B5');
    if (!r.ok) throw new Error('route');
    const steps = buildSteps(r.nodes, r.edges);
    for (const l of LANGUAGES) {
      const cat = JSON.parse(readFileSync(join(DIR, `${l.code}.json`), 'utf8'));
      const tr = makeTranslator(l.code, cat);
      const text = steps.map((s, i) => stepText(s, tr, i === 0)).join(' ');
      expect(text, l.code).toContain('Grosvenor Entrance 2');
      expect(text, l.code).toContain('B5-204');
      expect(text, l.code).not.toMatch(/\{[a-zA-Z]+\}/);
    }
  });
});

describe('session state: QR re-localisation and language switching preserve context', () => {
  const base: Session = {
    locale: 'zh-Hans', localeChosen: true, prefs: { ...DEFAULT_PREFS, stepFree: true, largeText: true }, destId: 'b3-outpatient',
    originCp: 'ENTRANCE_2', originConfirmed: true, originVia: 'manual', scanError: null, transport: 'drive', visitDay: 2, visitTime: '10:30',
    plannedStart: 'GROSVENOR_GARAGE', step: 3, screen: 'navigate', returnTo: null, unlocked: false, notice: null, presenter: false, kiosk: false, rerouteCount: 0,
  };
  it('scanning a new QR mid-route updates only the origin', () => {
    const s = reducer(base, { type: 'scan', raw: 'ZONE_B_LIFT_LEVEL_5', source: 'qr' });
    expect(s.originCp).toBe('ZONE_B_LIFT_LEVEL_5');
    expect(s.screen).toBe('navigate');
    expect(s.destId).toBe('b3-outpatient');
    expect(s.locale).toBe('zh-Hans');
    expect(s.prefs.stepFree && s.prefs.largeText).toBe(true);
    expect(s.transport).toBe('drive');
    expect(s.plannedStart).toBe('GROSVENOR_GARAGE');
    expect(s.step).toBe(0);
    expect(s.rerouteCount).toBe(1);
  });
  it('an unknown QR is not trusted and asks the person to choose', () => {
    const s = reducer(base, { type: 'scan', raw: 'HACKED_PLACE', source: 'qr' });
    expect(s.originCp).toBe('ENTRANCE_2');
    expect(s.scanError).toMatchObject({ ok: false, reason: 'unknown' });
    expect(s.screen).toBe('here');
  });
  it('changing language mid-route keeps destination, checkpoint and step', () => {
    const s = reducer(base, { type: 'setLocale', locale: 'ar' });
    expect([s.destId, s.originCp, s.step, s.screen]).toEqual(['b3-outpatient', 'ENTRANCE_2', 3, 'navigate']);
  });
  it('a QR scan never unlocks the restricted demo', () => {
    const s = reducer(base, { type: 'scan', raw: 'TRAINING_ANNEX_DOOR', source: 'qr' });
    expect(s.unlocked).toBe(false);
  });
});
