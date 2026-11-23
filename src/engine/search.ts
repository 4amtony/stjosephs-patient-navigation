import { DESTINATIONS, type Destination } from '../data/destinations';

/**
 * Deterministic destination search ("intent interpretation" without AI):
 *  - exact room codes (D1-112, d1 112, d1112)
 *  - official names and directory "see …" aliases, lay terms, multilingual search terms
 *  - natural-language filler stripped ("where is", "my appointment at", "我要去"…)
 *  - ambiguity is surfaced instead of guessed
 * Returns a structured result the UI renders; nothing is sent anywhere.
 */
export type SearchResult =
  | { kind: 'match'; dest: Destination; term: string; alternatives: Destination[] }
  | { kind: 'ambiguous'; options: { dest: Destination; term: string }[] }
  | { kind: 'none' }
  | { kind: 'empty' };

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin combining diacritics only (keeps Indic/Arabic marks intact)
    .normalize('NFC')
    .replace(/[ً-ْٰ]/g, '') // Arabic harakat
    .toLowerCase()
    .replace(/[’'`´]/g, "'")
    .replace(/[.,;:!?¿¡()[\]{}"“”«»。，、！？：；（）]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const FILLERS = [
  'where is', "where's", 'where are', 'how do i get to', 'how to get to', 'i need to go to', 'i need to find', 'i want to go to', 'take me to',
  'directions to', 'my appointment is at', 'my appointment at', 'appointment at', 'appointment for', 'i have an appointment at', 'i have an appointment for',
  'i am going to', "i'm going to", 'looking for', 'find', 'the', 'please', 'department', 'clinic', 'centre', 'center', 'room', 'at st josephs', 'st josephs',
  '我要去', '我想去', '在哪里', '在哪裡', '怎么走', '怎麼走', '请问', '請問', '预约', '預約', '去', 'أين', 'أريد', 'موعد', 'où est', 'je cherche', 'dónde está', 'donde esta', 'busco',
];

function stripFillers(q: string): string {
  let s = ` ${q} `;
  for (const f of FILLERS) s = s.split(` ${f} `).join(' ');
  // CJK fillers are not space-delimited
  for (const f of ['我要去', '我想去', '在哪里', '在哪裡', '怎么走', '怎麼走', '请问', '請問', '预约', '預約']) s = s.split(f).join(' ');
  return s.replace(/\s+/g, ' ').trim();
}

const ROOM_RE = /\b([a-fx])\s*-?\s*([0-6]?)\s*-?\s*(\d{3})\b/i;
const isCJK = (s: string) => /[぀-ヿ㐀-鿿가-힯]/.test(s);

function scoreTerm(q: string, term: string): number {
  const t = normalize(term);
  if (!t) return 0;
  if (q === t) return 10;
  const minLen = isCJK(t) ? 1 : 3;
  if (t.length >= minLen && (` ${q} `.includes(` ${t} `) || (isCJK(t) && q.includes(t)))) return 7 + Math.min(t.length, 12) / 12;
  if (q.length >= 3 && t.startsWith(q)) return 6;
  if (q.length >= 4 && t.includes(q)) return 5;
  if (!isCJK(q) && !isCJK(t)) {
    const qt = q.split(' ').filter((w) => w.length > 2);
    const tt = t.split(' ').filter((w) => w.length > 2);
    if (qt.length && tt.length) {
      const hit = qt.filter((w) => tt.some((x) => x === w || (w.length >= 4 && x.startsWith(w)))).length;
      if (hit) return 2 + (3 * hit) / Math.max(qt.length, tt.length);
    }
  } else if (q.length >= 2 && t.length >= 2 && t.includes(q)) return 5;
  return 0;
}

export function searchDestinations(raw: string, opts: { includeRestricted?: boolean } = {}): SearchResult {
  const q0 = normalize(raw);
  if (!q0) return { kind: 'empty' };
  const pool = DESTINATIONS.filter((d) => opts.includeRestricted || !d.restricted || /train|x-?101|restrict|staff/.test(q0));

  // 1. room code
  const m = q0.match(ROOM_RE);
  if (m) {
    const code = `${m[1]}${m[2]}-${m[3]}`.toUpperCase();
    const hits = pool.filter((d) => d.room.toUpperCase().includes(code) || d.room.toUpperCase().replace('-', '') === code.replace('-', ''));
    if (hits.length === 1) return { kind: 'match', dest: hits[0], term: hits[0].room, alternatives: [] };
    if (hits.length > 1) return { kind: 'ambiguous', options: hits.map((d) => ({ dest: d, term: d.room })) };
  }

  const q = stripFillers(q0) || q0;
  const scored: { dest: Destination; score: number; term: string }[] = [];
  for (const d of pool) {
    let best = 0;
    let term = '';
    const consider = (t: string, w: number) => {
      const s = scoreTerm(q, t) * w;
      if (s > best) {
        best = s;
        term = t;
      }
    };
    consider(d.name, 1.1);
    d.aliases.forEach((a) => consider(a, 1));
    d.xAliases?.forEach((a) => consider(a, 1));
    if (best > 0) scored.push({ dest: d, score: best + (d.popular ? 0.2 : 0), term });
  }
  scored.sort((a, b) => b.score - a.score);
  if (!scored.length) return { kind: 'none' };

  const top = scored[0];
  // Ambiguous when another destination matches the same strength (e.g. "physio", "imaging", "endocrinology")
  const close = scored.filter((s) => s.dest.id !== top.dest.id && s.score >= top.score - 0.6 && s.score >= 5);
  const exactName = normalize(top.dest.name) === q;
  if (close.length && !exactName) {
    return { kind: 'ambiguous', options: [top, ...close].slice(0, 5).map((s) => ({ dest: s.dest, term: s.term })) };
  }
  return { kind: 'match', dest: top.dest, term: top.term, alternatives: scored.slice(1, 4).map((s) => s.dest) };
}

export function popularDestinations(): Destination[] {
  return DESTINATIONS.filter((d) => d.popular);
}

export function alphabetical(): Destination[] {
  return DESTINATIONS.filter((d) => !d.restricted).slice().sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
