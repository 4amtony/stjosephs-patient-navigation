import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { CHECKPOINTS, checkpointUrl } from '../data/checkpoints';
import { DEST_BY_ID, DESTINATIONS, OFFICIAL, officialEntry } from '../data/destinations';
import { EDGES, NODES } from '../data/graph';
import { SOURCES } from '../data/sources';
import { useI18n } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/core';
import { simulateScan, useSession } from '../state/session';
import { Callout, Prov, RichT } from './common';
import { Check, Flag, Person, Qr } from './Icons';
import type { Provenance } from '../data/types';

export function Arrived() {
  const { t } = useI18n();
  const { s, dispatch } = useSession();
  const dest = s.destId ? DEST_BY_ID[s.destId] : null;
  if (!dest) return null;
  const off = officialEntry(dest);
  return (
    <div className="screen stack" id="main">
      <div className="row"><span className="icon-bubble" style={{ background: 'var(--good-soft)', color: 'var(--good)' }}><Flag /></span><h1 style={{ margin: 0 }}>{t('arrive.title')}</h1></div>
      <div className="card stack">
        <bdi lang="en" dir="ltr" style={{ fontWeight: 800, fontSize: '1.3rem' }}>{dest.name}</bdi>
        <span><RichT k="search.room" p={{ room: { sign: dest.room } }} /> · {t('search.zoneLevel', { zone: dest.zone, level: dest.level })}</span>
        {dest.checkIn && (
          <div>
            <h3>{t('arrive.checkin')}</h3>
            <q lang="en" dir="ltr" style={{ display: 'block', fontStyle: 'italic' }}>{dest.checkIn}</q>
            <span className="tiny muted"><Prov status="OFFICIAL" /> {off?.sourceUrl ? <a href={off.sourceUrl} target="_blank" rel="noreferrer">sjhc.london.on.ca</a> : null}</span>
          </div>
        )}
        <Callout tone="info"><p>{t('arrive.notCheckedIn')}</p></Callout>
        {dest.phones?.length ? (
          <div>
            <h3>{t('arrive.phone')}</h3>
            <ul lang="en" dir="ltr" className="small" style={{ textAlign: 'left' }}>{dest.phones.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        ) : null}
        <p className="small muted">{t('arrive.wrongPlace')}</p>
      </div>
      <div className="row">
        <button className="btn primary" onClick={() => { dispatch({ type: 'setDest', destId: null }); dispatch({ type: 'go', screen: 'search', returnTo: 'navigate' }); }}>{t('arrive.newTrip')}</button>
        <button className="btn help" onClick={() => dispatch({ type: 'go', screen: 'help', returnTo: 'navigate' })}><Person size={18} /> {t('navi.help')}</button>
        <button className="btn" onClick={() => dispatch({ type: 'go', screen: 'navigate' })}>{t('nav.back')}</button>
      </div>
    </div>
  );
}

export function QRSheet() {
  const [base, setBase] = useState(() => `${window.location.origin}${window.location.pathname}`);
  const [imgs, setImgs] = useState<Record<string, string>>({});
  const { dispatch } = useSession();
  useEffect(() => {
    let live = true;
    Promise.all(CHECKPOINTS.map(async (c) => [c.id, await QRCode.toDataURL(checkpointUrl(base, c.id), { margin: 1, width: 320, errorCorrectionLevel: 'M' })] as const)).then((pairs) => {
      if (live) setImgs(Object.fromEntries(pairs));
    }).catch(() => undefined);
    return () => { live = false; };
  }, [base]);
  return (
    <div className="screen stack" id="main" style={{ maxWidth: 1100 }} lang="en" dir="ltr">
      <h1 className="row"><Qr /> Proposed QR checkpoints (demo)</h1>
      <Callout tone="warn">
        <p>These codes are <strong>proposed locations, not installed signs</strong>. Each encodes only a public location id (<code>?checkpoint=ID</code>) — no personal data, no access rights. Scanning one never unlocks restricted areas.</p>
      </Callout>
      <label className="field no-print">
        Base URL encoded in the QR codes (use your computer's LAN address or a deployed URL so phones can open it)
        <input className="input" value={base} onChange={(e) => setBase(e.target.value)} />
      </label>
      <div className="qr-grid">
        {CHECKPOINTS.map((c) => (
          <div key={c.id} className="qr-card">
            {imgs[c.id] ? <img src={imgs[c.id]} alt={`QR code for ${c.name}`} /> : <div style={{ height: 160 }} />}
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
            <div className="cp-id">{c.id}</div>
            <div className="tiny" style={{ color: '#444' }}>{c.mounting}</div>
            <div className="row" style={{ justifyContent: 'center', marginTop: 6 }}>
              <Prov status={c.status} />
              <button className="btn small no-print" onClick={() => simulateScan(dispatch, c.id)}>Simulate scan</button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn no-print" onClick={() => window.print()}>Print this sheet</button>
    </div>
  );
}

export function Sources() {
  const { t } = useI18n();
  const stats = useMemo(() => {
    const officialRoutes = OFFICIAL.entries.reduce((n, e) => n + e.routes.length, 0);
    const byStatus = (list: { status: Provenance }[]) => list.reduce<Record<string, number>>((m, x) => ((m[x.status] = (m[x.status] ?? 0) + 1), m), {});
    return { dest: DESTINATIONS.length, officialEntries: OFFICIAL.entries.length, officialRoutes, nodes: NODES.length, edges: EDGES.length, edgeStatus: byStatus(EDGES), cps: CHECKPOINTS.length };
  }, []);
  return (
    <div className="screen stack" id="main">
      <h1>{t('home.sources')}</h1>
      <p className="small">{t('app.disclaimer')}</p>
      <div className="card stack">
        <h2>How this prototype works</h2>
        <ol className="small" lang="en" dir="ltr" style={{ textAlign: 'left' }}>
          <li><strong>Your words</strong> → matched against the official directory + aliases (deterministic, no AI service).</li>
          <li><strong>Data lookup</strong> → destination record with room, zone, level and the hospital's verbatim step lists.</li>
          <li><strong>Route &amp; access check</strong> → Dijkstra over a source-backed graph; step-free, opening-hour and restricted-area rules are enforced here.</li>
          <li><strong>Localized guidance</strong> → structured actions (turn, elevator, arrive) rendered from translated templates; official English sign names kept verbatim.</li>
          <li><strong>Help</strong> → human support and a bilingual staff card at every stage.</li>
        </ol>
      </div>
      <div className="card" lang="en" dir="ltr" style={{ textAlign: 'left' }}>
        <h2>Coverage</h2>
        <dl className="kv">
          <dt>Destinations</dt><dd>{stats.dest} (incl. 3 information desks, 1 fictional training room)</dd>
          <dt>Official direction entries</dt><dd>{stats.officialEntries} with {stats.officialRoutes} verbatim route variants (retrieved {OFFICIAL.retrievedAt})</dd>
          <dt>Graph</dt><dd>{stats.nodes} nodes, {stats.edges} edges — {Object.entries(stats.edgeStatus).map(([k, v]) => `${v} ${k}`).join(', ')}</dd>
          <dt>QR checkpoints</dt><dd>{stats.cps} proposed</dd>
        </dl>
      </div>
      <div className="card">
        <h2>{t('navi.routeStatus')}</h2>
        {(['OFFICIAL', 'DERIVED', 'SCHEMATIC', 'UNVERIFIED', 'CONFLICTING', 'FICTIONAL'] as Provenance[]).map((p) => (
          <div key={p} className="reason"><Prov status={p} /> <span className="small">{t(`prov.help.${p}` as MessageKey)}</span></div>
        ))}
      </div>
      <div className="card" lang="en" dir="ltr" style={{ textAlign: 'left', overflowX: 'auto' }}>
        <h2>Source ledger</h2>
        <table className="ledger">
          <thead><tr><th>Source</th><th>Used for</th><th>Retrieved</th></tr></thead>
          <tbody>
            {Object.values(SOURCES).map((src) => (
              <tr key={src.id}>
                <td>{src.url.startsWith('http') ? <a href={src.url} target="_blank" rel="noreferrer">{src.title}</a> : src.title}{src.edition && <div className="tiny muted">{src.edition}</div>}</td>
                <td className="small">{src.used}</td>
                <td className="tiny">{src.retrieved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted"><Check size={14} /> See docs/SOURCE_MAP.md and docs/DATA_COVERAGE.md in the repository for conflicts and gaps.</p>
    </div>
  );
}
