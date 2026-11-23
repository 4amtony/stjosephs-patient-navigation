import { useEffect, useState } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nProvider';
import { SessionProvider, useSession, type Screen } from './state/session';
import { Home } from './components/Home';
import { DestinationSearch } from './components/Search';
import { Plan } from './components/Plan';
import { Here } from './components/Here';
import { Navigate } from './components/Navigate';
import { Help } from './components/Help';
import { PrefsPanel } from './components/Prefs';
import { Arrived, QRSheet, Sources } from './components/Misc';
import { LanguageGrid } from './components/LanguagePicker';
import { Presenter } from './components/Presenter';
import { Sheet } from './components/common';
import { Globe, Logo, Person, Settings } from './components/Icons';
import type { MessageKey } from './i18n/core';

/** Shown before a language is chosen, so nobody has to read English first. */
const FIRST_RUN: [string, 'ltr' | 'rtl', string][] = [
  ['en', 'ltr', 'Choose your language'], ['fr', 'ltr', 'Choisissez votre langue'], ['ar', 'rtl', 'اختر لغتك'], ['zh-Hans', 'ltr', '选择语言'],
  ['es', 'ltr', 'Elija su idioma'], ['hi', 'ltr', 'अपनी भाषा चुनें'], ['pa', 'ltr', 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ'], ['ur', 'rtl', 'اپنی زبان منتخب کریں'],
];

const SCREENS: Screen[] = ['home', 'language', 'search', 'plan', 'here', 'navigate', 'arrived', 'help', 'sources', 'qr', 'prefs'];

function Shell() {
  const { s, dispatch } = useSession();
  const { t, meta } = useI18n();
  const [langSheet, setLangSheet] = useState(false);
  const [prefsSheet, setPrefsSheet] = useState(false);

  // accessibility preferences → root attributes
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.large = s.prefs.largeText || s.kiosk ? '1' : '0';
    r.dataset.contrast = s.prefs.highContrast ? 'high' : 'normal';
    r.dataset.motion = s.prefs.reduceMotion ? 'reduce' : 'normal';
    if (s.prefs.highContrast) r.dataset.theme = 'light';
    else delete r.dataset.theme;
  }, [s.prefs, s.kiosk]);

  // browser back button support (hash mirrors the screen)
  useEffect(() => {
    const want = `#${s.screen}`;
    if (window.location.hash !== want) window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${want}`);
    window.scrollTo({ top: 0 });
  }, [s.screen]);
  useEffect(() => {
    const onPop = () => {
      const h = window.location.hash.slice(1) as Screen;
      if (SCREENS.includes(h)) dispatch({ type: 'go', screen: h });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [dispatch]);

  // transient notices
  useEffect(() => {
    if (!s.notice) return;
    const id = setTimeout(() => dispatch({ type: 'notice', notice: null }), 5200);
    return () => clearTimeout(id);
  }, [s.notice, dispatch]);

  useEffect(() => {
    document.title = `${t('app.title')} · ${t('app.short')}`;
  }, [t]);

  let body: JSX.Element;
  switch (s.screen) {
    case 'language':
      body = (
        <div className="screen stack" id="main">
          <h1>{t('lang.title')}</h1>
          <LanguageGrid current={s.locale} onPick={(c) => { dispatch({ type: 'setLocale', locale: c }); dispatch({ type: 'go', screen: s.returnTo && s.returnTo !== 'language' ? s.returnTo : 'home' }); }} />
        </div>
      );
      break;
    case 'search':
      body = (
        <div className="screen stack" id="main">
          <h1>{t('search.title')}</h1>
          <DestinationSearch
            onPick={(d) => {
              const next: Screen = s.returnTo === 'navigate' && s.originCp ? 'navigate' : s.returnTo === 'here' ? 'here' : 'plan';
              dispatch({ type: 'setDest', destId: d.id, next });
            }}
          />
        </div>
      );
      break;
    case 'plan':
      body = <Plan />;
      break;
    case 'here':
      body = <Here key={`${s.originCp}-${s.rerouteCount}-${s.scanError ? 'err' : 'ok'}`} />;
      break;
    case 'navigate':
      body = <Navigate />;
      break;
    case 'arrived':
      body = <Arrived />;
      break;
    case 'help':
      body = <Help />;
      break;
    case 'sources':
      body = <Sources />;
      break;
    case 'qr':
      body = <QRSheet />;
      break;
    case 'prefs':
      body = (
        <div className="screen" id="main">
          <PrefsPanel />
        </div>
      );
      break;
    default:
      body = (
        <>
          {!s.localeChosen && (
            <div className="screen stack" style={{ paddingBottom: 0 }}>
              <div className="card tinted stack">
                <h2 className="row" style={{ margin: 0 }}>
                  <Globe /> <span>{t('lang.title')}</span>
                </h2>
                <p className="small" style={{ margin: 0 }}>
                  {FIRST_RUN.map(([lang, dir, text]) => (
                    <span key={lang} lang={lang} dir={dir} style={{ marginInlineEnd: 12, display: 'inline-block' }}>{text}</span>
                  ))}
                </p>
                <LanguageGrid current={s.locale} onPick={(c) => dispatch({ type: 'setLocale', locale: c })} />
              </div>
            </div>
          )}
          <Home />
        </>
      );
  }

  return (
    <div className="app">
      <a className="skip" href="#main">{t('a11y.skip')}</a>
      <header className="topbar no-print">
        <button className="brand" onClick={() => dispatch({ type: 'go', screen: 'home' })} aria-label={t('nav.home')}>
          <span className="brand-mark"><Logo /></span>
          <span className="brand-text">
            <span className="brand-title">{t('app.title')}</span>
            <span className="brand-sub"><span>{t('app.short')} </span><span className="proto-badge">Prototype</span></span>
          </span>
        </button>
        <button className="btn small tb-btn" onClick={() => setLangSheet(true)} aria-label={t('lang.change')}>
          <Globe size={18} /> <span className="lang-name" lang={meta.htmlLang}>{meta.native}</span>
        </button>
        <button className="btn small tb-btn" onClick={() => setPrefsSheet(true)} aria-label={t('nav.settings')} title={t('nav.settings')}>
          <Settings size={18} />
        </button>
        <button className="btn small tb-btn help" onClick={() => dispatch({ type: 'go', screen: 'help', returnTo: s.screen })} aria-label={t('navi.help')} title={t('navi.help')}>
          <Person size={18} />
        </button>
      </header>
      {s.notice && (
        <div className={`toast ${s.notice.tone ?? 'info'}`} role="status">
          {t(s.notice.key as MessageKey, s.notice.params)}
        </div>
      )}
      {s.kiosk && (
        <div className="callout info no-print" style={{ borderRadius: 0 }}>
          <div><strong>{t('kiosk.title')}</strong> — {t('kiosk.body')}</div>
        </div>
      )}
      <main>{body}</main>
      {s.screen !== 'navigate' && (
        <footer className="footer">
          <p style={{ margin: 0 }}>{t('app.disclaimer')}</p>
          <p style={{ margin: '6px 0 0' }}>
            <button className="btn ghost small" onClick={() => dispatch({ type: 'go', screen: 'sources' })}>{t('home.sources')}</button>
          </p>
        </footer>
      )}
      {langSheet && (
        <Sheet title={t('lang.title')} onClose={() => setLangSheet(false)}>
          <LanguageGrid current={s.locale} onPick={(c) => { dispatch({ type: 'setLocale', locale: c }); setLangSheet(false); }} />
        </Sheet>
      )}
      {prefsSheet && (
        <Sheet title={t('prefs.title')} onClose={() => setPrefsSheet(false)}>
          <PrefsPanel />
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => setPrefsSheet(false)}>{t('prefs.save')}</button>
        </Sheet>
      )}
      <Presenter />
    </div>
  );
}

function WithI18n() {
  const { s } = useSession();
  return (
    <I18nProvider locale={s.locale}>
      <Shell />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <WithI18n />
    </SessionProvider>
  );
}
