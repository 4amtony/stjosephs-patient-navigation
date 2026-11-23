#!/usr/bin/env node
/**
 * Repeatable extraction of St. Joseph's Hospital public turn-by-turn directions.
 *
 * Usage:
 *   node scripts/extract-official-directions.mjs                # fetch live pages (1 req/sec)
 *   node scripts/extract-official-directions.mjs --cache <dir>  # parse previously saved HTML files
 *   node scripts/extract-official-directions.mjs --save <dir>   # fetch live and also save raw HTML
 *
 * Output: src/data/official/directions.json (verbatim English step lists, grouped by
 * destination and origin, with source URL + retrieval date). The app treats this file as the
 * OFFICIAL evidence layer. Nothing here is rewritten: steps are stored exactly as published
 * (whitespace-normalised only). Patient data is never collected.
 *
 * Respect: robots.txt allows these public content pages; requests are sequential and rate-limited.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://www.sjhc.london.on.ca';
const UA = 'Mozilla/5.0 (academic research prototype; CEMS Team 3; contact via course)';

// Pages linked from the official directory (letters + special pages). /node/<n> links redirect
// to the canonical "-<letter>" URLs below.
const PAGES = [
  'st-josephs-hospital-program-and-service-detailed-directions',
  'st-josephs-hospital-program-and-service-detailed-directions-b',
  'st-josephs-hospital-program-and-service-detailed-directions-c',
  'st-josephs-hospital-program-and-service-detailed-directions-d',
  'st-josephs-hospital-program-and-service-detailed-directions-f',
  'st-josephs-hospital-program-and-service-detailed-directions-g',
  'st-josephs-hospital-program-and-service-detailed-directions-h',
  'st-josephs-hospital-program-and-service-detailed-directions-i',
  'st-josephs-hospital-program-and-service-detailed-directions-l',
  'st-josephs-hospital-program-and-service-detailed-directions-m',
  'st-josephs-hospital-program-and-service-detailed-directions-m-B5',
  'st-josephs-hospital-program-and-service-detailed-directions-o',
  'st-josephs-hospital-program-and-service-detailed-directions-p',
  'st-josephs-hospital-program-and-service-detailed-directions-r',
  'st-josephs-hospital-program-and-service-detailed-directions-s',
  'st-josephs-hospital-program-and-service-detailed-directions-t',
  'st-josephs-hospital-program-and-service-detailed-directions-u',
  'st-josephs-hospital-program-and-service-detailed-directions-w',
  'st-josephs-hospital-program-and-service-detailed-directions-conference-rooms',
];
// The "-a" page is reached via /node/252; "-v" via /node/4399 (canonical slugs differ).
const NODE_PAGES = { 'detailed-directions-a': '/node/252', 'detailed-directions-v': '/node/4399' };

const args = process.argv.slice(2);
const cacheDir = args.includes('--cache') ? args[args.indexOf('--cache') + 1] : null;
const saveDir = args.includes('--save') ? args[args.indexOf('--save') + 1] : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getHtml(key, path) {
  if (cacheDir) {
    const candidates = [join(cacheDir, `${key}.html`), join(cacheDir, `${path.replace(/^\//, '').replace(/\//g, '_')}.html`)];
    for (const c of candidates) if (existsSync(c)) return { html: readFileSync(c, 'utf8'), url: BASE + path };
    console.warn(`[cache miss] ${key}`);
    return null;
  }
  const res = await fetch(BASE + path, { headers: { 'User-Agent': UA } });
  await sleep(1000);
  if (!res.ok) {
    console.warn(`[${res.status}] ${path}`);
    return null;
  }
  const html = await res.text();
  if (saveDir) {
    mkdirSync(saveDir, { recursive: true });
    writeFileSync(join(saveDir, `${key}.html`), html);
  }
  return { html, url: res.url || BASE + path };
}

const ENT = { '&nbsp;': ' ', '&amp;': '&', '&#039;': "'", '&quot;': '"', '&lt;': '<', '&gt;': '>', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”', '&ndash;': '–', '&mdash;': '—' };
function decode(s) {
  return s
    .replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? (m.startsWith('&#') ? String.fromCodePoint(parseInt(m.slice(2), 10)) : m))
    .replace(/ /g, ' ');
}

/** Convert the body field of a Drupal page into tagged lines: H|text, LI|text, P|text */
function htmlToLines(html) {
  const m = html.match(/<div property="schema:text"[\s\S]*?<\/div>\s*<\/div>/) || html.match(/<main[\s\S]*?<\/main>/);
  let s = m ? m[0] : html;
  s = s.replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/g, '');
  s = s.replace(/<h[1-6][^>]*>/g, '\nH|').replace(/<\/h[1-6]>/g, '\n');
  s = s.replace(/<li[^>]*>/g, '\nLI|').replace(/<\/li>/g, '\n');
  s = s.replace(/<br\s*\/?>/g, '\nP|').replace(/<p[^>]*>/g, '\nP|').replace(/<\/p>/g, '\n');
  s = s.replace(/<hr[^>]*>/g, '\nHR|\n');
  s = s.replace(/<[^>]+>/g, '');
  return decode(s)
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l && !/^(P|LI|H)\|\s*$/.test(l));
}

const ROOM_RE = /^(?:Room\s+)?([A-F][0-6]\s?[‐-]\s?\d{3}[A-Z]?)\b/;
const FROM_RE = /^From (?:the )?(.+?)(?:\s*\((.+)\))?\s*:?\s*(?:\((.+)\))?\s*:?$/i;

function originId(label) {
  const l = label.toLowerCase();
  if (/entrance 1/.test(l)) return 'ENTRANCE_1';
  if (/entrance 2/.test(l)) return 'ENTRANCE_2';
  if (/entrance 3/.test(l)) return 'ENTRANCE_3';
  if (/entrance 4/.test(l)) return 'ENTRANCE_4';
  if (/grosvenor parking garage/.test(l)) return 'GROSVENOR_GARAGE';
  if (/cheapside parking garage/.test(l)) return 'CHEAPSIDE_GARAGE';
  return 'UNKNOWN';
}

function parsePage(lines, url) {
  const entries = [];
  let cur = null;
  let route = null;
  const pageTitle = (lines.find((l) => l.startsWith('H|')) || '').slice(2);
  const startEntry = (title) => {
    cur = { title: title.replace(/\s+/g, ' ').trim(), sourceUrl: url, pageTitle, room: null, details: [], notes: [], routes: [] };
    entries.push(cur);
    route = null;
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const kind = raw.slice(0, raw.indexOf('|'));
    let text = raw.slice(raw.indexOf('|') + 1).replace(/^[•\-]\s*/, '').trim();
    if (!text) continue;
    if (kind === 'H') {
      if (/Program and Service Detailed Directions|Conference\/Board Rooms|^Back to top/i.test(text)) continue;
      startEntry(text);
      continue;
    }
    if (kind === 'HR') { route = null; continue; }
    // Un-headed entries: a plain line followed by a room-code line
    const next = (lines[i + 1] || '').replace(/^\w+\|/, '');
    if (!FROM_RE.test(text) && ROOM_RE.test(next) && !ROOM_RE.test(text) && text.length < 70 && !/^(Enter|Proceed|Take|Turn|Exit|The |Follow|Go |Continue)/.test(text)) {
      startEntry(text);
      continue;
    }
    if (!cur) continue;
    const fm = text.match(FROM_RE);
    if (fm && text.length < 140 && originId(fm[1]) !== 'UNKNOWN') {
      const label = fm[1].trim();
      const qualifier = [fm[2], fm[3]].filter(Boolean).join('; ') || null;
      route = { originLabel: label, origin: originId(label), qualifier, shortest: /shortest/i.test(qualifier || ''), longWay: /long/i.test(qualifier || ''), steps: [] };
      cur.routes.push(route);
      continue;
    }
    if (!cur.room && ROOM_RE.test(text)) { cur.room = text.match(ROOM_RE)[1].replace(/\s/g, '').replace('‐', '-'); continue; }
    if (route) {
      if (/^\*/.test(text) || /^\(note/i.test(text)) route.steps.push({ note: true, text: text.replace(/^\*\s*/, '') });
      else route.steps.push({ text });
    } else if (/^(Note|Hours|Monday|Tuesday|Wednesday|Saturday|Physiotherapy for)/i.test(text) || text.length > 60) {
      cur.notes.push(text);
    } else {
      cur.details.push(text);
    }
  }
  for (const e of entries) {
    if (!e.room) {
      const m = e.title.match(/\(([A-F][0-6]-\d{3})/) || e.title.match(/([A-F][0-6]-\d{3})/);
      if (m) e.room = m[1];
    }
  }
  return entries.filter((e) => e.routes.length > 0);
}

async function main() {
  const all = [];
  const queue = PAGES.map((p) => ({ key: p.replace('st-josephs-hospital-program-and-service-', ''), path: '/' + p }));
  for (const [key, path] of Object.entries(NODE_PAGES)) queue.push({ key, path });
  for (const { key, path } of queue) {
    const got = await getHtml(key, path);
    if (!got) continue;
    const entries = parsePage(htmlToLines(got.html), got.url);
    console.log(`${key}: ${entries.length} destinations`);
    all.push(...entries);
  }
  // de-duplicate (same title + room), keep first occurrence
  const seen = new Set();
  const out = all.filter((e) => {
    const k = `${e.title}|${e.room}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const result = {
    retrievedAt: new Date().toISOString().slice(0, 10),
    source: `${BASE}/how-to-get-there/st-josephs-hospital-directions-to-all-program-and-services`,
    note: 'Verbatim public directions (English). Typos and inconsistencies are preserved intentionally and flagged in docs/SOURCE_MAP.md.',
    count: out.length,
    routeCount: out.reduce((n, e) => n + e.routes.length, 0),
    entries: out,
  };
  const dest = join(ROOT, 'src/data/official/directions.json');
  writeFileSync(dest, JSON.stringify(result, null, 2));
  console.log(`\nWrote ${dest}: ${result.count} destinations, ${result.routeCount} official route variants.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
