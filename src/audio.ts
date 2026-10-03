// Tiny WebAudio jingles + music loops. All generated, no copyrighted audio.
let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch { return null; }
}
export function blip(freq = 660, dur = 0.08, type: OscillatorType = 'square', vol = 0.04) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = vol;
  o.connect(g); g.connect(c.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.stop(c.currentTime + dur);
}
let muted = false;
export function setMuted(m: boolean) { muted = m; }
export function jingle(kind: 'open' | 'close' | 'notify' | 'dialup' | 'success' = 'open') {
  if (muted) return;
  if (kind === 'dialup') { [400, 600, 900, 500, 1200, 700].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'sawtooth', 0.03), i * 130)); return; }
  if (kind === 'notify') { blip(880, 0.09); setTimeout(() => blip(1320, 0.12), 110); return; }
  if (kind === 'success') { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'sine', 0.05), i * 100)); return; }
  if (kind === 'close') { blip(440, 0.08); return; }
  blip(660, 0.07); setTimeout(() => blip(880, 0.08), 80);
}

// Generative music: simple looped arpeggio per era.
let musicTimer: number | null = null;
let musicStep = 0;
const SCALES: Record<number, number[]> = {
  1995: [261, 329, 392, 523, 392, 329],
  2000: [294, 370, 440, 587, 440, 370],
  2005: [330, 415, 494, 659, 494, 415],
  2010: [349, 440, 523, 698, 523, 440],
  2015: [392, 494, 587, 784, 587, 494],
  2020: [440, 554, 659, 880, 659, 554],
  2025: [466, 587, 698, 932, 698, 587],
};
const TRACKS = [
  { title: 'Pixel Sunrise', artist: 'Chip Sparrow (fictional)' },
  { title: 'Modem Lullaby', artist: 'The Buffers (fictional)' },
  { title: 'Glitter Highway', artist: 'DJ Tiled BG (fictional)' },
  { title: 'Glass & Glow', artist: 'Aero Dream (fictional)' },
  { title: 'Flat White Noise (tasty)', artist: 'Barista Bots (fictional)' },
  { title: 'Fiber Dreams', artist: 'Remote Club (fictional)' },
  { title: 'Neon Harbor', artist: 'Aura Waves (fictional)' },
];
export function trackList() { return TRACKS; }
export function startMusic(year: number, volume: number) {
  stopMusic();
  const scale = SCALES[year] ?? SCALES[2005];
  musicStep = 0;
  musicTimer = window.setInterval(() => {
    if (muted) return;
    const f = scale[musicStep % scale.length];
    blip(f, 0.22, 'triangle', 0.02 + volume * 0.03);
    if (musicStep % 2 === 0) blip(f / 2, 0.3, 'sine', 0.015 + volume * 0.02);
    musicStep++;
  }, 420);
}
export function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }
