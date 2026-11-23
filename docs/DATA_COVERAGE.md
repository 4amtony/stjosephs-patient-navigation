# Data coverage

Numbers below are produced by the code in this repository (`src/data/*`, `scripts/validate-routes.ts`)
as of 2026-11-19.

## What exists

| Item | Count | Notes |
|---|---|---|
| Official destination entries extracted | **50** | from 21 detailed-direction pages |
| Official verbatim route variants | **165** | E1 50 · E2 49 · E4 49 · Grosvenor garage 9 · Cheapside garage 7 · Wellington E3 1 |
| Destinations in the app | **49** | 43 OFFICIAL, 4 CONFLICTING, 1 DERIVED (Zone E rooms), 1 FICTIONAL (training lab); includes 3 information desks |
| Search aliases | 255 English + 716 non-English search terms | non-English terms are unreviewed, used only for matching |
| Graph nodes | **122** | 49 destinations, 40 junctions, 21 elevator stops, 4 entrances, 5 outdoor, 2 garage, 1 fictional door |
| Graph edges | **160** | 109 walk, 46 elevator rides, 1 tunnel, 2 outdoor, 2 fictional restricted |
| Edge provenance | 95 OFFICIAL · 62 DERIVED · 1 CONFLICTING · 2 FICTIONAL | every edge carries ≥ 1 cited source phrase |
| Step-free status | 49 `yes` (elevators, tunnel, garage elevators/ramp) · 111 `unknown` · 0 `no` | no corridor is claimed wheelchair-accessible |
| Proposed QR checkpoints | **29** | 4 entrances, 3 garage/tunnel, 19 elevator lobbies (A0–A4, AT, B0–B6, C0–C1, D0–D3), 2 compass intersections, 1 fictional |
| Zones modelled | A (L0–4 + tunnel stop), B (L0–6), C (L0–1 + garage stop), D (L0–3), E (L1), F (unverified, no destinations) | footprints traced from the 2019 site map |

## How well the graph reproduces the hospital's own directions

`scripts/validate-routes.ts` routes every official (origin → destination) pair through the graph
and compares the ordered left/right turn words and the final "is on the left/right/straight
ahead" with the official text.

| Metric | Result |
|---|---|
| Official variants compared | 147 (18 "follow the directions from Entrance 4" cross-references and unmapped origins skipped) |
| Routable | 147 / 147 |
| Turn sequence identical | **118 / 147 (80 %)** |
| Final side identical (where stated) | 119 / 131 |
| Both identical | **115 / 147 (78 %)** |

All demo-critical routes match exactly (asserted in `tests/routing.test.ts`):
Cheapside Entrance 4 → Breast Care D1-112; Cheapside garage → Breast Care (via C0, as published);
Grosvenor Entrance 1 → Breast Care; Grosvenor Entrance 2 → MRI B5-204; Zone B Level 5 lift → B3-030.

### Known mismatch categories (32 variants)

1. **Zone C lobby → Zone D geometry** (E2/Cheapside → Breast Care, HULC, OT/PT, Rheumatology, WSIB):
   official texts say "proceed to the right" *after* the stair opening from two different approach
   directions; one schematic node cannot satisfy both. Instruction content is the same, the turn
   is placed one node earlier.
2. **Alternative valid elevator choice from Entrance 1** (Café, Business Office, Volunteer Services,
   Tim Hortons, Gift Shop, Medical Imaging C0): the graph sometimes prefers the Zone A elevators to
   Level 0; the hospital text uses Zone B/C elevators. Both are physically consistent with the text.
3. **Official text conflicts** (Volunteer Services "Level 5" for a Level 4 room, Shuttleworth,
   WSIB) — mismatch expected.
4. **Phrasing not expressible as a turn** ("in the corner to the right", "around the corner, behind
   the information desk", "towards the left side of the lobby").
5. **Zone E meeting rooms**: approximate geometry (marked DERIVED).

## What is approximate or missing (honest limits)

- **Geometry is schematic.** Positions were placed so official turn words come out right; corridor
  lengths and shapes are not real. No distances or walking times are shown anywhere.
- **Inside a zone, only the corridors mentioned in official directions exist.** Rooms not in the
  public directory are not routable.
- **Zone F** appears on the site map but has no public destinations → drawn, never routed.
- **Elevator exit orientation** is DERIVED (A/C/B/D banks) from consistent text across floors.
- **"Elevator 3"** is mentioned officially but not locatable → shown only as a caveat.
- **Stairs** are never used by official routes; no stair edges exist, so "avoid stairs" is a
  guarantee rather than a re-route. Accessibility of doors, ramps and slopes is **unknown**.
- **Entrance 3 (Wellington)** has one official route; other routes from it are derived.
- **Garages**: number of Grosvenor decks not published (drawn schematically); Cheapside garage
  interior not modelled beyond its elevator.
- **Opening hours**: Grosvenor garage and tunnel hours are not published; clinic hours not modelled.
- **No live data**: no occupancy, queue, closures or construction detours.
- **Public vs restricted**: only public destinations from the directory are included; the single
  restricted destination is fictional by design.
