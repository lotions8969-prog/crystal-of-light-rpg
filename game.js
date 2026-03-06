// ============================================================
//  光のクリスタル - Main Game Engine
// ============================================================

let game;

// ─── Utility ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

class Game {
  constructor() {
    this.screen = 'TITLE';
    this.player = null;
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
      status: [],   // [{type:'poison', turns:N}]
      tempDef: 0,
      buffTurns: 0,
    };
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
    switch (this.screen) {
      case 'TITLE':   c.innerHTML = this.renderTitle();  break;
      case 'MAP':     c.innerHTML = this.renderMap();    break;
      case 'TOWN':    c.innerHTML = this.renderTown();   break;
      case 'DUNGEON': c.innerHTML = this.renderDungeon(); break;
      case 'BATTLE':  c.innerHTML = this.renderBattle(); break;
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
    this.screen = 'DIALOG';
    this.showDialog(GAME_DATA.story.intro, () => {
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

    const cmdHtml = this.subMenu ? this.renderSubMenu() : `
      <button class="dq-cmd" onclick="game.cmdAttack()"><span class="cmd-cursor">▶</span>たたかう</button>
      <button class="dq-cmd" onclick="game.cmdMagic()"><span class="cmd-cursor"> </span>じゅもん</button>
      <button class="dq-cmd" onclick="game.cmdItem()"><span class="cmd-cursor"> </span>どうぐ</button>
      <button class="dq-cmd danger" onclick="game.cmdFlee()"><span class="cmd-cursor"> </span>にげる</button>`;

    return `<div id="battle-screen">
      <div class="battle-env ${bgClass}" id="battle-env">

        <!-- Enemy -->
        <div class="battle-enemy" id="battle-enemy">
          ${spriteHtml}
          <div class="enemy-shadow"></div>
        </div>

        <!-- Hero sprite (DQ7 shows party in lower right) -->
        <div class="battle-hero-sprite">
          <div class="hero-figure">
            <div class="hero-head"></div>
            <div class="hero-body"></div>
            <div class="hero-legs"></div>
            <div class="hero-sword"></div>
          </div>
          <div class="battle-hero-shadow" style="width:36px;height:6px;background:rgba(0,0,0,0.45);border-radius:50%;margin:0 auto;filter:blur(3px)"></div>
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
    const m = this.battle.monster;
    const dmg = this.dmg(this.getATK(), m.def);
    m.hp -= dmg;
    this.addBattleLog(`${this.player.name} の攻撃！ ${m.name} に ${dmg} のダメージ！`);
    this.showDmgNum(dmg, 'enemy');
    this.checkMonsterPhase2();
    if (m.hp <= 0) { m.hp = 0; this.winBattle(); return; }
    this.monsterTurn();
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

  monsterTurn() {
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
        this.screen = 'MAP';
        this.render();
      });
    } else if (this.areaId === 'cave') {
      this.flags.caveCleared = true;
      this.areas['castle'].locked = false;
      this.showDialog(GAME_DATA.story.caveClear, () => {
        this.screen = 'MAP';
        this.render();
      });
    } else if (this.areaId === 'castle') {
      this.flags.gameCleared = true;
      this.screen = 'DIALOG';
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
      const el = document.querySelector('.battle-hero');
      if (el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 350); }
    }, 50);
  }

  showDmgNum(dmg, target) {
    setTimeout(() => {
      const scene = document.querySelector('.battle-env');
      if (!scene) return;
      const el = document.createElement('div');
      el.className = `damage-number ${target === 'enemy' ? 'enemy-dmg' : 'player-dmg'}`;
      el.textContent = dmg;
      el.style.left = target === 'enemy' ? '28%' : '65%';
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
    return `<div id="ending-screen">
      <div class="ending-title">✨ おめでとう！ ✨</div>
      <div class="ending-text">
        魔王ゾルディアークを倒し、<br>
        光のクリスタルを取り戻した！<br><br>
        勇者の名は世界中に広まり、<br>
        平和が訪れた。<br><br>
        ＊　＊　＊<br><br>
        クリアレベル: ${this.player.level}<br>
        所持金: ${this.player.gold} G<br><br>
        ～ THE END ～
      </div>
      <button class="btn btn-gold" onclick="location.reload()" style="margin-top:24px">🔄 タイトルへ戻る</button>
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
