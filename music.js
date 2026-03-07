// ============================================================
//  Light Crystal RPG - Modern Music Engine
//  Web Audio API: ADSR envelopes, reverb, compressor, percussion
// ============================================================

class MusicEngine {
  constructor() {
    this.audioCtx    = null;
    this.masterGain  = null;
    this.reverbSend  = null;
    this.compressor  = null;
    this.isInit      = false;
    this.loopId      = 0;
    this.volume      = 0.44;
    this.muted       = false;
  }

  // ── Boot ──────────────────────────────────────────────────
  init() {
    if (this.isInit) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioCtx = ctx;
    this._buildChain(ctx);
    this.isInit = true;
  }

  _buildChain(ctx) {
    // Compressor for clean dynamics
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value      = 8;
    comp.ratio.value     = 3.5;
    comp.attack.value    = 0.004;
    comp.release.value   = 0.25;
    this.compressor = comp;

    // Master volume
    const mg = ctx.createGain();
    mg.gain.value = this.muted ? 0 : this.volume;
    this.masterGain = mg;

    // Simple plate reverb via two comb filters
    const rvSend = ctx.createGain();
    rvSend.gain.value = 0.22;
    this.reverbSend = rvSend;

    const d1 = ctx.createDelay(1.0); d1.delayTime.value = 0.047;
    const d2 = ctx.createDelay(1.0); d2.delayTime.value = 0.071;
    const fb1 = ctx.createGain(); fb1.gain.value = 0.34;
    const fb2 = ctx.createGain(); fb2.gain.value = 0.30;
    const rvLp = ctx.createBiquadFilter();
    rvLp.type = 'lowpass'; rvLp.frequency.value = 1600;

    rvSend.connect(d1);
    d1.connect(fb1); fb1.connect(d2); d2.connect(fb2);
    fb2.connect(rvLp); rvLp.connect(d1);   // feedback loop

    const rvOut = ctx.createGain(); rvOut.gain.value = 0.42;
    rvLp.connect(rvOut);

    mg.connect(comp);
    rvOut.connect(comp);
    comp.connect(ctx.destination);
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  // ── Pitch helper ──────────────────────────────────────────
  freq(n) {
    if (n === 'R') return 0;
    const map = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
    const m = n.match(/^([A-G]#?b?)(\d)$/);
    if (!m) return 0;
    return 440 * Math.pow(2, ((parseInt(m[2]) - 4) * 12 + map[m[1]] - 9) / 12);
  }

  // ── Note with ADSR + warm filter ──────────────────────────
  note(f, t, dur, wave, vol, gainNode) {
    if (!f || !this.isInit) return;
    const ctx = this.audioCtx;
    const tgt = gainNode || this.masterGain;

    const osc  = ctx.createOscillator();
    const env  = ctx.createGain();
    const filt = ctx.createBiquadFilter();

    // Timbre-specific filter cutoff
    filt.type = 'lowpass';
    filt.Q.value = 0.7;
    filt.frequency.value = wave === 'sawtooth' ? 2000
                         : wave === 'square'   ? 1400
                                               : 4500;

    osc.type = wave;
    osc.frequency.value = f;

    const atk = 0.009;
    const dec = 0.07;
    const sus = vol * (wave === 'triangle' || wave === 'sine' ? 0.72 : 0.58);

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + atk);
    env.gain.linearRampToValueAtTime(sus, t + atk + dec);
    env.gain.setValueAtTime(sus, t + dur * 0.82);
    env.gain.linearRampToValueAtTime(0, t + dur);

    osc.connect(filt);
    filt.connect(env);
    env.connect(tgt);

    // Send to reverb
    if (this.reverbSend) {
      const rvg = ctx.createGain();
      rvg.gain.value = 0.55;
      env.connect(rvg);
      rvg.connect(this.reverbSend);
    }

    osc.start(t);
    osc.stop(t + dur + 0.06);

    // Warm upper harmonic for triangle/sine
    if (wave === 'triangle' || wave === 'sine') {
      const h = ctx.createOscillator();
      const hg = ctx.createGain();
      h.type = 'sine';
      h.frequency.value = f * 2;
      hg.gain.setValueAtTime(0, t);
      hg.gain.linearRampToValueAtTime(vol * 0.13, t + atk);
      hg.gain.setValueAtTime(vol * 0.09, t + atk + dec);
      hg.gain.setValueAtTime(vol * 0.09, t + dur * 0.82);
      hg.gain.linearRampToValueAtTime(0, t + dur);
      h.connect(hg); hg.connect(tgt);
      h.start(t); h.stop(t + dur + 0.06);
    }
  }

  // ── Percussion synthesis ───────────────────────────────────
  kick(t, vol = 0.52) {
    if (!this.isInit) return;
    const ctx = this.audioCtx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(155, t);
    o.frequency.exponentialRampToValueAtTime(36, t + 0.19);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g); g.connect(this.masterGain);
    o.start(t); o.stop(t + 0.34);
  }

  snare(t, vol = 0.22) {
    if (!this.isInit) return;
    const ctx = this.audioCtx;
    // Noise body
    const bufLen = Math.floor(ctx.sampleRate * 0.16);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hi = ctx.createBiquadFilter();
    hi.type = 'highpass'; hi.frequency.value = 850;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
    src.connect(hi); hi.connect(g); g.connect(this.masterGain);
    src.start(t); src.stop(t + 0.22);
    // Tonal snap
    const o = ctx.createOscillator(); const og = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.09);
    og.gain.setValueAtTime(vol * 0.45, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
    o.connect(og); og.connect(this.masterGain);
    o.start(t); o.stop(t + 0.14);
  }

  hihat(t, vol = 0.07) {
    if (!this.isInit) return;
    const ctx = this.audioCtx;
    const bufLen = Math.floor(ctx.sampleRate * 0.045);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hi = ctx.createBiquadFilter();
    hi.type = 'highpass'; hi.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    src.connect(hi); hi.connect(g); g.connect(this.masterGain);
    src.start(t); src.stop(t + 0.07);
  }

  // ── Scheduling helpers ────────────────────────────────────
  schedule(seq, bpm, wave, vol, t0) {
    const b = 60 / bpm;
    let t = t0;
    for (const [n, beats] of seq) {
      const f = this.freq(n);
      if (f > 0) this.note(f, t, b * beats * 0.9, wave, vol);
      t += b * beats;
    }
    return t;
  }

  seqLen(seq, bpm) {
    return seq.reduce((s, [, b]) => s + b, 0) * (60 / bpm);
  }

  // Schedule percussion grid over the loop period
  scheduleGrid(t, bpm, totalBeats, kicks, snares, hihats) {
    const b = 60 / bpm;
    kicks.forEach(beat   => this.kick(t + beat * b));
    snares.forEach(beat  => this.snare(t + beat * b));
    hihats.forEach(beat  => this.hihat(t + beat * b));
  }

  // ── Core loop ─────────────────────────────────────────────
  stopAll() {
    this.loopId++;
    if (!this.audioCtx) return;
    this.audioCtx.close();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioCtx = ctx;
    this._buildChain(ctx);
  }

  loop(mel, bas, bpm, mWave, bWave, percData) {
    if (!this.isInit) return;
    this.stopAll();
    const id = this.loopId;
    const len = this.seqLen(mel, bpm);
    const go = t => {
      if (this.loopId !== id) return;
      this.schedule(mel, bpm, mWave || 'triangle', 0.3, t);
      if (bas) this.schedule(bas, bpm, bWave || 'triangle', 0.17, t);
      if (percData) {
        const { beats, kicks, snares, hihats } = percData;
        this.scheduleGrid(t, bpm, beats, kicks, snares, hihats);
      }
      setTimeout(() => go(t + len), (len - 0.45) * 1000);
    };
    go(this.audioCtx.currentTime + 0.06);
  }

  // ── Tracks ────────────────────────────────────────────────

  playTown() {
    // Warm, pastoral — F major, BPM 82, triangle "piano"
    const bpm = 82;
    const mel = [
      ['C5',.5],['F5',.5],['A5',.5],['C6',.5],
      ['Bb5',.5],['A5',.5],['G5',1],
      ['A5',.5],['G5',.5],['F5',.5],['E5',.5],
      ['F5',2],
      ['G5',.5],['A5',.5],['Bb5',.5],['C6',.5],
      ['A5',.5],['G5',.5],['F5',1],
      ['E5',.5],['F5',.5],['G5',.5],['A5',.5],
      ['G5',2],
      ['A5',.5],['C6',.5],['Bb5',.5],['A5',.5],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['G5',2],
      ['F5',1],['A5',.5],['G5',.5],
      ['Bb5',.5],['A5',.5],['G5',.5],['F5',.5],
      ['E5',.5],['G5',.5],['A5',.5],['C6',.5],
      ['F5',2],
    ];
    const bas = [
      ['F3',.5],['C3',.5],['A2',.5],['F2',.5],
      ['Bb2',.5],['F3',.5],['G2',1],
      ['A2',.5],['E3',.5],['C3',.5],['G2',.5],
      ['F2',2],
      ['G2',.5],['D3',.5],['G3',.5],['D3',.5],
      ['F2',.5],['C3',.5],['F3',1],
      ['C3',.5],['G2',.5],['C3',.5],['E3',.5],
      ['G2',2],
      ['A2',.5],['E3',.5],['A2',.5],['C3',.5],
      ['G2',.5],['D3',.5],['G2',.5],['F2',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['G2',2],
      ['F2',.5],['C3',.5],['F2',.5],['A2',.5],
      ['Bb2',.5],['F2',.5],['G2',.5],['D2',.5],
      ['C3',.5],['G2',.5],['A2',.5],['F2',.5],
      ['F2',2],
    ];
    this.loop(mel, bas, bpm, 'triangle', 'triangle');
  }

  playField() {
    // Adventurous — D Dorian, BPM 104, triangle + sawtooth bass
    const bpm = 104;
    const mel = [
      ['D5',.5],['E5',.5],['F5',.5],['G5',.5],
      ['A5',.5],['Bb5',.5],['A5',.5],['G5',.5],
      ['F5',.5],['E5',.5],['D5',.5],['C5',.5],
      ['D5',2],
      ['F5',.5],['G5',.5],['A5',.5],['Bb5',.5],
      ['C6',.5],['Bb5',.5],['A5',.5],['G5',.5],
      ['F5',.5],['A5',.5],['G5',.5],['E5',.5],
      ['F5',2],
      ['E5',.5],['F5',.5],['G5',.5],['A5',.5],
      ['Bb5',1],['A5',.5],['G5',.5],
      ['F5',.5],['G5',.5],['A5',.5],['Bb5',.5],
      ['A5',2],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['G5',.5],['E5',.5],['C5',.5],['D5',.5],
      ['D5',2],
    ];
    const bas = [
      ['D3',.5],['A2',.5],['D3',.5],['A2',.5],
      ['A2',.5],['E3',.5],['A2',.5],['E2',.5],
      ['F2',.5],['C3',.5],['F2',.5],['C3',.5],
      ['D2',2],
      ['F2',.5],['C3',.5],['F2',.5],['C3',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['F2',.5],['C3',.5],['A2',.5],['E2',.5],
      ['F2',2],
      ['E2',.5],['B2',.5],['E2',.5],['B2',.5],
      ['Bb2',.5],['F2',.5],['Bb2',1],
      ['F2',.5],['C3',.5],['F2',.5],['C3',.5],
      ['A2',2],
      ['G2',.5],['D3',.5],['G2',.5],['D3',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['G2',.5],['D2',.5],['G2',.5],['D2',.5],
      ['D2',2],
    ];
    this.loop(mel, bas, bpm, 'triangle', 'triangle');
  }

  playBattle() {
    // Energetic — A minor, BPM 150 with full drum kit
    const bpm = 150;
    const mel = [
      ['A5',.25],['R',.25],['C6',.5],['B5',.5],['A5',.5],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['E5',.25],['R',.25],['G5',.5],['F5',.5],['E5',.5],
      ['A5',1.5],['R',.5],
      ['C6',.5],['B5',.5],['A5',.5],['G5',.5],
      ['F5',.5],['E5',.5],['D5',.5],['C5',.5],
      ['D5',.25],['E5',.25],['F5',.5],['G5',.5],['A5',.5],
      ['A5',2],
      ['E5',.5],['F5',.5],['G5',.5],['A5',.5],
      ['B5',.5],['C6',.5],['B5',.5],['A5',.5],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['E5',2],
      ['A5',.5],['G5',.5],['F5',.5],['E5',.5],
      ['D5',.5],['E5',.5],['F5',.5],['G5',.5],
      ['A5',.5],['C6',.5],['B5',.5],['A5',.5],
      ['A5',2],
    ];
    const bas = [
      ['A2',.25],['R',.25],['A3',.5],['R',.5],['E3',.5],
      ['G2',.5],['R',.5],['G3',.5],['R',.5],
      ['E2',.25],['R',.25],['E3',.5],['R',.5],['B2',.5],
      ['A2',1.5],['R',.5],
      ['C3',.5],['R',.5],['G3',.5],['R',.5],
      ['F2',.5],['R',.5],['C3',.5],['R',.5],
      ['D3',.5],['R',.5],['A2',.5],['E2',.5],
      ['A2',2],
      ['E3',.5],['R',.5],['E3',.5],['A2',.5],
      ['G2',.5],['R',.5],['G3',.5],['R',.5],
      ['F3',.5],['R',.5],['C3',.5],['G2',.5],
      ['E2',2],
      ['A2',.5],['R',.5],['E3',.5],['A2',.5],
      ['G2',.5],['R',.5],['D3',.5],['G2',.5],
      ['A2',.5],['R',.5],['E3',.5],['A2',.5],
      ['A2',2],
    ];
    // Drum grid: 32 beats total (8 bars × 4 beats)
    const kicks   = [];
    const snares  = [];
    const hihats  = [];
    for (let bar = 0; bar < 8; bar++) {
      const o = bar * 4;
      kicks.push(o, o + 2);
      snares.push(o + 1, o + 3);
      for (let h = 0; h < 8; h++) hihats.push(o + h * 0.5);
    }
    this.loop(mel, bas, bpm, 'triangle', 'sawtooth',
      { beats: 32, kicks, snares, hihats });
  }

  playBoss() {
    // Epic — D minor, BPM 138, heavy drums
    const bpm = 138;
    const mel = [
      ['R',.25],['D5',.25],['D5',.25],['Eb5',.25],
      ['D5',.5],['C5',.25],['D5',.25],['Bb4',.5],['R',.5],
      ['R',.25],['F5',.25],['F5',.25],['G5',.25],
      ['F5',.5],['Eb5',.25],['F5',.25],['D5',.5],['R',.5],
      ['R',.25],['G5',.25],['G5',.25],['Ab5',.25],
      ['G5',.5],['F5',.25],['G5',.25],['Eb5',.5],['R',.5],
      ['A5',.25],['Bb5',.25],['A5',.25],['G5',.25],
      ['F5',.5],['Eb5',.5],['D5',1],
      ['R',.25],['D5',.25],['Eb5',.25],['D5',.25],
      ['C5',.5],['D5',.5],['Bb4',.5],['R',.5],
      ['F5',.25],['G5',.25],['F5',.25],['Eb5',.25],
      ['D5',.5],['C5',.5],['Bb4',.5],['R',.5],
      ['Bb4',.25],['C5',.25],['D5',.25],['Eb5',.25],
      ['F5',.5],['G5',.5],['A5',.5],['R',.5],
      ['Bb5',.5],['A5',.5],['G5',.5],['F5',.5],
      ['D5',2],
    ];
    const bas = [
      ['D2',.25],['R',.25],['D3',.5],['R',.5],['A2',.5],
      ['Bb2',.5],['R',.5],['A2',.5],['G2',.5],
      ['F2',.25],['R',.25],['F3',.5],['R',.5],['C3',.5],
      ['D3',.5],['R',.5],['D2',.5],['R',.5],
      ['G2',.25],['R',.25],['G3',.5],['R',.5],['D3',.5],
      ['Eb3',.5],['R',.5],['Bb2',.5],['R',.5],
      ['A2',.5],['Bb2',.5],['A2',.5],['G2',.5],
      ['F2',.5],['Eb2',.5],['D2',1],
      ['D2',.5],['R',.5],['D3',.5],['R',.5],
      ['C3',.5],['G2',.5],['Bb2',.5],['R',.5],
      ['F2',.5],['R',.5],['F3',.5],['C3',.5],
      ['D2',.5],['Bb1',.5],['A1',.5],['R',.5],
      ['Bb1',.5],['F2',.5],['Bb2',.5],['Eb3',.5],
      ['F3',.5],['G3',.5],['A3',.5],['R',.5],
      ['Bb2',.5],['A2',.5],['G2',.5],['F2',.5],
      ['D2',2],
    ];
    // 16 bars × 4 beats = 64 beats, half-time feel
    const kicks  = [];
    const snares = [];
    const hihats = [];
    for (let bar = 0; bar < 16; bar++) {
      const o = bar * 4;
      kicks.push(o, o + 2.5);
      snares.push(o + 2);
      for (let h = 0; h < 8; h++) hihats.push(o + h * 0.5);
    }
    this.loop(mel, bas, bpm, 'sawtooth', 'sawtooth',
      { beats: 64, kicks, snares, hihats });
  }

  playVictory() {
    if (!this.isInit) return;
    this.stopAll();
    const bpm = 145;
    const mel = [
      ['C5',.25],['C5',.25],['C5',.25],['C5',.5],['E5',.25],
      ['G5',.25],['C6',.5],['C6',.25],['B5',.25],['A5',.25],
      ['B5',.25],['C6',1.5],
    ];
    const now = this.audioCtx.currentTime + 0.05;
    this.schedule(mel, bpm, 'triangle', 0.42, now);
    // Quick fanfare kick hits
    [0, 0.165, 0.33].forEach(d => this.kick(now + d, 0.4));
  }

  playGameOver() {
    if (!this.isInit) return;
    this.stopAll();
    const mel = [
      ['E4',.5],['D4',.5],['C4',.75],['B3',.25],
      ['A3',1],['R',.5],['A3',.5],
      ['G3',1],['R',.5],['G3',.5],
      ['F3',2.5],
    ];
    this.schedule(mel, 66, 'triangle', 0.28, this.audioCtx.currentTime + 0.05);
  }

  playEnding() {
    // Emotional — C major, BPM 88
    const bpm = 88;
    const mel = [
      ['G5',.5],['E5',.5],['C5',.5],['E5',.5],
      ['G5',.5],['C6',.5],['B5',.5],['A5',.5],
      ['G5',1],['E5',.5],['G5',.5],
      ['C6',2],
      ['E5',.5],['F5',.5],['G5',.5],['A5',.5],
      ['Bb5',.5],['A5',.5],['G5',.5],['F5',.5],
      ['E5',.5],['D5',.5],['C5',.5],['D5',.5],
      ['E5',2],
      ['C5',.5],['E5',.5],['G5',.5],['C6',.5],
      ['E6',.5],['D6',.5],['C6',.5],['B5',.5],
      ['A5',.5],['G5',.5],['F5',.5],['E5',.5],
      ['C5',2],
      ['G5',.5],['E5',.5],['C5',.5],['E5',.5],
      ['G5',.5],['C6',.5],['B5',.5],['A5',.5],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['C5',2],
    ];
    const bas = [
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['E3',.5],['C3',.5],['G3',.5],['F3',.5],
      ['E3',1],['C3',.5],['E3',.5],
      ['C3',2],
      ['C3',.5],['G2',.5],['C3',.5],['A2',.5],
      ['Bb2',.5],['F2',.5],['G2',.5],['F2',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['C3',2],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['C3',.5],['G2',.5],['E3',.5],['G3',.5],
      ['F3',.5],['C3',.5],['F2',.5],['G2',.5],
      ['C2',2],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['C3',.5],['G2',.5],['G3',.5],['F3',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['C2',2],
    ];
    this.loop(mel, bas, bpm, 'triangle', 'triangle');
  }

  // ── Sound Effects ─────────────────────────────────────────
  sfx(type) {
    if (!this.isInit || this.muted) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const tone = (f1, f2, dur, wave, vol, delay = 0) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      o.type = wave;
      o.frequency.setValueAtTime(f1, now + delay);
      if (f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, now + delay + dur);
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(vol, now + delay + 0.006);
      g.gain.linearRampToValueAtTime(vol * 0.6, now + delay + dur * 0.4);
      g.gain.linearRampToValueAtTime(0, now + delay + dur);
      o.connect(lp); lp.connect(g); g.connect(this.masterGain);
      o.start(now + delay); o.stop(now + delay + dur + 0.02);
    };

    switch (type) {
      case 'attack':
        this.kick(now, 0.38);
        tone(320, 110, 0.12, 'sawtooth', 0.32, 0.02);
        break;
      case 'hit':
        tone(280, 100, 0.11, 'sawtooth', 0.38);
        break;
      case 'magic':
        [0, 0.08, 0.16, 0.24].forEach((d, i) =>
          tone(440 + i * 180, 880 + i * 180, 0.22, 'sine', 0.22, d));
        break;
      case 'heal':
        [523, 659, 784, 1047].forEach((f, i) =>
          tone(f, f, 0.32, 'sine', 0.18, i * 0.1));
        break;
      case 'levelup':
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
          tone(f, f, 0.16, 'triangle', 0.25, i * 0.1));
        this.kick(now, 0.3);
        break;
      case 'cursor':
        tone(1100, 1100, 0.045, 'sine', 0.1);
        break;
      case 'open':
        [440, 550, 660, 880].forEach((f, i) =>
          tone(f, f, 0.1, 'triangle', 0.12, i * 0.055));
        break;
      case 'die':
        tone(380, 45, 0.55, 'sawtooth', 0.48);
        this.kick(now, 0.5);
        break;
      case 'shop':
        [660, 880, 1100].forEach((f, i) =>
          tone(f, f, 0.13, 'triangle', 0.18, i * 0.075));
        break;
    }
  }

  // ── Mute toggle ───────────────────────────────────────────
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : this.volume;
    return this.muted;
  }
}

const musicEngine = new MusicEngine();

function toggleMusic() {
  musicEngine.init();
  musicEngine.resume();
  const muted = musicEngine.toggleMute();
  const btn = document.getElementById('music-toggle');
  if (btn) btn.classList.toggle('muted', muted);
}
