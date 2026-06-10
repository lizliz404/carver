/**
 * Web Audio API sound system for Carver.
 * All sounds are synthesized — no external audio files.
 *
 * Architecture:
 *   - BGM: always-on glacial ambient drone, 2 states (idle / active)
 *   - SFX: short synthesized events (move, slide, blocked, restart, victory, death)
 */

// ── AudioContext singleton ──────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Must be called on first user interaction to unlock AudioContext */
export function unlockAudio() {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
  } catch { /* ok */ }
}

// ── Utility: tone & noise generators ───────────────────────────────

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.08,
  freqEnd?: number,
  delay = 0,
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);
    }

    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch { /* audio is non-critical */ }
}

function playNoise(
  duration: number,
  volume = 0.04,
  filterFreq = 800,
  filterQ = 1,
  delay = 0,
) {
  try {
    const ctx = getCtx();
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Shaped noise: stronger attack, quick decay
    for (let i = 0; i < bufferSize; i++) {
      const env = 1 - (i / bufferSize) ** 0.6;
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime + delay);
    filter.Q.setValueAtTime(filterQ, ctx.currentTime + delay);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
    source.stop(ctx.currentTime + delay + duration);
  } catch { /* ok */ }
}

// ── BGM: Glacial ambient drone ─────────────────────────────────────
// Two oscillators create a deep, cold pad. An LFO provides slow pulse.
// State "idle" = dim/buried; "active" = slightly brighter, more forward.

interface BGMState {
  osc1: OscillatorNode;       // sub-bass sine ~41Hz
  osc2: OscillatorNode;       // low-mid triangle ~82Hz
  osc3: OscillatorNode;       // texture sawtooth ~164Hz, low-passed
  lfo: OscillatorNode;        // ~0.15Hz sine for volume pulse
  gain1: GainNode;            // osc1 gain
  gain2: GainNode;            // osc2 gain
  gain3: GainNode;            // osc3 gain
  lfoGain: GainNode;          // LFO modulation depth
  masterGain: GainNode;       // overall BGM volume
  filter: BiquadFilterNode;   // low-pass on osc3
  started: boolean;
  currentState: "idle" | "active";
}

let bgm: BGMState | null = null;

const BGM_PARAMS = {
  idle: { g1: 0.018, g2: 0.010, g3: 0.004, master: 0.65, filterFreq: 200 },
  active: { g1: 0.025, g2: 0.016, g3: 0.008, master: 0.85, filterFreq: 400 },
  transitionTime: 1.5, // seconds to ramp between states
};

function rampTo(target: AudioParam, value: number, time: number, ctx: AudioContext) {
  target.cancelScheduledValues(ctx.currentTime);
  target.setTargetAtTime(value, ctx.currentTime, time / 3);
}

export const BGM = {
  start() {
    if (bgm?.started) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Sub-bass oscillator (~41 Hz = low E, rumbles feel rather than hear)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(41.2, now);

      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(BGM_PARAMS.idle.g1, now);

      // Low-mid triangle (octave up)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(82.4, now);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(BGM_PARAMS.idle.g2, now);

      // Texture sawtooth (2 octaves up), heavily low-passed
      const osc3 = ctx.createOscillator();
      osc3.type = "sawtooth";
      osc3.frequency.setValueAtTime(164.8, now);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(BGM_PARAMS.idle.filterFreq, now);
      filter.Q.setValueAtTime(0.5, now);

      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(BGM_PARAMS.idle.g3, now);

      // LFO for subtle volume pulse
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.15, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.003, now);

      // Master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(BGM_PARAMS.idle.master, now);

      // Routing
      osc1.connect(gain1).connect(masterGain);
      osc2.connect(gain2).connect(masterGain);
      osc3.connect(filter).connect(gain3).connect(masterGain);
      lfo.connect(lfoGain).connect(gain1.gain); // LFO modulates sub-bass

      masterGain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      lfo.start(now);

      bgm = {
        osc1, osc2, osc3, lfo,
        gain1, gain2, gain3, lfoGain,
        masterGain, filter,
        started: true,
        currentState: "idle",
      };
    } catch { /* audio may not be available */ }
  },

  /** Transition to "active" state (during sliding) or back to "idle" */
  setState(state: "idle" | "active") {
    if (!bgm?.started) return;
    try {
      const ctx = getCtx();
      const p = BGM_PARAMS[state];
      const t = BGM_PARAMS.transitionTime;

      rampTo(bgm.gain1.gain, p.g1, t, ctx);
      rampTo(bgm.gain2.gain, p.g2, t, ctx);
      rampTo(bgm.gain3.gain, p.g3, t, ctx);
      rampTo(bgm.masterGain.gain, p.master, t, ctx);
      rampTo(bgm.filter.frequency, p.filterFreq, t, ctx);

      bgm.currentState = state;
    } catch { /* ok */ }
  },

  stop() {
    if (!bgm?.started) return;
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      bgm.masterGain.gain.linearRampToValueAtTime(0.001, now + 2);
      setTimeout(() => {
        try {
          bgm?.osc1.stop();
          bgm?.osc2.stop();
          bgm?.osc3.stop();
          bgm?.lfo.stop();
        } catch { /* already stopped */ }
        bgm = null;
      }, 2500);
    } catch { /* ok */ }
  },
};

// ── SFX ─────────────────────────────────────────────────────────────

export const SFX = {
  /** Stone scrape + thump: pushing off dirt */
  move() {
    // Low thump
    playTone(80, 0.05, "sine", 0.06, 40);
    // Stone scrape (filtered noise burst)
    playNoise(0.06, 0.03, 600, 3);
    // Subtle high click for tactile feel
    playTone(1200, 0.02, "sine", 0.03, 800, 0.01);
  },

  /** Icy slide: glassy ping + crystal noise */
  slide() {
    // Glassy high ping
    playTone(1800, 0.06, "sine", 0.025, 2400);
    // Crystal texture (high-passed noise)
    playNoise(0.05, 0.015, 3000, 5);
    // Harmonic overtone
    playTone(3600, 0.04, "sine", 0.015, 4800);
  },

  /** Dull thud + low rumble: hitting a wall or void */
  blocked() {
    // Deep thud
    playTone(60, 0.15, "triangle", 0.07, 30);
    // Low rumble noise
    playNoise(0.1, 0.03, 150, 1.5);
  },

  /** Upward sweep: restart / undo */
  restart() {
    playTone(200, 0.12, "sine", 0.04, 500);
    // Bright tail
    playTone(500, 0.08, "sine", 0.02, 800, 0.08);
  },

  /** C-E-G-C arpeggio with sub-bass: level clear */
  victory() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Sub-bass rumble
      playTone(65, 0.6, "sine", 0.05, 55);
      playTone(41, 0.8, "sine", 0.03, 30, 0.1);

      // Arpeggio notes
      const notes = [
        { freq: 523, time: 0 },     // C5
        { freq: 659, time: 0.1 },   // E5
        { freq: 784, time: 0.2 },   // G5
        { freq: 1047, time: 0.35 }, // C6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.07, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.5);
      });
    } catch { /* ok */ }
  },

  /** Descending sawtooth with rumble: route collapsed */
  death() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Rumble
      playNoise(0.3, 0.04, 80, 1);

      // Descending notes
      const pitches = [
        { freq: 200, time: 0 },
        { freq: 150, time: 0.1 },
        { freq: 100, time: 0.2 },
        { freq: 55, time: 0.35 },
      ];

      pitches.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + time);
        gain.gain.setValueAtTime(0.05, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + 0.35);
      });
    } catch { /* ok */ }
  },
};
