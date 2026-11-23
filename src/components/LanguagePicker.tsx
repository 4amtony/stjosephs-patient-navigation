import { useState } from 'react';
import { LANGUAGES, type LocaleCode } from '../i18n/languages';
import { useI18n } from '../i18n/I18nProvider';
import { Search } from './Icons';

export function LanguageGrid({ current, onPick }: { current: LocaleCode; onPick: (c: LocaleCode) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const n = q.trim().toLowerCase();
  const list = LANGUAGES.filter((l) => !n || l.native.toLowerCase().includes(n) || l.english.toLowerCase().includes(n) || l.code.toLowerCase().startsWith(n));
  return (
    <div className="stack">
      <div style={{ position: 'relative' }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t('lang.search')} · Search languages`} aria-label={t('lang.search')} style={{ paddingInlineStart: 44 }} />
        <span style={{ position: 'absolute', insetInlineStart: 14, top: 16, color: 'var(--muted)' }}>
          <Search size={20} />
        </span>
      </div>
      <div className="lang-grid" role="list">
        {list.map((l) => (
          <button key={l.code} role="listitem" className="lang-btn" aria-pressed={current === l.code} onClick={() => onPick(l.code)} lang={l.htmlLang} dir={l.dir}>
            <span className="native" lang={l.htmlLang}>{l.native}</span>
            <span className="eng" lang="en" dir="ltr">{l.english}</span>
          </button>
        ))}
      </div>
      <p className="small muted">{t('lang.note')}</p>
    </div>
  );
}
