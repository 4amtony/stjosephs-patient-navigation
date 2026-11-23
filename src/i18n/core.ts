import en from './locales/en-CA.json';
import type { LocaleCode } from './languages';

export type MessageKey = keyof typeof en;
export type Catalog = Partial<Record<MessageKey, string>>;
export type Params = Record<string, string | number>;

export const EN: Record<MessageKey, string> = en;

const loaders = import.meta.glob('./locales/*.json') as Record<string, () => Promise<{ default: Catalog }>>;
const cache: Partial<Record<LocaleCode, Catalog>> = { 'en-CA': en };

export async function loadCatalog(code: LocaleCode): Promise<Catalog> {
  if (cache[code]) return cache[code]!;
  const loader = loaders[`./locales/${code}.json`];
  if (!loader) {
    cache[code] = {};
    return {};
  }
  try {
    const mod = await loader();
    cache[code] = mod.default ?? (mod as unknown as Catalog);
  } catch {
    cache[code] = {};
  }
  return cache[code]!;
}

export function cachedCatalog(code: LocaleCode): Catalog | undefined {
  return cache[code];
}

/** Replace {param} tokens. Unknown params are left visible so mistakes are noticed. */
export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{([a-zA-Z]+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/** Split a template into text and param tokens (for rich rendering with <bdi> sign chips). */
export function splitTemplate(template: string): (string | { param: string })[] {
  const out: (string | { param: string })[] = [];
  let last = 0;
  template.replace(/\{([a-zA-Z]+)\}/g, (m, k, idx: number) => {
    if (idx > last) out.push(template.slice(last, idx));
    out.push({ param: k });
    last = idx + m.length;
    return m;
  });
  if (last < template.length) out.push(template.slice(last));
  return out;
}

export interface Translator {
  locale: LocaleCode;
  t: (key: MessageKey, params?: Params) => string;
  has: (key: MessageKey) => boolean;
  /** keys that fell back to English during this render cycle */
  fallbacks: Set<string>;
}

export function makeTranslator(locale: LocaleCode, catalog: Catalog): Translator {
  const fallbacks = new Set<string>();
  const has = (key: MessageKey) => typeof catalog[key] === 'string' && catalog[key]!.trim() !== '';
  const t = (key: MessageKey, params?: Params) => {
    let s = catalog[key];
    if (typeof s !== 'string' || s.trim() === '') {
      if (locale !== 'en-CA') fallbacks.add(key);
      s = EN[key] ?? key;
    }
    return interpolate(s, params);
  };
  return { locale, t, has, fallbacks };
}

export const enTranslator = makeTranslator('en-CA', en);
