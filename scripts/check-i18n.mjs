#!/usr/bin/env node
/**
 * Translation-catalog QA. For every locale in src/i18n/locales:
 *  - key parity with en-CA.json (missing / extra keys)
 *  - placeholder parity ({param} names identical)
 *  - protected tokens kept verbatim (room codes, phone numbers, 44555/55555, "Zone X")
 *  - empty strings / untranslated copies of English (reported as warnings, not errors)
 * Exit code 1 if any locale has missing keys or placeholder mismatches.
 *   node scripts/check-i18n.mjs            # summary
 *   node scripts/check-i18n.mjs --verbose  # list every issue
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales');
const EXPECTED = ['en-CA', 'fr-CA', 'zh-Hans', 'zh-Hant', 'ar', 'es', 'hi', 'pa-Guru', 'ur', 'pt', 'fa', 'ta', 'vi', 'fil', 'ko', 'ru', 'uk', 'pl', 'de', 'bn'];
const verbose = process.argv.includes('--verbose');
const en = JSON.parse(readFileSync(join(DIR, 'en-CA.json'), 'utf8'));
const keys = Object.keys(en);
const ph = (s) => (s.match(/\{[a-zA-Z]+\}/g) || []).sort().join(',');
const PROTECTED = /\b(?:[A-F][0-6]-\d{3}|44555|55555|519 646-6100|1-800-855-0511|1-800-267-6511)\b/g;
// Short labels that may legitimately stay identical to English
const SAME_OK = new Set(['map.north', 'navi.levelShort', 'pl.zone', 'zone.n', 'app.short']);

let failed = false;
const files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
const present = files.map((f) => f.replace('.json', ''));
for (const code of EXPECTED) if (!present.includes(code)) { console.log(`✗ ${code}: catalog file missing`); failed = true; }

const rows = [];
for (const f of files) {
  const code = f.replace('.json', '');
  if (code === 'en-CA') continue;
  let cat;
  try { cat = JSON.parse(readFileSync(join(DIR, f), 'utf8')); } catch (e) { console.log(`✗ ${code}: invalid JSON (${e.message})`); failed = true; continue; }
  const missing = keys.filter((k) => !(k in cat) || typeof cat[k] !== 'string' || cat[k].trim() === '');
  const extra = Object.keys(cat).filter((k) => !(k in en));
  const badPh = keys.filter((k) => k in cat && typeof cat[k] === 'string' && ph(cat[k]) !== ph(en[k]));
  const lostTokens = keys.filter((k) => {
    if (!(k in cat)) return false;
    const want = en[k].match(PROTECTED) || [];
    return want.some((t) => !cat[k].includes(t));
  });
  const same = keys.filter((k) => cat[k] === en[k] && !SAME_OK.has(k) && en[k].length > 3);
  if (missing.length || badPh.length) failed = true;
  rows.push({ code, total: keys.length, translated: keys.length - missing.length, missing: missing.length, extra: extra.length, placeholders: badPh.length, tokens: lostTokens.length, sameAsEnglish: same.length });
  if (verbose) {
    for (const k of missing) console.log(`  [${code}] missing: ${k}`);
    for (const k of extra) console.log(`  [${code}] extra: ${k}`);
    for (const k of badPh) console.log(`  [${code}] placeholder mismatch: ${k}: "${cat[k]}"`);
    for (const k of lostTokens) console.log(`  [${code}] protected token changed: ${k}: "${cat[k]}"`);
    for (const k of same) console.log(`  [${code}] identical to English (check): ${k}`);
  }
}
console.table(rows);
console.log(failed ? '\n✗ i18n check FAILED' : `\n✓ i18n check passed: ${rows.length + 1} locales × ${keys.length} keys`);
process.exit(failed ? 1 : 0);
