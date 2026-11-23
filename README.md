# St. Joseph's Hospital — Patient Navigation Prototype (CEMS Team 3)

A runnable, multilingual, QR-based **wayfinding website** for St. Joseph's Hospital
(268 Grosvenor St, London, Ontario). It follows the patient journey agreed by Team 3:
**pre-arrival planning → choosing the right garage/entrance → arrival QR check-in to a location →
3D + step-by-step indoor wayfinding → recovery when lost → human help**, with a public-vs-restricted
security demo.

> **Academic proof of concept.** Not an official St. Joseph's Health Care London service and not
> hospital-approved. Directions come from the hospital's public website (retrieved 2026-11-19);
> the 3D geometry is schematic. Translations are unreviewed. No patient data is collected.

---

## Quick start

Requirements: Node.js ≥ 18 (tested with Node 24.21, npm 11.19).

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:5173>. The dev server also listens on your LAN address (shown in the
terminal), so a phone on the same Wi-Fi can open it or scan the generated QR codes.

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 (LAN-accessible) |
| `npm run build` | Type-check (`tsc`) + production build into `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm test` | Vitest: routing, official-text alignment, search, planner, QR parsing, session state, i18n parity (59+ tests) |
| `npm run typecheck` | TypeScript only |
| `npm run i18n:check` | Translation QA table: key parity, `{placeholder}` parity, protected tokens (room codes, phone numbers) |
| `npm run data:extract` | Re-download and re-parse the official turn-by-turn pages into `src/data/official/directions.json` (1 request/second) |
| `npx vite-node scripts/validate-routes.ts --all` | How many official route variants the graph reproduces turn-for-turn |
| `npx vite-node scripts/debug-route.ts E1 BREAST [--stepfree]` | Print any route between two graph nodes |

### Demo entry points

- Presenter panel: click **▶ Demo** (bottom corner) or open `/?presenter=1`.
- QR deep links (no install, no login): `/?checkpoint=ENTRANCE_2`, `/?checkpoint=ZONE_B_LIFT_LEVEL_5`, …
- Printable QR sheet of all 29 proposed checkpoints: Presenter → *Printable QR checkpoints*.
- Language deep link: `/?lang=ar`, `/?lang=zh-Hans`; destination link: `/?dest=breast-care`.
- Volunteer / kiosk view: `/?kiosk=1`.

See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the click-by-click five-minute pitch.

---

## Architecture

```
src/
  data/
    official/directions.json  ← extracted verbatim from sjhc.london.on.ca (50 destinations, 165 route variants)
    sources.ts                ← source ledger (URLs, retrieval dates, what each was used for)
    zones.ts                  ← Zone A–F footprints traced from the official July-2019 site map (SCHEMATIC)
    graph.ts                  ← navigation topology: 122 nodes / 160 edges, each edge cites official text
    destinations.ts           ← 49 destinations, official names/rooms, 255 aliases + 716 multilingual search terms
    checkpoints.ts            ← 29 proposed public QR checkpoints (+ validation of scanned values)
    parking.ts                ← garages, entrance hours, transit — structured official facts
  engine/
    router.ts                 ← Dijkstra; step-free, closed-entrance and restricted-access rules
    steps.ts / geometry.ts    ← path → structured steps (turns from headings, door sides, zone changes)
    routeText.ts              ← structured step → localized sentences (official sign names kept verbatim)
    planner.ts                ← Grosvenor vs Cheapside + entrance recommendation with explainable reasons
    search.ts                 ← deterministic intent/search incl. room codes, NL filler, ambiguity
    speech.ts                 ← Web Speech TTS, only with a matching-language voice
    validate.ts               ← compares generated routes with the hospital's own turn words
  i18n/                       ← 20 locale catalogs (flat JSON, {param} interpolation), RTL metadata
  state/                      ← anonymous session (localStorage), QR re-localisation reducer
  components/                 ← screens, 3D twin (React Three Fiber), 2D fallback, help card, presenter
scripts/                      ← extraction, i18n QA, route validation, debug tools
tests/                        ← Vitest suites
docs/                         ← source map, coverage, product decisions, i18n coverage, demo script
```

**How a route is produced (no AI in the loop):** query → official directory match → source-backed
graph (Dijkstra) → access / step-free / opening-hour rules → structured actions (`TURN_LEFT`,
`TAKE_ELEVATOR`, `ARRIVE`…) → localized sentence templates with English sign chips → human help.
Each step shows its provenance (`Official`, `Derived`, `Approximate`, `Sources disagree`,
`Fictional`) and the official sentence it came from.

**Tech:** Vite 5, React 18, TypeScript 5.6, three.js 0.170 + @react-three/fiber 8 + drei 9,
`qrcode`, Vitest 2. Fully client-side: no server, no API key, no database, no tracking.
An optional LLM layer was deliberately **not** shipped (see docs/PRODUCT_DECISIONS.md) — the demo
works entirely on deterministic data.

## Deliverables

- [docs/SOURCE_MAP.md](docs/SOURCE_MAP.md) — every source, what was verified, conflicts
- [docs/DATA_COVERAGE.md](docs/DATA_COVERAGE.md) — destinations, routes, checkpoints, accuracy, gaps
- [docs/PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md) — UX, 3D, accessibility, security, language trade-offs
- [docs/I18N_COVERAGE.md](docs/I18N_COVERAGE.md) — 20 locales, RTL, TTS, review status
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — five-minute pitch with exact URLs

## Limits (read before presenting)

- Hospital geometry is **schematic** (traced from a 2019 PDF), not a floor plan; no distances are claimed.
- 115 of 147 comparable official route variants are reproduced turn-for-turn *and* arrival-side; the rest differ in phrasing or because official pages conflict (see DATA_COVERAGE).
- No route is promised as wheelchair-accessible; elevator-only and "no stairs" are checked, corridor/door accessibility is not.
- QR signs are **proposed**, not installed. Parking availability is never live.
- All 19 non-English catalogs are unreviewed machine/LLM translations.
