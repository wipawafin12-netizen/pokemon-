/**
 * AudioManager — Eternal Monsters audio architecture.
 *
 * Two layers:
 *  1. File layer: if an audio file exists under /assets/audio/** it is used.
 *  2. Synth layer: procedural WebAudio fallback so the game is fully
 *     playable with zero shipped audio assets.
 *
 * Folder structure (public/assets/audio):
 *   music/      — bgm-village.mp3, bgm-forest.mp3, bgm-cave.mp3, bgm-desert.mp3,
 *                 bgm-snow.mp3, bgm-plateau.mp3, bgm-temple.mp3, bgm-city.mp3,
 *                 bgm-battle.mp3, bgm-boss.mp3, bgm-menu.mp3
 *   ambient/    — amb-forest.mp3, amb-cave.mp3, amb-wind.mp3, amb-city.mp3
 *   battle/     — sfx-hit.mp3, sfx-crit.mp3, sfx-heal.mp3, sfx-faint.mp3,
 *                 sfx-capture-shake.mp3, sfx-capture-success.mp3, sfx-capture-fail.mp3
 *   ui/         — sfx-click.mp3, sfx-confirm.mp3, sfx-cancel.mp3, sfx-levelup.mp3
 */

export type SfxName =
  | "click" | "confirm" | "cancel"
  | "hit" | "crit" | "heal" | "faint"
  | "capture-shake" | "capture-success" | "capture-fail"
  | "levelup" | "evolve" | "item" | "quest";

type MusicKey =
  | "village" | "forest" | "cave" | "desert" | "snow"
  | "plateau" | "temple" | "city" | "battle" | "boss" | "menu";

const SFX_FILES: Record<SfxName, string> = {
  click: "/assets/audio/ui/sfx-click.mp3",
  confirm: "/assets/audio/ui/sfx-confirm.mp3",
  cancel: "/assets/audio/ui/sfx-cancel.mp3",
  hit: "/assets/audio/battle/sfx-hit.mp3",
  crit: "/assets/audio/battle/sfx-crit.mp3",
  heal: "/assets/audio/battle/sfx-heal.mp3",
  faint: "/assets/audio/battle/sfx-faint.mp3",
  "capture-shake": "/assets/audio/battle/sfx-capture-shake.mp3",
  "capture-success": "/assets/audio/battle/sfx-capture-success.mp3",
  "capture-fail": "/assets/audio/battle/sfx-capture-fail.mp3",
  levelup: "/assets/audio/ui/sfx-levelup.mp3",
  evolve: "/assets/audio/ui/sfx-levelup.mp3",
  item: "/assets/audio/ui/sfx-confirm.mp3",
  quest: "/assets/audio/ui/sfx-confirm.mp3",
};

const MUSIC_FILES: Record<MusicKey, string> = {
  village: "/assets/audio/music/bgm-village.mp3",
  forest: "/assets/audio/music/bgm-forest.mp3",
  cave: "/assets/audio/music/bgm-cave.mp3",
  desert: "/assets/audio/music/bgm-desert.mp3",
  snow: "/assets/audio/music/bgm-snow.mp3",
  plateau: "/assets/audio/music/bgm-plateau.mp3",
  temple: "/assets/audio/music/bgm-temple.mp3",
  city: "/assets/audio/music/bgm-city.mp3",
  battle: "/assets/audio/music/bgm-battle.mp3",
  boss: "/assets/audio/music/bgm-boss.mp3",
  menu: "/assets/audio/music/bgm-menu.mp3",
};

// Pentatonic-ish scales per theme for the procedural fallback.
const THEME_SCALES: Record<MusicKey, { root: number; scale: number[]; tempo: number; wave: OscillatorType }> = {
  village: { root: 261.63, scale: [0, 2, 4, 7, 9], tempo: 95, wave: "triangle" },
  forest: { root: 220.0, scale: [0, 3, 5, 7, 10], tempo: 85, wave: "triangle" },
  cave: { root: 174.61, scale: [0, 3, 5, 6, 10], tempo: 70, wave: "sine" },
  desert: { root: 233.08, scale: [0, 1, 4, 5, 7], tempo: 90, wave: "sawtooth" },
  snow: { root: 293.66, scale: [0, 2, 3, 7, 8], tempo: 65, wave: "sine" },
  plateau: { root: 196.0, scale: [0, 2, 5, 7, 10], tempo: 110, wave: "square" },
  temple: { root: 329.63, scale: [0, 4, 5, 7, 11], tempo: 60, wave: "sine" },
  city: { root: 246.94, scale: [0, 2, 4, 7, 9], tempo: 100, wave: "triangle" },
  battle: { root: 220.0, scale: [0, 2, 3, 5, 7], tempo: 140, wave: "square" },
  boss: { root: 164.81, scale: [0, 1, 3, 5, 6], tempo: 150, wave: "sawtooth" },
  menu: { root: 261.63, scale: [0, 4, 7, 11, 12], tempo: 72, wave: "sine" },
};

class AudioManagerImpl {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private currentMusic: MusicKey | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private fileCache = new Map<string, boolean>();
  private step = 0;

  /** Must be called from a user gesture before any sound plays. */
  init(): void {
    if (this.ctx || typeof window === "undefined") return;
    try {
      this.ctx = new AudioContext();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume * 0.22;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  setVolumes(music: number, sfx: number): void {
    this.musicVolume = music;
    this.sfxVolume = sfx;
    if (this.musicGain) this.musicGain.gain.value = music * 0.22;
    if (this.sfxGain) this.sfxGain.gain.value = sfx;
    if (this.musicEl) this.musicEl.volume = music;
  }

  // ---------------- SFX ----------------

  playSfx(name: SfxName): void {
    if (!this.ctx) return;
    if (this.sfxVolume <= 0) return;
    const file = SFX_FILES[name];
    if (this.fileCache.get(file)) {
      const el = new Audio(file);
      el.volume = this.sfxVolume;
      void el.play().catch(() => this.synthSfx(name));
      return;
    }
    if (!this.fileCache.has(file)) {
      // Probe once; remember the result.
      fetch(file, { method: "HEAD" })
        .then((r) => this.fileCache.set(file, r.ok))
        .catch(() => this.fileCache.set(file, false));
    }
    this.synthSfx(name);
  }

  private tone(freq: number, dur: number, delay = 0, type: OscillatorType = "square", vol = 0.5): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol * 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, delay = 0, vol = 0.4): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime + delay;
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.value = vol * 0.3;
    src.connect(g);
    g.connect(this.sfxGain);
    src.start(t);
  }

  private synthSfx(name: SfxName): void {
    switch (name) {
      case "click": this.tone(660, 0.05, 0, "square", 0.3); break;
      case "confirm": this.tone(523, 0.07); this.tone(784, 0.1, 0.07); break;
      case "cancel": this.tone(440, 0.07); this.tone(330, 0.1, 0.07); break;
      case "hit": this.noise(0.12); this.tone(150, 0.1, 0, "sawtooth", 0.5); break;
      case "crit": this.noise(0.18, 0, 0.6); this.tone(110, 0.16, 0, "sawtooth", 0.7); this.tone(220, 0.1, 0.05, "square", 0.5); break;
      case "heal": this.tone(523, 0.1); this.tone(659, 0.1, 0.09); this.tone(784, 0.16, 0.18, "sine", 0.5); break;
      case "faint": this.tone(330, 0.12, 0, "sawtooth"); this.tone(220, 0.14, 0.1, "sawtooth"); this.tone(110, 0.3, 0.22, "sawtooth"); break;
      case "capture-shake": this.tone(180, 0.08, 0, "square", 0.4); this.noise(0.05, 0.02, 0.2); break;
      case "capture-success": this.tone(523, 0.09); this.tone(659, 0.09, 0.1); this.tone(784, 0.09, 0.2); this.tone(1047, 0.25, 0.3, "triangle", 0.6); break;
      case "capture-fail": this.noise(0.2, 0, 0.5); this.tone(180, 0.2, 0.02, "sawtooth", 0.6); break;
      case "levelup": [523, 587, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.1, i * 0.08, "triangle", 0.5)); break;
      case "evolve": [392, 523, 659, 784, 988, 1175].forEach((f, i) => this.tone(f, 0.14, i * 0.1, "triangle", 0.5)); break;
      case "item": this.tone(880, 0.06); this.tone(1175, 0.1, 0.06); break;
      case "quest": this.tone(659, 0.08); this.tone(880, 0.08, 0.09); this.tone(1319, 0.18, 0.18, "triangle", 0.5); break;
    }
  }

  // ---------------- Music ----------------

  playMusic(key: MusicKey): void {
    if (this.currentMusic === key) return;
    this.stopMusic();
    this.currentMusic = key;
    if (!this.ctx) return;

    const file = MUSIC_FILES[key];
    fetch(file, { method: "HEAD" })
      .then((r) => {
        if (this.currentMusic !== key) return;
        if (r.ok) {
          this.musicEl = new Audio(file);
          this.musicEl.loop = true;
          this.musicEl.volume = this.musicVolume;
          void this.musicEl.play().catch(() => this.startSynthLoop(key));
        } else {
          this.startSynthLoop(key);
        }
      })
      .catch(() => {
        if (this.currentMusic === key) this.startSynthLoop(key);
      });
  }

  private startSynthLoop(key: MusicKey): void {
    if (!this.ctx || !this.musicGain) return;
    const theme = THEME_SCALES[key];
    const beatMs = 60000 / theme.tempo / 2;
    this.step = 0;
    this.musicTimer = setInterval(() => {
      if (!this.ctx || !this.musicGain || this.musicVolume <= 0) return;
      const t = this.ctx.currentTime;
      const s = this.step % 16;
      // Bass on downbeats
      if (s % 4 === 0) {
        this.musicNote(theme.root / 2, beatMs / 1000 * 1.8, theme.wave, 0.5);
      }
      // Melody: pseudo-random walk over the scale, deterministic per 16-step bar
      const idx = (this.step * 7 + Math.floor(this.step / 16) * 3) % theme.scale.length;
      const octave = s % 8 === 6 ? 2 : 1;
      if (s % 2 === 0) {
        this.musicNote(theme.root * Math.pow(2, theme.scale[idx] / 12) * octave, beatMs / 1000 * 0.9, theme.wave, 0.35);
      }
      void t;
      this.step += 1;
    }, beatMs);
  }

  private musicNote(freq: number, dur: number, type: OscillatorType, vol: number): void {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol * 0.5, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  stopMusic(): void {
    this.currentMusic = null;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicEl) {
      this.musicEl.pause();
      this.musicEl = null;
    }
  }
}

export const AudioManager = new AudioManagerImpl();
