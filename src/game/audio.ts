/**
 * All sound is synthesized with Web Audio: no files to download, no licensing.
 * The AudioContext is only created after the visitor turns sound on.
 */
type Wave = OscillatorType;

class ArcadeAudio {
  private ctx: AudioContext | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  sfxOn = false;

  private ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext;
      this.ctx = new Ctx();
      const master = this.ctx.createDynamicsCompressor();
      master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.5;
      this.sfxBus.connect(master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0;
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1700;
      this.musicBus.connect(lowpass);
      lowpass.connect(master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private tone(
    freq: number,
    at: number,
    duration: number,
    wave: Wave,
    volume: number,
    bus: GainNode,
    slideTo?: number,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, at);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + duration);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain).connect(bus);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  private sfx(play: (now: number, bus: GainNode) => void) {
    if (!this.sfxOn) return;
    const ctx = this.ensure();
    play(ctx.currentTime, this.sfxBus!);
  }

  enableSfx(on: boolean) {
    this.sfxOn = on;
    if (on) this.ensure();
    else this.motor(false);
  }

  /** Continuous gantry whir. */
  motor(on: boolean) {
    if (!on) {
      if (this.motorOsc && this.ctx && this.motorGain) {
        this.motorGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
        this.motorOsc.stop(this.ctx.currentTime + 0.2);
      }
      this.motorOsc = null;
      return;
    }
    if (!this.sfxOn || this.motorOsc) return;
    const ctx = this.ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 74;
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.055, ctx.currentTime, 0.05);
    osc.connect(gain).connect(this.sfxBus!);
    osc.start();
    this.motorOsc = osc;
    this.motorGain = gain;
  }

  drop = () => this.sfx((t, b) => this.tone(520, t, 0.9, "triangle", 0.16, b, 170));
  lift = () => this.sfx((t, b) => this.tone(190, t, 0.8, "triangle", 0.13, b, 460));
  grip = () =>
    this.sfx((t, b) => {
      this.tone(150, t, 0.08, "square", 0.22, b, 80);
      this.tone(1250, t + 0.05, 0.05, "square", 0.08, b);
    });
  miss = () => this.sfx((t, b) => this.tone(300, t, 0.45, "sawtooth", 0.12, b, 95));
  release = () => this.sfx((t, b) => this.tone(820, t, 0.42, "sine", 0.17, b, 150));
  thud = () => this.sfx((t, b) => this.tone(110, t, 0.16, "sine", 0.3, b, 55));
  coin = () =>
    this.sfx((t, b) => {
      this.tone(988, t, 0.08, "square", 0.1, b);
      this.tone(1319, t + 0.08, 0.32, "square", 0.1, b);
    });
  click = () => this.sfx((t, b) => this.tone(760, t, 0.04, "square", 0.05, b));
  win = () =>
    this.sfx((t, b) => {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        this.tone(f, t + i * 0.085, 0.3, "square", 0.08, b),
      );
    });

  /** A slow I-vi-IV-V arpeggio, scheduled slightly ahead of time. */
  private schedule = () => {
    const ctx = this.ctx!;
    const bus = this.musicBus!;
    const chords = [
      [261.63, 329.63, 392, 493.88],
      [220, 261.63, 329.63, 392],
      [174.61, 220, 261.63, 329.63],
      [196, 246.94, 293.66, 349.23],
    ];
    const stepTime = 0.24;
    while (this.nextNote < ctx.currentTime + 0.5) {
      const chord = chords[Math.floor(this.step / 16) % chords.length];
      const pos = this.step % 16;
      const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
      this.tone(chord[pattern[pos % 8]] * 2, this.nextNote, 0.34, "triangle", 0.075, bus);
      if (pos % 8 === 0) this.tone(chord[0] / 2, this.nextNote, 1.7, "sine", 0.14, bus);
      if (pos === 6 || pos === 14) this.tone(chord[3] * 4, this.nextNote, 0.2, "square", 0.012, bus);
      this.nextNote += stepTime;
      this.step += 1;
    }
  };

  enableMusic(on: boolean) {
    if (on) {
      const ctx = this.ensure();
      this.musicBus!.gain.setTargetAtTime(0.75, ctx.currentTime, 0.4);
      if (!this.timer) {
        this.nextNote = ctx.currentTime + 0.05;
        this.timer = setInterval(this.schedule, 120);
      }
    } else if (this.ctx && this.timer) {
      this.musicBus!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const audio = new ArcadeAudio();
