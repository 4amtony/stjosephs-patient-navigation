# Source map

All sources are **public** pages of St. Joseph's Health Care London (sjhc.london.on.ca) unless
noted. Retrieved **2026-11-19** with a plain HTTP client at ≤ 1 request/second. `robots.txt`
allows these content paths. No login, CAPTCHA or access control was bypassed. No patient data
was collected. Visual documents (site map, garage maps) were rendered to images and inspected by
eye, not only text-extracted.

Status vocabulary used in the app and data: **OFFICIAL** (explicitly stated/shown), **DERIVED**
(inferred by combining official statements; evidence recorded), **SCHEMATIC** (approximate
geometry for visualisation only), **UNVERIFIED**, **CONFLICTING** (official sources disagree),
**FICTIONAL** (security-demo only).

## Ledger

| # | Source | URL | Edition / date | What was verified | Used as |
|---|---|---|---|---|---|
| 1 | Wayfinding site map (PDF) | https://www.sjhc.london.on.ca/media/5882/download | Map dated **July 2019**; PDF modified 2021-02-25 | Zone A–F footprints and colours; Entrances 1, 2, 4 (Entrance 1 = "Level 1 Entrance", Entrance 4 = "Level 0 Entrance"); zone-elevator icons; compass rose at the main B intersection; Grosvenor garage + tunnel to Zone A elevators; Cheapside parking north of Zone C; "Level 1" links C↔B and D↔E; bus stops, taxi drop-offs, cafeterias | OFFICIAL layout → SCHEMATIC 3D geometry (`src/data/zones.ts`) |
| 2 | Directions to all programs and services | https://www.sjhc.london.on.ca/how-to-get-there/st-josephs-hospital-directions-to-all-program-and-services | live page | ~90 directory lines: names, "see …" aliases, room numbers, phone extensions, Paratransit → Entrance 2 | OFFICIAL destination index + aliases |
| 3 | Detailed directions pages A, B, C, D, F, G, H, I, L, M, M-B5, O, P, R, S, T, U, V, W, conference rooms | e.g. https://www.sjhc.london.on.ca/st-josephs-hospital-program-and-service-detailed-directions-b (and `-m-B5`, `-conference-rooms`, `/node/252`, `/node/4399`) | live pages | **50 destinations, 165 verbatim route variants** from Entrance 1 (50), 2 (49), 4 (49), Grosvenor garage (9), Cheapside garage (7), Wellington Entrance 3 (1). "Shortest route" / "long way" flags | OFFICIAL step lists (`src/data/official/directions.json`); edge evidence; validation corpus |
| 4 | Parking at St. Joseph's Hospital | https://www.sjhc.london.on.ca/patients-and-visitors/our-locations/st-josephs-hospital/parking-st-josephs-hospital | live page | Grosvenor 989 spaces, rates; **tunnel = "the safest and most accessible route"**; accessible spaces west end each floor; Cheapside 132 spaces, **open 5:30 am–5:30 pm Mon–Fri, closed weekends**, "closest lot for outpatients with appointments in Zones C and D", elevator connects to Level 0 and Level 1; both garages "often at capacity Mon–Thu 9:30–2"; drop-off at Entrances 1, 2, 4; bus routes 6, 13, 1, 21 | OFFICIAL planner rules (`src/data/parking.ts`) |
| 5 | St. Joseph's Hospital location page | https://www.sjhc.london.on.ca/patients-and-visitors/our-locations/st-josephs-hospital | live page | Same parking text; bus route listed as **15** Huron Heights | CONFLICT record |
| 6 | Visiting information (after-hours access) | https://www.sjhc.london.on.ca/patients-and-visitors/visiting-information | live page | **Entrance 1: Mon–Fri 5:30–18:00; Entrance 2: Mon–Fri 5:30–18:00, Sat/Sun/holidays 7:00–16:00; Entrance 4: Mon–Fri 5:30–20:00**; after hours use Entrance 2 buzzer; B6 after-hours escort | OFFICIAL entrance-hour rules |
| 7 | Accessibility (incl. language services) | https://www.sjhc.london.on.ca/patients-and-visitors/visiting-information/accessibility | live page | Wheelchairs at most major entrances; volunteers or Security **44555**; emergency **55555** from hospital phones; interpreters arranged in advance via staff or switchboard 519 646-6100 (**English-only line**); sign-language interpreters in advance; TTY numbers; adult change table B6-014 | OFFICIAL help content |
| 8 | "Speaking their language" story | https://www.sjhc.london.on.ca/news-and-media/our-stories/speaking-their-language-0 | page modified 2026-08-26 | July: Information Desk volunteers wear language buttons (14 languages incl. Arabic, Mandarin, French, Hindi; Spanish example). August: interpretation iPads at information desks (SJH and Parkwood), volunteers connect to a live interpreter. Volunteers give general info/wayfinding only, **do not accompany patients and do not translate medical information** | OFFICIAL help content; language ordering input |
| 9 | Grosvenor garage replacement | https://www.sjhc.london.on.ca/patients-and-visitors/our-locations/st-josephs-hospital/parking-st-josephs-hospital/replacement | live page | Planning stage; construction anticipated late 2027; new garage early 2029; existing garage stays open | Planner caveat |
| 10 | Grosvenor garage printable map | https://www.sjhc.london.on.ca/media/7805/download?attachment | 2018, modified 2020-05 | Accessible-parking area, tunnel label (visual) | Context |
| 11 | Cheapside garage printable map | https://www.sjhc.london.on.ca/media/7570/download?attachment | Nov 2018 | Visitor vs staff areas (visual) | Context |
| 12 | Statistics Canada 2021 Census language releases (search snippets only) | https://www150.statcan.gc.ca/n1/pub/11-627-m/11-627-m2022051-eng.htm | 2022 | A StatCan table reportedly lists Arabic as the predominant non-official home language in London; **not opened (HTTP 403), unverified** | Language-order rationale only (flagged) |
| 13 | Team files (not public) | `Team3_Patient_Journey_and_Solution_Notes.docx`, client kick-off notes, client intro deck | Oct–Nov 2026 | Journey, Christian Otte's "augment, don't replace" principle, language barrier pain point | Product requirements |

Other hospitals' products (e.g. MazeMap) were considered only as UX inspiration. **No other
hospital's geometry or routing data was used.**

Srihari's earlier prototype was **not present** in this repository or the shared folders available
to this build, so nothing from it could be audited or reused. The extraction approach here
(official textual directions → structured routes) follows the same idea he demonstrated.

## Conflicts and oddities found in official sources (preserved, flagged in-app)

| Topic | Source A | Source B | Handling |
|---|---|---|---|
| WSIB Specialty Clinic room | Directory: **E1-116** | W page: **D1-173** ("past the Breast Care Clinic") | Uses D1-173; destination marked CONFLICTING |
| WSIB from Cheapside garage | W page: "up to Level 1 (C1)" | All other garage routes: "Level 0 (C0)" | Garage routes anchored at C0; flagged |
| Volunteer Services (B4-048) from Entrance 4 | Says "Level 5 (B5)" | Room is on Level 4 | Route goes to B4; CONFLICTING |
| Drug Store / Prescription Shop | Directory "Drug Store … A1-103" | "Prescription Shop A1-013" | A1-013 used; conflict note |
| Tim Hortons hours | Directory 6:30 am–6:30 pm | T page 8:00 am–5:30 pm | Both shown as conflict |
| Bus route Huron Heights | Parking page "21" | Location page "15" | Both shown; points to LTC planner |
| Shuttleworth Auditorium D0-104 | From Entrance 4: Level 0 | From Entrance 1: reached on Level 1 without level change | CONFLICTING, approximate location |
| Conference Room D0-138 from Entrance 1 | Says "Zone D elevators to Level 2 (D2)" | Room is D0 | Not used for routing |
| "Elevator 3" | Mentioned as an alternative for B0/B1/B5 destinations | Not labelled on the public map | Shown as an UNVERIFIED note ("ask a volunteer") |
| Site-map edition | Map dated July 2019 | Pages edited later (e.g. Physiotherapy "has MOVED to Zone B Level 4") | Text treated as more current than the map |

## Refresh procedure

1. `npm run data:extract` (re-downloads the detailed-direction pages and rewrites `directions.json`; diff it in git).
2. `npx vite-node scripts/validate-routes.ts --all` — new mismatches indicate changed directions or graph drift.
3. Re-check entrance hours (Visiting page) and garage hours (Parking page) by hand; update `src/data/parking.ts`.
4. Re-download the site-map PDF and compare the edition date; if a new map exists, re-trace `src/data/zones.ts`.
