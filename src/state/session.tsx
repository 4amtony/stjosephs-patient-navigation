import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { parseCheckpoint, CHECKPOINT_BY_ID, type CheckpointParse } from '../data/checkpoints';
import { DEST_BY_ID } from '../data/destinations';
import type { Weekday } from '../data/parking';
import { isLocale, matchLocale, type LocaleCode } from '../i18n/languages';

/**
 * One anonymous navigation session. Stored only in this browser (localStorage) so a QR scan on
 * arrival can resume the plan made at home. No account, no server, no personal or health data.
 * The fictional staff verification (`unlocked`) is deliberately NOT persisted.
 */
export type Screen = 'home' | 'language' | 'search' | 'plan' | 'here' | 'navigate' | 'arrived' | 'help' | 'sources' | 'qr' | 'prefs';
export type Transport = 'drive' | 'dropoff' | 'transit';

export interface Prefs {
  stepFree: boolean;
  largeText: boolean;
  highContrast: boolean;
  voice: boolean;
  simple: boolean;
  reduceMotion: boolean;
  wantHelp: boolean;
}

export interface Notice {
  key: string;
  params?: Record<string, string | number>;
  tone?: 'info' | 'good' | 'warn';
  at: number;
}

export interface Session {
  locale: LocaleCode;
  localeChosen: boolean;
  prefs: Prefs;
  destId: string | null;
  /** checkpoint id of the current starting point */
  originCp: string | null;
  originConfirmed: boolean;
  /** how the current origin was set */
  originVia: 'qr' | 'manual' | 'plan' | null;
  /** result of the last QR/URL checkpoint parse when it failed */
  scanError: CheckpointParse | null;
  transport: Transport | null;
  visitDay: Weekday | null;
  visitTime: string | null;
  plannedStart: string | null;
  step: number;
  screen: Screen;
  returnTo: Screen | null;
  unlocked: boolean;
  notice: Notice | null;
  presenter: boolean;
  kiosk: boolean;
  /** increments on every re-localisation, drives the "route redraw" animation */
  rerouteCount: number;
}

export const DEFAULT_PREFS: Prefs = { stepFree: false, largeText: false, highContrast: false, voice: false, simple: false, reduceMotion: false, wantHelp: false };

const STORE_KEY = 'sjh-wayfinding-session-v1';

function initial(): Session {
  return {
    locale: 'en-CA', localeChosen: false, prefs: { ...DEFAULT_PREFS }, destId: null, originCp: null, originConfirmed: false, originVia: null,
    scanError: null, transport: null, visitDay: null, visitTime: null, plannedStart: null, step: 0, screen: 'home', returnTo: null,
    unlocked: false, notice: null, presenter: false, kiosk: false, rerouteCount: 0,
  };
}

export type Action =
  | { type: 'setLocale'; locale: LocaleCode }
  | { type: 'setPref'; key: keyof Prefs; value: boolean }
  | { type: 'setPrefs'; prefs: Partial<Prefs> }
  | { type: 'setDest'; destId: string | null; next?: Screen }
  | { type: 'scan'; raw: string | null; source: 'qr' | 'manual' | 'plan' }
  | { type: 'confirmOrigin' }
  | { type: 'setTransport'; transport: Transport }
  | { type: 'setVisit'; day: Weekday | null; time: string | null }
  | { type: 'setPlannedStart'; cp: string | null }
  | { type: 'setStep'; step: number }
  | { type: 'go'; screen: Screen; returnTo?: Screen | null }
  | { type: 'unlock' }
  | { type: 'lock' }
  | { type: 'notice'; notice: Omit<Notice, 'at'> | null }
  | { type: 'presenter'; on: boolean }
  | { type: 'kiosk'; on: boolean }
  | { type: 'reset' }
  | { type: 'hydrate'; state: Partial<Session> };

export function reducer(s: Session, a: Action): Session {
  switch (a.type) {
    case 'setLocale':
      return { ...s, locale: a.locale, localeChosen: true };
    case 'setPref':
      return { ...s, prefs: { ...s.prefs, [a.key]: a.value } };
    case 'setPrefs':
      return { ...s, prefs: { ...s.prefs, ...a.prefs } };
    case 'setDest':
      return { ...s, destId: a.destId, step: 0, screen: a.next ?? s.screen };
    case 'scan': {
      const p = parseCheckpoint(a.raw);
      if (!p.ok) return { ...s, scanError: p, screen: 'here', originConfirmed: false };
      const changed = p.checkpoint.id !== s.originCp;
      const wasNavigating = s.screen === 'navigate' || s.screen === 'arrived';
      return {
        ...s,
        originCp: p.checkpoint.id,
        originVia: a.source,
        scanError: null,
        // A scan from a known place mid-route updates only the origin and goes straight back to
        // navigation (destination, language, prefs, parking context untouched).
        originConfirmed: a.source !== 'qr' || (wasNavigating && !!s.destId),
        step: changed ? 0 : s.step,
        rerouteCount: changed ? s.rerouteCount + 1 : s.rerouteCount,
        screen: wasNavigating && s.destId ? 'navigate' : 'here',
        notice: wasNavigating && changed ? { key: 'here.updated', params: { place: p.checkpoint.name }, tone: 'good', at: Date.now() } : s.notice,
      };
    }
    case 'confirmOrigin':
      return { ...s, originConfirmed: true, screen: s.destId ? 'navigate' : 'search', step: 0 };
    case 'setTransport':
      return { ...s, transport: a.transport };
    case 'setVisit':
      return { ...s, visitDay: a.day, visitTime: a.time };
    case 'setPlannedStart':
      return { ...s, plannedStart: a.cp };
    case 'setStep':
      return { ...s, step: Math.max(0, a.step) };
    case 'go':
      return { ...s, screen: a.screen, returnTo: a.returnTo === undefined ? s.returnTo : a.returnTo };
    case 'unlock':
      return { ...s, unlocked: true };
    case 'lock':
      return { ...s, unlocked: false };
    case 'notice':
      return { ...s, notice: a.notice ? { ...a.notice, at: Date.now() } : null };
    case 'presenter':
      return { ...s, presenter: a.on };
    case 'kiosk':
      return { ...s, kiosk: a.on };
    case 'reset':
      return { ...initial(), locale: s.locale, localeChosen: s.localeChosen, presenter: s.presenter, kiosk: s.kiosk };
    case 'hydrate':
      return { ...s, ...a.state };
  }
}

function load(): Partial<Session> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const v = JSON.parse(raw);
    const out: Partial<Session> = {};
    if (isLocale(v.locale)) {
      out.locale = v.locale;
      out.localeChosen = !!v.localeChosen;
    }
    if (v.prefs && typeof v.prefs === 'object') out.prefs = { ...DEFAULT_PREFS, ...v.prefs };
    if (typeof v.destId === 'string' && DEST_BY_ID[v.destId]) out.destId = v.destId;
    if (typeof v.originCp === 'string' && CHECKPOINT_BY_ID[v.originCp]) out.originCp = v.originCp;
    if (['drive', 'dropoff', 'transit'].includes(v.transport)) out.transport = v.transport;
    if (typeof v.visitDay === 'number' && v.visitDay >= 0 && v.visitDay <= 6) out.visitDay = v.visitDay as Weekday;
    if (typeof v.visitTime === 'string' && /^\d\d:\d\d$/.test(v.visitTime)) out.visitTime = v.visitTime;
    if (typeof v.plannedStart === 'string' && CHECKPOINT_BY_ID[v.plannedStart]) out.plannedStart = v.plannedStart;
    if (typeof v.step === 'number') out.step = v.step;
    if (typeof v.originConfirmed === 'boolean') out.originConfirmed = v.originConfirmed;
    return out;
  } catch {
    return {};
  }
}

function save(s: Session) {
  try {
    const { locale, localeChosen, prefs, destId, originCp, transport, visitDay, visitTime, plannedStart, step, originConfirmed } = s;
    localStorage.setItem(STORE_KEY, JSON.stringify({ locale, localeChosen, prefs, destId, originCp, transport, visitDay, visitTime, plannedStart, step, originConfirmed }));
  } catch {
    /* private mode etc. — session simply isn't remembered */
  }
}

/** Read the URL once at startup: ?checkpoint=, ?dest=, ?lang=, ?presenter=1, ?kiosk=1 */
export function bootstrapFromUrl(dispatch: Dispatch<Action>, saved: Partial<Session>) {
  const q = new URLSearchParams(window.location.search);
  const lang = q.get('lang');
  if (lang) {
    const m = isLocale(lang) ? lang : matchLocale(lang);
    if (m) dispatch({ type: 'setLocale', locale: m });
  } else if (!saved.localeChosen) {
    const m = matchLocale(navigator.language);
    if (m) dispatch({ type: 'hydrate', state: { locale: m } });
  }
  if (q.get('presenter') === '1') dispatch({ type: 'presenter', on: true });
  if (q.get('kiosk') === '1') dispatch({ type: 'kiosk', on: true });
  const dest = q.get('dest');
  if (dest && DEST_BY_ID[dest] && !DEST_BY_ID[dest].restricted) dispatch({ type: 'setDest', destId: dest, next: 'plan' });
  if (q.has('checkpoint')) dispatch({ type: 'scan', raw: q.get('checkpoint'), source: 'qr' });
}

const Ctx = createContext<{ s: Session; dispatch: Dispatch<Action> } | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, () => {
    const saved = load();
    const base = { ...initial(), ...saved };
    // resume where the person was, but never straight into a stale screen
    base.screen = saved.destId && saved.originCp && saved.originConfirmed ? 'navigate' : 'home';
    return base;
  });
  useEffect(() => {
    bootstrapFromUrl(dispatch, load());
  }, []);
  useEffect(() => save(s), [s]);
  const value = useMemo(() => ({ s, dispatch }), [s]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error('SessionProvider missing');
  return v;
}

/** Update the address bar to reflect a simulated QR scan (so a refresh/QR behaves the same). */
export function simulateScan(dispatch: Dispatch<Action>, checkpointId: string) {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set('checkpoint', checkpointId);
    window.history.replaceState(null, '', u.toString());
  } catch {
    /* ignore */
  }
  dispatch({ type: 'scan', raw: checkpointId, source: 'qr' });
}
