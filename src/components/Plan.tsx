import { useMemo, useState } from 'react';
import { CHECKPOINT_BY_ID } from '../data/checkpoints';
import { DEST_BY_ID, officialRouteFrom, sourceLinkFor } from '../data/destinations';
import { NODE_BY_ID } from '../data/graph';
import { TRANSIT, type Weekday } from '../data/parking';
import { compareEntrances, compareGarages, closedNodesAt, type GarageOption, type EntranceOption } from '../engine/planner';
import { planRoute } from '../engine/router';
import { buildSteps } from '../engine/steps';
import { useI18n } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/core';
import { simulateScan, useSession, type Transport } from '../state/session';
import { Callout, Prov, RichT, Toggle } from './common';
import { Bus, Car, Check, ChevronNext, Print, Qr, Taxi, Wheelchair } from './Icons';
import { MapView } from './map/MapView';
import { StepsList } from './Navigate';

const GARAGE_CP: Record<string, string> = { cheapside: 'CHEAPSIDE_GARAGE', grosvenor: 'GROSVENOR_GARAGE' };
const ENT_HOURS: Record<string, MessageKey> = { ENTRANCE_1: 'ent.hours.E1', ENTRANCE_2: 'ent.hours.E2', ENTRANCE_3: 'ent.hours.E3', ENTRANCE_4: 'ent.hours.E4' };

export function Plan() {
  const { t, rich } = useI18n();
  const { s, dispatch } = useSession();
  const dest = s.destId ? DEST_BY_ID[s.destId] : null;
  const [showWhy, setShowWhy] = useState<string | null>(null);

  const ctx = dest ? { dest, day: s.visitDay, time: s.visitTime, stepFree: s.prefs.stepFree } : null;
  const garages = useMemo(() => (ctx && s.transport === 'drive' ? compareGarages(ctx) : []), [ctx?.dest.id, s.visitDay, s.visitTime, s.prefs.stepFree, s.transport]); // eslint-disable-line react-hooks/exhaustive-deps
  const entrances = useMemo(() => (ctx && (s.transport === 'dropoff' || s.transport === 'transit') ? compareEntrances(ctx, s.transport) : []), [ctx?.dest.id, s.visitDay, s.visitTime, s.prefs.stepFree, s.transport]); // eslint-disable-line react-hooks/exhaustive-deps

  const validStarts = s.transport === 'drive' ? garages.map((g) => GARAGE_CP[g.garage.id]) : entrances.map((e) => e.entrance.id);
  const recommended = s.transport === 'drive' ? garages.find((g) => g.recommended) : entrances.find((e) => e.recommended);
  const recCp = recommended ? ('garage' in recommended ? GARAGE_CP[recommended.garage.id] : recommended.entrance.id) : null;
  const selectedCp = s.plannedStart && validStarts.includes(s.plannedStart) ? s.plannedStart : recCp;
  const selected = selectedCp ? CHECKPOINT_BY_ID[selectedCp] : null;

  const overview = useMemo(() => {
    if (!selected || !dest) return null;
    const r = planRoute(selected.node, dest.node, { stepFree: s.prefs.stepFree, closedNodes: closedNodesAt(s.visitDay, s.visitTime) });
    if (!r.ok) return null;
    return { r, steps: buildSteps(r.nodes, r.edges, selected.facing) };
  }, [selected?.id, dest?.node, s.prefs.stepFree, s.visitDay, s.visitTime]); // eslint-disable-line react-hooks/exhaustive-deps
  const official = selected && dest ? officialRouteFrom(dest, selected.node) : undefined;
  // the QR the person would scan on arrival: the entrance actually used by the route (or garage lobby)
  const arrivalCp = useMemo(() => {
    if (!overview || !selected) return selected?.id ?? null;
    if (selected.kind === 'entrance') return selected.id;
    const ent = overview.r.nodes.find((n) => NODE_BY_ID[n].kind === 'entrance');
    const map: Record<string, string> = { E1: 'ENTRANCE_1', E2: 'ENTRANCE_2', E3: 'ENTRANCE_3', E4: 'ENTRANCE_4' };
    return ent ? map[ent] : selected.id;
  }, [overview, selected]);

  if (!dest) {
    return (
      <div className="screen">
        <Callout tone="warn">{t('help.noDestination')}</Callout>
        <button className="btn primary" onClick={() => dispatch({ type: 'go', screen: 'search', returnTo: 'plan' })}>{t('search.title')}</button>
      </div>
    );
  }

  const setDay = (v: string) => dispatch({ type: 'setVisit', day: v === '' ? null : (Number(v) as Weekday), time: s.visitTime });
  const setTime = (v: string) => dispatch({ type: 'setVisit', day: s.visitDay, time: v || null });

  return (
    <div className="screen stack" id="main">
      <h1>{t('plan.title')}</h1>
      <div className="card tinted row between">
        <div>
          <bdi lang="en" dir="ltr" style={{ fontWeight: 800, fontSize: '1.1rem', display: 'block' }}>{dest.name}</bdi>
          <span className="small"><RichT k="search.room" p={{ room: { sign: dest.room } }} /> · {t('search.zoneLevel', { zone: dest.zone, level: dest.level })}</span>
        </div>
        <button className="btn small" onClick={() => dispatch({ type: 'go', screen: 'search', returnTo: 'plan' })}>{t('nav.change')}</button>
      </div>

      <section className="stack" aria-labelledby="h-arrive">
        <h2 id="h-arrive">{t('plan.howArrive')}</h2>
        <div className="grid2">
          {([['drive', Car, 'plan.drive'], ['dropoff', Taxi, 'plan.dropoff'], ['transit', Bus, 'plan.transit']] as [Transport, typeof Car, MessageKey][]).map(([id, I, key]) => (
            <button key={id} className={`card choice ${s.transport === id ? 'selected' : ''}`} aria-pressed={s.transport === id} onClick={() => dispatch({ type: 'setTransport', transport: id })}>
              <span className="icon-bubble"><I /></span>
              <strong style={{ alignSelf: 'center' }}>{t(key)}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="card stack" aria-labelledby="h-when">
        <h2 id="h-when" style={{ marginBottom: 0 }}>{t('plan.when')}</h2>
        <p className="small muted" style={{ margin: 0 }}>{t('plan.whenHelp')}</p>
        <p className="small muted" style={{ margin: 0 }}>{t('plan.clinicHours')}</p>
        <div className="row">
          <label className="field" style={{ flex: '1 1 160px' }}>
            {t('plan.day')}
            <select className="input" value={s.visitDay ?? ''} onChange={(e) => setDay(e.target.value)}>
              <option value="">{t('plan.dayUnknown')}</option>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <option key={d} value={d}>{t(`day.${d}` as MessageKey)}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ flex: '1 1 140px' }}>
            {t('plan.time')}
            <input className="input" type="time" value={s.visitTime ?? ''} onChange={(e) => setTime(e.target.value)} />
          </label>
        </div>
        <Toggle label={t('prefs.stepFree')} help={t('prefs.stepFreeHelp')} checked={s.prefs.stepFree} onChange={(v) => dispatch({ type: 'setPref', key: 'stepFree', value: v })} icon={<Wheelchair />} />
      </section>

      {s.transport === 'drive' && (
        <section className="stack" aria-labelledby="h-park">
          <h2 id="h-park">{t('park.title')}</h2>
          <Callout tone="info">
            <p>{t('park.noLive')}</p>
          </Callout>
          {garages.map((g) => (
            <GarageCard key={g.garage.id} g={g} selected={selectedCp === GARAGE_CP[g.garage.id]} onChoose={() => dispatch({ type: 'setPlannedStart', cp: GARAGE_CP[g.garage.id] })} showWhy={showWhy === g.garage.id} toggleWhy={() => setShowWhy(showWhy === g.garage.id ? null : g.garage.id)} />
          ))}
          <p className="small muted">{t('park.officeHelp')} · <a href="https://www.sjhc.london.on.ca/patients-and-visitors/our-locations/st-josephs-hospital/parking-st-josephs-hospital" target="_blank" rel="noreferrer">{t('park.official')}</a></p>
        </section>
      )}

      {(s.transport === 'dropoff' || s.transport === 'transit') && (
        <section className="stack" aria-labelledby="h-ent">
          <h2 id="h-ent">{t('ent.title')}</h2>
          {s.transport === 'transit' && (
            <div className="card flat stack">
              <h3 className="row"><Bus size={20} /> {t('transit.title')}</h3>
              <p style={{ margin: 0 }}>{rich({ k: 'transit.routes', p: { routes: { sign: TRANSIT.routes.join(', ') } } })}</p>
              <p style={{ margin: 0 }}>{t('transit.stops')}</p>
              <p className="small muted" style={{ margin: 0 }}>{t('transit.conflict')} <a href={TRANSIT.planner} target="_blank" rel="noreferrer">{t('transit.planner')}</a></p>
            </div>
          )}
          {entrances.map((e) => (
            <EntranceCard key={e.entrance.id} e={e} selected={selectedCp === e.entrance.id} onChoose={() => dispatch({ type: 'setPlannedStart', cp: e.entrance.id })} />
          ))}
        </section>
      )}

      {s.transport && selected && overview && (
        <section className="stack" aria-labelledby="h-over">
          <h2 id="h-over">{t('plan.overview')}</h2>
          <div className="card flat" style={{ padding: 0, overflow: 'hidden' }}>
            <MapView
              nodes={overview.r.nodes}
              edges={overview.r.edges}
              stepNodes={[]}
              originNode={selected.node}
              destNode={dest.node}
              focusKey={`plan-${selected.id}-${dest.id}`}
              reduceMotion={s.prefs.reduceMotion}
              highContrast={s.prefs.highContrast}
              hereLabel={selected.name.split(' – ')[0]}
              destLabel={`${dest.room}`}
              compact
            />
          </div>
          <div className="card stack">
            <div className="row between">
              <span className="small muted">{t('plan.startAt')}</span>
              <Prov status={overview.steps.reduce((a, x) => (x.status === 'OFFICIAL' ? a : x.status === 'DERIVED' && a === 'OFFICIAL' ? 'DERIVED' : a), 'OFFICIAL' as typeof overview.steps[number]['status'])} />
            </div>
            <bdi lang="en" dir="ltr" className="sign" style={{ alignSelf: 'flex-start' }}>{selected.name}</bdi>
            <h3 style={{ margin: '6px 0 0' }}>{t('plan.inside')} · {t('plan.stepsCount', { n: overview.steps.length })}</h3>
            <StepsList steps={overview.steps} current={-1} onPick={() => undefined} />
            {official && (
              <details>
                <summary>{t('navi.official')}</summary>
                <p className="small muted">{t('navi.officialFrom', { origin: official.originLabel })}</p>
                <ol className="small" lang="en" dir="ltr" style={{ textAlign: 'left' }}>
                  {official.steps.map((x, i) => <li key={i}>{x.text}</li>)}
                </ol>
                <a className="small" href={sourceLinkFor(dest)} target="_blank" rel="noreferrer">{t('navi.openSource')}</a>
              </details>
            )}
          </div>
          <Callout tone="good">
            <p>{t('plan.onArrival')}</p>
            {arrivalCp && (
              <button className="btn primary" onClick={() => simulateScan(dispatch, arrivalCp)}>
                <Qr size={18} /> {t('plan.simulateArrival', { place: CHECKPOINT_BY_ID[arrivalCp].name })}
              </button>
            )}
          </Callout>
          <div className="row">
            <button className="btn" onClick={() => window.print()}><Print size={18} /> {t('plan.print')}</button>
          </div>
          <p className="tiny muted">{t('plan.linkPrivacy')}</p>
        </section>
      )}
    </div>
  );
}

function ReasonList({ reasons }: { reasons: GarageOption['reasons'] }) {
  const { t } = useI18n();
  return (
    <div>
      {reasons.map((r, i) => (
        <div key={i} className={`reason ${r.tone}`}>
          <span className="dot" />
          <span>{t(r.key, r.params)}</span>
        </div>
      ))}
    </div>
  );
}

function GarageCard({ g, selected, onChoose, showWhy, toggleWhy }: { g: GarageOption; selected: boolean; onChoose: () => void; showWhy: boolean; toggleWhy: () => void }) {
  const { t } = useI18n();
  const closed = g.open === 'closed';
  const top = g.reasons.filter((r) => r.tone === 'good' || r.tone === 'bad' || r.tone === 'warn');
  return (
    <article className="card stack" style={selected ? { border: '2px solid var(--brand)' } : closed ? { opacity: 0.75 } : undefined} aria-label={g.garage.name}>
      <div className="row between">
        <div>
          {g.recommended && <span className="chip brand"><Check size={14} /> {t('park.recommended')}</span>}
          {!g.recommended && !closed && <span className="chip">{t('park.alternative')}</span>}
          {closed && <span className="chip bad">{t('park.unavailable')}</span>}
          <h3 style={{ marginTop: 6 }}><bdi lang="en" dir="ltr">{g.garage.name}</bdi></h3>
        </div>
        <span className="chip info">{t('park.spaces', { n: g.garage.spaces })}</span>
      </div>
      <ReasonList reasons={top.length ? top : g.reasons.slice(0, 2)} />
      {g.route && <p className="small" style={{ margin: 0 }}>{t('park.routeSummary', { rides: g.rides, zones: g.zoneChanges })}{g.usesTunnel ? ` · ${t('navi.tunnelChosen')}` : ''}</p>}
      <div className="row">
        <button className="btn small ghost" onClick={toggleWhy} aria-expanded={showWhy}>{t('park.why')}</button>
        <span style={{ flex: 1 }} />
        <button className={`btn small ${selected ? 'primary' : ''}`} disabled={closed} onClick={onChoose} aria-pressed={selected}>
          {selected ? <><Check size={16} /> {t('park.chosen')}</> : t('park.choose')}
        </button>
      </div>
      {showWhy && <ReasonList reasons={g.reasons} />}
    </article>
  );
}

function EntranceCard({ e, selected, onChoose }: { e: EntranceOption; selected: boolean; onChoose: () => void }) {
  const { t } = useI18n();
  const closed = e.open === 'closed';
  return (
    <article className="card stack" style={selected ? { border: '2px solid var(--brand)' } : closed ? { opacity: 0.75 } : undefined}>
      <div className="row between">
        <div>
          {e.recommended && <span className="chip brand"><Check size={14} /> {t('park.recommended')}</span>}
          {closed && <span className="chip bad">{t('ent.closed')}</span>}
          {e.open === 'open' && <span className="chip good">{t('ent.open')}</span>}
          <h3 style={{ marginTop: 6 }}><bdi lang="en" dir="ltr">{e.entrance.name}</bdi></h3>
        </div>
      </div>
      <p className="small" style={{ margin: 0 }}>{t(ENT_HOURS[e.entrance.id])}</p>
      {closed && <p className="small" style={{ margin: 0 }}>{t('ent.afterHours')}</p>}
      {e.officialShortest && <div className="reason good"><span className="dot" />{t('ent.officialShortest')}</div>}
      {e.longWay && <div className="reason warn"><span className="dot" />{t('park.longWay')}</div>}
      {e.entrance.id === 'ENTRANCE_2' && <div className="reason info"><span className="dot" />{t('ent.paratransit')}</div>}
      {e.entrance.dropOff && <div className="reason info"><span className="dot" />{t('ent.dropoff')}</div>}
      {e.route && <p className="small muted" style={{ margin: 0 }}>{t('navi.summary', { steps: e.stepCount, rides: e.rides })}</p>}
      <div className="row end">
        <button className={`btn small ${selected ? 'primary' : ''}`} onClick={onChoose} aria-pressed={selected}>
          {selected ? <><Check size={16} /> {t('park.chosen')}</> : <>{t('ent.choose')} <ChevronNext size={16} /></>}
        </button>
      </div>
    </article>
  );
}
