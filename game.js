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
    this.W = 640;
    this.H = 302;
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
    const dur = type === 'attack' ? 30 : 20;
    this.anims[id] = { type, start: this.frame, dur };
  }

  _getAnim(id) {
    const a = this.anims[id];
    if (!a) return { x: 0, y: 0 };
    const t = (this.frame - a.start) / a.dur;
    if (t >= 1) { delete this.anims[id]; return { x: 0, y: 0 }; }
    if (a.type === 'attack') {
      const curve = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;
      return { x: curve * this.W * 0.36, y: -curve * 12 };
    }
    if (a.type === 'hurt') return { x: Math.sin(t * Math.PI * 5) * 10, y: 0 };
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

    // Draw party
    const members = this._members(g);
    const layout = [
      { x: W*0.07, y: H*0.76 },
      { x: W*0.20, y: H*0.82 },
      { x: W*0.07, y: H*0.93 },
      { x: W*0.20, y: H*0.97 },
    ];
    members.forEach((m, i) => {
      if (!layout[i]) return;
      const bob  = Math.sin(frame * 0.05 + i * 1.3) * 2.2;
      const anim = this._getAnim(m.id);
      const x = layout[i].x + anim.x;
      const y = layout[i].y + bob + anim.y;
      this._drawShadow(x + 16, y + 4);
      ctx.save();
      if (!m.alive) { ctx.globalAlpha = 0.22; ctx.filter = 'grayscale(100%)'; }
      ctx.translate(x, y);
      const fn = this['_c_' + m.id];
      if (fn) fn.call(this, ctx);
      else this._c_hero(ctx);
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

  _drawShadow(cx, cy) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    g.addColorStop(0, 'rgba(0,0,0,0.45)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.save(); ctx.scale(1, 0.3);
    ctx.beginPath(); ctx.arc(cx, cy/0.3, 22, 0, Math.PI*2); ctx.fill();
    ctx.restore();
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

  _c_hero(ctx) {
    // Scale 2.4 — blue plate armor hero, side/back view facing right
    ctx.save(); ctx.scale(2.4,2.4);
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

  _c_erina(ctx) {
    // Scale 2.2 — purple mage, witch hat, staff
    ctx.save(); ctx.scale(2.2,2.2);
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

  _c_gard(ctx) {
    // Scale 2.5 — heavy plate warrior, shield left, sword right
    ctx.save(); ctx.scale(2.5,2.5);
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

  _c_luna(ctx) {
    // Scale 2.2 — white/teal oracle healer, moon staff
    ctx.save(); ctx.scale(2.2,2.2);
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
    // Stop canvas if leaving battle
    if (this.screen !== 'BATTLE' && battleRenderer) {
      battleRenderer.stop(); battleRenderer = null;
    }
    switch (this.screen) {
      case 'TITLE':   c.innerHTML = this.renderTitle();  break;
      case 'MAP':     c.innerHTML = this.renderMap();    break;
      case 'TOWN':    c.innerHTML = this.renderTown();   break;
      case 'DUNGEON': c.innerHTML = this.renderDungeon(); break;
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
    const stars = Array.from({length: 60}, () => {
      const x = rand(0, 100), y = rand(0, 100), s = rand(1, 3);
      const delay = (Math.random() * 2).toFixed(1);
      return `<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${delay}s"></div>`;
    }).join('');
    return `
    <div id="title-screen">
      <div class="stars">${stars}</div>
      <div class="title-logo">
        <span class="title-main">光のクリスタル</span>
        <span class="title-sub">～ The Crystal of Light ～</span>
      </div>
      <div class="title-hero">⚔️</div>
      <button class="press-start" onclick="game.startGame()">▶ ゲームスタート</button>
      <div class="title-version text-gray text-small" style="position:absolute;bottom:12px">
        RPG ～30分クリア～ Web Audio DQ風 BGM付き
      </div>
    </div>`;
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
      <div class="town-sky"></div>
      <div class="town-cloud cloud-1"></div>
      <div class="town-cloud cloud-2"></div>
      <div class="town-ground"></div>
      <div class="town-road"></div>

      <!-- 宿屋 -->
      <div style="position:absolute;bottom:47%;left:48px;z-index:5">
        <div style="position:relative;width:108px;height:88px;background:#c8a86a;border:2px solid #8a6040">
          <div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:60px solid transparent;border-right:60px solid transparent;border-bottom:50px solid #8a3a1a"></div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:24px;height:32px;background:#6a4020;border-radius:40% 40% 0 0/60% 60% 0 0"></div>
          <div style="position:absolute;top:18px;left:10px;width:22px;height:22px;background:#ffeaa0;border:1px solid #8a6040;box-shadow:0 0 5px rgba(255,220,100,0.6)"></div>
          <div style="position:absolute;top:18px;right:10px;width:22px;height:22px;background:#ffeaa0;border:1px solid #8a6040;box-shadow:0 0 5px rgba(255,220,100,0.6)"></div>
          <div style="position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:9px;color:#ffd700;white-space:nowrap;text-shadow:1px 1px 0 #000">宿 屋</div>
        </div>
      </div>

      <!-- 道具屋 -->
      <div style="position:absolute;bottom:47%;left:238px;z-index:5">
        <div style="position:relative;width:128px;height:78px;background:#a87850;border:2px solid #6a4020">
          <div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:70px solid transparent;border-right:70px solid transparent;border-bottom:44px solid #6a3010"></div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:30px;height:26px;background:#5a3010;border:1px solid #3a1a00"></div>
          <div style="position:absolute;top:14px;left:8px;width:34px;height:24px;background:#ffeaa0;border:1px solid #8a6040;box-shadow:0 0 5px rgba(255,220,100,0.5)"></div>
          <div style="position:absolute;top:14px;right:8px;width:34px;height:24px;background:#ffeaa0;border:1px solid #8a6040;box-shadow:0 0 5px rgba(255,220,100,0.5)"></div>
          <div style="position:absolute;top:3px;left:50%;transform:translateX(-50%);font-size:9px;color:#ffd700;white-space:nowrap;text-shadow:1px 1px 0 #000">道 具 屋</div>
        </div>
      </div>

      <!-- 教会 -->
      <div style="position:absolute;bottom:47%;left:448px;z-index:5">
        <div style="position:relative;width:90px;height:98px;background:#e0d8c0;border:2px solid #a09070">
          <div style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:0;height:0;border-left:50px solid transparent;border-right:50px solid transparent;border-bottom:54px solid #888060"></div>
          <div style="position:absolute;bottom:calc(100% + 54px);left:50%;transform:translateX(-55%);width:7px;height:18px;background:#ffd700"></div>
          <div style="position:absolute;bottom:calc(100% + 60px);left:50%;transform:translateX(-55%) translateX(-6px);width:20px;height:6px;background:#ffd700"></div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:22px;height:34px;background:#6a4020;border-radius:40% 40% 0 0/60% 60% 0 0"></div>
          <div style="position:absolute;top:24px;left:8px;width:18px;height:22px;background:#a0d0ff;border:1px solid #808090;box-shadow:0 0 4px rgba(150,200,255,0.5)"></div>
          <div style="position:absolute;top:24px;right:8px;width:18px;height:22px;background:#a0d0ff;border:1px solid #808090;box-shadow:0 0 4px rgba(150,200,255,0.5)"></div>
        </div>
      </div>

      <!-- 木 -->
      <div style="position:absolute;bottom:47%;left:196px;z-index:4">
        <div style="width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:42px solid #2a8a18;margin:0 auto"></div>
        <div style="width:0;height:0;border-left:16px solid transparent;border-right:16px solid transparent;border-bottom:34px solid #3aaa20;margin:-12px auto 0"></div>
        <div style="width:12px;height:24px;background:#6a4020;margin:0 auto;border:1px solid #4a2a10"></div>
      </div>
      <div style="position:absolute;bottom:47%;left:398px;z-index:4">
        <div style="width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-bottom:38px solid #228818;margin:0 auto"></div>
        <div style="width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:30px solid #2aaa18;margin:-10px auto 0"></div>
        <div style="width:10px;height:20px;background:#6a4020;margin:0 auto;border:1px solid #4a2a10"></div>
      </div>

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
        <div class="dungeon-scene ${areaClass}">
          <div class="dungeon-walls">
            <div class="dungeon-wall-left ${areaClass}"></div>
            <div class="dungeon-wall-right ${areaClass}"></div>
            <div class="dungeon-ceiling"></div>
            <div class="dungeon-floor"></div>
          </div>
          ${torches}
          <div class="dungeon-room-info">${area.name}　[${this.room + 1} / ${area.rooms + 1}]</div>
          <div class="dungeon-center">
            <span class="dungeon-illustration-emoji" style="font-size:${bossReady ? '88' : '58'}px">${sceneEmoji}</span>
            <div style="font-size:11px;color:${bossReady ? '#ff6666' : '#666'};margin-top:4px">
              ${bossReady ? '--- ボスが待ち受けている ---' : area.name}
            </div>
          </div>
          ${this.lastTreasure ? `<div class="treasure-found">${this.lastTreasure}</div>` : ''}
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
