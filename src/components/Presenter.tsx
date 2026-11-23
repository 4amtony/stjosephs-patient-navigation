import { useState } from 'react';
import { simulateScan, useSession } from '../state/session';

/**
 * Presenter / debug panel for the 5-minute pitch. Every button performs the same state changes a
 * user's clicks (or a QR scan) would; nothing here is a recording. English-only by design (it is
 * a presenter tool, not part of the patient UI).
 */
export function Presenter() {
  const { s, dispatch } = useSession();
  const [open, setOpen] = useState(s.presenter);
  if (!open) {
    return (
      <button className="presenter-toggle no-print" onClick={() => setOpen(true)} aria-label="Open presenter demo panel">
        ▶ Demo
      </button>
    );
  }
  const go = (fn: () => void) => () => {
    fn();
    window.scrollTo({ top: 0 });
  };
  return (
    <aside className="presenter no-print" aria-label="Presenter demo panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Presenter demo</strong>
        <button style={{ width: 'auto', margin: 0 }} onClick={() => setOpen(false)} aria-label="Close presenter panel">✕</button>
      </div>
      <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Buttons drive the real app state (same as clicks / QR scans).</div>

      <div className="grp">
        <h3>A · Plan visit → parking → Breast Care</h3>
        <button onClick={go(() => {
          dispatch({ type: 'reset' });
          dispatch({ type: 'setLocale', locale: 'en-CA' });
          dispatch({ type: 'setDest', destId: 'breast-care' });
          dispatch({ type: 'setTransport', transport: 'drive' });
          dispatch({ type: 'setVisit', day: 2, time: '10:30' });
          dispatch({ type: 'go', screen: 'plan' });
        })}>1. Tuesday 10:30, driving → compare garages</button>
        <button onClick={go(() => { dispatch({ type: 'setVisit', day: 6, time: '10:30' }); dispatch({ type: 'setPlannedStart', cp: null }); dispatch({ type: 'go', screen: 'plan' }); })}>2. Toggle → Saturday (Cheapside closed)</button>
        <button onClick={go(() => { dispatch({ type: 'setVisit', day: 2, time: '10:30' }); dispatch({ type: 'setPlannedStart', cp: null }); dispatch({ type: 'go', screen: 'plan' }); })}>2b. Back to Tuesday</button>
        <button onClick={go(() => simulateScan(dispatch, 'CHEAPSIDE_GARAGE'))}>3. Arrive: scan QR in Cheapside garage</button>
        <button onClick={go(() => simulateScan(dispatch, 'ENTRANCE_4'))}>3b. Arrive: scan QR at Cheapside Entrance 4</button>
      </div>

      <div className="grp">
        <h3>B · 简体中文 + step-free + large text → MRI</h3>
        <button onClick={go(() => {
          dispatch({ type: 'reset' });
          dispatch({ type: 'setLocale', locale: 'zh-Hans' });
          dispatch({ type: 'setPrefs', prefs: { stepFree: true, largeText: true } });
          dispatch({ type: 'setDest', destId: 'mri-b5' });
          simulateScan(dispatch, 'ENTRANCE_1');
        })}>1. Scan Entrance 1 QR (Chinese, step-free, A+)</button>
        <button onClick={go(() => dispatch({ type: 'confirmOrigin' }))}>2. Confirm → start navigation</button>
        <button onClick={go(() => dispatch({ type: 'setStep', step: Math.max(2, s.step) }))}>3. Advance to step 3</button>
        <button onClick={go(() => dispatch({ type: 'setLocale', locale: 'ar' }))}>4. Switch to العربية mid-route (RTL)</button>
        <button onClick={go(() => dispatch({ type: 'go', screen: 'help', returnTo: 'navigate' }))}>5. Bilingual staff help card</button>
        <button onClick={go(() => { dispatch({ type: 'setLocale', locale: 'fr-CA' }); })}>6a. Français</button>
        <button onClick={go(() => { dispatch({ type: 'setLocale', locale: 'pa-Guru' }); })}>6b. ਪੰਜਾਬੀ</button>
        <button onClick={go(() => { dispatch({ type: 'setLocale', locale: 'hi' }); })}>6c. हिन्दी</button>
      </div>

      <div className="grp">
        <h3>C · Wrong floor → new QR → reroute</h3>
        <button onClick={go(() => {
          dispatch({ type: 'reset' });
          dispatch({ type: 'setLocale', locale: 'en-CA' });
          dispatch({ type: 'setDest', destId: 'b3-outpatient' });
          dispatch({ type: 'scan', raw: 'ENTRANCE_2', source: 'manual' });
          dispatch({ type: 'confirmOrigin' });
          dispatch({ type: 'setStep', step: 2 });
        })}>1. En route Entrance 2 → B3-030 (at elevator step)</button>
        <button onClick={go(() => simulateScan(dispatch, 'ZONE_B_LIFT_LEVEL_5'))}>2. Simulate scan: ZONE_B_LIFT_LEVEL_5</button>
        <button onClick={go(() => simulateScan(dispatch, 'NOT_A_REAL_PLACE'))}>3. Edge case: unknown QR</button>
      </div>

      <div className="grp">
        <h3>Security · public vs restricted</h3>
        <button onClick={go(() => {
          dispatch({ type: 'reset' });
          dispatch({ type: 'setLocale', locale: 'en-CA' });
          dispatch({ type: 'lock' });
          dispatch({ type: 'setDest', destId: 'info-desk-e2' });
          dispatch({ type: 'scan', raw: 'ENTRANCE_1', source: 'manual' });
          dispatch({ type: 'confirmOrigin' });
        })}>1. Public: route to Information Desk (no login)</button>
        <button onClick={go(() => { dispatch({ type: 'lock' }); dispatch({ type: 'setDest', destId: 'training-lab', next: 'navigate' }); })}>2. Fictional restricted lab → blocked</button>
        <button onClick={go(() => simulateScan(dispatch, 'TRAINING_ANNEX_DOOR'))}>3. Scan annex QR → still blocked</button>
        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>4. Enter demo PIN 4321 in the app → fictional route appears.</div>
      </div>

      <div className="grp">
        <button onClick={go(() => dispatch({ type: 'go', screen: 'qr' }))}>Printable QR checkpoints</button>
        <button onClick={go(() => dispatch({ type: 'go', screen: 'sources' }))}>Sources &amp; provenance</button>
        <button onClick={go(() => { dispatch({ type: 'reset' }); dispatch({ type: 'go', screen: 'home' }); })}>Reset session</button>
      </div>
    </aside>
  );
}
