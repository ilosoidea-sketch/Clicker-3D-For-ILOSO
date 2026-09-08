// One reusable audio context; mechanical transients instead of a square-wave beep.
let context;
let enabled = true;
const buffers = new Map();
export function setSoundEnabled(value) { enabled = Boolean(value); }
export function isSoundEnabled() { return enabled; }
export async function playClickSound(phase = 'down') {
  if (!enabled) return;
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    context ||= new AudioEngine();
    if (context.state === 'suspended') await context.resume();
    if (!enabled || context.state !== 'running') return;
    const up = phase === 'up';
    const now = context.currentTime;
    const duration = up ? 0.026 : 0.047;
    if (!buffers.has(phase)) {
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
      const samples = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < samples.length; i++) {
        const t = i / context.sampleRate;
        const random = Math.random() * 2 - 1;
        const transient = (random - last * 0.6) * Math.exp(-t / (up ? 0.003 : 0.004));
        const body = Math.sin(2 * Math.PI * (up ? 1650 : 760) * t) * Math.exp(-t / 0.006);
        const bottomOut = t > 0.006 ? random * 0.28 * Math.exp(-(t - 0.006) / 0.004) : 0;
        samples[i] = (transient * 0.48 + body * 0.24 + bottomOut) * Math.min(t / 0.0003, 1);
        last = random;
      }
      buffers.set(phase, buffer);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffers.get(phase);
    gain.gain.value = up ? 0.46 : 0.65;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(now);
  } catch (error) {
    // Audio failure never blocks button interaction. Report once in the UI.
    const status = document.getElementById('clickStatus');
    if (status) status.textContent = 'Suara belum tersedia. Coba aktifkan lagi.';
  }
}

export function bindKeyPress(button, label) {
  let pressed = false;
  let pressedAt = 0;
  let releaseTimer;
  let start;
  function down() {
    if (pressed) return;
    clearTimeout(releaseTimer);
    pressed = true;
    pressedAt = performance.now();
    button.classList.add('is-pressed');
    button.setAttribute('aria-pressed', 'true');
    playClickSound('down');
    document.getElementById('clickStatus').textContent = `Tombol ${label} ditekan`;
  }
  function up(silent = false) {
    if (!pressed) return;
    pressed = false;
    if (!silent) playClickSound('up');
    // Keep a very quick tap visible; a held press remains depressed until release.
    releaseTimer = setTimeout(() => {
      button.classList.remove('is-pressed');
      button.setAttribute('aria-pressed', 'false');
    }, Math.max(0, 110 - (performance.now() - pressedAt)));
  }
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary) return;
    start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    button.setPointerCapture(event.pointerId);
    down();
  });
  button.addEventListener('pointermove', event => {
    if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 18) up(true);
  });
  button.addEventListener('pointerup', () => { up(); start = null; });
  button.addEventListener('pointercancel', () => { up(true); start = null; });
  button.addEventListener('lostpointercapture', () => { up(true); start = null; });
  button.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); if (!event.repeat) down(); }
  });
  button.addEventListener('keyup', event => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); up(); }
  });
  button.addEventListener('blur', () => up(true));
  // Assistive technologies can activate without pointer or keyboard events.
  button.addEventListener('click', event => { if (event.detail === 0 && !pressed) { down(); up(); } });
}
