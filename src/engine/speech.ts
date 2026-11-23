import { LANG_BY_CODE, type LocaleCode } from '../i18n/languages';

/**
 * Honest text-to-speech via the browser's Web Speech API (no paid service).
 * We only speak when a voice for the chosen language exists; we never silently fall back to a
 * different language voice.
 */
export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const v = window.speechSynthesis.getVoices();
  if (v.length) return Promise.resolve(v);
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
}

export function voiceFor(locale: LocaleCode, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const tags = LANG_BY_CODE[locale].tts.map((t) => t.toLowerCase());
  for (const tag of tags) {
    const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === tag);
    if (exact) return exact;
  }
  for (const tag of tags) {
    const base = tag.split('-')[0];
    // Chinese: never use a Traditional/Cantonese voice for Simplified or vice-versa when avoidable
    const hit = voices.find((v) => v.lang.toLowerCase().replace('_', '-').split('-')[0] === base);
    if (hit) return hit;
  }
  return null;
}

export function speak(text: string, voice: SpeechSynthesisVoice, rate = 0.95) {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel();
}
