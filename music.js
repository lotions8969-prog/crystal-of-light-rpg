class MusicEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isInit = false;
    this.loopId = 0;
    this.volume = 0.4;
    this.muted = false;
  }

  init() {
    if (this.isInit) return;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = this.volume;
    this.masterGain.connect(this.audioCtx.destination);
    this.isInit = true;
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
  }

  freq(n) {
    if (n === 'R') return 0;
    const map = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
    const m = n.match(/^([A-G]#?b?)(\d)$/);
    if (!m) return 0;
    return 440 * Math.pow(2, ((parseInt(m[2]) - 4) * 12 + map[m[1]] - 9) / 12);
  }

  note(f, t, dur, wave, vol, g) {
    if (!f || !this.isInit) return;
    const o = this.audioCtx.createOscillator();
    const ng = this.audioCtx.createGain();
    o.type = wave;
    o.frequency.value = f;
    ng.gain.setValueAtTime(vol, t);
    ng.gain.setValueAtTime(vol, t + dur * 0.82);
    ng.gain.linearRampToValueAtTime(0, t + dur * 0.99);
    o.connect(ng);
    ng.connect(g || this.masterGain);
    o.start(t);
    o.stop(t + dur);
  }

  schedule(seq, bpm, wave, vol, t0, g) {
    const b = 60 / bpm;
    let t = t0;
    for (const [n, beats] of seq) {
      const f = this.freq(n);
      if (f > 0) this.note(f, t, b * beats, wave, vol, g);
      t += b * beats;
    }
    return t;
  }

  seqLen(seq, bpm) {
    return seq.reduce((s, [, b]) => s + b, 0) * (60 / bpm);
  }

  stopAll() {
    this.loopId++;
    if (!this.audioCtx) return;
    this.audioCtx.close();
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.audioCtx.destination);
  }

  loop(mel, bas, bpm, mWave, bWave) {
    if (!this.isInit) return;
    this.stopAll();
    const id = this.loopId;
    const len = this.seqLen(mel, bpm);
    const go = (t) => {
      if (this.loopId !== id) return;
      this.schedule(mel, bpm, mWave || 'square', 0.28, t);
      if (bas) this.schedule(bas, bpm, bWave || 'triangle', 0.18, t);
      setTimeout(() => go(t + len), (len - 0.5) * 1000);
    };
    go(this.audioCtx.currentTime + 0.05);
  }

  playField() {
    const bpm = 112;
    const mel = [
      ['C5',.5],['E5',.5],['G5',.5],['E5',.5],
      ['D5',.5],['F5',.5],['A5',.5],['F5',.5],
      ['E5',.5],['G5',.5],['B5',.5],['G5',.5],
      ['C6',1.5],['R',.5],
      ['B5',.5],['A5',.5],['G5',.5],['A5',.5],
      ['F5',.5],['E5',.5],['D5',.5],['E5',.5],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['G5',2],
      ['E5',.5],['G5',.5],['C6',.5],['G5',.5],
      ['F5',.5],['A5',.5],['C6',.5],['A5',.5],
      ['D5',.5],['F5',.5],['A5',.5],['F5',.5],
      ['G5',2],
      ['C5',.5],['E5',.5],['G5',.5],['E5',.5],
      ['A4',.5],['C5',.5],['E5',.5],['C5',.5],
      ['F4',.5],['A4',.5],['C5',.5],['A4',.5],
      ['G4',2],
    ];
    const bas = [
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['D3',.5],['A2',.5],['D3',.5],['A2',.5],
      ['E3',.5],['B2',.5],['E3',.5],['B2',.5],
      ['C3',1],['G2',1],
      ['G3',.5],['D3',.5],['G3',.5],['D3',.5],
      ['F3',.5],['C3',.5],['F3',.5],['C3',.5],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['G2',2],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['F3',.5],['C3',.5],['F3',.5],['C3',.5],
      ['D3',.5],['A2',.5],['D3',.5],['A2',.5],
      ['G2',2],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['A2',.5],['E2',.5],['A2',.5],['E2',.5],
      ['F2',.5],['C3',.5],['F2',.5],['C3',.5],
      ['G2',2],
    ];
    this.loop(mel, bas, bpm, 'square', 'triangle');
  }

  playBattle() {
    const bpm = 148;
    const mel = [
      ['D5',.25],['E5',.25],['F5',.5],['G5',.5],['A5',.5],
      ['Bb5',.5],['A5',.5],['G5',.5],['F5',.5],
      ['E5',.25],['F5',.25],['G5',.5],['A5',.5],['Bb5',.5],
      ['C6',1.5],['R',.5],
      ['A5',.5],['G5',.5],['F5',.5],['E5',.5],
      ['D5',.25],['E5',.25],['F5',.5],['E5',.5],['D5',.5],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['D5',2],
      ['F5',.5],['G5',.5],['A5',.5],['Bb5',.5],
      ['C6',.5],['Bb5',.5],['A5',.5],['G5',.5],
      ['F5',.5],['E5',.5],['D5',.5],['C5',.5],
      ['D5',2],
      ['G5',.5],['F5',.5],['E5',.5],['D5',.5],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['E5',.5],['D5',.5],['C5',.5],['Bb4',.5],
      ['A4',2],
    ];
    const bas = [
      ['D3',.25],['R',.25],['D3',.5],['R',.5],['A3',.5],
      ['Bb3',.5],['R',.5],['A3',.5],['G3',.5],
      ['E3',.25],['R',.25],['E3',.5],['R',.5],['Bb3',.5],
      ['C3',1.5],['R',.5],
      ['F3',.5],['R',.5],['F3',.5],['E3',.5],
      ['D3',.25],['R',.25],['D3',.5],['R',.5],['A3',.5],
      ['C3',.5],['R',.5],['G3',.5],['R',.5],
      ['D3',2],
      ['F3',.5],['R',.5],['F3',.5],['R',.5],
      ['C3',.5],['R',.5],['C3',.5],['G3',.5],
      ['F3',.5],['R',.5],['D3',.5],['C3',.5],
      ['D3',2],
      ['G3',.5],['R',.5],['G3',.5],['D3',.5],
      ['C3',.5],['R',.5],['C3',.5],['R',.5],
      ['E3',.5],['R',.5],['C3',.5],['Bb2',.5],
      ['A2',2],
    ];
    this.loop(mel, bas, bpm, 'square', 'triangle');
  }

  playBoss() {
    const bpm = 162;
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
    this.loop(mel, bas, bpm, 'sawtooth', 'square');
  }

  playTown() {
    const bpm = 100;
    const mel = [
      ['F5',.5],['G5',.5],['A5',.5],['Bb5',.5],
      ['C6',.5],['A5',.5],['F5',1],
      ['G5',.5],['A5',.5],['Bb5',.5],['G5',.5],
      ['F5',2],
      ['C5',.5],['D5',.5],['E5',.5],['F5',.5],
      ['G5',.5],['A5',.5],['Bb5',1],
      ['A5',.5],['G5',.5],['F5',.5],['G5',.5],
      ['A5',2],
      ['F5',.5],['A5',.5],['C6',.5],['A5',.5],
      ['Bb5',.5],['G5',.5],['E5',.5],['C5',.5],
      ['F4',.5],['A4',.5],['C5',.5],['E5',.5],
      ['F5',2],
      ['D5',.5],['F5',.5],['A5',.5],['F5',.5],
      ['G5',.5],['E5',.5],['C5',.5],['G4',.5],
      ['A4',.5],['C5',.5],['E5',.5],['G5',.5],
      ['F5',2],
    ];
    const bas = [
      ['F3',.5],['C3',.5],['F3',.5],['C3',.5],
      ['C3',.5],['G2',.5],['F3',1],
      ['G3',.5],['D3',.5],['G3',.5],['D3',.5],
      ['F3',2],
      ['C3',.5],['G2',.5],['C3',.5],['G2',.5],
      ['G2',.5],['D3',.5],['G2',1],
      ['F3',.5],['C3',.5],['F3',.5],['C3',.5],
      ['A2',2],
      ['F2',.5],['C3',.5],['F2',.5],['C3',.5],
      ['Bb2',.5],['F2',.5],['C3',.5],['G2',.5],
      ['F2',.5],['C2',.5],['F2',.5],['C3',.5],
      ['F2',2],
      ['D3',.5],['A2',.5],['D3',.5],['A2',.5],
      ['G2',.5],['D3',.5],['G2',.5],['D2',.5],
      ['A2',.5],['E3',.5],['A2',.5],['E3',.5],
      ['F2',2],
    ];
    this.loop(mel, bas, bpm, 'square', 'triangle');
  }

  playVictory() {
    if (!this.isInit) return;
    this.stopAll();
    const id = this.loopId;
    const mel = [
      ['C5',.25],['C5',.25],['C5',.25],['C5',.5],['E5',.25],
      ['G5',.25],['C6',.5],['C6',.25],['B5',.25],['A5',.25],
      ['B5',.25],['C6',1.5],
    ];
    this.schedule(mel, 140, 'square', 0.4, this.audioCtx.currentTime + 0.05);
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
    this.schedule(mel, 70, 'triangle', 0.3, this.audioCtx.currentTime + 0.05);
  }

  playEnding() {
    const bpm = 90;
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
    this.loop(mel, bas, bpm, 'square', 'triangle');
  }

  sfx(type) {
    if (!this.isInit || this.muted) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const mk = (f1, f2, dur, wave, vol, delay=0) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = wave;
      o.frequency.setValueAtTime(f1, now + delay);
      if (f2 !== f1) o.frequency.linearRampToValueAtTime(f2, now + delay + dur);
      g.gain.setValueAtTime(vol, now + delay);
      g.gain.linearRampToValueAtTime(0, now + delay + dur);
      o.connect(g); g.connect(this.masterGain);
      o.start(now + delay); o.stop(now + delay + dur + 0.01);
    };
    switch(type) {
      case 'attack': mk(220, 80, 0.12, 'square', 0.45); break;
      case 'hit':    mk(300, 120, 0.1, 'sawtooth', 0.4); break;
      case 'magic':  [0,0.1,0.2].forEach(d => mk(500+d*200, 900+d*200, 0.18, 'sine', 0.25, d)); break;
      case 'heal':   [523,659,784,1047].forEach((f,i) => mk(f, f, 0.28, 'sine', 0.2, i*0.1)); break;
      case 'levelup':[523,659,784,1047,784,1047,1319].forEach((f,i) => mk(f, f, 0.14, 'square', 0.28, i*0.1)); break;
      case 'cursor': mk(880, 880, 0.05, 'square', 0.12); break;
      case 'open':   [440,550,660].forEach((f,i) => mk(f, f, 0.1, 'square', 0.15, i*0.07)); break;
      case 'die':    mk(400, 50, 0.5, 'sawtooth', 0.5); break;
      case 'shop':   [660,880,1100].forEach((f,i) => mk(f, f, 0.12, 'square', 0.2, i*0.08)); break;
    }
  }

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
