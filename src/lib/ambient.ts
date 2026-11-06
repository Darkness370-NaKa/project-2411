/** Gentle generative piano-like ambient via Web Audio. Starts only on user gesture. */
export class Ambient {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  playing = false;

  static supported() {
    return typeof window !== "undefined" && !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  private init() {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    // simple feedback-delay "reverb"
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.38;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(lp);
    lp.connect(fb);
    fb.connect(delay);
    lp.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
  }

  private note(freq: number, t: number, vel = 0.18, dur = 3.2) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    g.connect(this.master!);
    [1, 2, 3].forEach((h, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = freq * h;
      const hg = ctx.createGain();
      hg.gain.value = [1, 0.22, 0.06][i] ?? 0;
      o.connect(hg);
      hg.connect(g);
      o.start(t);
      o.stop(t + dur + 0.1);
    });
  }

  private tick = () => {
    if (!this.ctx) return;
    // Dmaj7 – Bm9 – Gmaj7 – A6 progression, arpeggiated softly
    const chords = [
      [146.83, 220, 277.18, 369.99, 440],
      [123.47, 185, 246.94, 293.66, 369.99],
      [98, 196, 246.94, 293.66, 369.99],
      [110, 220, 277.18, 329.63, 369.99],
    ];
    const chord = chords[Math.floor(this.step / 8) % chords.length]!;
    const t = this.ctx.currentTime + 0.05;
    const i = this.step % 8;
    if (i === 0) this.note(chord[0]!, t, 0.16, 5);
    const pattern = [1, 2, 3, 4, 3, 2, 4, 3];
    if (Math.random() > 0.15) this.note(chord[pattern[i]!]! * (Math.random() > 0.85 ? 2 : 1), t, 0.07 + Math.random() * 0.05);
    this.step++;
  };

  async play() {
    if (!this.ctx) this.init();
    await this.ctx!.resume();
    const now = this.ctx!.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.linearRampToValueAtTime(0.5, now + 1.5);
    if (this.timer == null) this.timer = window.setInterval(this.tick, 520);
    this.playing = true;
  }

  pause() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.6);
    if (this.timer != null) window.clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    window.setTimeout(() => !this.playing && this.ctx?.suspend(), 800);
  }

  chime() {
    if (!this.ctx || !this.playing) return;
    const t = this.ctx.currentTime;
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => this.note(f, t + i * 0.09, 0.09, 2.5));
  }
}