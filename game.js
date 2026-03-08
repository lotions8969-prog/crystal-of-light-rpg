// ============================================================
//  光のクリスタル - Main Game Engine
// ============================================================

let game;

// ─── Utility ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ============================================================
//  BattleRenderer — Canvas-based CT-level battle visuals
// ============================================================
class BattleRenderer {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this.raf    = null;
    this.frame  = 0;
    this.anims  = {};
    this.spellFx = null;
    this.W = 640;
    this.H = 310;
  }

  mount(envEl) {
    if (this.canvas) this.canvas.remove();
    this.canvas = document.createElement('canvas');
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
    this.canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none';
    envEl.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  start() {
    this.stop();
    const tick = () => {
      this.frame++;
      if (this.ctx) this._draw();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.canvas) { this.canvas.remove(); this.canvas = null; this.ctx = null; }
  }

  triggerAnim(id, type) {
    const dur = type === 'attack' ? 36 : 24;
    this.anims[id] = { type, start: this.frame, dur };
  }

  triggerSpell(spellType) {
    this.spellFx = { type: spellType, start: this.frame, dur: 70 };
  }

  _getAnim(id) {
    const a = this.anims[id];
    if (!a) return { x: 0, y: 0 };
    const t = (this.frame - a.start) / a.dur;
    if (t >= 1) { delete this.anims[id]; return { x: 0, y: 0 }; }
    if (a.type === 'attack') {
      const curve = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;
      return { x: curve * this.W * 0.42, y: -curve * 22 };
    }
    if (a.type === 'hurt') return { x: Math.sin(t * Math.PI * 6) * 14, y: Math.sin(t * Math.PI * 3) * 5 };
    return { x: 0, y: 0 };
  }

  _draw() {
    const g = window.game;
    if (!g || !g.battle) return;
    const { ctx, W, H, frame } = this;
    ctx.clearRect(0, 0, W, H);

    const area = g.areaId;
    if      (area === 'cave')    this._bgCave();
    else if (area === 'castle')  this._bgCastle();
    else                          this._bgForest();

    // Spell effects drawn between background and characters
    if (this.spellFx) {
      const t = (frame - this.spellFx.start) / this.spellFx.dur;
      if (t >= 1) this.spellFx = null;
      else this._drawSpellFx(this.spellFx.type, t);
    }

    // Draw party members — CT-style: SMALL characters left side, BIG enemy right side
    // Characters at ~20-25% of canvas height (CT proportions)
    const members = this._members(g);
    const slots = [
      { x: W*0.13, y: H*0.90, sc: 2.2 },   // hero  — front center
      { x: W*0.04, y: H*0.80, sc: 1.9 },   // erina — back left
      { x: W*0.22, y: H*0.86, sc: 2.3 },   // gard  — front right
      { x: W*0.10, y: H*0.73, sc: 1.8 },   // luna  — far back
    ];
    members.forEach((m, i) => {
      const sl = slots[i]; if (!sl) return;
      const bob  = Math.sin(frame * 0.05 + i * 1.3) * 2.5;
      const anim = this._getAnim(m.id);
      const px = sl.x + anim.x;
      const py = sl.y + bob + anim.y;
      this._drawShadow(px, py, sl.sc * 12);
      ctx.save();
      if (!m.alive) { ctx.globalAlpha = 0.22; ctx.filter = 'grayscale(100%)'; }
      ctx.translate(px, py);
      const fn = this['_c_' + m.id];
      if (fn) fn.call(this, ctx, sl.sc);
      else this._c_hero(ctx, sl.sc);
      ctx.restore();
    });
  }

  _members(g) {
    const p = g.player;
    const list = [{ id:'hero', alive: p.hp > 0 }];
    g.party.forEach(id => {
      const pm = g.partyData[id];
      if (pm) list.push({ id, alive: pm.alive && pm.hp > 0 });
    });
    return list;
  }

  _drawShadow(cx, cy, radius = 22) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.save(); ctx.scale(1, 0.26);
    ctx.beginPath(); ctx.arc(cx, cy/0.26, radius, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── SPELL VISUAL EFFECTS ──────────────────────────────────
  _drawSpellFx(type, t) {
    const { ctx, W, H } = this;
    const pulse = Math.sin(t * Math.PI);
    const easeOut = 1 - (1 - t) * (1 - t);

    if (type === 'fire') {
      // Expanding fireball burst flying to enemy (right side)
      const cx = W * 0.72, cy = H * 0.42;
      const r = 190 * pulse;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      fg.addColorStop(0,    `rgba(255,220,80,${pulse*0.85})`);
      fg.addColorStop(0.35, `rgba(255,80,20,${pulse*0.6})`);
      fg.addColorStop(0.65, `rgba(180,20,0,${pulse*0.3})`);
      fg.addColorStop(1,    'transparent');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
      // Flying fireballs
      for (let i = 0; i < 9; i++) {
        const ft = (t * 1.8 + i * 0.13) % 1;
        const fx = W * 0.2 + ft * W * 0.55;
        const fy = H * 0.38 + Math.sin(ft * Math.PI * 3 + i) * H * 0.14;
        const fr = (5 + i % 3 * 5) * pulse;
        const flg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
        flg.addColorStop(0, 'rgba(255,240,180,0.95)');
        flg.addColorStop(0.5, 'rgba(255,100,20,0.75)');
        flg.addColorStop(1, 'transparent');
        ctx.fillStyle = flg; ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI*2); ctx.fill();
      }
      // Scorch marks at enemy
      ctx.strokeStyle = `rgba(255,120,20,${pulse*0.6})`; ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * 0.4 + t * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.4);
        ctx.stroke();
      }
    } else if (type === 'ice') {
      const cx = W * 0.68, cy = H * 0.45;
      const r = 200 * pulse;
      const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      ig.addColorStop(0,   `rgba(200,240,255,${pulse*0.75})`);
      ig.addColorStop(0.4, `rgba(80,160,220,${pulse*0.5})`);
      ig.addColorStop(0.7, `rgba(30,80,160,${pulse*0.25})`);
      ig.addColorStop(1,   'transparent');
      ctx.fillStyle = ig; ctx.fillRect(0, 0, W, H);
      // Ice crystals
      for (let i = 0; i < 12; i++) {
        const px = W * (0.35 + (i % 5) * 0.12);
        const py = H * 0.18 + Math.sin(t * Math.PI * 2 + i * 0.6) * H * 0.28;
        const sz = (6 + i % 4 * 5) * pulse;
        ctx.save(); ctx.translate(px, py); ctx.rotate(t * Math.PI * 2 + i * 0.5);
        ctx.strokeStyle = `rgba(180,220,255,${pulse*0.85})`; ctx.lineWidth = 1.5;
        for (let a = 0; a < 6; a++) {
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.lineTo(Math.cos(a*Math.PI/3)*sz, Math.sin(a*Math.PI/3)*sz);
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(Math.cos(a*Math.PI/3)*sz*0.5, Math.sin(a*Math.PI/3)*sz*0.5);
          ctx.lineTo(Math.cos(a*Math.PI/3+0.4)*sz*0.7, Math.sin(a*Math.PI/3+0.4)*sz*0.7);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else if (type === 'thunder' || type === 'lightning') {
      // Dramatic lightning bolt from sky
      const ex = W * 0.70, ey = H * 0.55;
      ctx.fillStyle = `rgba(220,220,255,${pulse*0.4})`; ctx.fillRect(0, 0, W, H);
      for (let b = 0; b < 3; b++) {
        ctx.save();
        ctx.strokeStyle = b === 0 ? `rgba(255,255,255,${pulse*0.95})` : `rgba(180,180,255,${pulse*(0.7-b*0.2)})`;
        ctx.lineWidth = b === 0 ? 4 : (3-b*0.8);
        ctx.shadowColor = '#8080ff'; ctx.shadowBlur = b === 0 ? 25 : 10;
        ctx.beginPath();
        let bx = ex + (b-1) * 12;
        ctx.moveTo(bx, 0);
        for (let s = 0; s < 9; s++) {
          bx += (Math.sin(s * 2.8 + b * 1.5) * 22);
          ctx.lineTo(bx, ey * (s+1) / 9);
        }
        ctx.lineTo(ex, ey); ctx.stroke();
        ctx.restore();
      }
      const lg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 70*pulse);
      lg.addColorStop(0, `rgba(255,255,220,${pulse*0.9})`);
      lg.addColorStop(0.4, `rgba(160,160,255,${pulse*0.5})`);
      lg.addColorStop(1, 'transparent');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(ex, ey, 70*pulse, 0, Math.PI*2); ctx.fill();
    } else if (type === 'heal' || type === 'healall') {
      ctx.fillStyle = `rgba(80,200,80,${pulse*0.12})`; ctx.fillRect(0, 0, W*0.42, H);
      for (let i = 0; i < 28; i++) {
        const sx = W * (0.02 + (i % 9) * 0.045);
        const sy = ((t * H * 1.6 + i * H / 14) % H);
        const sr = (2.5 + i % 4 * 2) * pulse;
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr*2.5);
        sg.addColorStop(0, 'rgba(200,255,180,0.95)');
        sg.addColorStop(0.4, 'rgba(100,220,80,0.7)');
        sg.addColorStop(1, 'transparent');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, sy, sr*2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(255,255,200,${pulse*0.9})`;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(t*Math.PI*4+i);
        ctx.fillRect(-sr*0.4, -sr, sr*0.8, sr*2);
        ctx.fillRect(-sr, -sr*0.4, sr*2, sr*0.8);
        ctx.restore();
      }
    } else if (type === 'dark') {
      const cx = W*0.65, cy = H*0.42;
      const r = 230 * pulse;
      const dg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      dg.addColorStop(0,   `rgba(90,0,140,${pulse*0.88})`);
      dg.addColorStop(0.4, `rgba(45,0,80,${pulse*0.55})`);
      dg.addColorStop(0.7, `rgba(20,0,40,${pulse*0.28})`);
      dg.addColorStop(1,   'transparent');
      ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 8; i++) {
        const angle = i * Math.PI / 4 + t * Math.PI;
        ctx.save(); ctx.strokeStyle = `rgba(180,0,255,${pulse*0.75})`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        for (let s = 0; s < 7; s++) {
          const fr2 = s/6 * r * 0.85;
          const wave = Math.sin(s*0.9 + t*12 + i) * 20;
          ctx.lineTo(cx + Math.cos(angle)*fr2 + Math.cos(angle+Math.PI/2)*wave,
                     cy + Math.sin(angle)*fr2 + Math.sin(angle+Math.PI/2)*wave);
        }
        ctx.stroke(); ctx.restore();
      }
    } else if (type === 'holy') {
      ctx.fillStyle = `rgba(255,255,220,${pulse*0.22})`; ctx.fillRect(0, 0, W, H);
      const ox = W*0.22, oy = -20;
      for (let i = 0; i < 14; i++) {
        const angle = (i/14)*Math.PI*2 + t*0.8;
        const rayG = ctx.createLinearGradient(ox, oy, ox+Math.cos(angle)*280, oy+Math.sin(angle)*280);
        rayG.addColorStop(0, `rgba(255,255,200,${pulse*0.55})`);
        rayG.addColorStop(1, 'transparent');
        ctx.fillStyle = rayG; ctx.save(); ctx.translate(ox, oy); ctx.rotate(angle);
        ctx.fillRect(-3, 0, 6, 280*pulse); ctx.restore();
      }
      const hg = ctx.createRadialGradient(W*0.22, H*0.3, 0, W*0.22, H*0.3, 90*pulse);
      hg.addColorStop(0, `rgba(255,255,220,${pulse*0.85})`);
      hg.addColorStop(0.5, `rgba(200,220,255,${pulse*0.4})`);
      hg.addColorStop(1, 'transparent');
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    }
  }

  // ── FOREST BACKGROUND ─────────────────────────────────────
  _bgForest() {
    const { ctx, W, H, frame } = this;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H*0.6);
    sky.addColorStop(0,   '#0e2888');
    sky.addColorStop(0.5, '#1e50d8');
    sky.addColorStop(1,   '#5898f8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H*0.6);

    // Sun
    const sunG = ctx.createRadialGradient(W*0.75, H*0.12, 2, W*0.75, H*0.12, 36);
    sunG.addColorStop(0, 'rgba(255,240,180,0.95)');
    sunG.addColorStop(0.4, 'rgba(255,200,80,0.5)');
    sunG.addColorStop(1, 'transparent');
    ctx.fillStyle = sunG; ctx.fillRect(W*0.55, 0, W*0.4, H*0.3);
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath(); ctx.arc(W*0.75, H*0.12, 18, 0, Math.PI*2); ctx.fill();

    // Clouds
    [[0.12,0.1,32,0.14],[0.40,0.07,24,0.09],[0.64,0.13,28,0.11]].forEach(([cx,cy,r,spd]) => {
      const ox = ((cx*W + frame*spd) % (W+80)) - 40;
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      [[0,0,r],[r*0.75,0,r*0.65],[-r*0.6,r*0.2,r*0.55],[r*0.25,-r*0.35,r*0.5]].forEach(([dx,dy,rad]) => {
        ctx.beginPath(); ctx.arc(ox+dx, cy*H+dy, rad, 0, Math.PI*2); ctx.fill();
      });
    });

    // Far mountains
    ctx.fillStyle = '#1a4882';
    ctx.beginPath(); ctx.moveTo(0, H*0.54);
    [0,0.07,0.14,0.22,0.30,0.38,0.46,0.55,0.63,0.71,0.79,0.87,0.95,1.0].forEach((x,i) => {
      const peaks = [0.5,0.42,0.48,0.38,0.44,0.4,0.46,0.36,0.43,0.41,0.45,0.37,0.44,0.5];
      ctx.lineTo(x*W, peaks[i]*H);
    });
    ctx.lineTo(W,H*0.54); ctx.closePath(); ctx.fill();

    // Mid hills
    ctx.fillStyle = '#1e6820';
    ctx.beginPath(); ctx.moveTo(0,H);
    ctx.lineTo(0, H*0.58);
    ctx.quadraticCurveTo(W*0.12,H*0.48, W*0.25,H*0.56);
    ctx.quadraticCurveTo(W*0.38,H*0.62, W*0.50,H*0.53);
    ctx.quadraticCurveTo(W*0.62,H*0.44, W*0.75,H*0.54);
    ctx.quadraticCurveTo(W*0.88,H*0.62, W,H*0.57);
    ctx.lineTo(W,H); ctx.closePath(); ctx.fill();

    // Back trees
    [0.0,0.09,0.19,0.30,0.62,0.72,0.82,0.91,0.99].forEach(tx => {
      this._drawTree(tx*W, H*0.6, H*0.20, '#12400e','#1a5e14');
    });

    // Ground
    const grd = ctx.createLinearGradient(0,H*0.62,0,H);
    grd.addColorStop(0, '#3c9430'); grd.addColorStop(0.3,'#2a7420');
    grd.addColorStop(0.6,'#1e5814'); grd.addColorStop(1,'#0e2c08');
    ctx.fillStyle = grd; ctx.fillRect(0, H*0.62, W, H*0.38);

    // Ground lines
    for (let i=0;i<4;i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, H*(0.62+i*0.08), W, 1.5);
    }

    // Grass tufts
    this._drawGrassTufts();

    // Front trees (edges)
    [[0.02,H*0.66,H*0.44,'#0a2e06','#163810'],
     [0.11,H*0.63,H*0.36,'#0c3408','#18481c'],
     [0.79,H*0.64,H*0.40,'#0a2e06','#163810'],
     [0.88,H*0.62,H*0.44,'#0c3408','#18481c'],
     [0.97,H*0.66,H*0.37,'#0a2e06','#163810']].forEach(([tx,ty,th,d,l]) => {
      this._drawTree(tx*W, ty, th, d, l);
    });

    // Foreground grass edge
    ctx.fillStyle = '#2a7020';
    ctx.beginPath();
    ctx.moveTo(0, H*0.64);
    for (let gx=0; gx<W; gx+=12) {
      ctx.lineTo(gx, H*0.64 - 4 - Math.sin(gx*0.08)*3);
      ctx.lineTo(gx+6, H*0.64 + 2);
    }
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  }

  _drawTree(cx, baseY, tH, dark, light) {
    const ctx = this.ctx;
    const tW = tH * 0.52;
    ctx.fillStyle = '#3c1a06';
    ctx.fillRect(cx-tH*0.04, baseY-tH*0.22, tH*0.08, tH*0.22+4);
    for (let lay=0;lay<3;lay++) {
      const ly = baseY - tH*(0.26 + lay*0.3);
      const lw = tW*(1.05 - lay*0.17);
      const lh = tH*0.38;
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.moveTo(cx,ly-lh); ctx.lineTo(cx+lw*0.52,ly+lh*0.08); ctx.lineTo(cx-lw*0.52,ly+lh*0.08); ctx.closePath(); ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.moveTo(cx-lw*0.52,ly-lh*0.12); ctx.lineTo(cx,ly-lh); ctx.lineTo(cx,ly+lh*0.08); ctx.lineTo(cx-lw*0.52,ly+lh*0.08); ctx.closePath(); ctx.fill();
    }
  }

  _drawGrassTufts() {
    const { ctx, W, H, frame } = this;
    [120,155,210,265,310,365,420,475,520].forEach((tx,i) => {
      const ty = H*0.645;
      ctx.strokeStyle = '#54b032'; ctx.lineWidth = 1.8;
      for (let g=0;g<3;g++) {
        const ang = -0.6 + g*0.55 + Math.sin(frame*0.04+i+g)*0.1;
        ctx.beginPath();
        ctx.moveTo(tx+g*5, ty);
        ctx.lineTo(tx+g*5 + Math.sin(ang)*9, ty-12+Math.cos(ang)*3);
        ctx.stroke();
      }
    });
  }

  // ── CAVE BACKGROUND ───────────────────────────────────────
  _bgCave() {
    const { ctx, W, H, frame } = this;

    // Dark base
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#08060a'); bg.addColorStop(0.4,'#100e0e');
    bg.addColorStop(0.7,'#181614'); bg.addColorStop(1,'#221e18');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Back wall stone blocks
    ctx.fillStyle = '#161210';
    ctx.fillRect(0,0,W,H*0.72);
    for (let row=0;row<7;row++) {
      for (let col=0;col<11;col++) {
        const bx = col*60 + (row%2===0?0:30);
        const by = row*22;
        ctx.fillStyle = `rgba(255,255,255,${(row+col)%3===0?0.04:0.015})`;
        ctx.fillRect(bx+1, by+1, 58, 20);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(bx, by, 60, 1.5);
        ctx.fillRect(bx, by, 1.5, 22);
      }
    }

    // Crystal formations
    this._drawCrystals(W*0.14, H*0.56, '#9040a8', frame);
    this._drawCrystals(W*0.71, H*0.50, '#4060cc', frame+5);
    this._drawCrystals(W*0.55, H*0.60, '#6040a0', frame+3);

    // Torches
    this._drawTorch(W*0.22, H*0.30, frame);
    this._drawTorch(W*0.78, H*0.30, frame+9);

    // Stalactites
    [0.06,0.14,0.22,0.31,0.40,0.50,0.60,0.69,0.78,0.86,0.93].forEach((sx,i) => {
      const len = H*(0.12 + (i%4)*0.055);
      const wid = 10 + (i%3)*5;
      ctx.fillStyle = '#1a1614';
      ctx.beginPath(); ctx.moveTo(sx*W-wid/2,0); ctx.lineTo(sx*W+wid/2,0); ctx.lineTo(sx*W,len); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#242018';
      ctx.fillRect(sx*W-2,0,4,len*0.55);
      // Drip highlight
      ctx.fillStyle = '#302820';
      ctx.fillRect(sx*W-1,0,2,3);
    });

    // Crystal ambient glow
    [[W*0.14,H*0.56,'#a040b8'],[W*0.71,H*0.50,'#4060cc']].forEach(([gx,gy,col]) => {
      const alpha = 0.12 + Math.sin(frame*0.055)*0.04;
      const glow = ctx.createRadialGradient(gx,gy,5,gx,gy,90);
      glow.addColorStop(0, col.replace('#','rgba(').replace(/(..)(..)(..)/, (_,r,g,b)=>`rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},${alpha})`));
      glow.addColorStop(1, 'transparent');
      try { ctx.fillStyle = glow; ctx.fillRect(gx-90,gy-90,180,180); } catch(e) {}
      const g2 = ctx.createRadialGradient(gx,gy,5,gx,gy,90);
      g2.addColorStop(0, `rgba(160,100,220,${alpha})`);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2; ctx.fillRect(gx-90,gy-90,180,180);
    });

    // Floor
    const floor = ctx.createLinearGradient(0,H*0.72,0,H);
    floor.addColorStop(0,'#2a2218'); floor.addColorStop(0.5,'#201a10'); floor.addColorStop(1,'#120e08');
    ctx.fillStyle = floor; ctx.fillRect(0,H*0.72,W,H*0.28);
    // Floor cracks/tiles
    for (let tx=0;tx<W;tx+=44) {
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(tx,H*0.72,1,H*0.28);
    }
    for (let ty=0;ty<5;ty++) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0,H*(0.72+ty*0.056),W,1);
    }
  }

  _drawTorch(x, y, frame) {
    const ctx = this.ctx;
    // Wall bracket
    ctx.fillStyle = '#604828';
    ctx.fillRect(x-5,y,10,14);
    ctx.fillStyle = '#4a3418';
    ctx.fillRect(x-4,y+2,8,10);
    // Flame glow
    const flicker = Math.sin(frame*0.22)*3;
    const glow = ctx.createRadialGradient(x,y-8,2,x,y-8,38);
    glow.addColorStop(0,`rgba(255,160,32,${0.22+Math.sin(frame*0.28)*0.07})`);
    glow.addColorStop(1,'transparent');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x,y-8,38,0,Math.PI*2); ctx.fill();
    // Flame layers
    [[12+flicker,'#cc3800'],[9+flicker,'#f07000'],[5+flicker,'#ffcc00']].forEach(([fh,col])=>{
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x,y-fh); ctx.lineTo(x+5,y-1); ctx.lineTo(x-5,y-1); ctx.closePath(); ctx.fill();
    });
  }

  _drawCrystals(cx, cy, color, frame) {
    const ctx = this.ctx;
    const pulse = 0.7 + Math.sin(frame*0.055)*0.15;
    [[0,0,13,26],[-17,14,9,20],[19,10,11,22]].forEach(([dx,dy,cw,ch]) => {
      ctx.save(); ctx.translate(cx+dx, cy+dy);
      const r=parseInt(color.slice(1,3),16), g=parseInt(color.slice(3,5),16), b=parseInt(color.slice(5,7),16);
      ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`;
      ctx.beginPath(); ctx.moveTo(0,-ch); ctx.lineTo(cw/2,0); ctx.lineTo(0,ch*0.18); ctx.lineTo(-cw/2,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath(); ctx.moveTo(-cw*0.2,-ch); ctx.lineTo(0,-ch*0.3); ctx.lineTo(-cw*0.42,0); ctx.closePath(); ctx.fill();
      ctx.restore();
    });
  }

  // ── CASTLE BACKGROUND ─────────────────────────────────────
  _bgCastle() {
    const { ctx, W, H, frame } = this;

    // Void
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#030010'); bg.addColorStop(0.5,'#06001a'); bg.addColorStop(1,'#0e0020');
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Energy clouds
    for (let i=0;i<4;i++) {
      const cx2 = W*(0.2+i*0.2);
      const cy2 = H*0.28;
      const phase = frame*0.018+i*1.8;
      const gx2 = cx2+Math.cos(phase)*22, gy2 = cy2+Math.sin(phase)*11;
      const eg = ctx.createRadialGradient(gx2,gy2,5,gx2,gy2,90);
      eg.addColorStop(0,`rgba(100,0,180,${0.16+Math.sin(phase)*0.06})`);
      eg.addColorStop(0.5,`rgba(50,0,90,0.08)`);
      eg.addColorStop(1,'transparent');
      ctx.fillStyle = eg; ctx.fillRect(0,0,W,H*0.8);
    }

    // Stone pillars
    [0.10, 0.90].forEach(px => {
      const x=px*W, pw=32;
      const pg = ctx.createLinearGradient(x-pw/2,0,x+pw/2,0);
      pg.addColorStop(0,'#150e20'); pg.addColorStop(0.3,'#1e1430'); pg.addColorStop(0.7,'#160c1e'); pg.addColorStop(1,'#0e0818');
      ctx.fillStyle = pg; ctx.fillRect(x-pw/2,0,pw,H*0.78);
      for (let sy=0;sy<H*0.78;sy+=32) {
        ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(x-pw/2,sy,pw,2);
      }
      ctx.fillStyle='rgba(80,40,120,0.3)'; ctx.fillRect(x-pw/2,0,3,H*0.78);
    });

    // Central energy vortex
    const cX=W*0.64, cY=H*0.35;
    const pulse = 0.85+Math.sin(frame*0.07)*0.15;
    const core = ctx.createRadialGradient(cX,cY,0,cX,cY,65*pulse);
    core.addColorStop(0,'rgba(220,120,255,0.65)'); core.addColorStop(0.35,'rgba(130,0,200,0.3)');
    core.addColorStop(0.65,'rgba(60,0,100,0.15)'); core.addColorStop(1,'transparent');
    ctx.fillStyle=core; ctx.fillRect(cX-80,cY-80,160,160);
    // Rings
    for (let r=1;r<=4;r++) {
      ctx.strokeStyle=`rgba(200,80,255,${0.45-r*0.08})`; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cX,cY,r*16*pulse,0,Math.PI*2); ctx.stroke();
    }
    // Core dot
    ctx.fillStyle='rgba(240,200,255,0.9)';
    ctx.beginPath(); ctx.arc(cX,cY,4*pulse,0,Math.PI*2); ctx.fill();

    // Flying particles
    for (let p=0;p<16;p++) {
      const px=((W*(p*0.065+0.02)+frame*(0.28+p*0.018))%W);
      const py=H*0.08+Math.sin(frame*0.04+p*0.85)*H*0.28;
      const pa=0.28+Math.sin(frame*0.1+p)*0.14;
      ctx.fillStyle=`rgba(160,80,255,${pa})`;
      ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fill();
    }

    // Floor
    const fl = ctx.createLinearGradient(0,H*0.68,0,H);
    fl.addColorStop(0,'#1c1030'); fl.addColorStop(0.5,'#140c24'); fl.addColorStop(1,'#0c0818');
    ctx.fillStyle=fl; ctx.fillRect(0,H*0.68,W,H*0.32);
    // Perspective floor tiles
    ctx.strokeStyle='rgba(80,40,120,0.35)'; ctx.lineWidth=1;
    for (let fy=0;fy<6;fy++) { ctx.beginPath(); ctx.moveTo(0,H*(0.68+fy*0.052)); ctx.lineTo(W,H*(0.68+fy*0.052)); ctx.stroke(); }
    for (let fv=0;fv<=8;fv++) { ctx.beginPath(); ctx.moveTo(W/2,H*0.68); ctx.lineTo(fv*W/8,H); ctx.stroke(); }
  }

  // ── CHARACTER DRAWINGS ────────────────────────────────────
  // All drawn with feet at (0,0), extending upward. Scale applied externally.

  _c_hero(ctx, scale = 2.2) {
    // Blue plate armor hero
    ctx.save(); ctx.scale(scale, scale);
    // --- Boots ---
    ctx.fillStyle='#1c2e70'; ctx.fillRect(-8,18,7,6); ctx.fillRect(1,18,7,6);
    ctx.fillStyle='#283ea0'; ctx.fillRect(-9,15,7,5); ctx.fillRect(0,15,7,5);
    // --- Legs ---
    ctx.fillStyle='#2e4aa8'; ctx.fillRect(-7,6,6,12); ctx.fillRect(1,6,6,12);
    ctx.fillStyle='#1e3488'; ctx.fillRect(-8,8,8,8); ctx.fillRect(0,8,8,8);
    // --- Belt ---
    ctx.fillStyle='#7a4a10'; ctx.fillRect(-10,4,20,4);
    ctx.fillStyle='#c89828'; ctx.fillRect(-2,5,4,3);
    // --- Body/Armor ---
    ctx.fillStyle='#3a60cc';
    ctx.fillRect(-10,-10,20,16);
    ctx.fillStyle='#2848a8'; ctx.fillRect(-10,-1,20,2);
    ctx.fillStyle='#5070d8'; ctx.fillRect(-8,-10,5,7);
    ctx.fillStyle='#2040a0'; ctx.fillRect(3,-10,5,7);
    // --- Pauldrons ---
    ctx.fillStyle='#4868c8'; ctx.fillRect(-14,-12,6,8); ctx.fillRect(8,-12,6,8);
    ctx.fillStyle='#6088e0'; ctx.fillRect(-14,-12,6,3); ctx.fillRect(8,-12,6,3);
    // --- Neck ---
    ctx.fillStyle='#e8b870'; ctx.fillRect(-3,-15,6,6);
    // --- Head ---
    ctx.fillStyle='#f0c880'; ctx.fillRect(-6,-25,12,12);
    ctx.fillStyle='#c8904a'; ctx.fillRect(-6,-14,12,1);
    // --- Hair ---
    ctx.fillStyle='#281008'; ctx.fillRect(-7,-26,14,4); ctx.fillRect(-7,-26,2,8); ctx.fillRect(5,-26,2,6);
    // --- Helmet ---
    ctx.fillStyle='#3858c0'; ctx.fillRect(-8,-30,16,8);
    ctx.fillStyle='#5070d0'; ctx.fillRect(-6,-30,12,3);
    ctx.fillStyle='#7090e0'; ctx.fillRect(-2,-35,4,7);
    ctx.fillStyle='#90b0f0'; ctx.fillRect(-1,-33,2,4);
    // --- Face ---
    ctx.fillStyle='#1a1838'; ctx.fillRect(-3,-22,3,3); ctx.fillRect(1,-22,3,3);
    ctx.fillStyle='#ffffff'; ctx.fillRect(-2,-22,1,1); ctx.fillRect(2,-22,1,1);
    ctx.fillStyle='#c87848'; ctx.fillRect(-2,-17,4,2);
    // --- Sword ---
    ctx.save(); ctx.translate(14,-10); ctx.rotate(0.18);
    ctx.fillStyle='#c8c8d8'; ctx.fillRect(-2,-22,4,28);
    ctx.fillStyle='#e8e8f8'; ctx.fillRect(-1,-22,1,22);
    ctx.fillStyle='#c8a020'; ctx.fillRect(-7,-1,14,4);
    ctx.fillStyle='#d0b028'; ctx.fillRect(-1,2,2,7);
    ctx.restore();
    ctx.restore();
  }

  _c_erina(ctx, scale = 1.9) {
    // Purple mage, witch hat, staff
    ctx.save(); ctx.scale(scale, scale);
    // --- Robe bottom ---
    ctx.fillStyle='#5a14a0'; ctx.fillRect(-7,6,14,18);
    [[0,'#4a0e90'],[5,'#5e18aa'],[10,'#4a0e90']].forEach(([dx,c])=>{ctx.fillStyle=c;ctx.fillRect(-7+dx,12,5,12);});
    // --- Sash ---
    ctx.fillStyle='#f0c038'; ctx.fillRect(-8,4,16,3);
    // --- Body ---
    ctx.fillStyle='#7020c0'; ctx.fillRect(-8,-8,16,14);
    ctx.fillStyle='#9040d8'; ctx.fillRect(-2,-8,4,14);
    ctx.fillStyle='#4a10908'; ctx.fillStyle='#5818a8'; ctx.fillRect(-7,-8,3,8);
    // --- Sleeves ---
    ctx.fillStyle='#6018a8'; ctx.fillRect(-12,-6,6,12); ctx.fillRect(6,-6,6,12);
    ctx.fillStyle='#4a0e88'; ctx.fillRect(-13,-4,5,8); ctx.fillRect(8,-4,5,8);
    // --- Neck ---
    ctx.fillStyle='#f0c888'; ctx.fillRect(-2,-12,4,5);
    // --- Head ---
    ctx.fillStyle='#f8d0a8'; ctx.fillRect(-5,-22,10,11);
    ctx.fillStyle='#d8a870'; ctx.fillRect(-5,-12,10,1);
    // --- Hair ---
    ctx.fillStyle='#28083a'; ctx.fillRect(-6,-22,12,4); ctx.fillRect(-6,-22,2,7); ctx.fillRect(4,-22,2,7);
    // --- Eyes ---
    ctx.fillStyle='#6810a0'; ctx.fillRect(-3,-19,2,2); ctx.fillRect(1,-19,2,2);
    ctx.fillStyle='#fff'; ctx.fillRect(-2,-19,1,1); ctx.fillRect(2,-19,1,1);
    ctx.fillStyle='#e888c8'; ctx.fillRect(-2,-16,4,2);
    // --- Hat brim ---
    ctx.fillStyle='#7820c0'; ctx.fillRect(-10,-23,20,4);
    ctx.fillStyle='#9030d8'; ctx.fillRect(-8,-23,16,2);
    // --- Hat cone ---
    ctx.fillStyle='#7020c0';
    ctx.beginPath(); ctx.moveTo(-7,-23); ctx.lineTo(-1,-42); ctx.lineTo(2,-42); ctx.lineTo(7,-23); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#9030d8';
    ctx.beginPath(); ctx.moveTo(-5,-23); ctx.lineTo(-1,-42); ctx.lineTo(1,-42); ctx.lineTo(3,-23); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#f0d040'; ctx.fillRect(-1,-38,2,3);
    // --- Staff ---
    ctx.save(); ctx.translate(12,0); ctx.rotate(-0.12);
    ctx.fillStyle='#c8900e'; ctx.fillRect(-1,-36,2,50);
    ctx.fillStyle='#b84ae0'; ctx.beginPath(); ctx.arc(0,-36,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#d878f8'; ctx.beginPath(); ctx.arc(-2,-38,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(200,120,255,0.3)';
    const sg=ctx.createRadialGradient(0,-36,2,0,-36,14); sg.addColorStop(0,'rgba(200,120,255,0.4)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(0,-36,14,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  _c_gard(ctx, scale = 2.3) {
    // Heavy plate warrior, shield left, sword right
    ctx.save(); ctx.scale(scale, scale);
    // --- Greaves/boots ---
    ctx.fillStyle='#40485a'; ctx.fillRect(-9,17,9,6); ctx.fillRect(0,17,9,6);
    ctx.fillStyle='#6878a8'; ctx.fillRect(-10,11,10,8); ctx.fillRect(0,11,10,8);
    // --- Legs ---
    ctx.fillStyle='#505868'; ctx.fillRect(-8,4,7,9); ctx.fillRect(1,4,7,9);
    // --- Skirt armor ---
    ctx.fillStyle='#606878'; ctx.fillRect(-9,1,18,5);
    [[0,'#585868'],[6,'#686878'],[12,'#585868']].forEach(([dx,c])=>{ctx.fillStyle=c;ctx.fillRect(-9+dx,1,6,5);});
    // --- Body plate ---
    ctx.fillStyle='#8898b0'; ctx.fillRect(-11,-13,22,16);
    ctx.fillStyle='#9ab0c8'; ctx.fillRect(-9,-13,8,8);
    ctx.fillStyle='#606878'; ctx.fillRect(-11,-2,22,2); ctx.fillRect(-2,-13,4,8);
    ctx.fillStyle='#b0c0d0'; ctx.fillRect(-11,-13,3,16);
    // --- Pauldrons ---
    ctx.fillStyle='#a0b0c8'; ctx.fillRect(-15,-16,8,12); ctx.fillRect(7,-16,8,12);
    ctx.fillStyle='#c0d0e0'; ctx.fillRect(-15,-16,8,4); ctx.fillRect(7,-16,8,4);
    ctx.fillStyle='#707888'; ctx.fillRect(-14,-14,6,8); ctx.fillRect(8,-14,6,8);
    // --- Shield (left) ---
    ctx.fillStyle='#3050b0'; ctx.fillRect(-24,-14,13,22);
    ctx.fillStyle='#4060c8'; ctx.fillRect(-24,-14,13,6);
    ctx.fillStyle='#c0a820'; ctx.beginPath(); ctx.arc(-17,-3,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e0c828'; ctx.beginPath(); ctx.arc(-17,-3,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#6080d0'; ctx.lineWidth=1.5; ctx.strokeRect(-24,-14,13,22);
    // --- Neck ---
    ctx.fillStyle='#d0a060'; ctx.fillRect(-3,-16,6,5);
    // --- Head ---
    ctx.fillStyle='#d8a060'; ctx.fillRect(-6,-26,12,11);
    ctx.fillStyle='#b07840'; ctx.fillRect(-6,-16,12,1);
    // Scar
    ctx.fillStyle='#9a5830'; ctx.fillRect(2,-24,1,6);
    // Eyes
    ctx.fillStyle='#1a1820'; ctx.fillRect(-3,-23,3,2); ctx.fillRect(1,-23,3,2);
    ctx.fillStyle='#fff'; ctx.fillRect(-2,-23,1,1); ctx.fillRect(2,-23,1,1);
    // --- Helmet ---
    ctx.fillStyle='#8090a8'; ctx.fillRect(-8,-32,16,9);
    ctx.fillStyle='#a0b0c8'; ctx.fillRect(-6,-32,12,4);
    ctx.fillStyle='#606878'; ctx.fillRect(-7,-26,14,4);
    ctx.fillStyle='#202830'; ctx.fillRect(-5,-25,4,2); ctx.fillRect(1,-25,4,2);
    ctx.fillStyle='#b0c0d0'; ctx.fillRect(-1,-36,2,6);
    ctx.fillStyle='#c0d0e0'; ctx.fillRect(-1,-34,2,3);
    // --- Sword ---
    ctx.save(); ctx.translate(13,-16); ctx.rotate(-0.25);
    ctx.fillStyle='#b8c0d0'; ctx.fillRect(-2,-26,4,30);
    ctx.fillStyle='#d0d8e8'; ctx.fillRect(-1,-26,1,26);
    ctx.fillStyle='#d8c040'; ctx.fillRect(-7,0,14,4);
    ctx.fillStyle='#c8b028'; ctx.fillRect(-1,3,2,8);
    ctx.restore();
    ctx.restore();
  }

  _c_luna(ctx, scale = 1.8) {
    // White/teal oracle healer, moon staff
    ctx.save(); ctx.scale(scale, scale);
    // --- Robe ---
    ctx.fillStyle='#d0e8c8'; ctx.fillRect(-7,4,14,20);
    [[0,'#c0d8b0'],[5,'#d0e8c0'],[10,'#c0d8b0']].forEach(([dx,c])=>{ctx.fillStyle=c;ctx.fillRect(-7+dx,12,5,12);});
    // --- Teal trim ---
    ctx.fillStyle='#28c0b0'; ctx.fillRect(-9,4,3,20); ctx.fillRect(6,4,3,20); ctx.fillRect(-9,14,18,3);
    // --- Body ---
    ctx.fillStyle='#e0f0d8'; ctx.fillRect(-8,-8,16,14);
    // --- Cross symbol ---
    ctx.fillStyle='#28c0b0'; ctx.fillRect(-1,-6,2,8); ctx.fillRect(-3,-4,6,2);
    // --- Sleeves ---
    ctx.fillStyle='#d0e8c0'; ctx.fillRect(-11,-6,5,10); ctx.fillRect(6,-6,5,10);
    ctx.fillStyle='#28c0b0'; ctx.fillRect(-12,-4,3,6); ctx.fillRect(9,-4,3,6);
    // --- Neck ---
    ctx.fillStyle='#fce8c8'; ctx.fillRect(-2,-12,4,5);
    // --- Head ---
    ctx.fillStyle='#fce8c8'; ctx.fillRect(-5,-23,10,12);
    ctx.fillStyle='#e8c8a0'; ctx.fillRect(-5,-12,10,1);
    // Hair (silver)
    ctx.fillStyle='#c8d0e0'; ctx.fillRect(-6,-25,12,5); ctx.fillRect(-7,-23,2,8); ctx.fillRect(5,-23,2,8);
    // Eyes (green)
    ctx.fillStyle='#18a860'; ctx.fillRect(-3,-20,2,2); ctx.fillRect(1,-20,2,2);
    ctx.fillStyle='#fff'; ctx.fillRect(-2,-20,1,1); ctx.fillRect(2,-20,1,1);
    ctx.fillStyle='#e8c098'; ctx.fillRect(-2,-18,4,2);
    // --- Veil/headpiece ---
    ctx.fillStyle='#f0f4f0'; ctx.fillRect(-8,-26,16,4);
    ctx.fillStyle='#d8e0d8'; ctx.fillRect(-9,-24,3,12); ctx.fillRect(6,-24,3,12);
    // Moon circlet
    ctx.fillStyle='#c8d8e8'; ctx.beginPath(); ctx.arc(0,-28,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#080c1a'; ctx.beginPath(); ctx.arc(2,-28,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#a8c0d8'; ctx.beginPath(); ctx.arc(0,-28,2,0,Math.PI*2); ctx.fill();
    // --- Moon staff (left) ---
    ctx.save(); ctx.translate(-13,-4); ctx.rotate(0.14);
    ctx.fillStyle='#a0b0a8'; ctx.fillRect(-1,-32,2,46);
    ctx.fillStyle='#c0d0c8'; ctx.beginPath(); ctx.arc(0,-32,6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#06101a'; ctx.beginPath(); ctx.arc(2,-32,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#a0c0e0'; ctx.beginPath(); ctx.arc(0,-32,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(160,200,240,0.3)';
    const mg=ctx.createRadialGradient(0,-32,2,0,-32,14); mg.addColorStop(0,'rgba(160,200,240,0.35)'); mg.addColorStop(1,'transparent');
    ctx.fillStyle=mg; ctx.beginPath(); ctx.arc(0,-32,14,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
}

// Global battle renderer instance
let battleRenderer = null;

// ============================================================
//  DungeonRenderer — Canvas-based 3D perspective dungeon
// ============================================================
class DungeonRenderer {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this.raf    = null;
    this.frame  = 0;
    this.W = 400;
    this.H = 280;
  }

  mount(sceneEl) {
    if (this.canvas) this.canvas.remove();
    this.canvas = document.createElement('canvas');
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
    this.canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
    sceneEl.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  start() {
    this.stop();
    const tick = () => {
      this.frame++;
      if (this.ctx) this._draw();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.canvas) { this.canvas.remove(); this.canvas = null; this.ctx = null; }
  }

  _draw() {
    const g = window.game;
    if (!g) return;
    const { ctx, W, H, frame } = this;
    ctx.clearRect(0, 0, W, H);

    const area = g.areaId;
    const isBoss = g.areas[area] && g.room >= g.areas[area].rooms && !g.areas[area].bossDefeated;

    if (area === 'cave') this._drawCaveCorridor(isBoss);
    else if (area === 'castle') this._drawCastleCorridor(isBoss);
    else this._drawForestPath(isBoss);
  }

  // ── FOREST PATH ────────────────────────────────────────────
  _drawForestPath(isBoss) {
    const { ctx, W, H, frame } = this;
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#0d1f6a'); sky.addColorStop(0.5, '#1848b8'); sky.addColorStop(1, '#4888e8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);

    // Sun glow
    if (!isBoss) {
      const sg = ctx.createRadialGradient(W*0.5, H*0.18, 5, W*0.5, H*0.18, 70);
      sg.addColorStop(0, 'rgba(255,240,160,0.9)'); sg.addColorStop(0.4, 'rgba(255,180,60,0.4)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(W*0.2, 0, W*0.6, H*0.4);
      ctx.fillStyle = '#fff8d8'; ctx.beginPath(); ctx.arc(W*0.5, H*0.18, 18, 0, Math.PI*2); ctx.fill();
    } else {
      // Ominous red sky for boss
      const bs = ctx.createLinearGradient(0, 0, 0, H*0.55);
      bs.addColorStop(0, '#200008'); bs.addColorStop(1, '#601020');
      ctx.fillStyle = bs; ctx.fillRect(0, 0, W, H*0.55);
    }

    // Clouds
    [[0.15,0.12,28],[0.45,0.08,22],[0.72,0.15,25]].forEach(([cx, cy, r], i) => {
      const ox = ((cx*W + frame*0.1*(i+1)) % (W+80)) - 40;
      ctx.fillStyle = isBoss ? 'rgba(80,20,20,0.7)' : 'rgba(255,255,255,0.82)';
      [[0,0,r],[r*0.7,0,r*0.6],[-r*0.55,r*0.2,r*0.5],[r*0.2,-r*0.3,r*0.45]].forEach(([dx,dy,rd]) => {
        ctx.beginPath(); ctx.arc(ox+dx, cy*H+dy, rd, 0, Math.PI*2); ctx.fill();
      });
    });

    // Far mountains
    ctx.fillStyle = isBoss ? '#3a0808' : '#1a3e78';
    ctx.beginPath(); ctx.moveTo(0, H*0.52);
    [0,0.08,0.16,0.24,0.32,0.42,0.52,0.61,0.70,0.79,0.88,0.96,1.0].forEach((x,i) => {
      const ps = [0.5,0.40,0.46,0.36,0.43,0.38,0.44,0.34,0.41,0.39,0.45,0.37,0.5];
      ctx.lineTo(x*W, ps[i]*H);
    });
    ctx.lineTo(W,H*0.52); ctx.closePath(); ctx.fill();

    // Ground
    const gnd = ctx.createLinearGradient(0, H*0.6, 0, H);
    gnd.addColorStop(0, isBoss?'#1a0804':'#226018'); gnd.addColorStop(0.4, isBoss?'#100402':'#164210'); gnd.addColorStop(1, isBoss?'#080200':'#0a1c06');
    ctx.fillStyle = gnd; ctx.fillRect(0, H*0.6, W, H*0.4);

    // 3D path perspective
    ctx.fillStyle = isBoss ? '#201004' : '#503820';
    ctx.beginPath(); ctx.moveTo(W*0.3, H*0.6); ctx.lineTo(W*0.7, H*0.6); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = isBoss ? '#281408' : '#604428';
    ctx.beginPath(); ctx.moveTo(W*0.36, H*0.6); ctx.lineTo(W*0.64, H*0.6); ctx.lineTo(W*0.9, H); ctx.lineTo(W*0.1, H); ctx.closePath(); ctx.fill();
    // Path lines
    for (let i = 1; i < 5; i++) {
      const fy = H * (0.6 + i * 0.1);
      const fw = (i / 5) * W * 0.4;
      ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(W*0.5-fw/2, fy, fw, 1.5);
    }

    // Tree corridor (left and right)
    [[0.05,1.0],[0.14,0.82],[0.22,0.68],[0.28,0.56]].forEach(([tx, sc]) => {
      this._drawFTree(tx*W, H*0.6, H*0.42*sc, isBoss?'#200604':'#0a2a04', isBoss?'#380a08':'#143a08', 'L');
    });
    [[0.95,1.0],[0.86,0.82],[0.78,0.68],[0.72,0.56]].forEach(([tx, sc]) => {
      this._drawFTree(tx*W, H*0.6, H*0.42*sc, isBoss?'#200604':'#0a2a04', isBoss?'#380a08':'#143a08', 'R');
    });

    // Light at end of path
    if (!isBoss) {
      const vg = ctx.createRadialGradient(W*0.5, H*0.58, 0, W*0.5, H*0.58, 80);
      vg.addColorStop(0, 'rgba(200,240,180,0.55)'); vg.addColorStop(0.5, 'rgba(100,200,80,0.2)'); vg.addColorStop(1, 'transparent');
      ctx.fillStyle = vg; ctx.fillRect(W*0.2, H*0.35, W*0.6, H*0.3);
    } else {
      // Boss: red pulsing light
      const ba = 0.5 + Math.sin(frame*0.08)*0.3;
      const bg = ctx.createRadialGradient(W*0.5, H*0.52, 0, W*0.5, H*0.52, 50*ba);
      bg.addColorStop(0, `rgba(255,40,0,${ba*0.7})`); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg; ctx.fillRect(W*0.2, H*0.3, W*0.6, H*0.4);
    }

    // Foreground grass fringe
    ctx.fillStyle = isBoss ? '#1a0402' : '#1a5010';
    ctx.beginPath(); ctx.moveTo(0, H*0.61);
    for (let gx = 0; gx < W; gx += 8) {
      ctx.lineTo(gx, H*0.61 - 3 - Math.sin(gx*0.09+frame*0.03)*2.5);
      ctx.lineTo(gx+4, H*0.61+2);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  }

  _drawFTree(cx, baseY, tH, dark, light, side) {
    const ctx = this.ctx;
    const tW = tH * 0.5;
    ctx.fillStyle = '#4a2a0c';
    ctx.fillRect(cx - tH*0.04, baseY - tH*0.2, tH*0.08, tH*0.2 + 3);
    for (let l = 0; l < 3; l++) {
      const ly = baseY - tH*(0.25 + l*0.3);
      const lw = tW*(1.0 - l*0.15);
      const lh = tH*0.36;
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.moveTo(cx,ly-lh); ctx.lineTo(cx+lw*0.5,ly+lh*0.1); ctx.lineTo(cx-lw*0.5,ly+lh*0.1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath(); ctx.moveTo(cx-lw*0.5,ly-lh*0.1); ctx.lineTo(cx,ly-lh); ctx.lineTo(cx,ly+lh*0.1); ctx.lineTo(cx-lw*0.5,ly+lh*0.1); ctx.closePath(); ctx.fill();
    }
  }

  // ── CAVE CORRIDOR ──────────────────────────────────────────
  _drawCaveCorridor(isBoss) {
    const { ctx, W, H, frame } = this;
    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#040306'); bg.addColorStop(0.5, '#080608'); bg.addColorStop(1, '#100c0a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Stone wall blocks
    ctx.fillStyle = '#120e10'; ctx.fillRect(0, 0, W, H*0.68);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 9; col++) {
        const bw = W/8, bh = H*0.068;
        const bx = col*bw + (row%2===0?0:bw/2) - bw/2;
        const by = row * bh;
        const shade = ((row+col)%3===0) ? 0.05 : ((row+col)%3===1) ? 0.025 : 0.01;
        ctx.fillStyle = `rgba(255,255,255,${shade})`; ctx.fillRect(bx+1.5, by+1.5, bw-3, bh-3);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(bx, by, bw, 2); ctx.fillRect(bx, by, 2, bh);
      }
    }

    // Arch perspective
    const archW = isBoss ? W*0.28 : W*0.22;
    const archH = isBoss ? H*0.6 : H*0.52;
    const ax = W*0.5 - archW/2, ayt = H*0.04;
    const innerG = ctx.createLinearGradient(W*0.5, ayt, W*0.5, ayt+archH);
    innerG.addColorStop(0, isBoss?'#2a0020':'#060310'); innerG.addColorStop(1, isBoss?'#080010':'#0a0810');
    ctx.fillStyle = innerG;
    ctx.beginPath();
    ctx.moveTo(ax, ayt+archH);
    ctx.lineTo(ax, ayt + archW*0.5);
    ctx.quadraticCurveTo(ax, ayt, W*0.5, ayt);
    ctx.quadraticCurveTo(ax+archW, ayt, ax+archW, ayt + archW*0.5);
    ctx.lineTo(ax+archW, ayt+archH);
    ctx.closePath(); ctx.fill();

    // Nested arches for 3D depth
    for (let d = 1; d <= 4; d++) {
      const dw = archW*(1-d*0.18), dh = archH*(1-d*0.15);
      const dx = W*0.5 - dw/2, dyt = ayt + archH*d*0.11;
      ctx.strokeStyle = `rgba(60,40,60,${0.55-d*0.08})`; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(dx, dyt+dh); ctx.lineTo(dx, dyt+dw*0.5);
      ctx.quadraticCurveTo(dx, dyt, W*0.5, dyt);
      ctx.quadraticCurveTo(dx+dw, dyt, dx+dw, dyt+dw*0.5);
      ctx.lineTo(dx+dw, dyt+dh); ctx.stroke();
    }

    // Floor
    const fl = ctx.createLinearGradient(0, H*0.68, 0, H);
    fl.addColorStop(0, '#2c2018'); fl.addColorStop(0.5, '#1e1610'); fl.addColorStop(1, '#100c08');
    ctx.fillStyle = fl; ctx.fillRect(0, H*0.68, W, H*0.32);
    for (let ti = 0; ti < 5; ti++) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(0, H*(0.68+ti*0.064), W, 1.5);
      const tw = W*(0.1+ti*0.2);
      ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(W*0.5-tw/2, H*(0.68+ti*0.064), tw, 1);
    }

    // Torches
    this._drawCaveTorch(W*0.18, H*0.36, frame);
    this._drawCaveTorch(W*0.82, H*0.36, frame + 11);

    // Stalactites
    [0.08,0.18,0.28,0.38,0.5,0.62,0.72,0.82,0.92].forEach((sx, i) => {
      const slen = H*(0.08+((i*3)%5)*0.045);
      const sw = 9 + (i%3)*5;
      ctx.fillStyle = '#1a1210';
      ctx.beginPath(); ctx.moveTo(sx*W-sw/2,0); ctx.lineTo(sx*W+sw/2,0); ctx.lineTo(sx*W,slen); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#242018'; ctx.fillRect(sx*W-1.5, 0, 3, slen*0.5);
    });

    // Crystal glow pools on walls
    if (!isBoss) {
      [[W*0.08,H*0.42,'#9040c8'],[W*0.88,H*0.38,'#4060d0']].forEach(([gx,gy,col]) => {
        const ga = 0.12+Math.sin(frame*0.05)*0.04;
        const r=parseInt(col.slice(1,3),16),gb=parseInt(col.slice(3,5),16),gbl=parseInt(col.slice(5,7),16);
        const cr = ctx.createRadialGradient(gx,gy,5,gx,gy,80);
        cr.addColorStop(0, `rgba(${r},${gb},${gbl},${ga*3})`);
        cr.addColorStop(1, 'transparent');
        ctx.fillStyle = cr; ctx.fillRect(gx-80, gy-80, 160, 160);
      });
    } else {
      // Boss: pulsing red glow
      const ba = 0.35+Math.sin(frame*0.09)*0.2;
      const br = ctx.createRadialGradient(W*0.5, H*0.35, 0, W*0.5, H*0.35, 120*ba);
      br.addColorStop(0, `rgba(200,0,50,${ba})`); br.addColorStop(1, 'transparent');
      ctx.fillStyle = br; ctx.fillRect(0, 0, W, H);
    }
  }

  _drawCaveTorch(x, y, frame) {
    const ctx = this.ctx;
    ctx.fillStyle = '#503018'; ctx.fillRect(x-6,y,12,16);
    ctx.fillStyle = '#3a2010'; ctx.fillRect(x-5,y+2,10,12);
    const flicker = Math.sin(frame*0.24)*4;
    const gw = ctx.createRadialGradient(x,y-10,2,x,y-10,42);
    gw.addColorStop(0, `rgba(255,160,32,${0.3+Math.sin(frame*0.3)*0.08})`); gw.addColorStop(1,'transparent');
    ctx.fillStyle = gw; ctx.beginPath(); ctx.arc(x,y-10,42,0,Math.PI*2); ctx.fill();
    [[14+flicker,'#cc3800'],[11+flicker,'#f07800'],[6+flicker,'#ffd030']].forEach(([fh,c]) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(x,y-fh); ctx.lineTo(x+6,y-1); ctx.lineTo(x-6,y-1); ctx.closePath(); ctx.fill();
    });
  }

  // ── CASTLE CORRIDOR ────────────────────────────────────────
  _drawCastleCorridor(isBoss) {
    const { ctx, W, H, frame } = this;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#030010'); bg.addColorStop(0.5, '#060018'); bg.addColorStop(1, '#0c0020');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Energy clouds
    for (let i = 0; i < 4; i++) {
      const px = W*(0.15+i*0.24), py = H*0.3;
      const phase = frame*0.016+i*1.9;
      const ex = px+Math.cos(phase)*18, ey = py+Math.sin(phase)*9;
      const eg = ctx.createRadialGradient(ex,ey,4,ex,ey,80);
      eg.addColorStop(0, `rgba(100,0,180,${0.16+Math.sin(phase)*0.06})`);
      eg.addColorStop(0.5, `rgba(50,0,90,0.07)`); eg.addColorStop(1, 'transparent');
      ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H*0.8);
    }

    // Stone wall
    ctx.fillStyle = '#100c1a'; ctx.fillRect(0, 0, W, H*0.7);
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 9; col++) {
        const bw = W/8, bh = H*0.07;
        const bx = col*bw + (row%2===0?0:bw/2) - bw/2;
        const by = row * bh;
        ctx.fillStyle = `rgba(255,255,255,${(row+col)%3===0?0.03:0.01})`; ctx.fillRect(bx+1.5, by+1.5, bw-3, bh-3);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(bx, by, bw, 2); ctx.fillRect(bx, by, 2, bh);
      }
    }

    // Pillars
    [0.1, 0.9].forEach(px => {
      const x = px*W, pw = 38;
      const pg = ctx.createLinearGradient(x-pw/2,0,x+pw/2,0);
      pg.addColorStop(0,'#10091a'); pg.addColorStop(0.3,'#1e1430'); pg.addColorStop(0.7,'#140c1e'); pg.addColorStop(1,'#09060e');
      ctx.fillStyle = pg; ctx.fillRect(x-pw/2, 0, pw, H*0.8);
      for (let sy = 0; sy < H*0.8; sy += 30) { ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fillRect(x-pw/2,sy,pw,2); }
      ctx.fillStyle='rgba(100,50,160,0.35)'; ctx.fillRect(x-pw/2, 0, 3, H*0.8);
    });

    // Arch
    const archW = isBoss ? W*0.32 : W*0.26;
    const ax = W*0.5 - archW/2, ayt = H*0.02;
    const aH = H*0.66;
    const innerG = ctx.createLinearGradient(W*0.5, ayt, W*0.5, ayt+aH);
    innerG.addColorStop(0, isBoss?'#1a0028':'#060016'); innerG.addColorStop(1, isBoss?'#0c0020':'#04000e');
    ctx.fillStyle = innerG;
    ctx.beginPath();
    ctx.moveTo(ax, ayt+aH); ctx.lineTo(ax, ayt+archW*0.5);
    ctx.quadraticCurveTo(ax, ayt, W*0.5, ayt);
    ctx.quadraticCurveTo(ax+archW, ayt, ax+archW, ayt+archW*0.5);
    ctx.lineTo(ax+archW, ayt+aH); ctx.closePath(); ctx.fill();

    // Nested arches
    for (let d = 1; d <= 4; d++) {
      const dw = archW*(1-d*0.18), dh = aH*(1-d*0.15);
      const dx = W*0.5 - dw/2, dyt = ayt + aH*d*0.10;
      ctx.strokeStyle = `rgba(80,30,120,${0.6-d*0.1})`; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(dx, dyt+dh); ctx.lineTo(dx, dyt+dw*0.5);
      ctx.quadraticCurveTo(dx, dyt, W*0.5, dyt);
      ctx.quadraticCurveTo(dx+dw, dyt, dx+dw, dyt+dw*0.5);
      ctx.lineTo(dx+dw, dyt+dh); ctx.stroke();
    }

    // Floor with perspective tiles
    const fl = ctx.createLinearGradient(0, H*0.7, 0, H);
    fl.addColorStop(0,'#1a1030'); fl.addColorStop(1,'#0a0818');
    ctx.fillStyle = fl; ctx.fillRect(0, H*0.7, W, H*0.3);
    ctx.strokeStyle='rgba(80,40,120,0.38)'; ctx.lineWidth=1;
    for (let fy = 0; fy < 5; fy++) { ctx.beginPath(); ctx.moveTo(0, H*(0.7+fy*0.06)); ctx.lineTo(W, H*(0.7+fy*0.06)); ctx.stroke(); }
    for (let fv = 0; fv <= 10; fv++) { ctx.beginPath(); ctx.moveTo(W/2, H*0.7); ctx.lineTo(fv*W/10, H); ctx.stroke(); }

    // Purple torches
    [W*0.2, W*0.8].forEach((tx, i) => {
      const ty = H*0.38;
      const flicker = Math.sin(frame*0.2 + i*3)*3;
      const gw = ctx.createRadialGradient(tx,ty-8,2,tx,ty-8,40);
      gw.addColorStop(0,`rgba(160,0,255,${0.28+Math.sin(frame*0.26+i)*0.08})`); gw.addColorStop(1,'transparent');
      ctx.fillStyle=gw; ctx.beginPath(); ctx.arc(tx,ty-8,40,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#402050'; ctx.fillRect(tx-5,ty,10,14);
      [[12+flicker,'#8800cc'],[9+flicker,'#cc20ff'],[5+flicker,'#e890ff']].forEach(([fh,c])=>{
        ctx.fillStyle=c;
        ctx.beginPath(); ctx.moveTo(tx,ty-fh); ctx.lineTo(tx+5,ty-1); ctx.lineTo(tx-5,ty-1); ctx.closePath(); ctx.fill();
      });
    });

    // Boss: vortex
    if (isBoss) {
      const cX=W*0.5, cY=H*0.38;
      const pulse = 0.85+Math.sin(frame*0.07)*0.15;
      const core = ctx.createRadialGradient(cX,cY,0,cX,cY,55*pulse);
      core.addColorStop(0,'rgba(220,100,255,0.7)'); core.addColorStop(0.4,'rgba(120,0,200,0.4)');
      core.addColorStop(0.7,'rgba(60,0,100,0.2)'); core.addColorStop(1,'transparent');
      ctx.fillStyle=core; ctx.fillRect(cX-80,cY-80,160,160);
      for (let r=1;r<=4;r++) {
        ctx.strokeStyle=`rgba(200,80,255,${0.5-r*0.09})`; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.arc(cX,cY,r*14*pulse,0,Math.PI*2); ctx.stroke();
      }
    } else {
      // Flying particles
      for (let p=0;p<14;p++) {
        const px=((W*(p*0.07+0.02)+frame*(0.3+p*0.015))%W);
        const py=H*0.1+Math.sin(frame*0.04+p*0.8)*H*0.26;
        ctx.fillStyle=`rgba(160,80,255,${0.3+Math.sin(frame*0.1+p)*0.14})`;
        ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fill();
      }
    }
  }
}

let dungeonRenderer = null;

// ============================================================
//  TownRenderer — Canvas-based SNES-style town with 3D buildings
// ============================================================
class TownRenderer {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this.raf    = null;
    this.frame  = 0;
    this.W = 640;
    this.H = 392;
    this.npcs = [
      { x: 200, y: 312, vx: 0.28,  animT: 0,  color: '#d04020' },
      { x: 440, y: 308, vx: -0.22, animT: 45, color: '#2060a0' },
      { x: 315, y: 324, vx: 0.18,  animT: 20, color: '#208840' },
    ];
  }

  mount(el) {
    if (this.canvas) this.canvas.remove();
    this.canvas = document.createElement('canvas');
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
    this.canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;' +
      'image-rendering:pixelated;image-rendering:crisp-edges;pointer-events:none';
    el.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  start() {
    this.stop();
    const loop = () => {
      this.frame++;
      if (this.ctx) this._draw();
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    if (this.canvas) { this.canvas.remove(); this.canvas = null; this.ctx = null; }
  }

  _draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this._sky();
    this._hills();
    this._ground();
    this._path();
    // Back-row trees
    this._tree(38,  268, 50, 0.64);
    this._tree(132, 260, 44, 0.58);
    this._tree(510, 263, 46, 0.60);
    this._tree(600, 270, 52, 0.66);
    // Buildings (front to back order irrelevant here, left → center → right)
    this._inn(55, 218);
    this._shop(232, 204);
    this._church(450, 210);
    // Mid-row trees flanking the path
    this._tree(188, 308, 34, 0.44);
    this._tree(398, 312, 32, 0.42);
    // NPCs
    this._npcs();
    // Foreground fringe
    this._fringe();
  }

  _sky() {
    const { ctx, W, H, frame } = this;
    const sk = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sk.addColorStop(0,    '#061848');
    sk.addColorStop(0.45, '#1256b4');
    sk.addColorStop(0.78, '#3484cc');
    sk.addColorStop(1,    '#6ab0e8');
    ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H * 0.55);
    // Horizon warmth
    const hg = ctx.createLinearGradient(0, H*0.42, 0, H*0.56);
    hg.addColorStop(0, 'transparent'); hg.addColorStop(0.5, 'rgba(210,160,70,0.22)'); hg.addColorStop(1, 'transparent');
    ctx.fillStyle = hg; ctx.fillRect(0, H*0.42, W, H*0.14);
    // Clouds
    [[0.09,0.09,46,0.13],[0.36,0.06,38,0.09],[0.61,0.12,42,0.11],[0.84,0.08,30,0.07]].forEach(([cx,cy,r,spd],i) => {
      const ox = ((cx*W + frame*spd) % (W+120)) - 60;
      ctx.fillStyle = 'rgba(240,248,255,0.9)';
      [[0,0,r],[r*0.7,0,r*0.62],[-r*0.55,r*0.22,r*0.52],[r*0.26,-r*0.3,r*0.46]].forEach(([dx,dy,rd]) => {
        ctx.beginPath(); ctx.arc(ox+dx, cy*H+dy, rd, 0, Math.PI*2); ctx.fill();
      });
    });
  }

  _hills() {
    const { ctx, W, H } = this;
    // Far mountains
    ctx.fillStyle = '#1a4e8c';
    ctx.beginPath(); ctx.moveTo(0, H*0.52);
    [[0,.48],[.08,.40],[.16,.44],[.25,.36],[.34,.42],[.43,.34],[.52,.41],[.61,.32],[.70,.39],[.79,.35],[.88,.43],[.96,.38],[1,.44]].forEach(([x,y]) => ctx.lineTo(x*W, y*H));
    ctx.lineTo(W,H*0.52); ctx.closePath(); ctx.fill();
    // Near hills
    ctx.fillStyle = '#287028';
    ctx.beginPath(); ctx.moveTo(0, H*0.57);
    [[0,.55],[.12,.49],[.26,.53],[.39,.47],[.51,.51],[.63,.45],[.76,.51],[.89,.48],[1,.53]].forEach(([x,y]) => ctx.lineTo(x*W, y*H));
    ctx.lineTo(W,H*0.57); ctx.closePath(); ctx.fill();
  }

  _ground() {
    const { ctx, W, H } = this;
    const g = ctx.createLinearGradient(0, H*0.54, 0, H);
    g.addColorStop(0,   '#2c7828'); g.addColorStop(0.22, '#246820');
    g.addColorStop(0.5, '#1c5418'); g.addColorStop(0.8, '#143c10');
    g.addColorStop(1,   '#0c2808');
    ctx.fillStyle = g; ctx.fillRect(0, H*0.54, W, H*0.46);
    // Depth shading
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.moveTo(0,H*0.78); ctx.lineTo(W*0.28,H*0.68); ctx.lineTo(W*0.72,H*0.68); ctx.lineTo(W,H*0.78); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
  }

  _path() {
    const { ctx, W, H } = this;
    const cx = W * 0.5;
    // Dirt base
    ctx.fillStyle = '#7a6640';
    ctx.beginPath(); ctx.moveTo(cx-40,H*0.57); ctx.lineTo(cx+40,H*0.57); ctx.lineTo(cx+130,H); ctx.lineTo(cx-130,H); ctx.closePath(); ctx.fill();
    // Lighter center
    ctx.fillStyle = '#8c7850';
    ctx.beginPath(); ctx.moveTo(cx-20,H*0.57); ctx.lineTo(cx+20,H*0.57); ctx.lineTo(cx+76,H); ctx.lineTo(cx-76,H); ctx.closePath(); ctx.fill();
    // Stone tiles
    ctx.strokeStyle = 'rgba(100,82,50,0.45)'; ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const fy = H*(0.575+i*0.06); const fw = 14+i*16;
      ctx.beginPath(); ctx.moveTo(cx-fw,fy); ctx.lineTo(cx+fw,fy); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx-40,H*0.57); ctx.lineTo(cx-130,H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+40,H*0.57); ctx.lineTo(cx+130,H); ctx.stroke();
    // Dashes
    for (let i = 0; i < 7; i++) {
      const fy = H*(0.585+i*0.06); const fw = 6+i*7;
      ctx.fillStyle = 'rgba(210,188,110,0.7)'; ctx.fillRect(cx-fw/2, fy, fw, 5+i);
    }
  }

  // ── 3D BUILDING HELPERS ─────────────────────────────────────
  // Draws a building with: front wall, visible side wall, 3D angled roof + peak
  _buildingBase(x, y, w, h, wallCol, sideCol, roofCol, roofDark) {
    const ctx = this.ctx;
    const side = 18, slope = 52;
    // Side face (right)
    ctx.fillStyle = sideCol;
    ctx.beginPath(); ctx.moveTo(x+w,y+12); ctx.lineTo(x+w+side,y+20); ctx.lineTo(x+w+side,y+h+side*0.45); ctx.lineTo(x+w,y+h); ctx.closePath(); ctx.fill();
    // Front wall
    ctx.fillStyle = wallCol;
    ctx.fillRect(x, y+12, w, h);
    // Gradient on front wall for depth
    const wg = ctx.createLinearGradient(x, y+12, x+w, y+12);
    wg.addColorStop(0, 'rgba(255,255,255,0.14)'); wg.addColorStop(0.5, 'rgba(255,255,255,0.04)'); wg.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = wg; ctx.fillRect(x, y+12, w, h);
    // Roof eave (trapezoid showing top of roof from slight above)
    ctx.fillStyle = roofDark;
    ctx.beginPath(); ctx.moveTo(x-8,y+12); ctx.lineTo(x+w+8,y+12); ctx.lineTo(x+w+side+8,y+20); ctx.lineTo(x-8,y+20); ctx.closePath(); ctx.fill();
    // Roof main face (triangle)
    ctx.fillStyle = roofCol;
    ctx.beginPath(); ctx.moveTo(x-10,y+12); ctx.lineTo(x+w/2,y-slope); ctx.lineTo(x+w+side+10,y+12); ctx.closePath(); ctx.fill();
    // Roof highlight left
    ctx.fillStyle = 'rgba(255,200,150,0.2)';
    ctx.beginPath(); ctx.moveTo(x-10,y+12); ctx.lineTo(x+w/2,y-slope); ctx.lineTo(x+w/2+2,y-slope); ctx.lineTo(x-8,y+12); ctx.closePath(); ctx.fill();
    // Roof ridge line
    ctx.strokeStyle = roofDark; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x-10,y+12); ctx.lineTo(x+w+side+10,y+12); ctx.stroke();
    // Foundation
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x-2, y+h+1, w+side+3, 6);
  }

  _window(x, y, w, h, glassCol) {
    const ctx = this.ctx;
    const gg = ctx.createRadialGradient(x+w/2,y+h/2,2,x+w/2,y+h/2,Math.max(w,h)*1.1);
    gg.addColorStop(0,'rgba(255,230,120,0.5)'); gg.addColorStop(1,'transparent');
    ctx.fillStyle = gg; ctx.fillRect(x-10,y-10,w+20,h+20);
    ctx.fillStyle = '#7a5c30'; ctx.fillRect(x-3,y-3,w+6,h+6);
    ctx.fillStyle = glassCol; ctx.fillRect(x,y,w,h);
    ctx.fillStyle = '#7a5c30'; ctx.fillRect(x+w/2-1,y,2,h); ctx.fillRect(x,y+h/2-1,w,2);
  }

  _door(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#3c2010';
    ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x,y+h-h*0.55); ctx.quadraticCurveTo(x,y,x+w/2,y); ctx.quadraticCurveTo(x+w,y,x+w,y+h-h*0.55); ctx.lineTo(x+w,y+h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c89820'; ctx.beginPath(); ctx.arc(x+w*0.65, y+h*0.52, 2.5, 0, Math.PI*2); ctx.fill();
  }

  _sign(x, y, text) {
    const ctx = this.ctx;
    ctx.fillStyle = '#7a4c20'; ctx.fillRect(x-28, y, 56, 15);
    ctx.strokeStyle = '#5a3410'; ctx.lineWidth = 1; ctx.strokeRect(x-28,y,56,15);
    ctx.fillStyle = '#f0c840'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y+8);
  }

  // ── INN ────────────────────────────────────────────────────
  _inn(x, y) {
    const ctx = this.ctx;
    const { frame } = this;
    const w = 116, h = 94;
    this._buildingBase(x, y, w, h, '#c8a464', '#906830', '#8c2c18', '#6a1c08');
    // Chimney
    ctx.fillStyle = '#604828'; ctx.fillRect(x+w-30, y-40, 17, 32);
    ctx.fillStyle = '#503818'; ctx.fillRect(x+w-33, y-43, 23, 7);
    // Smoke
    for (let i = 0; i < 4; i++) {
      const sa = 0.2 - i*0.035 + Math.sin(frame*0.05+i*1.8)*0.04;
      const sx = x+w-22 + Math.sin(frame*0.04+i*1.4)*7;
      const sy = y-48 - i*11 - Math.sin(frame*0.06+i)*4;
      ctx.fillStyle = `rgba(200,190,175,${sa})`; ctx.beginPath(); ctx.arc(sx,sy,4+i*2.5,0,Math.PI*2); ctx.fill();
    }
    this._window(x+10, y+28, 28, 26, '#ffe898');
    this._window(x+w-36, y+28, 28, 26, '#ffe898');
    this._door(x+w/2-14, y+h-44, 28, 44);
    this._sign(x+w/2, y+16, '宿屋');
  }

  // ── SHOP ───────────────────────────────────────────────────
  _shop(x, y) {
    const ctx = this.ctx;
    const w = 136, h = 88;
    this._buildingBase(x, y, w, h, '#b07a44', '#7a5228', '#782010', '#5a1408');
    // Awning
    ctx.fillStyle = '#881c10';
    ctx.beginPath(); ctx.moveTo(x-8,y+12); ctx.lineTo(x+w+8,y+12); ctx.lineTo(x+w+8,y+28); ctx.lineTo(x-8,y+28); ctx.closePath(); ctx.fill();
    for (let s = 0; s < 9; s++) {
      ctx.fillStyle = s%2===0?'rgba(255,90,40,0.38)':'rgba(255,210,60,0.3)'; ctx.fillRect(x-8+s*17.2, y+12, 17.2, 16);
    }
    ctx.strokeStyle='rgba(100,20,0,0.55)'; ctx.lineWidth=1.5; ctx.strokeRect(x-8,y+12,w+16,16);
    // Large display window
    ctx.fillStyle = '#7a5428'; ctx.fillRect(x+6, y+32, w-12, 40);
    ctx.fillStyle = '#c8e8f8'; ctx.fillRect(x+8, y+34, w-16, 36);
    // Items visible in window
    ctx.fillStyle = '#c89028'; ctx.fillRect(x+16, y+46, 19, 22); // barrel
    ctx.fillStyle = '#b07820'; ctx.beginPath(); ctx.ellipse(x+25.5,y+46,9.5,4,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8a5c20'; ctx.fillRect(x+w-50, y+46, 24, 22); // crate
    ctx.fillStyle = '#7a4c18'; ctx.fillRect(x+w-50, y+46, 24, 5);
    this._door(x+w/2-16, y+h-46, 32, 46);
    this._sign(x+w/2, y+16, '道具屋');
  }

  // ── CHURCH ─────────────────────────────────────────────────
  _church(x, y) {
    const ctx = this.ctx;
    const w = 106, h = 100;
    this._buildingBase(x, y, w, h, '#9098ac', '#6870a0', '#686e7c', '#484e58');
    // Stone block texture
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        const shade = (r+c)%2===0?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.09)';
        ctx.fillStyle = shade; ctx.fillRect(x+c*23+(r%2)*11.5, y+12+r*15, 21, 13);
      }
    }
    // Cross (flag area, above roof)
    ctx.fillStyle = '#887228'; ctx.fillRect(x+w/2-1.5, y-96, 3, 46);
    ctx.fillStyle = '#f0d020';
    ctx.fillRect(x+w/2-10, y-82, 20, 7);
    ctx.fillRect(x+w/2-3.5, y-98, 7, 28);
    // Blue windows
    this._window(x+10, y+30, 22, 24, '#a0c8f8');
    this._window(x+w-30, y+30, 22, 24, '#a0c8f8');
    this._door(x+w/2-13, y+h-44, 26, 44);
  }

  // ── TREE ───────────────────────────────────────────────────
  _tree(cx, baseY, trunkH, scale) {
    const ctx = this.ctx;
    const tW = 8*scale, tH = trunkH*scale;
    const topR = 30*scale;
    ctx.fillStyle = '#5c3818'; ctx.fillRect(cx-tW/2, baseY-tH, tW, tH+4);
    ctx.fillStyle = '#3c2410'; ctx.fillRect(cx+tW/4, baseY-tH, tW/4, tH);
    // Shadow underside of foliage
    ctx.fillStyle = '#183c0e'; ctx.beginPath(); ctx.arc(cx, baseY-tH-topR*0.5, topR*1.08, 0, Math.PI*2); ctx.fill();
    // Main foliage
    ctx.fillStyle = '#2a7018'; ctx.beginPath(); ctx.arc(cx, baseY-tH-topR*0.6, topR, 0, Math.PI*2); ctx.fill();
    // Lighter patches
    ctx.fillStyle = '#3c9428'; ctx.beginPath(); ctx.arc(cx-topR*0.28, baseY-tH-topR*0.72, topR*0.46, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3c9428'; ctx.beginPath(); ctx.arc(cx+topR*0.18, baseY-tH-topR*0.95, topR*0.36, 0, Math.PI*2); ctx.fill();
    // Specular
    ctx.fillStyle = 'rgba(100,220,60,0.22)'; ctx.beginPath(); ctx.arc(cx-topR*0.24, baseY-tH-topR*1.08, topR*0.24, 0, Math.PI*2); ctx.fill();
  }

  // ── NPCS ───────────────────────────────────────────────────
  _npcs() {
    const { W } = this;
    this.npcs.forEach(n => {
      n.x += n.vx; n.animT++;
      if (n.x > W*0.73 || n.x < W*0.26) n.vx = -n.vx;
      this._npcFigure(n.x, n.y, n.animT, n.vx > 0 ? 1 : -1, n.color);
    });
  }

  _npcFigure(x, y, t, dir, bodyColor) {
    const ctx = this.ctx;
    const step = Math.sin(t * 0.2) * 2.5;
    ctx.save(); ctx.translate(x, y); if (dir < 0) ctx.scale(-1, 1);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.save(); ctx.scale(1,0.22); ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fill(); ctx.restore();
    // Legs
    ctx.fillStyle = '#2840a0';
    ctx.fillRect(-4, 4+step, 4, 8); ctx.fillRect(0, 4-step, 4, 8);
    // Body
    ctx.fillStyle = bodyColor; ctx.fillRect(-5, -9, 10, 15);
    // Arms
    ctx.fillRect(-8, -8, 3, 9); ctx.fillRect(5, -8, 3, 9);
    // Head
    ctx.fillStyle = '#f0c888'; ctx.fillRect(-4, -19, 9, 11);
    // Hair
    ctx.fillStyle = '#3c2008'; ctx.fillRect(-4, -21, 9, 4);
    // Eyes
    ctx.fillStyle = '#000'; ctx.fillRect(-2, -16, 2, 2); ctx.fillRect(2, -16, 2, 2);
    ctx.restore();
  }

  // ── FOREGROUND ─────────────────────────────────────────────
  _fringe() {
    const { ctx, W, H, frame } = this;
    ctx.fillStyle = '#1e5812';
    ctx.beginPath(); ctx.moveTo(0, H*0.88);
    for (let gx = 0; gx < W; gx += 9) {
      ctx.lineTo(gx, H*0.88 - 5 - Math.sin(gx*0.08+frame*0.025)*3);
      ctx.lineTo(gx+4.5, H*0.88+2);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  }
}

let townRenderer = null;

class Game {
  constructor() {
    this.screen = 'TITLE';
    this.player = null;
    this.party = [];         // party member IDs (e.g. ['erina','gard','luna'])
    this.partyData = {};     // live HP/MP state, deep-copied from GAME_DATA.partyMembers
    this.areaId = 'village';
    this.room = 0;
    this.areas = JSON.parse(JSON.stringify(GAME_DATA.areas));
    this.flags = { forestCleared: false, caveCleared: false, castleEntered: false, gameCleared: false };
    this.battle = null;
    this.dialog = { queue: [], idx: 0, active: false, callback: null };
    this.dungeonLog = [];
    this.battleLog = [];
    this.subMenu = null; // 'magic'|'item'
    this.levelUpQueue = [];
    this.lastTreasure = null;
  }

  // ── Player Init ───────────────────────────────────────────
  initPlayer() {
    this.player = {
      name: '勇者', level: 1,
      hp: 50, maxHp: 50, mp: 20, maxMp: 20,
      atk: 12, def: 8, spd: 10,
      exp: 0, expNext: 50,
      gold: 100,
      items: [{ id: 'potion', count: 3 }],
      weapon: null, armor: null,
      spells: ['fire', 'heal'],
      status: [],
      tempDef: 0,
      buffTurns: 0,
    };
  }

  initParty() {
    this.partyData = {};
    Object.entries(GAME_DATA.partyMembers).forEach(([id, m]) => {
      this.partyData[id] = {
        ...m,
        hp: m.maxHp, mp: m.maxMp,
        status: [], alive: true,
        tempDef: 0, buffTurns: 0,
      };
    });
  }

  getATK() {
    let a = this.player.atk;
    if (this.player.weapon) a += GAME_DATA.weapons[this.player.weapon].atk;
    return a;
  }

  getDEF() {
    let d = this.player.def + (this.player.tempDef || 0);
    if (this.player.armor) d += GAME_DATA.armors[this.player.armor].def;
    return d;
  }

  dmg(atk, def) {
    const base = Math.max(1, atk - def);
    return Math.max(1, base + rand(-Math.floor(base * 0.15), Math.floor(base * 0.15)));
  }

  addItem(id, count = 1) {
    const existing = this.player.items.find(i => i.id === id);
    if (existing) existing.count += count;
    else this.player.items.push({ id, count });
  }

  removeItem(id) {
    const it = this.player.items.find(i => i.id === id);
    if (!it || it.count <= 0) return false;
    it.count--;
    this.player.items = this.player.items.filter(i => i.count > 0);
    return true;
  }

  expFor(lv) { return Math.floor(50 * Math.pow(1.6, lv - 1)); }

  checkLevelUp() {
    const msgs = [];
    while (this.player.exp >= this.player.expNext && this.player.level < 30) {
      this.player.exp -= this.player.expNext;
      this.player.level++;
      this.player.expNext = this.expFor(this.player.level);
      const hg = rand(8, 14), mg = rand(3, 6), ag = rand(2, 4), dg = rand(1, 3);
      this.player.maxHp += hg; this.player.hp = Math.min(this.player.hp + hg, this.player.maxHp);
      this.player.maxMp += mg; this.player.mp = Math.min(this.player.mp + mg, this.player.maxMp);
      this.player.atk += ag; this.player.def += dg;
      msgs.push(`レベル ${this.player.level} になった！`);
      msgs.push(`HP+${hg} MP+${mg} 攻+${ag} 守+${dg}`);
      GAME_DATA.spellLevelUp.forEach(e => {
        if (e.level === this.player.level) {
          e.spells.forEach(s => {
            if (!this.player.spells.includes(s)) {
              this.player.spells.push(s);
              msgs.push(`${GAME_DATA.spells[s].name} を覚えた！`);
            }
          });
        }
      });
    }
    return msgs;
  }

  // ── Screens ───────────────────────────────────────────────
  render() {
    const c = $('game-container');
    // Stop renderers when leaving their screens
    if (this.screen !== 'BATTLE' && battleRenderer) { battleRenderer.stop(); battleRenderer = null; }
    if (this.screen !== 'DUNGEON' && dungeonRenderer) { dungeonRenderer.stop(); dungeonRenderer = null; }
    if (this.screen !== 'TOWN' && townRenderer) { townRenderer.stop(); townRenderer = null; }
    switch (this.screen) {
      case 'TITLE':   c.innerHTML = this.renderTitle();  break;
      case 'MAP':     c.innerHTML = this.renderMap();    break;
      case 'TOWN':
        c.innerHTML = this.renderTown();
        requestAnimationFrame(() => {
          const tw = document.getElementById('town-canvas-target');
          if (tw) { townRenderer = new TownRenderer(); townRenderer.mount(tw); townRenderer.start(); }
        });
        break;
      case 'DUNGEON':
        c.innerHTML = this.renderDungeon();
        requestAnimationFrame(() => {
          const scene = document.getElementById('dungeon-canvas-target');
          if (scene) {
            dungeonRenderer = new DungeonRenderer();
            dungeonRenderer.mount(scene);
            dungeonRenderer.start();
          }
        });
        break;
      case 'BATTLE':
        c.innerHTML = this.renderBattle();
        // Mount canvas battle renderer
        requestAnimationFrame(() => {
          const env = document.getElementById('battle-env');
          if (env) {
            if (!battleRenderer) battleRenderer = new BattleRenderer();
            else battleRenderer.stop();
            battleRenderer = new BattleRenderer();
            battleRenderer.mount(env);
            battleRenderer.start();
          }
        });
        break;
      case 'STATUS':  c.innerHTML = this.renderStatus(); break;
      case 'SHOP':    c.innerHTML = this.renderShop();   break;
      case 'GAMEOVER':c.innerHTML = this.renderGameOver(); break;
      case 'ENDING':  c.innerHTML = this.renderEnding(); break;
    }
    if (this.dialog.active) this.renderDialog();
  }

  // ── TITLE ─────────────────────────────────────────────────
  renderTitle() {
    const stars = Array.from({length: 80}, () => {
      const x = rand(0, 100), y = rand(0, 100), s = rand(1, 3);
      const delay = (Math.random() * 3).toFixed(1);
      return `<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${delay}s"></div>`;
    }).join('');
    // Start title canvas animation after render
    requestAnimationFrame(() => this._startTitleCanvas());
    return `
    <div id="title-screen">
      <div class="stars">${stars}</div>
      <div class="title-logo" style="z-index:2;position:relative">
        <span class="title-main">光のクリスタル</span>
        <span class="title-sub">～ The Crystal of Light ～</span>
      </div>
      <canvas id="title-canvas" width="640" height="200"
        style="position:absolute;top:50px;left:0;width:100%;height:200px;z-index:1;pointer-events:none;image-rendering:pixelated"></canvas>
      <button class="press-start" onclick="game.startGame()">▶ ゲームスタート</button>
      <div class="title-version text-gray text-small" style="position:absolute;bottom:12px">
        RPG ～30分クリア～ Web Audio BGM付き
      </div>
    </div>`;
  }

  _startTitleCanvas() {
    const cvs = document.getElementById('title-canvas');
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const W = 640, H = 200;
    let frame = 0;
    const tick = () => {
      if (!document.getElementById('title-canvas')) return; // stop if navigated away
      frame++;
      ctx.clearRect(0, 0, W, H);
      // Draw four party members on the title screen
      const br = new BattleRenderer();
      br.frame = frame; br.canvas = cvs; br.ctx = ctx; br.W = W; br.H = H;
      // Hero
      ctx.save(); ctx.translate(W*0.25, H*0.92 + Math.sin(frame*0.04)*4); br._c_hero(ctx, 3.2); ctx.restore();
      // Erina
      ctx.save(); ctx.translate(W*0.42, H*0.88 + Math.sin(frame*0.04+1)*4); br._c_erina(ctx, 2.8); ctx.restore();
      // Gard
      ctx.save(); ctx.translate(W*0.60, H*0.92 + Math.sin(frame*0.04+2)*4); br._c_gard(ctx, 3.4); ctx.restore();
      // Luna
      ctx.save(); ctx.translate(W*0.77, H*0.88 + Math.sin(frame*0.04+3)*4); br._c_luna(ctx, 2.6); ctx.restore();
      // Sparkle particles
      for (let i = 0; i < 8; i++) {
        const px = W*(0.12 + (i*0.11 + frame*0.003*(i%3+1)) % 0.9);
        const py = H*(0.1 + Math.sin(frame*0.03+i*0.7)*0.35 + 0.2);
        const pa = 0.5 + Math.sin(frame*0.12+i)*0.3;
        ctx.fillStyle = `rgba(240,200,80,${pa})`;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    tick();
  }

  startGame() {
    musicEngine.init();
    musicEngine.resume();
    this.initPlayer();
    this.initParty();
    this.party = [];
    this.screen = 'DIALOG';
    this.showDialog(GAME_DATA.story.intro, () => {
      // Erina joins after intro
      if (!this.party.includes('erina')) this.party.push('erina');
      this.screen = 'TOWN';
      musicEngine.playTown();
      this.render();
    });
  }

  // ── MAP ───────────────────────────────────────────────────
  renderMap() {
    const locs = [
      { id: 'village', x: 55,  y: 185 },
      { id: 'forest',  x: 205, y: 115 },
      { id: 'cave',    x: 365, y: 158 },
      { id: 'castle',  x: 498, y: 88  },
    ];
    const paths = [
      { x1:140, y1:208, w:92, h:5, angle:'-22deg' },
      { x1:290, y1:142, w:98, h:5, angle:'20deg'  },
      { x1:452, y1:128, w:72, h:5, angle:'-26deg' },
    ];
    let html = `<div id="map-screen">
      <div class="map-bg"></div>
      <div class="map-title">ワールドマップ</div>`;
    paths.forEach(p => {
      html += `<div class="map-path" style="left:${p.x1}px;top:${p.y1}px;width:${p.w}px;height:${p.h}px;transform:rotate(${p.angle})"></div>`;
    });
    locs.forEach(loc => {
      const area = this.areas[loc.id];
      const isCurrent = this.areaId === loc.id;
      const isLocked = area.locked;
      const isCleared = (loc.id === 'forest' && this.flags.forestCleared) ||
                        (loc.id === 'cave' && this.flags.caveCleared) ||
                        (loc.id === 'village');
      let cls = 'map-location';
      if (isCurrent) cls += ' current';
      if (isLocked) cls += ' locked';
      else if (isCleared) cls += ' cleared';
      const statusText = isLocked ? '未到達' : isCleared && loc.id !== 'village' ? '✓ 踏破' : '';
      html += `<div class="${cls}" style="left:${loc.x}px;top:${loc.y}px;z-index:2" onclick="game.goLocation('${loc.id}')">
        <span class="map-location-emoji">${area.emoji}</span>
        <span class="map-location-name">${area.name}</span>
        <span class="map-location-status">${statusText}</span>
      </div>`;
    });
    const p = this.player;
    html += `<div class="map-player-status">
      <span class="map-status-item">Lv.<span>${p.level}</span></span>
      <span class="map-status-item">HP <span>${p.hp}/${p.maxHp}</span></span>
      <span class="map-status-item">MP <span>${p.mp}/${p.maxMp}</span></span>
      <span class="map-status-item">G <span>${p.gold}</span></span>
    </div>`;
    html += `</div>`;
    return html;
  }

  goLocation(id) {
    const area = this.areas[id];
    if (area.locked) return;
    musicEngine.sfx('cursor');
    this.areaId = id;
    if (area.type === 'town') {
      this.screen = 'TOWN';
      musicEngine.playTown();
    } else {
      this.room = 0;
      if (id === 'castle' && !this.flags.castleEntered) {
        this.flags.castleEntered = true;
        this.showDialog(GAME_DATA.story.castleEnter, () => {
          this.screen = 'DUNGEON';
          musicEngine.playField();
          this.render();
        });
        this.screen = 'DIALOG';
      } else {
        this.screen = 'DUNGEON';
        musicEngine.playField();
      }
    }
    this.render();
  }

  // ── TOWN ──────────────────────────────────────────────────
  renderTown() {
    const area = this.areas['village'];
    return `<div id="town-screen">
      <!-- Canvas-drawn town background (TownRenderer mounts here) -->
      <div id="town-canvas-target" style="position:absolute;top:0;left:0;right:0;bottom:0;overflow:hidden"></div>

      <div class="town-name-panel">${area.name}</div>
      <div class="town-elder-msg">長老：「勇気をもって旅立て、若者よ。」</div>
      <div class="town-menu-panel">
        <button class="btn btn-gold" onclick="game.openShop()">お店</button>
        <button class="btn" onclick="game.useInn()">宿屋 (20G)</button>
        <button class="btn" onclick="game.openStatus()">ステータス</button>
        <button class="btn" onclick="game.goMap()">世界地図</button>
      </div>
    </div>`;
  }

  useInn() {
    if (this.player.gold < 20) { this.quickMsg('お金が足りない！'); return; }
    this.player.gold -= 20;
    this.player.hp = this.player.maxHp;
    this.player.mp = this.player.maxMp;
    this.player.status = [];
    this.player.tempDef = 0;
    musicEngine.sfx('heal');
    this.quickMsg('ゆっくり休んだ。HP・MPが全回復した！', () => this.render());
  }

  // ── SHOP ──────────────────────────────────────────────────
  renderShop() {
    const area = GAME_DATA.areas['village'];
    let itemRows = '';
    [...(area.shopItems || [])].forEach(id => {
      const item = GAME_DATA.items[id];
      const owned = this.player.items.find(i => i.id === id);
      itemRows += `<div class="shop-item" onclick="game.buyItem('${id}')">
        <div>
          <div class="shop-item-name">💊 ${item.name}</div>
          <div class="shop-item-desc">${item.desc}</div>
          ${owned ? `<div class="shop-item-owned">所持: ${owned.count}個</div>` : ''}
        </div>
        <div class="shop-item-price">${item.price}G</div>
      </div>`;
    });
    [...(area.shopWeapons || [])].forEach(id => {
      const w = GAME_DATA.weapons[id];
      const owned = this.player.weapon === id;
      itemRows += `<div class="shop-item" onclick="game.buyWeapon('${id}')">
        <div>
          <div class="shop-item-name">⚔️ ${w.name}</div>
          <div class="shop-item-desc">${w.desc}</div>
          ${owned ? '<div class="shop-item-owned">装備中</div>' : ''}
        </div>
        <div class="shop-item-price">${w.price}G</div>
      </div>`;
    });
    [...(area.shopArmors || [])].forEach(id => {
      const a = GAME_DATA.armors[id];
      const owned = this.player.armor === id;
      itemRows += `<div class="shop-item" onclick="game.buyArmor('${id}')">
        <div>
          <div class="shop-item-name">🛡️ ${a.name}</div>
          <div class="shop-item-desc">${a.desc}</div>
          ${owned ? '<div class="shop-item-owned">装備中</div>' : ''}
        </div>
        <div class="shop-item-price">${a.price}G</div>
      </div>`;
    });
    return `<div id="shop-screen">
      <div class="shop-title">🏪 エルフィア商店</div>
      <div class="shop-layout">
        <div class="shop-items">${itemRows}</div>
        <div class="shop-info">
          <div>💰 所持金</div>
          <div class="shop-gold">${this.player.gold} G</div>
          <div style="margin-top:12px;font-size:10px;color:#888">アイテムをクリックで購入</div>
          <button class="btn shop-back" onclick="game.closeshop()">← 戻る</button>
        </div>
      </div>
    </div>`;
  }

  openShop() { musicEngine.sfx('open'); this.screen = 'SHOP'; this.render(); }
  closeshop() { musicEngine.sfx('cursor'); this.screen = 'TOWN'; this.render(); }

  buyItem(id) {
    const item = GAME_DATA.items[id];
    if (this.player.gold < item.price) { this.quickMsg('お金が足りない！'); return; }
    this.player.gold -= item.price;
    this.addItem(id);
    musicEngine.sfx('shop');
    this.render();
  }

  buyWeapon(id) {
    const w = GAME_DATA.weapons[id];
    if (this.player.gold < w.price) { this.quickMsg('お金が足りない！'); return; }
    if (this.player.weapon === id) { this.quickMsg('すでに装備している！'); return; }
    this.player.gold -= w.price;
    this.player.weapon = id;
    musicEngine.sfx('shop');
    this.quickMsg(`${w.name} を装備した！`, () => this.render());
  }

  buyArmor(id) {
    const a = GAME_DATA.armors[id];
    if (this.player.gold < a.price) { this.quickMsg('お金が足りない！'); return; }
    if (this.player.armor === id) { this.quickMsg('すでに装備している！'); return; }
    this.player.gold -= a.price;
    this.player.armor = id;
    musicEngine.sfx('shop');
    this.quickMsg(`${a.name} を装備した！`, () => this.render());
  }

  // ── STATUS ────────────────────────────────────────────────
  openStatus() { musicEngine.sfx('open'); this.screen = 'STATUS'; this.render(); }

  renderStatus() {
    const p = this.player;
    const weapName = p.weapon ? GAME_DATA.weapons[p.weapon].name : 'なし';
    const armName  = p.armor  ? GAME_DATA.armors[p.armor].name   : 'なし';
    const spellList = p.spells.map(s => GAME_DATA.spells[s].name).join(' / ');
    const itemList = p.items.length
      ? p.items.map(i => `${GAME_DATA.items[i.id].name} x${i.count}`).join('<br>')
      : 'なし';
    const statusBadges = p.status.map(s =>
      `<span class="status-effect-badge">${s.type === 'poison' ? '毒' : s.type}</span>`
    ).join('') || '正常';
    return `<div id="status-screen">
      <div class="status-left">
        <div class="status-section-title">⚔️ ${p.name}</div>
        <div class="status-line"><span>Lv</span><span>${p.level}</span></div>
        <div class="status-line"><span>HP</span><span>${p.hp} / ${p.maxHp}</span></div>
        <div class="status-line"><span>MP</span><span>${p.mp} / ${p.maxMp}</span></div>
        <div class="status-line"><span>EXP</span><span>${p.exp} / ${p.expNext}</span></div>
        <div class="status-line"><span>GOLD</span><span>${p.gold} G</span></div>
        <div class="status-section-title">能力値</div>
        <div class="status-line"><span>攻撃力</span><span>${this.getATK()}</span></div>
        <div class="status-line"><span>守備力</span><span>${this.getDEF()}</span></div>
        <div class="status-line"><span>素早さ</span><span>${p.spd}</span></div>
        <div class="status-section-title">状態</div>
        <div style="font-size:11px;color:#e0e0ff">${statusBadges}</div>
        <button class="btn mt-8" onclick="game.closeStatus()" style="margin-top:auto">← 戻る</button>
      </div>
      <div class="status-right">
        <div class="status-section-title">装備</div>
        <div class="status-line"><span>武器</span><span>${weapName}</span></div>
        <div class="status-line"><span>防具</span><span>${armName}</span></div>
        <div class="status-section-title">魔法</div>
        <div style="font-size:11px;color:#e0e0ff;line-height:2">${spellList}</div>
        <div class="status-section-title">アイテム</div>
        <div style="font-size:11px;color:#e0e0ff;line-height:2">${itemList}</div>
        ${this.party.length ? `
        <div class="status-section-title">仲間</div>
        ${this.party.map(id => {
          const pm = this.partyData[id];
          if (!pm) return '';
          const pct = clamp(pm.hp / pm.maxHp * 100, 0, 100);
          return `<div style="font-size:10px;margin-bottom:5px">
            <div style="color:${pm.alive?'#c8e0ff':'#666'};margin-bottom:2px">${pm.name}（${pm.role}）${pm.alive?'':'<span style="color:#ff4444"> ×</span>'}</div>
            <div style="display:flex;align-items:center;gap:4px">
              <span style="color:#a0c4ff;font-size:9px">HP</span>
              <div class="hp-bar-container" style="width:100px"><div class="${pct<25?'hp-bar low':pct<50?'hp-bar mid':'hp-bar'}" style="width:${pct}%"></div></div>
              <span style="color:#fff;font-size:9px">${pm.hp}/${pm.maxHp}</span>
            </div>
          </div>`;
        }).join('')}` : ''}
      </div>
    </div>`;
  }

  closeStatus() {
    musicEngine.sfx('cursor');
    const prevScreen = this.screen;
    if (this.areaId === 'village') this.screen = 'TOWN';
    else if (this.areas[this.areaId].type === 'dungeon') this.screen = 'DUNGEON';
    else this.screen = 'MAP';
    this.render();
  }

  goMap() {
    musicEngine.sfx('cursor');
    this.screen = 'MAP';
    this.render();
  }

  // ── DUNGEON ───────────────────────────────────────────────
  renderDungeon() {
    const area = this.areas[this.areaId];
    const bossReady = this.room >= area.rooms && !area.bossDefeated;
    const areaClass = `area-${this.areaId}`;

    const centerEmojis = {
      forest: ['🌲','🌿','🦋','🌳','🍃'],
      cave:   ['💎','🪨','🦇','⛏️','🔥'],
      castle: ['💀','⛓️','🗡️','👿','🔥'],
    };
    const emojis = centerEmojis[this.areaId] || ['?'];
    const sceneEmoji = bossReady ? '💀' : emojis[Math.min(this.room, emojis.length - 1)];

    const logHtml = this.dungeonLog.slice(-5).map(l =>
      `<div class="dungeon-log-entry${l.important?' important':''}">${l.text}</div>`
    ).join('');

    const torches = (this.areaId === 'cave' || this.areaId === 'castle') ? `
      <div style="position:absolute;left:26%;top:28%;font-size:22px;filter:drop-shadow(0 0 8px orange);animation:dungeon-float 0.4s ease-in-out infinite alternate">🔥</div>
      <div style="position:absolute;right:26%;top:28%;font-size:22px;filter:drop-shadow(0 0 8px orange);animation:dungeon-float 0.4s ease-in-out infinite alternate 0.2s">🔥</div>` : '';

    return `<div id="dungeon-screen">
      <div class="dungeon-bg">
        <div class="dungeon-scene ${areaClass}" id="dungeon-canvas-target">
          <!-- Canvas background rendered here (z-index:1) -->
          <div class="dungeon-room-info" style="z-index:10;position:relative">${area.name}　[${this.room + 1} / ${area.rooms + 1}]</div>
          <div class="dungeon-center" style="z-index:10;position:relative">
            ${bossReady ? `<div style="font-size:11px;color:#ff6666;letter-spacing:2px;text-shadow:0 0 12px #ff0000">--- ボスが待ち受けている ---</div>` : ''}
            ${this.lastTreasure ? `<div class="treasure-found" style="z-index:10">${this.lastTreasure}</div>` : ''}
          </div>
        </div>
        <div class="dungeon-actions">
          <div class="dungeon-menu">
            ${bossReady
              ? `<button class="btn btn-danger" onclick="game.fightBoss()">ボスに挑む</button>`
              : `<button class="btn btn-gold" onclick="game.advance()">前進する</button>`}
            <button class="btn" onclick="game.searchRoom()">探索する</button>
            <button class="btn" onclick="game.openStatus()">ステータス</button>
            <button class="btn" onclick="game.retreatTown()">村へ戻る</button>
          </div>
          <div class="dungeon-status">
            <div style="font-size:12px;color:#ffd700;margin-bottom:6px">${this.player.name}</div>
            <div style="font-size:11px;color:#a0c4ff">HP <span style="color:#fff">${this.player.hp}/${this.player.maxHp}</span></div>
            ${this.makeHpBar(this.player.hp, this.player.maxHp, 120)}
            <div style="font-size:11px;color:#a0c4ff;margin-top:4px">MP <span style="color:#fff">${this.player.mp}/${this.player.maxMp}</span></div>
            ${this.makeMpBar(this.player.mp, this.player.maxMp, 120)}
            <div style="font-size:11px;color:#a0c4ff;margin-top:6px">Lv <span style="color:#fff">${this.player.level}</span></div>
            ${this.player.status.map(() => '<span class="poison-badge">毒</span>').join('')}
          </div>
          <div class="dungeon-log">${logHtml}</div>
        </div>
      </div>
    </div>`;
  }

  getCurrentTreasure() {
    const area = this.areas[this.areaId];
    if (!area.treasures) return null;
    return area.treasures.find(t => t.room === this.room && !t.found) || null;
  }

  advance() {
    musicEngine.sfx('cursor');
    this.lastTreasure = null;
    const area = this.areas[this.areaId];
    // Random encounter
    if (Math.random() < area.encounterRate) {
      this.startRandomBattle();
      return;
    }
    this.room++;
    this.addDungeonLog(`部屋 ${this.room+1} に進んだ。`, false);
    // Auto-discover treasure
    const t = this.getCurrentTreasure();
    if (t) this.discoverTreasure(t);
    this.render();
  }

  discoverTreasure(t) {
    t.found = true;
    if (t.item) {
      this.addItem(t.item, t.count);
      this.lastTreasure = `宝箱！ ${GAME_DATA.items[t.item].name} x${t.count} を手に入れた！`;
      this.addDungeonLog(this.lastTreasure, true);
    } else if (t.weaponId) {
      this.player.weapon = t.weaponId;
      const w = GAME_DATA.weapons[t.weaponId];
      this.lastTreasure = `宝箱！ ${w.name} を入手・装備した！`;
      this.addDungeonLog(this.lastTreasure, true);
    } else if (t.armorId) {
      this.player.armor = t.armorId;
      const a = GAME_DATA.armors[t.armorId];
      this.lastTreasure = `宝箱！ ${a.name} を入手・装備した！`;
      this.addDungeonLog(this.lastTreasure, true);
    }
  }

  searchRoom() {
    musicEngine.sfx('open');
    this.lastTreasure = null;
    if (Math.random() < 0.3) {
      this.startRandomBattle();
      return;
    }
    const t = this.getCurrentTreasure();
    if (t) {
      this.discoverTreasure(t);
    } else {
      this.addDungeonLog('何も見つからなかった。', false);
    }
    this.render();
  }

  retreatTown() {
    musicEngine.sfx('cursor');
    this.room = 0;
    this.lastTreasure = null;
    this.screen = 'TOWN';
    musicEngine.playTown();
    this.render();
  }

  addDungeonLog(text, important = false) {
    this.dungeonLog.push({ text, important });
    if (this.dungeonLog.length > 20) this.dungeonLog.shift();
  }

  fightBoss() {
    const area = this.areas[this.areaId];
    const bossId = area.boss;
    let storyKey = null;
    if (bossId === 'forestTroll') storyKey = 'forestBoss';
    if (bossId === 'caveDragon') storyKey = 'caveBoss';
    if (bossId === 'demonKing') storyKey = 'finalBoss';
    if (storyKey) {
      this.showDialog(GAME_DATA.story[storyKey], () => {
        this.initBattle(bossId, true);
      });
      this.screen = 'DIALOG';
      this.render();
    } else {
      this.initBattle(bossId, true);
    }
  }

  // ── BATTLE SYSTEM ─────────────────────────────────────────
  startRandomBattle() {
    const area = this.areas[this.areaId];
    const mId = area.monsters[rand(0, area.monsters.length - 1)];
    this.flash(() => this.initBattle(mId, false));
  }

  flash(cb) {
    const el = document.createElement('div');
    el.className = 'encounter-flash';
    $('game-container').appendChild(el);
    setTimeout(() => { el.remove(); cb(); }, 500);
  }

  initBattle(monsterId, isBoss) {
    const template = GAME_DATA.monsters[monsterId];
    const m = { ...template, hp: template.hp, maxHp: template.hp, phase: 1, status: [] };
    this.battle = { monster: m, isBoss, log: [], phase2Shown: false };
    this.battleLog = [`${m.name} が現れた！`];
    this.subMenu = null;
    this.screen = 'BATTLE';
    if (isBoss) musicEngine.playBoss();
    else musicEngine.playBattle();
    this.render();
  }

  renderBattle() {
    const b = this.battle;
    const m = b.monster;
    const p = this.player;
    const mHpPct = clamp(m.hp / m.maxHp * 100, 0, 100);
    const pHpPct = clamp(p.hp / p.maxHp * 100, 0, 100);
    const pMpPct = clamp(p.mp / p.maxMp * 100, 0, 100);
    const pHpCls = pHpPct < 25 ? 'hp-bar low' : pHpPct < 50 ? 'hp-bar mid' : 'hp-bar';

    const bgMap = { forest: 'bg-forest', cave: 'bg-cave', castle: 'bg-castle', village: 'bg-forest' };
    const bgClass = bgMap[this.areaId] || 'bg-forest';

    // SVG sprite or emoji fallback
    const isBoss = b.isBoss;
    const spriteKey = m.sprite;
    const spriteHtml = (typeof SPRITES !== 'undefined' && SPRITES[spriteKey])
      ? `<div class="enemy-sprite-wrap${isBoss ? ' boss-sprite' : ''}">${SPRITES[spriteKey]}</div>`
      : `<span style="font-size:${isBoss?'100':'80'}px;filter:drop-shadow(0 0 12px ${m.color})">${m.emoji}</span>`;

    // Last 4 log entries
    const logLines = this.battleLog.slice(-4);
    const logHtml = logLines.map(l => {
      let cls = 'bl-entry';
      if (l.includes('ダメージ') && l.includes(p.name)) cls += ' pl';
      else if (l.includes(m.name) && l.includes('ダメージ')) cls += ' en';
      else if (l.includes('回復') || l.includes('かいふく')) cls += ' hl';
      else cls += ' sy';
      return `<div class="${cls}">${l}</div>`;
    }).join('');

    // HP blocks display (DQ7 style)
    const hpBlocks = this._makeBlocks(p.hp, p.maxHp, 18, pHpPct < 25 ? '#ff4444' : pHpPct < 50 ? '#ffcc00' : '#44ee44');
    const mpBlocks = this._makeBlocks(p.mp, p.maxMp, 18, '#4488ff');

    // Party HP rows
    let partyHpHtml = '';
    this.party.forEach(id => {
      const pm = this.partyData[id];
      if (!pm) return;
      const pct = clamp(pm.hp / pm.maxHp * 100, 0, 100);
      const barCls = !pm.alive ? 'hp-bar low' : pct < 25 ? 'hp-bar low' : pct < 50 ? 'hp-bar mid' : 'hp-bar';
      const nameColor = !pm.alive ? '#666' : '#c8e0ff';
      partyHpHtml += `
        <div class="party-member-row">
          <span class="party-member-name" style="color:${nameColor}">${pm.name}</span>
          <div class="hp-bar-container" style="width:80px;flex:1"><div class="${barCls}" style="width:${pct}%"></div></div>
          <span class="party-member-hp">${pm.alive ? pm.hp : '---'}</span>
        </div>`;
    });

    const cmdHtml = this.subMenu ? this.renderSubMenu() : `
      <button class="dq-cmd" onclick="game.cmdAttack()"><span class="cmd-cursor">▶</span>たたかう</button>
      <button class="dq-cmd" onclick="game.cmdMagic()"><span class="cmd-cursor"> </span>じゅもん</button>
      <button class="dq-cmd" onclick="game.cmdItem()"><span class="cmd-cursor"> </span>どうぐ</button>
      <button class="dq-cmd danger" onclick="game.cmdFlee()"><span class="cmd-cursor"> </span>にげる</button>`;

    return `<div id="battle-screen">
      <div class="battle-env ${bgClass}" id="battle-env">

        <!-- Canvas renders background + party sprites (z-index:2) -->
        <!-- Enemy SVG overlay (z-index:10) -->
        <div class="battle-enemy" id="battle-enemy">
          ${spriteHtml}
          <div class="enemy-shadow"></div>
        </div>

        <!-- Enemy nameplate (top-left) -->
        <div class="enemy-nameplate-top">
          <span class="ent-name">${m.name}${m.phase === 2 ? ' <span style="color:#ff8800">★</span>' : ''}</span>
          <div class="ent-hp-row">
            <span class="ent-hp-label">HP</span>
            <div class="hp-bar-container" style="width:110px"><div class="hp-bar" style="width:${mHpPct}%"></div></div>
            <span class="ent-hp-num">${m.hp}</span>
          </div>
        </div>

      </div>

      <!-- DQ7-style bottom UI -->
      <div class="battle-ui">

        <!-- Message window -->
        <div class="battle-msg-win">
          <div class="battle-log-dq">${logHtml}</div>
        </div>

        <!-- Status + Commands -->
        <div class="battle-right-panel">

          <!-- Player status (DQ7 style) -->
          <div class="dq-status-win">
            <div class="dst-name">${p.name}<span class="dst-lv">Lv <span>${p.level}</span></span></div>
            <div class="dst-row">
              <span class="dst-label">HP</span>
              <span class="dst-num">${p.hp}<span class="dst-slash">／</span>${p.maxHp}</span>
            </div>
            <div class="dst-blocks">${hpBlocks}</div>
            <div class="dst-row" style="margin-top:4px">
              <span class="dst-label">MP</span>
              <span class="dst-num">${p.mp}<span class="dst-slash">／</span>${p.maxMp}</span>
            </div>
            <div class="dst-blocks">${mpBlocks}</div>
            ${p.status.length ? `<div style="margin-top:4px"><span class="poison-badge">どく</span></div>` : ''}
            ${partyHpHtml ? `<div class="party-hp-section">${partyHpHtml}</div>` : ''}
          </div>

          <!-- Command window -->
          <div class="dq-cmd-win">
            ${cmdHtml}
          </div>

        </div>
      </div>
    </div>`;
  }

  _makeBlocks(cur, max, count, color) {
    const filled = Math.round(clamp(cur / max, 0, 1) * count);
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<span class="hp-block" style="background:${i < filled ? color : '#333'};border-color:${i < filled ? color : '#444'}"></span>`;
    }
    return html;
  }

  _renderPartyBattleSprites() {
    const p = this.player;
    const pAlive = p.hp > 0;

    // Hero slot
    let html = `
      <div class="bp-slot${pAlive ? '' : ' bp-dead'}" id="bp-hero">
        <div class="bp-figure-wrap">
          <div class="bp-hero-fig">
            <div class="bp-hero-body"></div>
            <div class="bp-hero-belt"></div>
            <div class="bp-hero-legs"></div>
            <div class="bp-hero-sword"></div>
          </div>
        </div>
        <div class="bp-shadow"></div>
        <span class="bp-name-lbl">${p.name}</span>
        <span class="bp-hp-lbl">${pAlive ? p.hp : 'KO'}</span>
      </div>`;

    // Party members
    this.party.forEach(id => {
      const pm = this.partyData[id];
      if (!pm) return;
      const alive = pm.alive && pm.hp > 0;
      const figureInner = id === 'erina'
        ? `<div class="bp-erina-body"></div><div class="bp-erina-staff"></div>`
        : id === 'gard'
        ? `<div class="bp-gard-body"></div><div class="bp-gard-shield"></div><div class="bp-gard-legs"></div>`
        : `<div class="bp-luna-body"></div><div class="bp-luna-cross">+</div><div class="bp-luna-staff"></div>`;
      html += `
        <div class="bp-slot${alive ? '' : ' bp-dead'}" id="bp-${id}">
          <div class="bp-figure-wrap">
            <div class="bp-${id}-fig">${figureInner}</div>
          </div>
          <div class="bp-shadow"></div>
          <span class="bp-name-lbl">${pm.name}</span>
          <span class="bp-hp-lbl">${alive ? pm.hp : 'KO'}</span>
        </div>`;
    });
    return html;
  }

  renderSubMenu() {
    if (this.subMenu === 'magic') {
      const rows = this.player.spells.map(s => {
        const sp = GAME_DATA.spells[s];
        const canUse = this.player.mp >= sp.mpCost;
        return `<button class="submenu-btn${canUse?'':'" disabled style="opacity:.4'}" onclick="game.useSpell('${s}')">
          ${sp.name} <span class="mp-cost">MP:${sp.mpCost}</span>
        </button>`;
      }).join('');
      return `<div class="submenu-overlay">
        <div class="submenu-title">✨ まほう</div>
        <div class="submenu-grid">${rows}</div>
        <button class="btn" style="margin-top:6px" onclick="game.closeSubMenu()">← 戻る</button>
      </div>`;
    }
    if (this.subMenu === 'item') {
      const rows = this.player.items.map(it => {
        const item = GAME_DATA.items[it.id];
        return `<button class="submenu-btn" onclick="game.useItem('${it.id}')">
          ${item.name} x${it.count}
        </button>`;
      }).join('') || '<div style="color:#888;font-size:11px">アイテムがない</div>';
      return `<div class="submenu-overlay">
        <div class="submenu-title">💊 どうぐ</div>
        <div class="submenu-grid">${rows}</div>
        <button class="btn" style="margin-top:6px" onclick="game.closeSubMenu()">← 戻る</button>
      </div>`;
    }
    return '';
  }

  cmdAttack() {
    musicEngine.sfx('attack');
    // Canvas hero attack animation
    if (battleRenderer) battleRenderer.triggerAnim('hero', 'attack');
    // Apply damage mid-animation
    setTimeout(() => {
      const m = this.battle.monster;
      const dmg = this.dmg(this.getATK(), m.def);
      m.hp -= dmg;
      this.addBattleLog(`${this.player.name} の攻撃！ ${m.name} に ${dmg} のダメージ！`);
      this.showDmgNum(dmg, 'enemy');
      // Flash enemy sprite
      const enemy = document.getElementById('battle-enemy');
      if (enemy) {
        const f = document.createElement('div');
        f.style.cssText = 'position:absolute;inset:-8px;background:rgba(255,255,255,0.8);border-radius:50%;pointer-events:none;z-index:15;animation:encounterFlash 0.22s ease-out forwards';
        enemy.style.position = 'relative';
        enemy.appendChild(f);
        setTimeout(() => f.remove(), 240);
      }
      this.checkMonsterPhase2();
      if (m.hp <= 0) { m.hp = 0; this.winBattle(); return; }
      this.monsterTurn();
    }, 280);
  }

  cmdMagic() { musicEngine.sfx('cursor'); this.subMenu = 'magic'; this.render(); }
  cmdItem()  { musicEngine.sfx('cursor'); this.subMenu = 'item';  this.render(); }
  closeSubMenu() { this.subMenu = null; this.render(); }

  useSpell(id) {
    this.subMenu = null;
    const sp = GAME_DATA.spells[id];
    if (this.player.mp < sp.mpCost) {
      this.addBattleLog('MPが足りない！');
      this.render();
      return;
    }
    this.player.mp -= sp.mpCost;

    // Trigger visual spell effect on canvas
    if (battleRenderer) {
      const fxMap = {
        fire:'fire', blaze:'fire', inferno:'fire', flame:'fire',
        blizzard:'ice', frost:'ice', glacier:'ice', ice:'ice',
        thunder:'thunder', spark:'thunder', bolt:'thunder', lightning:'thunder',
        dark:'dark', shadow:'dark', void:'dark', death:'dark',
        holy:'holy', light:'holy', dawn:'holy', angel:'holy',
        heal:'heal', cure:'heal',
        healall:'healall', revive:'heal',
      };
      const fxType = fxMap[id] || (sp.type === 'heal' || sp.type === 'healall' || sp.type === 'revive' ? 'heal' : 'fire');
      battleRenderer.triggerSpell(fxType);
    }

    if (sp.type === 'magic') {
      const dmg = rand(sp.damage[0], sp.damage[1]);
      this.battle.monster.hp -= dmg;
      musicEngine.sfx('magic');
      this.addBattleLog(`${this.player.name} は ${sp.name} を唱えた！ ${this.battle.monster.name} に ${dmg} のダメージ！`);
      this.showDmgNum(dmg, 'enemy');
      this.checkMonsterPhase2();
      if (this.battle.monster.hp <= 0) { this.battle.monster.hp = 0; this.winBattle(); return; }
    } else if (sp.type === 'heal') {
      const h = rand(sp.heal[0], sp.heal[1]);
      const actual = Math.min(h, this.player.maxHp - this.player.hp);
      this.player.hp += actual;
      musicEngine.sfx('heal');
      this.addBattleLog(`${this.player.name} は ${sp.name} を唱えた！ HP が ${actual} 回復した！`);
    } else if (sp.type === 'buff') {
      this.player.tempDef += sp.buffAmount;
      this.player.buffTurns = sp.buffTurns;
      this.addBattleLog(`${this.player.name} は ${sp.name} を唱えた！ 守備力が上がった！`);
    } else if (sp.type === 'healall') {
      const h = rand(sp.heal[0], sp.heal[1]);
      const heroActual = Math.min(h, this.player.maxHp - this.player.hp);
      this.player.hp += heroActual;
      musicEngine.sfx('heal');
      this.party.forEach(id => {
        const pm = this.partyData[id];
        if (pm && pm.alive) {
          const a = Math.min(h, pm.maxHp - pm.hp);
          pm.hp += a;
        }
      });
      this.addBattleLog(`${this.player.name} は ${sp.name} を唱えた！ 全員のHPが回復した！`);
    } else if (sp.type === 'revive') {
      const deadId = this.party.find(id => this.partyData[id] && !this.partyData[id].alive);
      if (deadId) {
        const pm = this.partyData[deadId];
        pm.alive = true;
        pm.hp = Math.floor(pm.maxHp * 0.5);
        musicEngine.sfx('heal');
        this.addBattleLog(`${this.player.name} は ${sp.name} を唱えた！ ${pm.name} が復活した！`);
      } else {
        this.player.mp += sp.mpCost;
        this.addBattleLog('復活できる仲間がいない！MPを返した。');
        this.render(); return;
      }
    }
    this.monsterTurn();
  }

  useItem(id) {
    this.subMenu = null;
    const item = GAME_DATA.items[id];
    if (!this.removeItem(id)) { this.addBattleLog('そのアイテムはない！'); this.render(); return; }
    if (item.type === 'heal') {
      const actual = Math.min(item.healAmount, this.player.maxHp - this.player.hp);
      this.player.hp += actual;
      musicEngine.sfx('heal');
      this.addBattleLog(`${item.name} を使った！ HP が ${actual} 回復した！`);
    } else if (item.type === 'healFull') {
      const actual = this.player.maxHp - this.player.hp;
      this.player.hp = this.player.maxHp;
      musicEngine.sfx('heal');
      this.addBattleLog(`${item.name} を使った！ HP が全回復した！`);
    } else if (item.type === 'healMP') {
      const actual = Math.min(item.healAmount, this.player.maxMp - this.player.mp);
      this.player.mp += actual;
      this.addBattleLog(`${item.name} を使った！ MP が ${actual} 回復した！`);
    } else if (item.type === 'cure') {
      this.player.status = this.player.status.filter(s => s.type !== item.cureStatus);
      this.addBattleLog(`${item.name} を使った！ 毒が治った！`);
    }
    this.monsterTurn();
  }

  cmdFlee() {
    const m = this.battle.monster;
    if (m.isBoss) { this.addBattleLog('ボス戦では逃げられない！'); this.render(); return; }
    if (Math.random() < 0.55) {
      this.addBattleLog('うまく逃げ出した！');
      setTimeout(() => {
        this.screen = 'DUNGEON';
        musicEngine.playField();
        this.render();
      }, 800);
    } else {
      this.addBattleLog('逃げられなかった！');
      this.monsterTurn();
    }
  }

  checkMonsterPhase2() {
    const m = this.battle.monster;
    if (m.phase2Trigger && m.hp <= m.phase2Trigger && m.phase === 1 && !this.battle.phase2Shown) {
      m.phase = 2;
      this.battle.phase2Shown = true;
      if (m.isBoss && this.areaId === 'castle') {
        this.showDialog(GAME_DATA.story.finalBossPhase2, () => {
          this.screen = 'BATTLE';
          this.render();
        });
        this.screen = 'DIALOG';
      }
    }
  }

  // ── PARTY AUTO-BATTLE ─────────────────────────────────────
  partyAutoTurn() {
    const m = this.battle.monster;
    const p = this.player;
    if (m.hp <= 0) return;

    this.party.forEach(id => {
      if (m.hp <= 0) return;
      const pm = this.partyData[id];
      if (!pm || !pm.alive || pm.hp <= 0) return;

      if (id === 'erina') {
        // Cast offensive spell if MP available
        const candidates = pm.spells.filter(s => {
          const sp = GAME_DATA.spells[s];
          return sp && sp.type === 'magic' && pm.mp >= sp.mpCost;
        });
        if (candidates.length > 0) {
          const spellId = candidates[rand(0, candidates.length - 1)];
          const sp = GAME_DATA.spells[spellId];
          pm.mp -= sp.mpCost;
          const dmg = rand(sp.damage[0], sp.damage[1]);
          m.hp = Math.max(0, m.hp - dmg);
          this.addBattleLog(`${pm.name} の${sp.name}！ ${m.name} に${dmg}のダメージ！`);
          this.showDmgNum(dmg, 'enemy');
        } else {
          const dmg = Math.max(1, pm.atk - m.def + rand(-2, 2));
          m.hp = Math.max(0, m.hp - dmg);
          this.addBattleLog(`${pm.name} の攻撃！ ${dmg}のダメージ！`);
        }
      } else if (id === 'gard') {
        // Always physical attack
        const dmg = Math.max(1, pm.atk - m.def + rand(-3, 6));
        m.hp = Math.max(0, m.hp - dmg);
        this.addBattleLog(`${pm.name} の大剣攻撃！ ${dmg}のダメージ！`);
        this.showDmgNum(dmg, 'enemy');
      } else if (id === 'luna') {
        // Heal hero if HP < 50%, otherwise attack
        if (p.hp < p.maxHp * 0.5 && pm.mp >= 5) {
          const healId = pm.spells.includes('healmore') && pm.mp >= 11 ? 'healmore' : 'heal';
          const sp = GAME_DATA.spells[healId];
          pm.mp -= sp.mpCost;
          const h = rand(sp.heal[0], sp.heal[1]);
          const actual = Math.min(h, p.maxHp - p.hp);
          p.hp += actual;
          musicEngine.sfx('heal');
          this.addBattleLog(`${pm.name} の${sp.name}！ ${p.name}のHPが${actual}回復！`);
        } else {
          const dmg = Math.max(1, pm.atk - m.def + rand(-2, 2));
          m.hp = Math.max(0, m.hp - dmg);
          this.addBattleLog(`${pm.name} の攻撃！ ${dmg}のダメージ！`);
        }
      }
    });
  }

  monsterTurn() {
    // Party acts before monster
    this.partyAutoTurn();
    if (this.battle.monster.hp <= 0) {
      this.battle.monster.hp = 0;
      this.winBattle();
      return;
    }

    const m = this.battle.monster;
    const p = this.player;
    const actions = m.actions;
    let action = actions[rand(0, actions.length - 1)];
    if (m.phase === 2 && Math.random() > 0.35) {
      const strong = actions.filter(a => a !== 'attack' && a !== 'regen');
      if (strong.length) action = strong[rand(0, strong.length - 1)];
    }
    const atkMult = m.phase === 2 ? 1.4 : 1;
    const mAtk = Math.floor(m.atk * atkMult);
    const pDef = this.getDEF();

    switch (action) {
      case 'attack': {
        const d = this.dmg(mAtk, pDef);
        p.hp -= d;
        musicEngine.sfx('attack');
        this.addBattleLog(`${m.name} の攻撃！ ${d} のダメージを受けた！`);
        this.shakeHero();
        break;
      }
      case 'breath': {
        const d = Math.max(1, Math.floor(mAtk * 0.85 - pDef * 0.4));
        p.hp -= d;
        this.addBattleLog(`${m.name} の炎のブレス！ ${d} のダメージ！`);
        this.shakeHero();
        break;
      }
      case 'smash': {
        const d = Math.max(1, Math.floor(mAtk * 1.6 - pDef * 0.5));
        p.hp -= d;
        this.addBattleLog(`${m.name} の強打！ ${d} の大ダメージ！`);
        this.shakeHero();
        break;
      }
      case 'magic': {
        const d = rand(28, 48) + (m.phase === 2 ? 20 : 0);
        p.hp -= d;
        musicEngine.sfx('magic');
        this.addBattleLog(`${m.name} の魔法攻撃！ ${d} のダメージ！`);
        this.shakeHero();
        break;
      }
      case 'poison': {
        if (!p.status.find(s => s.type === 'poison')) {
          p.status.push({ type: 'poison', turns: 5 });
          this.addBattleLog(`${m.name} の毒攻撃！ 毒に侵された！`);
        } else {
          const d = this.dmg(mAtk, pDef);
          p.hp -= d;
          this.addBattleLog(`${m.name} の攻撃！ ${d} のダメージ！`);
        }
        break;
      }
      case 'regen': {
        const h = Math.floor(m.maxHp * 0.06);
        m.hp = Math.min(m.maxHp, m.hp + h);
        this.addBattleLog(`${m.name} は体力を回復した！ ${h} HP 回復！`);
        break;
      }
      case 'charge': {
        const d = Math.max(1, Math.floor(mAtk * 1.3 - pDef * 0.6));
        p.hp -= d;
        this.addBattleLog(`${m.name} の突進！ ${d} のダメージ！`);
        this.shakeHero();
        break;
      }
      case 'roar':
        this.addBattleLog(`${m.name} の咆哮！ 恐怖で一瞬体が固まった！`);
        break;
      case 'drain': {
        const d = Math.max(1, Math.floor(mAtk * 0.75));
        p.hp -= d;
        m.hp = Math.min(m.maxHp, m.hp + Math.floor(d * 0.5));
        this.addBattleLog(`${m.name} のHP吸収！ ${d} のHPを吸い取られた！`);
        break;
      }
      case 'darkBlast': {
        const d = Math.max(1, Math.floor(mAtk * 1.3 - pDef * 0.2));
        p.hp -= d;
        musicEngine.sfx('magic');
        this.addBattleLog(`${m.name} の闇の爆発！ ${d} の大ダメージ！`);
        this.shakeHero();
        break;
      }
      case 'tailSwipe': {
        const d = Math.max(1, Math.floor(mAtk * 0.9 - pDef * 0.5));
        p.hp -= d;
        this.addBattleLog(`${m.name} の尻尾攻撃！ ${d} のダメージ！`);
        break;
      }
      case 'rage': {
        for (let i = 0; i < 2; i++) {
          const d = Math.max(1, this.dmg(Math.floor(mAtk * 0.75), pDef));
          p.hp -= d;
          this.addBattleLog(`${m.name} の連続攻撃！ ${d} のダメージ！`);
        }
        this.shakeHero();
        break;
      }
    }

    // Poison tick
    const poison = p.status.find(s => s.type === 'poison');
    if (poison) {
      const pd = Math.max(1, Math.floor(p.maxHp * 0.05));
      p.hp -= pd;
      poison.turns--;
      if (poison.turns <= 0) p.status = p.status.filter(s => s.type !== 'poison');
      this.addBattleLog(`毒でHPが ${pd} 減少した！`);
    }

    // Buff duration
    if (p.buffTurns > 0) {
      p.buffTurns--;
      if (p.buffTurns === 0) { p.tempDef = 0; this.addBattleLog('バリアが解けた。'); }
    }

    p.hp = clamp(p.hp, 0, p.maxHp);

    if (p.hp <= 0) {
      this.loseBattle();
      return;
    }
    this.render();
  }

  winBattle() {
    const m = this.battle.monster;
    const expGain = m.exp;
    const goldGain = m.gold;
    this.player.exp += expGain;
    this.player.gold += goldGain;
    musicEngine.sfx('hit');
    this.addBattleLog(`${m.name} を倒した！ ${expGain} EXP と ${goldGain} G を得た！`);
    this.render();

    // Level up?
    const lvMsgs = this.checkLevelUp();
    if (lvMsgs.length) {
      setTimeout(() => {
        musicEngine.sfx('levelup');
        this.showLevelUp(lvMsgs, () => this.afterBattle());
      }, 600);
    } else {
      setTimeout(() => {
        musicEngine.playVictory();
        setTimeout(() => this.afterBattle(), 1800);
      }, 600);
    }
  }

  afterBattle() {
    if (this.battle.isBoss) {
      this.handleBossWin();
    } else {
      this.screen = 'DUNGEON';
      musicEngine.playField();
      this.render();
    }
  }

  handleBossWin() {
    const area = this.areas[this.areaId];
    area.bossDefeated = true;
    if (this.areaId === 'forest') {
      this.flags.forestCleared = true;
      this.areas['cave'].locked = false;
      this.showDialog(GAME_DATA.story.forestClear, () => {
        if (!this.party.includes('gard')) this.party.push('gard');
        this.screen = 'MAP';
        this.render();
      });
    } else if (this.areaId === 'cave') {
      this.flags.caveCleared = true;
      this.areas['castle'].locked = false;
      this.showDialog(GAME_DATA.story.caveClear, () => {
        if (!this.party.includes('luna')) this.party.push('luna');
        this.screen = 'MAP';
        this.render();
      });
    } else if (this.areaId === 'castle') {
      this.flags.gameCleared = true;
      this.showDialog(GAME_DATA.story.ending, () => {
        this.screen = 'ENDING';
        musicEngine.playEnding();
        this.render();
      });
    }
    this.screen = 'DIALOG';
    this.render();
  }

  loseBattle() {
    musicEngine.playGameOver();
    this.addBattleLog('倒れてしまった…。');
    this.render();
    setTimeout(() => {
      this.screen = 'GAMEOVER';
      this.render();
    }, 1500);
  }

  addBattleLog(text) {
    this.battleLog.push(text);
    if (this.battleLog.length > 20) this.battleLog.shift();
  }

  shakeHero() {
    setTimeout(() => {
      if (battleRenderer) battleRenderer.triggerAnim('hero', 'hurt');
    }, 50);
  }

  showDmgNum(dmg, target) {
    setTimeout(() => {
      const scene = document.querySelector('.battle-env');
      if (!scene) return;
      const el = document.createElement('div');
      el.className = `damage-number ${target === 'enemy' ? 'enemy-dmg' : 'player-dmg'}`;
      el.textContent = dmg;
      el.style.left = target === 'enemy' ? '55%' : '18%';
      el.style.top = '40%';
      scene.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }, 100);
  }

  // ── LEVEL UP OVERLAY ──────────────────────────────────────
  showLevelUp(msgs, cb) {
    const c = $('game-container');
    const el = document.createElement('div');
    el.id = 'levelup-overlay';
    el.innerHTML = `
      <div class="levelup-title">⭐ レベルアップ！</div>
      <div class="levelup-stats">${msgs.join('<br>')}</div>
      <button class="btn btn-gold" onclick="this.parentElement.remove();(${cb.toString()})()">OK</button>`;
    c.appendChild(el);
  }

  // ── GAMEOVER ──────────────────────────────────────────────
  renderGameOver() {
    return `<div id="gameover-screen">
      <div class="gameover-text">GAME OVER</div>
      <div style="font-size:12px;color:#888;margin-bottom:24px">勇者は倒れた…</div>
      <button class="btn btn-gold" onclick="game.restartFromVillage()">🏘️ 村から再開</button>
    </div>`;
  }

  restartFromVillage() {
    // Keep player but restore HP/MP to partial
    this.player.hp = Math.floor(this.player.maxHp * 0.5);
    this.player.mp = Math.floor(this.player.maxMp * 0.5);
    this.player.status = [];
    this.player.tempDef = 0;
    this.areaId = 'village';
    this.room = 0;
    this.screen = 'TOWN';
    musicEngine.playTown();
    this.render();
  }

  // ── ENDING ────────────────────────────────────────────────
  renderEnding() {
    const partyNames = this.party.map(id => this.partyData[id]?.name || id).join('・');
    return `<div id="ending-screen">
      <div class="ending-title">― 光のクリスタル ―</div>
      <div class="ending-text">
        魔王ゾルディアークを倒し、<br>
        光のクリスタルを取り戻した！<br><br>
        ${partyNames ? `仲間たち（${partyNames}）と共に<br>戦い抜いた勇者の物語は<br>永く語り継がれた。<br><br>` : ''}
        ＊　＊　＊<br><br>
        クリアレベル: ${this.player.level}<br>
        所持金: ${this.player.gold} G<br><br>
        ～ THE END ～
      </div>
      <button class="btn btn-gold" onclick="location.reload()" style="margin-top:24px">タイトルへ戻る</button>
    </div>`;
  }

  // ── DIALOG ────────────────────────────────────────────────
  showDialog(queue, callback) {
    this.dialog = { queue: [...queue], idx: 0, active: true, callback };
    this.screen = 'DIALOG';
    this.renderDialogOnly();
  }

  renderDialogOnly() {
    // Render background + dialog overlay
    const c = $('game-container');
    // Keep previous screen visible as backdrop
    if (!document.getElementById('dialog-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'dialog-overlay';
      ov.onclick = () => game.advanceDialog();
      c.appendChild(ov);
    }
    this.updateDialogContent();
  }

  renderDialog() {
    if (!document.getElementById('dialog-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'dialog-overlay';
      ov.onclick = () => game.advanceDialog();
      $('game-container').appendChild(ov);
    }
    this.updateDialogContent();
  }

  updateDialogContent() {
    const ov = document.getElementById('dialog-overlay');
    if (!ov) return;
    const d = this.dialog.queue[this.dialog.idx];
    if (!d) return;
    ov.innerHTML = `
      <div class="dialog-speaker">${d.speaker}</div>
      <div class="dialog-text">${d.text}</div>
      <div class="dialog-arrow">▼</div>`;
  }

  advanceDialog() {
    musicEngine.sfx('cursor');
    this.dialog.idx++;
    if (this.dialog.idx >= this.dialog.queue.length) {
      this.dialog.active = false;
      const ov = document.getElementById('dialog-overlay');
      if (ov) ov.remove();
      if (this.dialog.callback) this.dialog.callback();
    } else {
      this.updateDialogContent();
    }
  }

  // ── QUICK MESSAGE ─────────────────────────────────────────
  quickMsg(text, cb) {
    const fake = [{ speaker: 'システム', text }];
    this.showDialog(fake, cb || (() => this.render()));
    this.render();
  }

  // ── MAKE BAR ──────────────────────────────────────────────
  makeHpBar(cur, max, w = 140) {
    const pct = clamp(cur / max * 100, 0, 100);
    const cls = pct < 25 ? 'hp-bar low' : pct < 50 ? 'hp-bar mid' : 'hp-bar';
    return `<div class="hp-bar-container" style="width:${w}px"><div class="${cls}" style="width:${pct}%"></div></div>`;
  }

  makeMpBar(cur, max, w = 140) {
    const pct = clamp(cur / max * 100, 0, 100);
    return `<div class="mp-bar-container" style="width:${w}px"><div class="mp-bar" style="width:${pct}%"></div></div>`;
  }
}

// ── Bootstrap ──────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  game.screen = 'TITLE';
  game.render();

  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (game.dialog.active) { e.preventDefault(); game.advanceDialog(); }
      else if (game.screen === 'TITLE') game.startGame();
    }
  });

  // Allow audio on any click
  document.addEventListener('click', () => {
    musicEngine.init();
    musicEngine.resume();
  }, { once: false });
});
