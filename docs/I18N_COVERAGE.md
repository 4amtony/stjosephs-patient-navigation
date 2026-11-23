# Internationalisation coverage

**Status: 20 locales × 334 keys, 100 % key and placeholder parity** (`npm run i18n:check`,
`tests/i18n-session.test.ts`). All 19 non-English catalogs are **unreviewed LLM translations**
produced for this academic demo — not professional or medical translation. None has been reviewed
by a native speaker or by St. Joseph's.

## Locales

Display order is a product choice: the official languages first, then languages named in
St. Joseph's own volunteer-language story (Arabic, Mandarin, French, Hindi; Spanish example) and
other languages common in the London–Middlesex region. It is **not** a claim about St. Joseph's
patient demographics. A Statistics Canada release reportedly lists Arabic as London's most common
non-official home language (search snippet; source page returned HTTP 403, so unverified). The
hospital's own language-access data should set the final order.

| # | Code | Native label | Dir | Script / font stack | TTS voice tags tried (in order) | Translated keys | Review |
|---|---|---|---|---|---|---|---|
| 1 | en-CA | English | ltr | system | en-CA, en-US, en-GB | 334 (source) | source text by team |
| 2 | fr-CA | Français | ltr | system | fr-CA, fr-FR | 334 | unreviewed |
| 3 | ar | العربية | **rtl** | Noto Naskh Arabic / Geeza Pro | ar-SA, ar-EG | 334 | unreviewed |
| 4 | zh-Hans | 简体中文 | ltr | PingFang SC / Noto Sans SC | zh-CN | 334 | unreviewed |
| 5 | es | Español | ltr | system | es-MX, es-US, es-ES | 334 | unreviewed |
| 6 | hi | हिन्दी | ltr | Noto Sans Devanagari | hi-IN | 334 | unreviewed |
| 7 | pa-Guru | ਪੰਜਾਬੀ | ltr | Noto Sans Gurmukhi | pa-IN | 334 | unreviewed |
| 8 | pt | Português | ltr | system | pt-PT, pt-BR | 334 | unreviewed |
| 9 | zh-Hant | 繁體中文 | ltr | PingFang TC / Noto Sans TC | zh-TW, zh-HK | 334 | unreviewed |
| 10 | ur | اردو | **rtl** | Noto Nastaliq Urdu (line-height 2.1) | ur-PK, ur-IN | 334 | unreviewed |
| 11 | fa | فارسی | **rtl** | Noto Naskh Arabic | fa-IR | 334 | unreviewed |
| 12 | ta | தமிழ் | ltr | Noto Sans Tamil | ta-IN, ta-LK | 334 | unreviewed |
| 13 | vi | Tiếng Việt | ltr | system | vi-VN | 334 | unreviewed |
| 14 | fil | Filipino / Tagalog | ltr | system | fil-PH, tl-PH | 334 | unreviewed |
| 15 | ko | 한국어 | ltr | Apple SD Gothic Neo / Noto Sans KR | ko-KR | 334 | unreviewed |
| 16 | ru | Русский | ltr | system | ru-RU | 334 | unreviewed |
| 17 | uk | Українська | ltr | system | uk-UA | 334 | unreviewed |
| 18 | pl | Polski | ltr | system | pl-PL | 334 | unreviewed |
| 19 | de | Deutsch | ltr | system | de-DE | 334 | unreviewed |
| 20 | bn | বাংলা | ltr | Noto Sans Bengali | bn-IN, bn-BD | 334 | unreviewed |

Web fonts (Google Fonts, `display=swap`) are progressive enhancement only; system fonts are used
offline.

## What is localized

Everything a patient sees in the core flows: language picker, home, search (incl. ambiguity / no
result), plan-my-visit, parking and entrance comparison and all their reasons, journey overview,
"you are here" and QR error states, preferences, every navigation sentence (turns, elevators,
zone changes, doors, arrival sides, tunnel, street crossing), provenance badges, step-free
warnings, I'm-lost sheet, help page, bilingual staff card, arrival screen, security demo, map
labels/controls, toasts, plain-language glosses for 19 key destinations.

**Deliberately kept in English (official signage):** department names, room codes (B5-204),
entrance names (Grosvenor Entrance 2), elevator codes (B5), zone letters, street names,
"Tim Hortons", "Elevator 3". They are rendered as isolated `<bdi lang="en" dir="ltr">` sign chips
so they display correctly inside RTL sentences and match the physical signs.

**English-only by design:** the presenter panel, the printable QR sheet and the source ledger
(team/presenter tools, not patient UI); official verbatim directions and official check-in notes
(shown as quotations from the hospital website, always next to the localized steps).

## How route text is localized (source-grounded)

Routes are never free-text generated. The router outputs structured actions; each step becomes a
list of **complete sentences** from templates (`r.turnLeft`, `r.takeElevator`, `r.arriveRight`…)
with parameters filled by localized place phrases (`pl.*`) or English sign chips. Translators were
told the slot each phrase fills, so grammar works per language (e.g. Polish genitive phrases,
Russian/Ukrainian colon constructions, Hindi/Punjabi oblique forms, Korean/Vietnamese reordered
arrival sentences). Physical directions are never mirrored for RTL.

Tests assert for every locale: all keys present, identical `{placeholder}` sets, safety-critical
sentences translated (not English), and that a localized route still contains "Grosvenor Entrance 2"
and "B5-204" verbatim with no unfilled placeholders.

## RTL

`<html dir="rtl">` for ar/ur/fa; all layout uses logical CSS properties (`margin-inline-start`,
`inset-inline-end`…). Navigation chevrons (Back/Next) mirror; **turn arrows and the 3D/2D map do
not** (verified in the browser: Arabic shows the panel on the right, Zone A still west of Zone B).
Urdu uses Nastaliq with a taller line height to avoid clipping.

## Text-to-speech

Web Speech API only. The app looks for a voice matching the chosen locale's tags; if none exists
it shows "No {language} voice is available on this device" and offers an explicit "Read the
English version instead" — it never silently reads the wrong language. Availability depends on the
device (e.g. Punjabi, Tamil, Bengali and Urdu voices are often missing on desktop browsers).

## Fallback behaviour

If a key were missing, the English string is shown and the key is recorded in the translator's
`fallbacks` set (developer-visible), never an empty string. With the current catalogs no fallback
occurs.

## Known gaps / reviewer checklist

- Native-speaker review of all 19 catalogs, prioritising safety sentences (`r.*`, `navi.stepFreeWarn`, `help.emergencyBody`, `sec.*`).
- "Compass intersection" is translated literally; confirm what the physical landmark looks like.
- Gendered first-person phrases ("I've arrived") in Hindi, Punjabi and Urdu use a default form.
- Prices/time formats are partly localized (24-h in fr/de/pl/pt/ru/uk).
- Multilingual **search terms** (716) are unreviewed and only aid matching.
- Interpretation for clinical conversations must always go through the hospital's interpreter services (the app says so).
