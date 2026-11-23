import { useState } from 'react';
import { CHECKPOINTS, CHECKPOINT_BY_ID } from '../data/checkpoints';
import { DEST_BY_ID } from '../data/destinations';
import { NODE_BY_ID } from '../data/graph';
import { useI18n } from '../i18n/I18nProvider';
import { useSession } from '../state/session';
import { Callout, Prov, useLevelText } from './common';
import { Check, ChevronNext, Pin, Qr } from './Icons';
import { DestinationSearch } from './Search';
import { PrefsPanel } from './Prefs';
import Map2D from './map/Map2D';

/**
 * "You are here" — confirm/correct the scanned checkpoint, then confirm destination, then a short
 * optional preferences step. Unknown or malformed QR values are never trusted.
 */
export function Here() {
  const { t } = useI18n();
  const { s, dispatch } = useSession();
  const cp = s.originCp ? CHECKPOINT_BY_ID[s.originCp] : null;
  const dest = s.destId ? DEST_BY_ID[s.destId] : null;
  const levelText = useLevelText();
  const [stage, setStage] = useState<'where' | 'pick' | 'dest' | 'prefs'>(cp && !s.scanError ? 'where' : 'pick');

  if (stage === 'pick' || s.scanError || !cp) {
    return (
      <div className="screen stack" id="main">
        <h1>{t('here.pick')}</h1>
        {s.scanError && (
          <Callout tone="bad">
            <p>{s.scanError.ok === false && s.scanError.reason === 'malformed' ? t('here.malformed') : t('here.unknown', { raw: s.scanError.ok === false ? s.scanError.raw : '' })}</p>
          </Callout>
        )}
        <p className="muted">{t('here.pickHelp')}</p>
        <p className="small muted">{t('here.noTracking')}</p>
        <CheckpointPicker
          onPick={(id) => {
            dispatch({ type: 'scan', raw: id, source: 'manual' });
            setStage('where');
          }}
        />
      </div>
    );
  }

  if (stage === 'dest') {
    return (
      <div className="screen stack" id="main">
        <h1>{t('here.chooseDest')}</h1>
        <DestinationSearch onPick={(d) => { dispatch({ type: 'setDest', destId: d.id }); setStage('prefs'); }} />
      </div>
    );
  }

  if (stage === 'prefs') {
    return (
      <div className="screen stack" id="main">
        <PrefsPanel />
        <button className="btn primary block" onClick={() => dispatch({ type: 'confirmOrigin' })}>
          {t('nav.start')} <ChevronNext />
        </button>
        <button className="btn ghost" onClick={() => dispatch({ type: 'confirmOrigin' })}>{t('nav.skip')}</button>
      </div>
    );
  }

  return (
    <div className="screen stack" id="main">
      {s.originVia === 'qr' && <span className="chip info" style={{ alignSelf: 'flex-start' }}><Qr size={14} /> {t('here.scanned')}</span>}
      <h1>{t('here.title')}</h1>
      <div className="card stack">
        <div className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <span className="icon-bubble"><Pin /></span>
          <div>
            <bdi lang="en" dir="ltr" className="sign" style={{ fontSize: '1.05rem' }}>{cp.name}</bdi>
            <p className="small" style={{ margin: '6px 0 0' }}>{cp.level >= 0 && !['GG', 'CG'].includes(cp.zone) ? t('here.zoneLevel', { zone: cp.zone, level: cp.level }) : levelText(cp.level, cp.zone)} <Prov status={cp.status} /></p>
          </div>
        </div>
        <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
          <Map2D nodes={null} edges={null} stepNodes={[]} originNode={cp.node} destNode={null} focusLevel={cp.level} focusKey="here" reduceMotion showCheckpoints={false} showFictional={cp.zone === 'X'} hereLabel={t('map.youAreHere')} destLabel="" highContrast={s.prefs.highContrast} zoom={{ x: NODE_BY_ID[cp.node].x, y: NODE_BY_ID[cp.node].y, r: 420 }} />
        </div>
        {cp.facing && <p className="small muted" style={{ margin: 0 }}>{t('here.facing')}</p>}
        <p className="tiny muted" style={{ margin: 0 }}>{t('here.noTracking')} {t('navi.qrNoAccess')}</p>
      </div>
      <button className="btn primary block" onClick={() => setStage(dest ? 'prefs' : 'dest')}>
        <Check /> {t('here.confirm')}
      </button>
      <button className="btn block" onClick={() => setStage('pick')}>{t('here.wrong')}</button>
      {dest && (
        <div className="card flat row between">
          <div>
            <span className="tiny muted">{t('navi.to')}</span>
            <bdi lang="en" dir="ltr" style={{ display: 'block', fontWeight: 700 }}>{dest.name} ({dest.room})</bdi>
          </div>
          <button className="btn small" onClick={() => setStage('dest')}>{t('nav.change')}</button>
        </div>
      )}
    </div>
  );
}

export function CheckpointPicker({ onPick }: { onPick: (id: string) => void }) {
  const { t } = useI18n();
  const groups: [string, typeof CHECKPOINTS][] = [
    [t('here.groupEntrances'), CHECKPOINTS.filter((c) => c.kind === 'entrance')],
    [t('here.groupGarages'), CHECKPOINTS.filter((c) => c.kind === 'garage')],
    [t('here.groupLifts'), CHECKPOINTS.filter((c) => c.kind === 'lift')],
    [t('here.groupJunctions'), CHECKPOINTS.filter((c) => c.kind === 'junction')],
  ];
  return (
    <div className="stack">
      {groups.map(([title, list], gi) => (
        <details key={title} open={gi === 0}>
          <summary>{title} ({list.length})</summary>
          <ul className="list card flat">
            {list.map((c) => (
              <li key={c.id}>
                <button className="list-btn" onClick={() => onPick(c.id)}>
                  <Pin size={18} />
                  <span className="grow"><bdi lang="en" dir="ltr">{c.name}</bdi></span>
                  <ChevronNext />
                </button>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
