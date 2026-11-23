import { useI18n } from '../i18n/I18nProvider';
import { useSession, type Prefs } from '../state/session';
import { Toggle } from './common';
import { Globe, Person, Speaker, TextIcon, Wheelchair } from './Icons';
import type { MessageKey } from '../i18n/core';

const ITEMS: [keyof Prefs, MessageKey, MessageKey | null, JSX.Element | null][] = [
  ['stepFree', 'prefs.stepFree', 'prefs.stepFreeHelp', <Wheelchair key="w" />],
  ['largeText', 'prefs.largeText', null, <span key="t" style={{ fontWeight: 800, width: 22, textAlign: 'center' }}>A+</span>],
  ['highContrast', 'prefs.highContrast', null, <span key="c" style={{ fontWeight: 800, width: 22, textAlign: 'center' }}>◐</span>],
  ['voice', 'prefs.voice', null, <Speaker key="s" />],
  ['simple', 'prefs.simple', null, <TextIcon key="x" />],
  ['reduceMotion', 'prefs.reduceMotion', null, <span key="m" style={{ width: 22, textAlign: 'center' }}>≋</span>],
  ['wantHelp', 'prefs.wantHelp', null, <Person key="p" />],
];

export function PrefsPanel() {
  const { t, meta } = useI18n();
  const { s, dispatch } = useSession();
  return (
    <div className="stack">
      <h1>{t('prefs.title')}</h1>
      <p className="muted">{t('prefs.optional')}</p>
      <button className="card choice" onClick={() => dispatch({ type: 'go', screen: 'language', returnTo: s.screen })}>
        <span className="icon-bubble"><Globe /></span>
        <span>
          <strong>{t('lang.change')}</strong>
          <span className="muted" style={{ display: 'block' }}>{meta.native}</span>
        </span>
      </button>
      <div className="card" style={{ paddingBlock: 4 }}>
        {ITEMS.map(([k, label, help, icon]) => (
          <Toggle key={k} label={t(label)} help={help ? t(help) : undefined} checked={s.prefs[k]} onChange={(v) => dispatch({ type: 'setPref', key: k, value: v })} icon={icon} />
        ))}
      </div>
    </div>
  );
}
