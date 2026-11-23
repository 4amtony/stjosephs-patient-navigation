import { useMemo, useState } from 'react';
import { type Destination } from '../data/destinations';
import { alphabetical, popularDestinations, searchDestinations } from '../engine/search';
import { useI18n } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/core';
import { Callout, Prov, RichT } from './common';
import { ChevronNext, Search as SearchIcon, Info } from './Icons';

export function DestRow({ d, onPick, term }: { d: Destination; onPick: (d: Destination) => void; term?: string }) {
  const { t, has } = useI18n();
  const glossKey = `dest.${d.id}` as MessageKey;
  return (
    <li>
      <button className="list-btn" onClick={() => onPick(d)}>
        <span className="grow">
          <bdi lang="en" dir="ltr" style={{ fontWeight: 700, display: 'block' }}>{d.name}</bdi>
          {has(glossKey) && <span className="small" style={{ display: 'block' }}>{t(glossKey)}</span>}
          <span className="small muted">
            <RichT k="search.room" p={{ room: { sign: d.room } }} /> · {t('search.zoneLevel', { zone: d.zone, level: d.level })}
          </span>
          {term && <span className="tiny muted" style={{ display: 'block' }}>{t('search.matchedBy', { term })}</span>}
        </span>
        {d.status !== 'OFFICIAL' && <Prov status={d.status} />}
        <ChevronNext />
      </button>
    </li>
  );
}

export function DestinationSearch({ onPick, autoFocus = true }: { onPick: (d: Destination) => void; autoFocus?: boolean }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [browse, setBrowse] = useState(false);
  const res = useMemo(() => searchDestinations(q), [q]);
  return (
    <div className="stack">
      <label className="field" htmlFor="dest-q">
        {t('search.label')}
        <span style={{ position: 'relative' }}>
          <input
            id="dest-q"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder')}
            autoFocus={autoFocus}
            autoComplete="off"
            enterKeyHint="search"
            style={{ paddingInlineStart: 46 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && res.kind === 'match') onPick(res.dest);
            }}
          />
          <span style={{ position: 'absolute', insetInlineStart: 14, top: 16, color: 'var(--muted)' }}>
            <SearchIcon size={20} />
          </span>
        </span>
      </label>
      <p className="tiny muted" style={{ marginTop: -6 }}>{t('search.tip')}</p>

      <div aria-live="polite">
        {res.kind === 'match' && (
          <div className="card flat">
            <ul className="list">
              <DestRow d={res.dest} onPick={onPick} term={res.term} />
              {res.alternatives.map((d) => (
                <DestRow key={d.id} d={d} onPick={onPick} />
              ))}
            </ul>
          </div>
        )}
        {res.kind === 'ambiguous' && (
          <div className="stack">
            <Callout tone="warn">
              <strong>{t('search.ambiguous', { q })}</strong>
            </Callout>
            <div className="card flat">
              <ul className="list">
                {res.options.map((o) => (
                  <DestRow key={o.dest.id} d={o.dest} onPick={onPick} term={o.term} />
                ))}
              </ul>
            </div>
          </div>
        )}
        {res.kind === 'none' && (
          <Callout tone="warn">
            <p><strong>{t('search.noResults', { q })}</strong></p>
            <p>{t('search.noResultsHelp')}</p>
          </Callout>
        )}
      </div>

      {res.kind === 'empty' && (
        <>
          <h2 style={{ marginTop: 8 }}>{t('search.popular')}</h2>
          <div className="card flat">
            <ul className="list">
              {popularDestinations().map((d) => (
                <DestRow key={d.id} d={d} onPick={onPick} />
              ))}
            </ul>
          </div>
          <details open={browse} onToggle={(e) => setBrowse((e.target as HTMLDetailsElement).open)}>
            <summary>{t('search.browse')}</summary>
            {browse && (
              <div className="card flat">
                <ul className="list">
                  {alphabetical().map((d) => (
                    <DestRow key={d.id} d={d} onPick={onPick} />
                  ))}
                </ul>
              </div>
            )}
          </details>
        </>
      )}
      <p className="tiny muted" style={{ display: 'flex', gap: 6 }}>
        <Info size={14} /> {t('search.how')}
      </p>
    </div>
  );
}
