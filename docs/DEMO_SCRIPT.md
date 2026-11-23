# Five-minute demo script

**Setup (before the pitch)**

```bash
npm run dev
```

- Laptop: open `http://localhost:5173/?presenter=1` full-screen (desktop width ≥ 960 px shows steps and 3D map side by side).
- Optional phone: open the **Network** URL printed by Vite (e.g. `http://<your-LAN-IP>:5173`). On the QR sheet, set the base URL to that address and print or display it, so a real phone camera can scan e.g. `ZONE_B_LIFT_LEVEL_5`.
- Click **Reset session** in the presenter panel. Every presenter button performs the same state changes as real clicks/QR scans; you can also do every step by hand.

Opening line (10 s): *"Patients told Christian the hardest part is finding the place — especially with a language barrier. This is a QR-and-web wayfinding layer built only on St. Joseph's own public directions. It helps volunteers; it doesn't replace them."*

---

## 0:10 – 1:30 · Scenario A — plan at home, park, arrive

1. **Home** shows the language picker in native scripts first. Click **English** → **Plan my visit**.
2. Type `mammogram appointment` → it resolves to **Breast Care Centre · D1-112** (say: *deterministic search over the official directory, no AI and no personal data*).
3. Choose **Driving and parking**; set **Tuesday 10:30**.
   - Point at **Cheapside garage — Suggested**: *"officially the closest lot for Zones C and D"*, open 5:30–5:30 weekdays, the busy-hours warning, and **"no live space information"**.
   - Click **Why?** to show every reason is an official fact.
4. Presenter **A2 · Toggle → Saturday**: Cheapside flips to **closed on weekends**, Grosvenor is suggested, and the route switches to the **tunnel** (Entrance 1 is closed on weekends).
   Presenter **A2b** back to Tuesday.
5. Scroll to **Your journey**: 3D overview (garage → C elevator → Zone C lobby → Zone D → D elevator → D1-112) and the 6 steps; open **Official directions (English)** to show the source text.
6. Click **Demo: I've arrived — scan at Cheapside…** → **You are here** (`/?checkpoint=CHEAPSIDE_GARAGE`) → destination already filled → **Yes, I'm here** → **Start**.
7. Click **Next step** through to *"Turn left. Breast Care Centre (D1-112) is on your right."* — identical to the hospital's published route.

## 1:30 – 3:00 · Scenario B — Chinese + step-free + large text, switch to Arabic

1. Presenter **B1** (Simplified Chinese, avoid stairs, larger text, scan at Grosvenor Entrance 1 → `/?checkpoint=ENTRANCE_1`). Show the Chinese "您在这里" screen; **B2** confirm.
2. Point out: interface in Chinese, **sign names and room codes stay in English** (B5-204, "Grosvenor Entrance 1"), translation disclaimer, route evidence badge, **"此路线没有楼梯"** plus the honest **"not verified as wheelchair accessible"** warning with how to get a wheelchair (Security 44555).
3. **B3** advance to step 3, then **B4 Switch to العربية**: the layout mirrors to RTL, the **same step 3 of 7** and checkpoint are kept, "Turn right" is still right, and the 3D map is not mirrored.
4. **B5** → bilingual **show-to-staff card** (Arabic + English): destination, current checkpoint, "interpreter (Arabic)" and "wheelchair" pre-ticked; *"nothing has been sent or requested"*. Mention volunteers' language buttons and interpretation iPads (official, Aug 2026).
5. (Optional, 10 s) **B6a/b/c** Français / ਪੰਜਾਬੀ / हिन्दी to show script rendering.

## 3:00 – 4:15 · Scenario C — wrong floor, new QR, reroute

1. Presenter **C1**: English, Entrance 2 → **B3 Outpatient Clinics (B3-030)**, currently at "Take one of the Zone B elevators to Level 3".
2. *"The visitor gets off on Level 5 by mistake and scans the sign in the elevator lobby."* → **C2 Simulate scan: ZONE_B_LIFT_LEVEL_5** (URL becomes `/?checkpoint=ZONE_B_LIFT_LEVEL_5`; on a phone, scan the printed code).
3. Toast: *"Start point updated… destination and settings unchanged."* The 3D camera flies to the new route: **ride back to Level 3 → turn left → desk on the right**. Floors 5 and 3 are highlighted in the floor rail.
4. **I'm lost** button: shows that location only comes from a scan or manual choice — **no GPS or tracking** — and offers human help.
5. **C3** edge case: an unknown QR (`/?checkpoint=NOT_A_REAL_PLACE`) is rejected and the visitor is asked to choose — never guessed.

## 4:15 – 4:50 · Security — public vs restricted

1. **S1**: route to **Information Desk – Entrance 2** works with no login or PIN (*"you never need a PIN to find reception"*).
2. **S2**: **Simulation Training Lab X-101 (FICTIONAL)** → locked: *"requires staff verification; a location QR code does not give access."*
3. **S3**: scan the annex QR → still locked.
4. Type a wrong PIN (`1111`) → stays locked; type the published demo PIN **4321** → a clearly fictional route appears in the purple "FICTIONAL TRAINING ANNEX". *Nothing here touches real doors, badges or records.*

## 4:50 – 5:00 · Close

Open **Where this information comes from**: 165 official route variants, 115/147 reproduced turn-for-turn, provenance on every step, conflicts listed. *"Next: hospital review of the data, native-speaker review of the 19 translations, a pilot of 3–5 QR signs at Entrance 2 and the Zone B lifts."*

---

## Direct URLs

| Purpose | URL |
|---|---|
| Presenter mode | `http://localhost:5173/?presenter=1` |
| Arrival QR, Cheapside garage | `http://localhost:5173/?checkpoint=CHEAPSIDE_GARAGE` |
| Arrival QR, Entrance 1 | `http://localhost:5173/?checkpoint=ENTRANCE_1` |
| Wrong-floor QR | `http://localhost:5173/?checkpoint=ZONE_B_LIFT_LEVEL_5` |
| Unknown QR | `http://localhost:5173/?checkpoint=NOT_A_REAL_PLACE` |
| Fictional annex QR | `http://localhost:5173/?checkpoint=TRAINING_ANNEX_DOOR` |
| Plan link for a destination | `http://localhost:5173/?dest=breast-care` |
| Language deep links | `?lang=zh-Hans`, `?lang=ar`, `?lang=pa-Guru` |
| Volunteer / kiosk view | `http://localhost:5173/?kiosk=1` |

## If something goes wrong

- 3D map blank or slow: click **2D map** (same data, SVG).
- Session in a strange state: presenter **Reset session**, or clear site data.
- No projector WebGL: the 2D map and **Text only** mode cover every scenario.
