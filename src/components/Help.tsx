import { useState } from 'react';
import { CHECKPOINT_BY_ID } from '../data/checkpoints';
import { DEST_BY_ID } from '../data/destinations';
import { useI18n } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/core';
import { useSession } from '../state/session';
import { Callout } from './common';
import { ChevronNext, Globe, Info, Person, Print, Warn, Wheelchair } from './Icons';

const OPTS: [string, MessageKey][] = [
  ['directions', 'help.optDirections'],
  ['interpreter', 'help.optInterpreter'],
  ['wheelchair', 'help.optWheelchair'],
  ['escort', 'help.optEscort'],
  ['unwell', 'help.optUnwell'],
];

/** Bilingual (chosen language + English) show-to-staff card. No name, diagnosis or health data. */
export function StaffCard({ wants }: { wants: Set<string> }) {
  const { t, en, meta, locale } = useI18n();
  const { s } = useSession();
  const dest = s.destId ? DEST_BY_ID[s.destId] : null;
  const cp = s.originCp ? CHECKPOINT_BY_ID[s.originCp] : null;
  const Bi = ({ k }: { k: MessageKey }) => (
    <div className="bi">
      {locale !== 'en-CA' && <span className="loc" lang={meta.htmlLang} dir={meta.dir}>{t(k)}</span>}
      <span className="en" lang="en" dir="ltr">{en.t(k)}</span>
    </div>
  );
  return (
    <div className="staff-card" aria-label={en.t('help.cardTitle')}>
      <Bi k="help.cardNeed" />
      <span className="value">{dest ? `${dest.name} — ${dest.room}` : en.t('help.noDestination')}</span>
      <hr />
      <Bi k="help.cardAt" />
      <span className="value">{cp ? cp.name : en.t('help.cardUnknownPlace')}</span>
      <hr />
      <Bi k="help.cardWant" />
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {OPTS.filter(([id]) => wants.has(id)).map(([id, k]) => (
          <li key={id} style={{ marginBottom: 6 }}>
            <span className="tick">☑</span>{' '}
            {locale !== 'en-CA' && <span lang={meta.htmlLang} dir={meta.dir} style={{ fontWeight: 700 }}>{t(k)}{id === 'interpreter' ? ` (${meta.native})` : ''} · </span>}
            <span lang="en" dir="ltr" style={{ fontWeight: 700 }}>{en.t(k)}{id === 'interpreter' ? ` (${meta.english})` : ''}</span>
          </li>
        ))}
      </ul>
      <hr />
      <Bi k="help.cardLang" />
      <span className="value"><span lang={meta.htmlLang} dir={meta.dir}>{meta.native}</span> · {meta.english}</span>
      <p className="tiny" style={{ marginTop: 12, color: '#444' }}>{en.t('help.cardPrivacy')} {en.t('help.notDispatched')}</p>
    </div>
  );
}

export function Help() {
  const { t } = useI18n();
  const { s, dispatch } = useSession();
  const [wants, setWants] = useState<Set<string>>(() => new Set(['directions', ...(s.locale !== 'en-CA' ? ['interpreter'] : []), ...(s.prefs.stepFree ? ['wheelchair'] : [])]));
  const toggle = (id: string) => setWants((w) => { const n = new Set(w); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const nearestDesk = (() => {
    const cp = s.originCp ? CHECKPOINT_BY_ID[s.originCp] : null;
    if (!cp) return 'info-desk-e1';
    if (['C', 'D', 'CG'].includes(cp.zone)) return 'info-desk-e4';
    if (cp.zone === 'B') return 'info-desk-e2';
    return 'info-desk-e1';
  })();
  return (
    <div className="screen stack" id="main">
      <h1 className="row"><Person /> {t('help.title')}</h1>
      <p>{t('help.intro')}</p>
      <Callout tone="warn"><p>{t('help.notDispatched')}</p></Callout>
      {wants.has('unwell') && <Callout tone="bad"><p><strong>{t('help.unwell')}</strong> {t('help.emergencyBody')}</p></Callout>}

      <section className="stack" aria-labelledby="h-card">
        <h2 id="h-card">{t('help.cardTitle')}</h2>
        <div className="seg" role="group" aria-label={t('help.cardWant')}>
          {OPTS.map(([id, k]) => (
            <button key={id} aria-pressed={wants.has(id)} onClick={() => toggle(id)}>{t(k)}</button>
          ))}
        </div>
        <StaffCard wants={wants} />
        <div className="row">
          <button className="btn" onClick={() => window.print()}><Print size={18} /> {t('help.cardPrint')}</button>
          <button className="btn" onClick={() => { dispatch({ type: 'setDest', destId: nearestDesk }); dispatch({ type: 'go', screen: s.originCp ? 'navigate' : 'here' }); }}>
            {t('help.deskGo')} <ChevronNext />
          </button>
        </div>
        <p className="tiny muted">{t('help.cardPrivacy')}</p>
      </section>

      <section className="card stack">
        <h3 className="row"><Info size={20} /> {t('help.deskTitle')}</h3>
        <p style={{ margin: 0 }}>{t('help.deskBody')}</p>
      </section>
      <section className="card stack">
        <h3 className="row"><Globe size={20} /> {t('help.langTitle')}</h3>
        <p style={{ margin: 0 }}>{t('help.langBody')}</p>
        <p style={{ margin: 0 }}>{t('help.langAdvance')}</p>
        <p className="small" style={{ margin: 0 }}>{t('help.langSign')}</p>
        <a className="small" href="https://www.sjhc.london.on.ca/news-and-media/our-stories/speaking-their-language-0" target="_blank" rel="noreferrer">St. Joseph's: “Speaking their language” ↗</a>
      </section>
      <section className="card stack">
        <h3 className="row"><Wheelchair size={20} /> {t('help.mobilityTitle')}</h3>
        <p style={{ margin: 0 }}>{t('help.mobilityBody')}</p>
        <p className="small" style={{ margin: 0 }}>{t('help.hearing')}</p>
      </section>
      <section className="card stack">
        <h3 className="row"><Warn size={20} /> {t('help.securityTitle')} · {t('help.emergencyTitle')}</h3>
        <p style={{ margin: 0 }}>{t('help.securityBody')}</p>
        <p style={{ margin: 0 }}><strong>{t('help.emergencyBody')}</strong></p>
      </section>
      <p className="small muted">{t('help.noSmartphone')}</p>
      <a className="small" href="https://www.sjhc.london.on.ca/patients-and-visitors/visiting-information/accessibility" target="_blank" rel="noreferrer">{t('help.official')} ↗</a>
      {s.returnTo === 'navigate' && s.destId && (
        <button className="btn primary" onClick={() => dispatch({ type: 'go', screen: 'navigate' })}>{t('nav.back')}</button>
      )}
    </div>
  );
}
