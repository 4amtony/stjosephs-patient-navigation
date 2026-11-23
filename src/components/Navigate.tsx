import { useEffect, useMemo, useRef, useState } from 'react';
import { CHECKPOINTS, CHECKPOINT_BY_ID } from '../data/checkpoints';
import { sourceLinkFor } from '../data/destinations';
import { NODE_BY_ID } from '../data/graph';
import { sentencesForStep, stepText } from '../engine/routeText';
import { loadVoices, speak, speechSupported, stopSpeaking, voiceFor } from '../engine/speech';
import type { RouteStep } from '../engine/steps';
import { useI18n } from '../i18n/I18nProvider';
import { simulateScan, useSession } from '../state/session';
import { useRoute } from '../state/useRoute';
import { Callout, Prov, Sheet, useLevelText } from './common';
import { ArrowUp, Check, ChevronBack, ChevronNext, Door, Elevator, Flag, Lock, Person, Pin, Qr, Speaker, Stop, TurnLeft, TurnRight, Tunnel, UTurn, Unlock, Warn, Wheelchair } from './Icons';
import { MapView } from './map/MapView';

const DEMO_PIN = '4321';

function StepIcon({ step }: { step: RouteStep }) {
  if (step.kind === 'elevator') return <Elevator size={34} />;
  if (step.kind === 'tunnel') return <Tunnel size={34} />;
  if (step.arrive) return <Flag size={34} />;
  if (step.turn === 'left') return <TurnLeft size={36} />;
  if (step.turn === 'right') return <TurnRight size={36} />;
  if (step.turn === 'back') return <UTurn size={36} />;
  if (step.kind === 'enter') return <Door size={34} />;
  return <ArrowUp size={34} />;
}

export function StepSentences({ step, first }: { step: RouteStep; first: boolean }) {
  const { rich } = useI18n();
  const ss = sentencesForStep(step, first);
  return (
    <>
      {ss.map((s, i) => (
        <span key={i}>
          {rich(s)}
          {i < ss.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

export function StepsList({ steps, current, onPick }: { steps: RouteStep[]; current: number; onPick: (i: number) => void }) {
  return (
    <ol className="steps-list">
      {steps.map((st, i) => (
        <li key={i} aria-current={i === current ? 'step' : undefined} className={current > i ? 'done' : ''} onClick={() => onPick(i)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onPick(i)}>
          <span className="num">{current > i ? <Check size={14} /> : i + 1}</span>
          <span style={{ flex: 1 }}>
            <StepSentences step={st} first={i === 0} />
          </span>
          {st.status !== 'OFFICIAL' && <Prov status={st.status} />}
        </li>
      ))}
    </ol>
  );
}

function RestrictedLock() {
  const { t } = useI18n();
  const { dispatch } = useSession();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  return (
    <div className="card stack" style={{ borderColor: '#6d28d9' }}>
      <span className="chip" style={{ background: '#ede9fe', color: '#5b21b6', alignSelf: 'flex-start' }}>{t('sec.fictional')}</span>
      <h2 className="row"><Lock /> {t('sec.title')}</h2>
      <Callout tone="warn"><p>{t('sec.locked')}</p></Callout>
      <p className="small">{t('sec.public')}</p>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (pin === DEMO_PIN) {
            dispatch({ type: 'unlock' });
            dispatch({ type: 'notice', notice: { key: 'sec.granted', tone: 'good' } });
          } else setErr(true);
        }}
      >
        <h3>{t('sec.verify')}</h3>
        <label className="field">
          {t('sec.pinLabel')}
          <input className="input" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr(false); }} aria-describedby="pin-hint" />
        </label>
        <span id="pin-hint" className="small muted">{t('sec.pinHint', { pin: DEMO_PIN })}</span>
        {err && <Callout tone="bad">{t('sec.wrong')}</Callout>}
        <button className="btn primary" type="submit"><Unlock size={18} /> {t('sec.submit')}</button>
      </form>
      <p className="tiny muted">{t('sec.noReal')}</p>
    </div>
  );
}

function LostSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const { s, dispatch } = useSession();
  const cur = s.originCp ? CHECKPOINT_BY_ID[s.originCp] : null;
  const groups: [string, typeof CHECKPOINTS][] = [
    [t('here.groupLifts'), CHECKPOINTS.filter((c) => c.kind === 'lift')],
    [t('here.groupEntrances'), CHECKPOINTS.filter((c) => c.kind === 'entrance')],
    [t('here.groupJunctions'), CHECKPOINTS.filter((c) => c.kind === 'junction')],
    [t('here.groupGarages'), CHECKPOINTS.filter((c) => c.kind === 'garage')],
  ];
  return (
    <Sheet title={t('navi.lost')} onClose={onClose}>
      <div className="stack">
        <Callout tone="info">
          <p><strong>{t('here.pick')}</strong></p>
          <p>{t('here.noTracking')}</p>
        </Callout>
        <button className="btn help block" onClick={() => { onClose(); dispatch({ type: 'go', screen: 'help', returnTo: 'navigate' }); }}>
          <Person size={20} /> {t('navi.help')}
        </button>
        {groups.map(([title, list]) => (
          <details key={title} open={title === t('here.groupLifts')}>
            <summary>{title}</summary>
            <ul className="list card flat">
              {list.map((c) => (
                <li key={c.id}>
                  <button className="list-btn" onClick={() => { simulateScan(dispatch, c.id); onClose(); }} aria-current={cur?.id === c.id ? 'location' : undefined}>
                    <Qr size={18} />
                    <span className="grow"><bdi lang="en" dir="ltr">{c.name}</bdi></span>
                    {cur?.id === c.id && <span className="chip brand">{t('map.youAreHere')}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </Sheet>
  );
}

export function Navigate() {
  const i18n = useI18n();
  const { t, meta } = i18n;
  const { s, dispatch } = useSession();
  const { dest, cp, result, steps, quality, official } = useRoute(s);
  const [view, setView] = useState<'card' | 'list'>('card');
  const [lost, setLost] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceChecked, setVoiceChecked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [focusMode, setFocusMode] = useState<'route' | 'step'>('route');
  const levelText = useLevelText();
  const flashRef = useRef<HTMLDivElement>(null);

  const step = Math.min(s.step, Math.max(0, steps.length - 1));
  const cur = steps[step];

  useEffect(() => {
    let live = true;
    loadVoices().then((vs) => {
      if (!live) return;
      setVoice(voiceFor(s.locale, vs));
      setVoiceChecked(true);
    });
    return () => { live = false; stopSpeaking(); };
  }, [s.locale]);

  // re-route visual cue
  useEffect(() => {
    if (s.rerouteCount && flashRef.current) {
      flashRef.current.classList.remove('reroute-flash');
      void flashRef.current.offsetWidth;
      flashRef.current.classList.add('reroute-flash');
    }
    setFocusMode('route');
  }, [s.rerouteCount]);

  useEffect(() => {
    if (s.prefs.voice && voice && cur) {
      speak(stepText(cur, i18n, step === 0), voice);
      setSpeaking(true);
    }
  }, [step, s.locale, s.rerouteCount, s.prefs.voice]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepNodes = useMemo(() => (cur ? cur.nodes : []), [cur]);

  if (!dest || !cp) {
    return (
      <div className="screen stack">
        <Callout tone="warn">{t('help.noDestination')}</Callout>
        <button className="btn primary" onClick={() => dispatch({ type: 'go', screen: dest ? 'here' : 'search' })}>{dest ? t('here.pick') : t('search.title')}</button>
      </div>
    );
  }

  const restrictedLocked = !!dest.restricted && !s.unlocked;
  const noRoute = result && !result.ok && !restrictedLocked;
  const last = step === steps.length - 1;
  const elevator3 = cp.node === 'E1' && ['MI_B5', 'CAFE', 'MULTI', 'SPIRIT'].includes(dest.node);

  const doSpeak = (english = false) => {
    if (!cur) return;
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    if (english) {
      loadVoices().then((vs) => { const v = voiceFor('en-CA', vs); if (v) { speak(stepText(cur, i18n.en, step === 0), v); setSpeaking(true); } });
      return;
    }
    if (voice) { speak(stepText(cur, i18n, step === 0), voice); setSpeaking(true); }
  };

  const evidenceQuotes = cur ? Array.from(new Set(cur.evidence.filter((e) => e.src === 'DIRECTIONS' && e.quote && !e.quote.includes('…')).map((e) => e.quote!))).slice(0, 2) : [];

  return (
    <div className="nav-layout" id="main">
      <div className="panel stack" ref={flashRef}>
        {/* destination + origin header */}
        <div className="card flat" style={{ padding: 12 }}>
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <span className="tiny muted">{t('navi.to')}</span>
              <bdi lang="en" dir="ltr" style={{ display: 'block', fontWeight: 800, fontSize: '1.08rem' }}>{dest.name}</bdi>
              <span className="small"><bdi className="sign" lang="en" dir="ltr">{dest.room}</bdi> · {t('search.zoneLevel', { zone: dest.zone, level: dest.level })}</span>
            </div>
            <button className="btn small ghost" onClick={() => dispatch({ type: 'go', screen: 'search', returnTo: 'navigate' })}>{t('nav.change')}</button>
          </div>
          <div className="divider" style={{ margin: '10px 0' }} />
          <div className="row between">
            <div style={{ minWidth: 0 }}>
              <span className="tiny muted"><Pin size={13} /> {t('navi.from')} · {s.originVia === 'qr' ? t('here.scanned') : t('map.youAreHere')}</span>
              <bdi lang="en" dir="ltr" style={{ display: 'block', fontWeight: 600 }}>{cp.name}</bdi>
            </div>
            <button className="btn small" onClick={() => setLost(true)}><Qr size={16} /> {t('navi.lost')}</button>
          </div>
        </div>

        {s.locale !== 'en-CA' && <p className="tiny muted" style={{ margin: 0 }}>{t('navi.translationNote', { language: meta.native })}</p>}

        {restrictedLocked && <RestrictedLock />}
        {dest.restricted && s.unlocked && (
          <Callout tone="good">
            <p><strong>{t('sec.granted')}</strong></p>
            <p className="small">{t('sec.fictional')} {t('navi.qrNoAccess')}</p>
            <button className="btn small" onClick={() => dispatch({ type: 'lock' })}><Lock size={16} /> {t('sec.lock')}</button>
          </Callout>
        )}

        {noRoute && (
          <Callout tone="bad">
            <p><strong>{result && !result.ok && result.reason === 'same-place' ? t('navi.sameRoom') : t('navi.noRoute')}</strong></p>
            <p>{t('navi.noRouteHelp')}</p>
            <button className="btn help" onClick={() => dispatch({ type: 'go', screen: 'help', returnTo: 'navigate' })}><Person size={18} /> {t('navi.help')}</button>
          </Callout>
        )}

        {quality && (
          <div className="row" style={{ gap: 6 }}>
            <span className="small muted">{t('navi.routeStatus')}:</span>
            <Prov status={quality.status} withHelp />
            <span className="chip">{t('navi.summary', { steps: steps.length, rides: quality.elevatorRides })}</span>
            {s.prefs.stepFree && quality.noStairs && <span className="chip good"><Wheelchair size={14} /> {t('navi.stepFreeOk')}</span>}
          </div>
        )}
        {quality && s.prefs.stepFree && (
          <Callout tone="warn">
            <p>{t('navi.stepFreeWarn')}</p>
            <p className="small">{t('navi.unknownSegments', { n: quality.unknownSegments })}{quality.doors ? ` ${t('navi.closedDoor')}` : ''}</p>
            {result?.ok && result.edges.some((e) => e.kind === 'tunnel') && <p className="small">{t('navi.tunnelChosen')}</p>}
          </Callout>
        )}

        {cur && view === 'card' && (
          <section className="step-card" aria-live="polite" aria-atomic="true">
            <div className="step-head">
              <span className="small" style={{ fontWeight: 700 }}>{t('navi.step', { n: step + 1, total: steps.length })}</span>
              <span className="row" style={{ gap: 6 }}>
                <span className="chip">{levelText(cur.levelTo ?? NODE_BY_ID[cur.to].level, NODE_BY_ID[cur.levelTo !== undefined ? cur.to : cur.from].zone)}</span>
                <Prov status={cur.status} />
              </span>
            </div>
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', gap: 14 }}>
              <span className="turn-icon" aria-hidden><StepIcon step={cur} /></span>
              <p className="big" style={{ margin: 0 }}><StepSentences step={cur} first={step === 0} /></p>
            </div>
            {evidenceQuotes.length > 0 && (
              <div className="official">
                <span className="tiny">{t('navi.signsLabel')} · {t('prov.OFFICIAL')}:</span>
                {evidenceQuotes.map((q) => <q key={q} lang="en">{q}</q>)}
              </div>
            )}
            <div className="row" style={{ marginTop: 10 }}>
              {speechSupported() && voice && (
                <button className="btn small" onClick={() => doSpeak(false)}>{speaking ? <><Stop size={16} /> {t('navi.stop')}</> : <><Speaker size={16} /> {t('navi.speak')}</>}</button>
              )}
              {speechSupported() && voiceChecked && !voice && (
                <div className="stack" style={{ gap: 6 }}>
                  <span className="tiny muted">{t('navi.noVoice', { language: meta.native })}</span>
                  <button className="btn small ghost" onClick={() => doSpeak(true)}><Speaker size={16} /> {t('navi.speakEnglish')}</button>
                </div>
              )}
              <span style={{ flex: 1 }} />
              <button className="btn small ghost" onClick={() => { setFocusMode('step'); }}>◎ {t('navi.focus')}</button>
            </div>
          </section>
        )}

        {steps.length > 0 && (
          <div className="row">
            <button className="btn" disabled={step === 0} onClick={() => { dispatch({ type: 'setStep', step: step - 1 }); setFocusMode('step'); }}>
              <ChevronBack /> {t('navi.prev')}
            </button>
            {!last ? (
              <button className="btn primary" style={{ flex: 1 }} onClick={() => { dispatch({ type: 'setStep', step: step + 1 }); setFocusMode('step'); }}>
                {t('navi.next')} <ChevronNext />
              </button>
            ) : (
              <button className="btn primary" style={{ flex: 1 }} onClick={() => dispatch({ type: 'go', screen: 'arrived' })}>
                <Flag size={18} /> {t('navi.arrivedBtn')}
              </button>
            )}
          </div>
        )}

        {steps.length > 0 && (
          <div className="row">
            <button className="btn small" aria-pressed={view === 'list'} onClick={() => setView(view === 'list' ? 'card' : 'list')}>{view === 'list' ? t('navi.step', { n: step + 1, total: steps.length }) : t('navi.allSteps')}</button>
            <button className="btn small" aria-pressed={s.prefs.simple} onClick={() => dispatch({ type: 'setPref', key: 'simple', value: !s.prefs.simple })}>{s.prefs.simple ? t('navi.mapView') : t('navi.textView')}</button>
            <button className="btn small" onClick={() => window.print()}>{t('nav.print')}</button>
          </div>
        )}
        <div className="print-only">
          <h2><bdi lang="en" dir="ltr">{dest.name} ({dest.room})</bdi></h2>
          <p><bdi lang="en" dir="ltr">{cp.name}</bdi></p>
          <StepsList steps={steps} current={-1} onPick={() => undefined} />
          <p className="small">{t('app.disclaimer')}</p>
        </div>
        {view === 'list' && <StepsList steps={steps} current={step} onPick={(i) => { dispatch({ type: 'setStep', step: i }); setView('card'); setFocusMode('step'); }} />}

        {elevator3 && <Callout tone="info"><p className="small">{t('navi.elevator3')}</p></Callout>}

        <details>
          <summary>{t('navi.official')}</summary>
          {official ? (
            <>
              <p className="small muted">{t('navi.officialFrom', { origin: official.originLabel })}</p>
              <ol className="small" lang="en" dir="ltr" style={{ textAlign: 'left' }}>
                {official.steps.map((x, i) => <li key={i}>{x.text}</li>)}
              </ol>
            </>
          ) : (
            <p className="small">{t('navi.noOfficial')}</p>
          )}
          {!dest.restricted && <a className="small" href={sourceLinkFor(dest)} target="_blank" rel="noreferrer">{t('navi.openSource')}</a>}
        </details>

        {(dest.notes?.length || dest.conflicts?.length || dest.hours) && (
          <details>
            <summary>{t('arrive.notes')}</summary>
            <div lang="en" dir="ltr" className="small stack" style={{ textAlign: 'left', gap: 6 }}>
              {dest.hours && <p style={{ margin: 0 }}>🕒 {dest.hours}</p>}
              {dest.notes?.map((n) => <p key={n} style={{ margin: 0 }}>{n}</p>)}
              {dest.conflicts?.map((n) => <p key={n} style={{ margin: 0, color: 'var(--warn)' }}><Warn size={14} /> {n}</p>)}
            </div>
          </details>
        )}

        <div className="navbar no-print">
          <button className="btn" onClick={() => setLost(true)}><Qr size={18} /> {t('navi.lost')}</button>
          <button className="btn help" onClick={() => dispatch({ type: 'go', screen: 'help', returnTo: 'navigate' })}><Person size={18} /> {t('navi.help')}</button>
        </div>
      </div>

      {!s.prefs.simple && (
        <MapView
          nodes={result?.ok ? result.nodes : null}
          edges={result?.ok ? result.edges : null}
          stepNodes={focusMode === 'step' ? stepNodes : stepNodes}
          originNode={cp.node}
          destNode={dest.node}
          focusKey={focusMode === 'step' ? `step-${step}-${s.rerouteCount}` : `route-${cp.id}-${dest.id}-${s.prefs.stepFree}-${s.rerouteCount}`}
          reduceMotion={s.prefs.reduceMotion}
          highContrast={s.prefs.highContrast}
          showFictional={!!dest.restricted}
          hereLabel={t('map.youAreHere')}
          destLabel={dest.room}
          onOverview={() => setFocusMode('route')}
          onFocusStep={() => setFocusMode('step')}
          onCheckpoint={(id) => simulateScan(dispatch, id)}
        />
      )}
      {lost && <LostSheet onClose={() => setLost(false)} />}
    </div>
  );
}
