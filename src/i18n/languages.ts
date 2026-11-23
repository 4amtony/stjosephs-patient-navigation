/**
 * The 20 supported interface languages. Order = suggested display order (see docs/I18N_COVERAGE.md):
 * official languages first, then languages named in St. Joseph's own volunteer-language story
 * (Arabic, Mandarin, Spanish, Hindi) and other languages common in the London–Middlesex region.
 * This is a product-design choice, not a claim about St. Joseph's most common patient languages.
 */
export type LocaleCode =
  | 'en-CA' | 'fr-CA' | 'ar' | 'zh-Hans' | 'es' | 'hi' | 'pa-Guru' | 'pt' | 'zh-Hant' | 'ur'
  | 'fa' | 'ta' | 'vi' | 'fil' | 'ko' | 'ru' | 'uk' | 'pl' | 'de' | 'bn';

export interface LanguageMeta {
  code: LocaleCode;
  native: string;
  english: string;
  dir: 'ltr' | 'rtl';
  /** BCP-47 tags to look for in speechSynthesis voices, most specific first */
  tts: string[];
  /** html lang attribute */
  htmlLang: string;
  /** script hint for font stacks */
  script: 'latin' | 'arabic' | 'nastaliq' | 'hans' | 'hant' | 'devanagari' | 'gurmukhi' | 'tamil' | 'bengali' | 'hangul' | 'cyrillic';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en-CA', native: 'English', english: 'English', dir: 'ltr', tts: ['en-CA', 'en-US', 'en-GB', 'en'], htmlLang: 'en-CA', script: 'latin' },
  { code: 'fr-CA', native: 'Français', english: 'French', dir: 'ltr', tts: ['fr-CA', 'fr-FR', 'fr'], htmlLang: 'fr-CA', script: 'latin' },
  { code: 'ar', native: 'العربية', english: 'Arabic', dir: 'rtl', tts: ['ar-SA', 'ar-EG', 'ar'], htmlLang: 'ar', script: 'arabic' },
  { code: 'zh-Hans', native: '简体中文', english: 'Chinese (Simplified)', dir: 'ltr', tts: ['zh-CN', 'cmn-CN', 'zh'], htmlLang: 'zh-Hans', script: 'hans' },
  { code: 'es', native: 'Español', english: 'Spanish', dir: 'ltr', tts: ['es-MX', 'es-US', 'es-ES', 'es'], htmlLang: 'es', script: 'latin' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', dir: 'ltr', tts: ['hi-IN', 'hi'], htmlLang: 'hi', script: 'devanagari' },
  { code: 'pa-Guru', native: 'ਪੰਜਾਬੀ', english: 'Punjabi (Gurmukhi)', dir: 'ltr', tts: ['pa-IN', 'pa-Guru-IN', 'pa'], htmlLang: 'pa-Guru', script: 'gurmukhi' },
  { code: 'pt', native: 'Português', english: 'Portuguese', dir: 'ltr', tts: ['pt-PT', 'pt-BR', 'pt'], htmlLang: 'pt', script: 'latin' },
  { code: 'zh-Hant', native: '繁體中文', english: 'Chinese (Traditional)', dir: 'ltr', tts: ['zh-TW', 'zh-HK', 'yue-HK', 'zh-Hant'], htmlLang: 'zh-Hant', script: 'hant' },
  { code: 'ur', native: 'اردو', english: 'Urdu', dir: 'rtl', tts: ['ur-PK', 'ur-IN', 'ur'], htmlLang: 'ur', script: 'nastaliq' },
  { code: 'fa', native: 'فارسی', english: 'Persian (Farsi)', dir: 'rtl', tts: ['fa-IR', 'fa'], htmlLang: 'fa', script: 'arabic' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', dir: 'ltr', tts: ['ta-IN', 'ta-LK', 'ta'], htmlLang: 'ta', script: 'tamil' },
  { code: 'vi', native: 'Tiếng Việt', english: 'Vietnamese', dir: 'ltr', tts: ['vi-VN', 'vi'], htmlLang: 'vi', script: 'latin' },
  { code: 'fil', native: 'Filipino / Tagalog', english: 'Tagalog (Filipino)', dir: 'ltr', tts: ['fil-PH', 'tl-PH', 'fil', 'tl'], htmlLang: 'fil', script: 'latin' },
  { code: 'ko', native: '한국어', english: 'Korean', dir: 'ltr', tts: ['ko-KR', 'ko'], htmlLang: 'ko', script: 'hangul' },
  { code: 'ru', native: 'Русский', english: 'Russian', dir: 'ltr', tts: ['ru-RU', 'ru'], htmlLang: 'ru', script: 'cyrillic' },
  { code: 'uk', native: 'Українська', english: 'Ukrainian', dir: 'ltr', tts: ['uk-UA', 'uk'], htmlLang: 'uk', script: 'cyrillic' },
  { code: 'pl', native: 'Polski', english: 'Polish', dir: 'ltr', tts: ['pl-PL', 'pl'], htmlLang: 'pl', script: 'latin' },
  { code: 'de', native: 'Deutsch', english: 'German', dir: 'ltr', tts: ['de-DE', 'de-AT', 'de'], htmlLang: 'de', script: 'latin' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', dir: 'ltr', tts: ['bn-IN', 'bn-BD', 'bn'], htmlLang: 'bn', script: 'bengali' },
];

export const LANG_BY_CODE = Object.fromEntries(LANGUAGES.map((l) => [l.code, l])) as Record<LocaleCode, LanguageMeta>;

export function isLocale(x: unknown): x is LocaleCode {
  return typeof x === 'string' && x in LANG_BY_CODE;
}

/** Best-effort match of a browser language (e.g. "zh-TW", "pa", "tl") to a supported locale. */
export function matchLocale(tag: string | undefined | null): LocaleCode | null {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.startsWith('zh')) return /tw|hk|mo|hant/.test(t) ? 'zh-Hant' : 'zh-Hans';
  if (t.startsWith('pa')) return 'pa-Guru';
  if (t.startsWith('tl') || t.startsWith('fil')) return 'fil';
  if (t.startsWith('en')) return 'en-CA';
  if (t.startsWith('fr')) return 'fr-CA';
  const base = t.split('-')[0];
  const hit = LANGUAGES.find((l) => l.code.toLowerCase() === base);
  return hit ? hit.code : null;
}
