# Product decisions

The team's journey (Nov 14) is the contract: **pre-arrival guidance → right garage/entrance →
arrival QR → indoor 3D wayfinding → recovery when lost → human help → arrival**, plus a
public/restricted security demo. Below are the main choices made while building it, and why.

## 1. Data & routing

| Decision | Why |
|---|---|
| **Official turn-by-turn text is the evidence base; the graph is reverse-engineered from it.** | The hospital publishes 165 step lists — richer and more current than its 2019 map. A graph lets QR re-localisation start from *any* checkpoint, which the static lists cannot. |
| **Heading-aware topology** (each corridor has a compass direction; elevator banks have an exit direction). | Turns ("turn left at the compass intersection") are computed, then checked against the hospital's own words: 115/147 variants reproduce exactly. This is the strongest honest proof that the reconstruction is faithful. |
| **Every edge cites an official phrase; every step shows its provenance** (Official / Derived / Approximate / Sources disagree / Fictional). | A plausible-looking corridor is not proof it exists. Patients and the client can see what is official. |
| **Official-route anchoring**: Cheapside-garage routes go via C0 and Grosvenor-garage routes use the tunnel, exactly as published. | Where the hospital prescribes a first leg, we follow it even if another path is "shorter" in our schematic. |
| **Deterministic everything (no LLM in production path).** | Routing, parking and access decisions must be auditable. An LLM could later rephrase verified steps, but it is not needed for the demo and nothing is labelled "AI". Search is deterministic intent matching (room codes, NL filler stripping, multilingual aliases, explicit ambiguity). |
| **Conflicts are kept, not silently fixed.** | WSIB room, Volunteer Services level, Tim Hortons hours, bus route 15/21 are surfaced in-app and in SOURCE_MAP. |

## 2. Parking & entrance recommendation

- Rule-based and **explainable**: each reason is an official fact (Cheapside = "closest lot for
  Zones C and D", hours 5:30–17:30 weekdays, tunnel = "safest and most accessible route",
  capacity warning Mon–Thu 9:30–2).
- The planned visit day/time removes closed garages **and closed entrances** from routing (e.g.
  Saturday: Cheapside closed, Entrances 1 and 4 closed → Grosvenor garage via tunnel).
- **Never fabricates** distances, minutes, live occupancy or reservations; says so explicitly.
- Drop-off / transit modes recommend the hospital's own "shortest route" entrance when open.

## 3. QR checkpoints

- A QR encodes only `?checkpoint=ID`: a **location**, never identity or permission.
- Every scanned value is validated (format + known id); unknown/malformed codes trigger a
  "choose where you are" flow — never a guessed location.
- Each proposed sign has a **mounting orientation** (e.g. lift-lobby signs face the doors) so the
  first instruction ("turn left") is valid for a person standing at the sign.
- Mid-route scans update **only the origin**; destination, language, preferences and parking
  context persist (unit-tested), the camera animates to the new route and a toast confirms.
- No GPS, beacons or tracking. The session lives only in the browser's localStorage.

## 4. 3D & visual design

- React Three Fiber "spatial twin": per-level translucent floor plates for Zones A–F traced from
  the site map, elevator shafts (active bank glows), corridor network on route floors, a thick
  route line with an animated marker, current-step highlight, floor rail, overview/focus camera.
- **Geography is never mirrored** in RTL; only the UI chrome is.
- 2D SVG fallback (no WebGL, printing, "Text only" mode) uses the same data.
- Calm, high-legibility UI: large tap targets, one instruction at a time, physical turn icons.

## 5. Accessibility

- Preferences are optional, overlapping and changeable mid-route (step-free, larger text, high
  contrast, voice, text-only, reduced motion, "I'd like a person").
- **Step-free is enforced in routing** (stairs/`no` edges excluded; unknown street crossings
  penalised) and the result is reported honestly: "No stairs on this route" + "Not verified as
  wheelchair accessible; N segments unverified; includes a closed door" + how to get a wheelchair.
- Keyboard: skip link, focus rings, Escape closes sheets, steps list is keyboard-operable.
- Low/no digital literacy: printable steps, printable bilingual help card, kiosk view
  (`?kiosk=1`), constant reminder that signs and volunteers remain the primary path.

## 6. Human support (augment, not replace — Christian Otte)

- "Help from a person" is in the header and the bottom bar of every navigation screen.
- Content is only what the hospital publishes: information-desk volunteers (some with language
  buttons), interpretation iPads, interpreters arranged in advance, Security 44555, emergency 55555.
- **Bilingual show-to-staff card** (chosen language + English): destination, current checkpoint,
  requested help (directions / interpreter / wheelchair / escort / unwell). No name, diagnosis or
  health data. States clearly that **nothing has been sent or requested**.

## 7. Security demo (public vs restricted)

- Public destinations (parking, entrances, information desks, registration) need nothing.
- One **fictional** "Simulation Training Lab X-101" in a floating, purple, clearly-labelled
  "FICTIONAL TRAINING ANNEX". The router refuses it (`reason: restricted`) until a simulated
  staff verification with a published demo PIN; the unlock is in-memory only (lost on reload).
- Scanning the annex QR (`TRAINING_ANNEX_DOOR`) sets location but never unlocks (unit-tested).
- No real door, badge, appointment or database is referenced.

## 8. Languages

- 20 locales with native-name picker on the very first screen (plus a multilingual "choose your
  language" line so nobody needs English first).
- Flat JSON catalogs with `{param}` interpolation; English is the source; adding a language =
  adding one JSON file (no UI changes). Parity checked by script and tests.
- Route text is composed from **sentence-level templates** (each sentence complete), avoiding
  fragile word-level grammar across 20 languages; official sign names/room codes are inserted as
  isolated English "sign chips" (`<bdi lang="en">`).
- TTS uses only a voice matching the chosen language; otherwise says so and offers English.

## Improvements over the original brief, inspired by research

- Using the hospital's **"compass intersection"** as the anchor landmark of the model.
- Entrance-hour-aware planning (from the Visiting page) — not in the brief, but it changes real
  weekend/evening advice (e.g. MRI after 6 pm → Entrance 2 buzzer).
- Automated **official-text alignment test** as a quality gate for the spatial model.
- "Elevators on your right" phrasing for Zone A/C banks, matching how the hospital words it.

## Not built (proposed extensions)

Camera-based in-app QR scanning (phones' native camera already opens the URLs), live parking
sensors, an LLM explanation layer constrained to verified steps, professional translation review,
staff CMS for directions, real accessibility audit of corridors and doors.
