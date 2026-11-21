// audio.js — tiny WebAudio bleeps, synthesized in the browser. No audio
// files, no network: every sound is an oscillator started on demand.

let audioContext = null;
let muted = false;

function context() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function tone(freq, dur, type, gain, when = 0) {
  if (muted) return;
  const ac = context();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ac.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(ac.currentTime + when);
  osc.stop(ac.currentTime + when + dur);
}

export function playFound() {
  tone(660, 0.12, 'sine', 0.18);
  tone(880, 0.18, 'sine', 0.18, 0.09);
  tone(1320, 0.22, 'sine', 0.12, 0.18);
}

export function playMiss() {
  tone(180, 0.16, 'square', 0.08);
  tone(140, 0.2, 'square', 0.06, 0.1);
}

export function playHint() {
  tone(520, 0.1, 'sine', 0.12);
  tone(780, 0.14, 'sine', 0.12, 0.08);
}

export function playWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'sine', 0.16, i * 0.12));
}

export function playTick() {
  tone(980, 0.05, 'sine', 0.05);
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}
