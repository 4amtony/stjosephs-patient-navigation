import { createContext, Fragment, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cachedCatalog, enTranslator, loadCatalog, makeTranslator, splitTemplate, type MessageKey, type Translator } from './core';
import { LANG_BY_CODE, type LanguageMeta, type LocaleCode } from './languages';
import type { PV, Sentence } from '../engine/routeText';

interface I18n extends Translator {
  meta: LanguageMeta;
  en: Translator;
  ready: boolean;
  /** rich render: {sign} params become <bdi lang="en"> chips; nested messages are localized */
  rich: (s: Sentence) => ReactNode;
  richIn: (tr: Translator, s: Sentence) => ReactNode;
}

const Ctx = createContext<I18n | null>(null);

export function SignChip({ children }: { children: string }) {
  return (
    <bdi lang="en" dir="ltr" className="sign">
      {children}
    </bdi>
  );
}

function renderPV(v: PV, tr: Translator, key: string): ReactNode {
  if (typeof v === 'string' || typeof v === 'number') return <Fragment key={key}>{v}</Fragment>;
  if ('sign' in v) return <SignChip key={key}>{v.sign}</SignChip>;
  if ('list' in v)
    return (
      <Fragment key={key}>
        {v.list.map((x, i) => (
          <Fragment key={i}>
            {i > 0 && ', '}
            {renderPV(x, tr, `${key}-${i}`)}
          </Fragment>
        ))}
      </Fragment>
    );
  return <Fragment key={key}>{richSentence(tr, { k: v.k, p: v.p })}</Fragment>;
}

export function richSentence(tr: Translator, s: Sentence): ReactNode {
  const tpl = tr.has(s.k) ? tr.t(s.k) : enTranslator.t(s.k);
  if (!tr.has(s.k) && tr.locale !== 'en-CA') tr.fallbacks.add(s.k);
  // tr.t() already interpolated nothing (no params) — split the raw template instead
  const parts = splitTemplate(tpl);
  return parts.map((p, i) => (typeof p === 'string' ? <Fragment key={i}>{p}</Fragment> : s.p && p.param in s.p ? renderPV(s.p[p.param], tr, `${i}`) : `{${p.param}}`));
}

export function I18nProvider({ locale, children }: { locale: LocaleCode; children: ReactNode }) {
  const [catalog, setCatalog] = useState(() => cachedCatalog(locale));
  const [loadedFor, setLoadedFor] = useState<LocaleCode | null>(cachedCatalog(locale) ? locale : null);
  useEffect(() => {
    let live = true;
    loadCatalog(locale).then((c) => {
      if (live) {
        setCatalog(c);
        setLoadedFor(locale);
      }
    });
    return () => {
      live = false;
    };
  }, [locale]);

  const meta = LANG_BY_CODE[locale];
  useEffect(() => {
    document.documentElement.lang = meta.htmlLang;
    document.documentElement.dir = meta.dir;
    document.documentElement.dataset.script = meta.script;
  }, [meta]);

  const value = useMemo<I18n>(() => {
    const tr = makeTranslator(locale, loadedFor === locale && catalog ? catalog : locale === 'en-CA' ? (cachedCatalog('en-CA') ?? {}) : {});
    return {
      ...tr,
      meta,
      en: enTranslator,
      ready: loadedFor === locale,
      rich: (s: Sentence) => richSentence(tr, s),
      richIn: (t: Translator, s: Sentence) => richSentence(t, s),
    };
  }, [locale, catalog, loadedFor, meta]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error('I18nProvider missing');
  return v;
}

export type { MessageKey };
