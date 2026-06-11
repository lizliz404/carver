/**
 * Web Audio API sound system for Carver.
 * All sounds are synthesized — no external audio files.
 *
 * Architecture:
 *   - BGM: tonal glacial ambient pad, 2 states (idle / active)
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

// ── BGM: Tonal glacial ambient pad ─────────────────────────────────
// The mix avoids low-frequency rumble as the main voice. A quiet bass layer
// supports warmer mid tones and bright ice shimmer so the loop reads as music,
// not HVAC noise.

interface BGMState {
  bassOsc: OscillatorNode;
  rootOsc: OscillatorNode;
  fifthOsc: OscillatorNode;
  shimmerOsc: OscillatorNode;
  lfo: OscillatorNode;
  bassGain: GainNode;
  rootGain: GainNode;
  fifthGain: GainNode;
  shimmerGain: GainNode;
  lfoGain: GainNode;
  masterGain: GainNode;
  padFilter: BiquadFilterNode;
  shimmerFilter: BiquadFilterNode;
  started: boolean;
  currentState: "idle" | "active";
}

let bgm: BGMState | null = null;

const BGM_PARAMS = {
  idle: {
    bass: 0.006,
    root: 0.018,
    fifth: 0.012,
    shimmer: 0.004,
    master: 0.38,
    padFilter: 520,
    shimmerFilter: 1800,
  },
  active: {
    bass: 0.008,
    root: 0.024,
    fifth: 0.017,
    shimmer: 0.008,
    master: 0.48,
    padFilter: 860,
    shimmerFilter: 2600,
  },
  transitionTime: 1.2,
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

      const bassOsc = ctx.createOscillator();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(55, now);

      const rootOsc = ctx.createOscillator();
      rootOsc.type = "triangle";
      rootOsc.frequency.setValueAtTime(220, now);
      rootOsc.detune.setValueAtTime(-4, now);

      const fifthOsc = ctx.createOscillator();
      fifthOsc.type = "sine";
      fifthOsc.frequency.setValueAtTime(329.63, now);
      fifthOsc.detune.setValueAtTime(3, now);

      const shimmerOsc = ctx.createOscillator();
      shimmerOsc.type = "triangle";
      shimmerOsc.frequency.setValueAtTime(659.25, now);
      shimmerOsc.detune.setValueAtTime(6, now);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(BGM_PARAMS.idle.bass, now);

      const rootGain = ctx.createGain();
      rootGain.gain.setValueAtTime(BGM_PARAMS.idle.root, now);

      const fifthGain = ctx.createGain();
      fifthGain.gain.setValueAtTime(BGM_PARAMS.idle.fifth, now);

      const shimmerGain = ctx.createGain();
      shimmerGain.gain.setValueAtTime(BGM_PARAMS.idle.shimmer, now);

      const padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(BGM_PARAMS.idle.padFilter, now);
      padFilter.Q.setValueAtTime(0.7, now);

      const shimmerFilter = ctx.createBiquadFilter();
      shimmerFilter.type = "bandpass";
      shimmerFilter.frequency.setValueAtTime(BGM_PARAMS.idle.shimmerFilter, now);
      shimmerFilter.Q.setValueAtTime(1.2, now);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.09, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.002, now);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(BGM_PARAMS.idle.master, now);

      bassOsc.connect(bassGain).connect(masterGain);
      rootOsc.connect(rootGain).connect(padFilter);
      fifthOsc.connect(fifthGain).connect(padFilter);
      padFilter.connect(masterGain);
      shimmerOsc.connect(shimmerFilter).connect(shimmerGain).connect(masterGain);
      lfo.connect(lfoGain).connect(rootGain.gain);

      masterGain.connect(ctx.destination);

      bassOsc.start(now);
      rootOsc.start(now);
      fifthOsc.start(now);
      shimmerOsc.start(now);
      lfo.start(now);

      bgm = {
        bassOsc,
        rootOsc,
        fifthOsc,
        shimmerOsc,
        lfo,
        bassGain,
        rootGain,
        fifthGain,
        shimmerGain,
        lfoGain,
        masterGain,
        padFilter,
        shimmerFilter,
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

      rampTo(bgm.bassGain.gain, p.bass, t, ctx);
      rampTo(bgm.rootGain.gain, p.root, t, ctx);
      rampTo(bgm.fifthGain.gain, p.fifth, t, ctx);
      rampTo(bgm.shimmerGain.gain, p.shimmer, t, ctx);
      rampTo(bgm.masterGain.gain, p.master, t, ctx);
      rampTo(bgm.padFilter.frequency, p.padFilter, t, ctx);
      rampTo(bgm.shimmerFilter.frequency, p.shimmerFilter, t, ctx);

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
          bgm?.bassOsc.stop();
          bgm?.rootOsc.stop();
          bgm?.fifthOsc.stop();
          bgm?.shimmerOsc.stop();
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
