'use strict';

const GAME_DATA = {

  // ── キャラクター固有テック ────────────────────────────────────
  heroTechs: {
    attack:    { name: 'たたかう',    mpCost: 0,  power: 1.0, type: 'phys',  target: 'single', element: 'none', always: true },
    slash:     { name: '斬撃',       mpCost: 0,  power: 1.9, type: 'phys',  target: 'single', element: 'none', minLevel: 1,  desc: '鋭い一撃を浴びせる。' },
    cyclone:   { name: 'サイクロン', mpCost: 8,  power: 1.25,type: 'phys',  target: 'all',    element: 'wind', minLevel: 5,  desc: '旋風を起こし全敵を攻撃。' },
    shockwave: { name: '衝撃波',     mpCost: 12, power: 2.3, type: 'phys',  target: 'single', element: 'none', minLevel: 8,  desc: '強烈な衝撃波で単体大ダメージ。' },
    luminance: { name: '輝光撃',     mpCost: 18, power: 3.4, type: 'magic', target: 'single', element: 'holy', minLevel: 12, desc: '光を纏った神聖な一撃。聖属性。' },
  },

  erinaTechs: {
    attack:       { name: 'たたかう',      mpCost: 0,  power: 0.7, type: 'phys',  target: 'single', element: 'none',    always: true },
    ice_lance:    { name: '氷の槍',        mpCost: 6,  power: 2.1, type: 'magic', target: 'single', element: 'ice',     minLevel: 1, canFreeze: 0.2, desc: '鋭い氷の槍。20%で凍結。' },
    fire_whirl:   { name: '炎旋風',        mpCost: 8,  power: 1.3, type: 'magic', target: 'all',    element: 'fire',    minLevel: 1, desc: '炎の竜巻で全敵を攻撃。' },
    thunder_storm:{ name: '雷嵐',         mpCost: 14, power: 1.85,type: 'magic', target: 'all',    element: 'thunder', minLevel: 7, desc: '雷の嵐で全敵を撃つ。' },
    mana_burst:   { name: 'マナバースト',  mpCost: 24, power: 4.2, type: 'magic', target: 'single', element: 'arcane',  minLevel: 12, desc: '純魔力の爆発。最大威力の単体攻撃。' },
  },

  gardTechs: {
    attack:      { name: 'たたかう',        mpCost: 0,  power: 1.35,type: 'phys', target: 'single', element: 'none',  always: true },
    shield_bash: { name: 'シールドバッシュ', mpCost: 0,  power: 2.1, type: 'phys', target: 'single', element: 'none',  minLevel: 1, canStun: 0.3, desc: '盾で叩きつける。30%でスタン。' },
    war_cry:     { name: '雄叫び',          mpCost: 8,  power: 0,   type: 'buff', target: 'party',  element: 'none',  minLevel: 4, buffType: 'atk', buffPct: 0.35, turns: 3, desc: '3ターン全員の攻撃力+35%。' },
    aegis:       { name: 'イージス',        mpCost: 12, power: 0,   type: 'buff', target: 'self',   element: 'none',  minLevel: 7, buffType: 'def', buffPct: 1.0, turns: 3, taunt: true, desc: '防御を倍増し敵の標的になる。' },
    ground_slam: { name: 'グランドスラム',   mpCost: 16, power: 2.5, type: 'phys', target: 'all',    element: 'earth', minLevel: 11, desc: '地面を叩き割り全敵に大ダメージ。' },
  },

  lunaTechs: {
    attack:       { name: 'たたかう',        mpCost: 0,  power: 0.6, type: 'phys',    target: 'single', element: 'none', always: true },
    holy_light:   { name: '聖なる光',        mpCost: 10, power: 0,   type: 'healall', target: 'party',  element: 'holy', minLevel: 1, healPct: 0.38, desc: '全員のHPを38%回復する。' },
    barrier:      { name: 'バリアフィールド', mpCost: 8,  power: 0,   type: 'buff',    target: 'party',  element: 'none', minLevel: 1, buffType: 'statusImmune', turns: 3, desc: '3ターン状態異常を無効化。' },
    resurrect:    { name: 'リザレクション',  mpCost: 26, power: 0,   type: 'revive',  target: 'single', element: 'holy', minLevel: 6, healPct: 0.5, desc: '戦闘不能を回復しHP50%で復活。' },
    divine_strike:{ name: '神撃',           mpCost: 22, power: 3.1, type: 'magic',   target: 'single', element: 'holy', minLevel: 11, desc: '神の力による聖なる一撃。' },
  },

  // ── 合体技（二連技）────────────────────────────────────────
  dualTechs: {
    fire_cross: {
      name: '炎十字斬', chars: ['hero', 'erina'],
      power: 5.5, type: 'magic', target: 'single', element: 'fire',
      mpCosts: { hero: 8, erina: 8 },
      minLevels: { hero: 3, erina: 0 },
      desc: '勇者とエリナの合体技！炎を纏った十字斬撃！',
      animation: 'fire',
    },
    dual_strike: {
      name: '連携突撃', chars: ['hero', 'gard'],
      power: 6.2, type: 'phys', target: 'single', element: 'none',
      mpCosts: { hero: 0, gard: 10 },
      minLevels: { hero: 5, gard: 0 },
      desc: '勇者とガルドの合体技！二人同時の超強力攻撃！',
      animation: null,
    },
    aurora: {
      name: 'オーロラブラスト', chars: ['erina', 'luna'],
      power: 2.6, type: 'magic', target: 'all', element: 'holy',
      mpCosts: { erina: 14, luna: 12 },
      minLevels: { erina: 7, luna: 0 },
      healAmount: 55,
      desc: 'エリナとルナの合体技！全敵にダメージ＋全員回復！',
      animation: 'holy',
    },
    sacred_blade: {
      name: '神聖剣', chars: ['hero', 'luna'],
      power: 7.2, type: 'magic', target: 'single', element: 'holy',
      mpCosts: { hero: 18, luna: 22 },
      minLevels: { hero: 10, luna: 0 },
      desc: '勇者とルナの最強合体技！神聖な光の剣！',
      animation: 'holy',
    },
    blizzard_smash: {
      name: 'ブリザードスマッシュ', chars: ['erina', 'gard'],
      power: 5.8, type: 'magic', target: 'single', element: 'ice',
      mpCosts: { erina: 12, gard: 8 },
      minLevels: { erina: 5, gard: 4 },
      desc: 'エリナとガルドの合体技！凍てつく粉砕攻撃！',
      animation: 'ice',
    },
  },

  // ── 三連技 ──────────────────────────────────────────────────
  tripleTechs: {
    delta_force: {
      name: 'デルタフォース', chars: ['hero', 'erina', 'gard'],
      power: 10.5, type: 'magic', target: 'all', element: 'all',
      mpCosts: { hero: 18, erina: 24, gard: 16 },
      minLevels: { hero: 12, erina: 0, gard: 0 },
      desc: '勇者・エリナ・ガルドによる究極三連技！全敵に壊滅的ダメージ！',
      animation: 'delta',
    },
  },

  // ── テック習得レベル ─────────────────────────────────────────
  techLevelUp: {
    hero:  [
      { level: 1,  techs: ['slash'] },
      { level: 5,  techs: ['cyclone'] },
      { level: 8,  techs: ['shockwave'] },
      { level: 12, techs: ['luminance'] },
    ],
    erina: [
      { level: 1,  techs: ['ice_lance', 'fire_whirl'] },
      { level: 7,  techs: ['thunder_storm'] },
      { level: 12, techs: ['mana_burst'] },
    ],
    gard:  [
      { level: 1,  techs: ['shield_bash'] },
      { level: 4,  techs: ['war_cry'] },
      { level: 7,  techs: ['aegis'] },
      { level: 11, techs: ['ground_slam'] },
    ],
    luna:  [
      { level: 1,  techs: ['holy_light', 'barrier'] },
      { level: 6,  techs: ['resurrect'] },
      { level: 11, techs: ['divine_strike'] },
    ],
  },

  // ── アイテム ────────────────────────────────────────────────
  items: {
    potion:    { name: 'ポーション',      type: 'heal',       healAmount: 40,  price: 30,  desc: 'HPを40回復する。' },
    hiPotion:  { name: 'ハイポーション',  type: 'heal',       healAmount: 130, price: 80,  desc: 'HPを130回復する。' },
    elixir:    { name: 'エリクサー',      type: 'healFull',                    price: 280, desc: 'HPとMPを全回復する。' },
    ether:     { name: 'エーテル',        type: 'healMP',     healAmount: 32,  price: 50,  desc: 'MPを32回復する。' },
    fullEther: { name: 'フルエーテル',    type: 'healMP',     healAmount: 85,  price: 130, desc: 'MPを85回復する。' },
    antidote:  { name: '解毒薬',          type: 'cure',       cureStatus: 'poison', price: 20, desc: '毒を治す。' },
    awaken:    { name: '覚醒薬',          type: 'cure',       cureStatus: 'sleep',  price: 25, desc: '睡眠を治す。' },
    megalixir: { name: 'メガエリクサー',  type: 'healFullAll',                 price: 0,   desc: '全員のHPとMPを全回復。入手困難！' },
    phoenix:   { name: 'フェニックスの羽', type: 'reviveItem', healPct: 0.5,   price: 150, desc: '戦闘不能1人をHP50%で復活。' },
  },

  // ── 武器・防具 ──────────────────────────────────────────────
  weapons: {
    woodSword:    { name: '木剣',           atk: 4,  price: 0,   desc: '出発時の剣。心強さは別のところにある。' },
    bronzeSword:  { name: '青銅の剣',       atk: 12, price: 120, desc: '攻撃力+12。基本的な金属剣。' },
    ironSword:    { name: '鉄の剣',         atk: 26, price: 0,   desc: '攻撃力+26。遺跡で発見。' },
    mythrilSword: { name: 'ミスリルの剣',   atk: 42, price: 0,   desc: '攻撃力+42。洞窟の秘宝。' },
    legendBlade:  { name: '伝説の剣',       atk: 62, price: 0,   desc: '攻撃力+62。光の力が宿る聖剣。' },
  },

  armors: {
    clothRobe:    { name: '布の服',          def: 3,  price: 0,   desc: '旅立ちの装束。' },
    leatherArmor: { name: '革の鎧',          def: 9,  price: 100, desc: '防御力+9。基本的な鎧。' },
    chainMail:    { name: 'チェインメイル',  def: 20, price: 0,   desc: '防御力+20。鎖でできた鎧。' },
    crystalRobe:  { name: 'クリスタルローブ', def: 36, price: 0,   desc: '防御力+36。クリスタルの加護を受けた。' },
    dragonMail:   { name: 'ドラゴンメイル',  def: 50, price: 0,   desc: '防御力+50。伝説の最強鎧。' },
  },

  // ── パーティメンバー ─────────────────────────────────────────
  partyMembers: {
    erina: {
      name: 'エリナ', role: '魔法使い',
      hp: 48, maxHp: 48, mp: 44, maxMp: 44,
      atk: 10, def: 7, spd: 14,
      learnedTechs: ['attack', 'ice_lance', 'fire_whirl'],
      level: 1, exp: 0, expNext: 50,
      weapon: null, armor: null,
      status: [], alive: true, tempAtk: 0, tempDef: 0, buffTurns: 0, statusImmune: false,
      sprite: 'erina',
    },
    gard: {
      name: 'ガルド', role: '剣士',
      hp: 88, maxHp: 88, mp: 12, maxMp: 12,
      atk: 26, def: 22, spd: 8,
      learnedTechs: ['attack', 'shield_bash'],
      level: 1, exp: 0, expNext: 50,
      weapon: null, armor: null,
      status: [], alive: true, tempAtk: 0, tempDef: 0, buffTurns: 0, statusImmune: false,
      sprite: 'gard',
    },
    luna: {
      name: 'ルナ', role: '聖職者',
      hp: 66, maxHp: 66, mp: 58, maxMp: 58,
      atk: 9, def: 14, spd: 11,
      learnedTechs: ['attack', 'holy_light', 'barrier'],
      level: 1, exp: 0, expNext: 50,
      weapon: null, armor: null,
      status: [], alive: true, tempAtk: 0, tempDef: 0, buffTurns: 0, statusImmune: false,
      sprite: 'luna',
    },
  },

  // ── モンスター ──────────────────────────────────────────────
  monsters: {
    // 翠の森
    slime:       { name:'スライム',      hp:24,  maxHp:24,  atk:6,  def:3,  spd:8,  exp:15,  gold:8,   sprite:'slime',      isBoss:false, actions:['attack','attack','attack'], weakElement:'thunder' },
    goblin:      { name:'ゴブリン',      hp:35,  maxHp:35,  atk:13, def:7,  spd:11, exp:26,  gold:13,  sprite:'goblin',      isBoss:false, actions:['attack','attack','throw','attack'] },
    forestSprite:{ name:'フォレストスプライト', hp:30, maxHp:30, atk:11, def:5, spd:17, exp:30, gold:15, sprite:'slime', isBoss:false, actions:['attack','sleep_spray','attack','magic'], weakElement:'fire' },
    wyvern:      { name:'ワイバーン',    hp:50,  maxHp:50,  atk:19, def:9,  spd:14, exp:44,  gold:22,  sprite:'wyvern',      isBoss:false, actions:['attack','attack','breath'] },
    forestTroll: { name:'フォレストトロール', hp:260, maxHp:260, atk:30, def:15, spd:7, exp:250, gold:100, sprite:'forestTroll', isBoss:true, actions:['attack','attack','smash','regen'], phase2Trigger:130 },

    // 古代遺跡
    golem:       { name:'ゴーレム',      hp:70,  maxHp:70,  atk:26, def:20, spd:4,  exp:58,  gold:30,  sprite:'skeleton',   isBoss:false, actions:['attack','attack','boulder'], weakElement:'thunder' },
    ruinGuardian:{ name:'遺跡の守護者', hp:58,  maxHp:58,  atk:21, def:13, spd:12, exp:52,  gold:26,  sprite:'darkMage',   isBoss:false, actions:['attack','magic','magic'], weakElement:'holy' },
    ancientDemon:{ name:'古代の悪霊',   hp:75,  maxHp:75,  atk:27, def:15, spd:14, exp:65,  gold:34,  sprite:'demon',      isBoss:false, actions:['attack','curse','drain'] },
    ruinsWarden: { name:'遺跡の番人',   hp:520, maxHp:520, atk:40, def:24, spd:9,  exp:520, gold:190, sprite:'caveDragon', isBoss:true,  actions:['attack','boulder','magic','ancient_beam','regen'], phase2Trigger:260, weakElement:'thunder' },

    // 黒岩の洞窟
    skeleton:    { name:'スケルトン',    hp:60,  maxHp:60,  atk:24, def:16, spd:9,  exp:58,  gold:30,  sprite:'skeleton',   isBoss:false, actions:['attack','attack','attack'], weakElement:'holy' },
    caveBat:     { name:'ケイブバット',  hp:44,  maxHp:44,  atk:19, def:11, spd:20, exp:48,  gold:24,  sprite:'caveBat',    isBoss:false, actions:['attack','attack','poison','attack'] },
    darkMage:    { name:'ダークメイジ',  hp:68,  maxHp:68,  atk:30, def:14, spd:13, exp:75,  gold:40,  sprite:'darkMage',   isBoss:false, actions:['attack','magic','magic','silence'], weakElement:'holy' },
    iceWitch:    { name:'氷の魔女',      hp:75,  maxHp:75,  atk:27, def:13, spd:16, exp:80,  gold:44,  sprite:'darkMage',   isBoss:false, actions:['ice_breath','attack','freeze'], weakElement:'fire' },
    caveDragon:  { name:'ケイブドラゴン', hp:620, maxHp:620, atk:52, def:28, spd:11, exp:650, gold:240, sprite:'caveDragon', isBoss:true,  actions:['attack','breath','breath','tailSwipe','roar'], phase2Trigger:310, weakElement:'ice' },

    // 魔王城
    darkKnight:  { name:'ダークナイト',  hp:110, maxHp:110, atk:52, def:32, spd:15, exp:145, gold:72,  sprite:'darkKnight', isBoss:false, actions:['attack','attack','charge','darkSlash'] },
    demon:       { name:'デーモン',      hp:125, maxHp:125, atk:58, def:25, spd:16, exp:170, gold:82,  sprite:'demon',      isBoss:false, actions:['attack','magic','roar','drain'] },
    archDemon:   { name:'アーチデーモン', hp:150, maxHp:150, atk:64, def:30, spd:18, exp:195, gold:100, sprite:'archDemon',  isBoss:false, actions:['attack','magic','magic','drain','shadow_nova'] },
    voidKnight:  { name:'虚空の騎士',    hp:165, maxHp:165, atk:68, def:36, spd:20, exp:210, gold:110, sprite:'darkKnight', isBoss:false, actions:['attack','darkBlast','charge','void_slash'] },
    demonKing:   { name:'魔王ゾルディアーク', hp:1600, maxHp:1600, atk:95, def:50, spd:18, exp:9999, gold:9999, sprite:'demonKing', isBoss:true, actions:['attack','attack','darkBlast','darkBlast','drain','rage','shadowRealm'], phase2Trigger:800, weakElement:'holy' },
  },

  // ── エリア ──────────────────────────────────────────────────
  areas: {
    village: {
      name: 'エルフィア村', type: 'town', emoji: '🏘️', music: 'town',
      desc: '平和な村。旅の出発点。', locked: false,
      shopItems:   ['potion', 'hiPotion', 'ether', 'antidote', 'awaken', 'fullEther', 'phoenix'],
      shopWeapons: ['bronzeSword'],
      shopArmors:  ['leatherArmor'],
    },
    ruins: {
      name: '古代遺跡', type: 'dungeon', emoji: '🏛️', music: 'field',
      desc: '崩壊した古代文明の遺跡。クリスタルの秘密が眠る。', locked: true,
      monsters: ['golem', 'ruinGuardian', 'ancientDemon'], boss: 'ruinsWarden', rooms: 5,
      bossDefeated: false, encounterRate: 0.38,
      treasures: [
        { item: 'ether', count: 2, room: 1, found: false },
        { weaponId: 'ironSword', room: 3, found: false },
        { item: 'hiPotion', count: 2, room: 4, found: false },
      ],
    },
    forest: {
      name: '翠の森', type: 'dungeon', emoji: '🌲', music: 'field',
      desc: '緑豊かな森。魔物が潜む。', locked: false,
      monsters: ['slime', 'goblin', 'forestSprite', 'wyvern'], boss: 'forestTroll', rooms: 5,
      bossDefeated: false, encounterRate: 0.35,
      treasures: [
        { item: 'potion', count: 2, room: 1, found: false },
        { item: 'ether', count: 1, room: 3, found: false },
        { item: 'antidote', count: 2, room: 5, found: false },
      ],
    },
    cave: {
      name: '黒岩の洞窟', type: 'dungeon', emoji: '⛰️', music: 'field',
      desc: '暗く険しい洞窟。強敵が待つ。', locked: true,
      monsters: ['skeleton', 'caveBat', 'darkMage', 'iceWitch'], boss: 'caveDragon', rooms: 6,
      bossDefeated: false, encounterRate: 0.40,
      treasures: [
        { item: 'hiPotion', count: 2, room: 2, found: false },
        { armorId: 'chainMail', room: 4, found: false },
        { item: 'fullEther', count: 1, room: 5, found: false },
      ],
    },
    castle: {
      name: '魔王城', type: 'dungeon', emoji: '🏰', music: 'field',
      desc: '魔王の城。最後の決戦の地。', locked: true,
      monsters: ['darkKnight', 'demon', 'archDemon', 'voidKnight'], boss: 'demonKing', rooms: 8,
      bossDefeated: false, encounterRate: 0.45,
      treasures: [
        { weaponId: 'legendBlade', room: 3, found: false },
        { armorId: 'crystalRobe', room: 5, found: false },
        { item: 'megalixir', count: 1, room: 6, found: false },
        { armorId: 'dragonMail', room: 7, found: false },
      ],
    },
  },

  // ── ストーリー ───────────────────────────────────────────────
  story: {
    intro: [
      { speaker: 'ナレーター', text: '遠い昔、世界は「光のクリスタル」の加護によって守られていた。その輝きは大地を潤し、命を育み、人々に希望の光をもたらし続けた…。' },
      { speaker: 'ナレーター', text: 'しかし七日前の夜、天地が震えた。深淵より蘇りし魔王ゾルディアークが、その暗黒の爪でクリスタルを奪い去ったのだ。' },
      { speaker: 'ナレーター', text: 'クリスタルを失った世界には静かに闇が満ち始め、植物は枯れ、空は淀み、魔物の数が日ごとに増えていった…。' },
      { speaker: '長老カルタス', text: '目を覚ましたか、若者よ。三日ぶりじゃな。倒れているお前を村人が運び込んだ。心配したぞ。' },
      { speaker: '長老カルタス', text: 'お前が魔王の闇の波動に飲まれて倒れたのは覚えておるか。だがその体の中で、特別な光が波動を跳ね返した。それがお前の中に眠る「光の血」じゃ。' },
      { speaker: '長老カルタス', text: 'クリスタルを取り戻せる者がいるとすれば、その光の血を持つ者だけじゃ。若者よ、お前こそが選ばれた勇者なのだ。' },
      { speaker: '長老カルタス', text: '翠の森を抜け、黒岩の洞窟を越えれば魔王城に辿り着ける。道は険しいが、きっと力になってくれる者が現れるはずじゃ。' },
      { speaker: 'エリナ', text: 'おじい様、勇者さんが起きた！…やっと目が覚めたのね。ずっと心配してたんだから。' },
      { speaker: 'エリナ', text: '私も行く！魔法の修行はずっと積んできた。クリスタルがないままじゃ、村の子供たちが…。もう黙って見てられない！' },
      { speaker: '勇者', text: '…危険だぞ。それでも来るのか、エリナ？' },
      { speaker: 'エリナ', text: '当たり前！おじい様みたいに心配性にならないで。炎と氷の魔法、絶対役に立てるから。それに…私も戦う理由があるのよ。' },
      { speaker: '長老カルタス', text: 'エリナ…。二人とも気をつけるのじゃ。まずは村の店で装備を整えてから旅立つがよい。そして必ず…必ず帰ってきておくれ。' },
    ],

    ruinsEvent: [
      { speaker: 'ナレーター', text: '古代遺跡の中枢部。朽ち果てた石柱の間から、かすかな光が差し込んでいた。' },
      { speaker: 'エリナ', text: 'この遺跡…すごく古い。何千年も前の文明？不思議なエネルギーを感じる。' },
      { speaker: '勇者', text: '（石板に刻まれた文字を読む）…「光のクリスタルは天界より降り来たりし神の欠片。その力は生命の源にして、同時に破滅の引き金ともなりうる」' },
      { speaker: 'エリナ', text: '破滅の引き金…？クリスタルにそんな側面があったの？' },
      { speaker: '勇者', text: '「…かつて一人の者がクリスタルを私物化しようとした。だが力に飲まれ、魔へと堕ちた。その魂は今も闇の中で彷徨う」…まさか、これが魔王の起源か？' },
      { speaker: 'エリナ', text: '魔王も、もともとは人間だったってこと？…だとしたら、クリスタルを取り戻すだけじゃダメなのかもしれない。' },
      { speaker: '勇者', text: '……まずはクリスタルを取り戻す。それから考えよう。行くぞ、エリナ。' },
    ],

    forestBoss: [
      { speaker: 'ナレーター', text: '翠の森の最奥。古木が空を覆い、木漏れ日も届かぬその場所で、大地が揺れた！巨大な影が姿を現した！' },
      { speaker: 'エリナ', text: 'あれが…フォレストトロール！魔王に操られた森の守護者よ。本来は穏やかな生き物なのに…！' },
      { speaker: 'フォレストトロール', text: 'ガアアアァ！この森を踏み荒らす人間が来るとは！魔王様のご命令じゃ、ここを通りたくばこの儂を倒してみせろ！！' },
      { speaker: '勇者', text: '退いてくれ！俺たちは世界を救いに行く。道を開けてもらうぞ！' },
      { speaker: 'エリナ', text: '大きいけど怖くない！あなたを魔王の呪縛から解放してあげる！受けなさい、私の魔法を！' },
    ],

    forestClear: [
      { speaker: 'ナレーター', text: 'フォレストトロールが轟音とともに崩れ落ちた。その瞬間、魔王の呪縛が解け、木々の間に柔らかな光が戻り始めた…。' },
      { speaker: 'エリナ', text: 'やった…。倒した。でも…あそこ！木陰に誰か倒れてる！' },
      { speaker: 'ガルド', text: '…強い奴らだ。俺の名前はガルド。流れ者の戦士だ。魔物に囲まれて、限界だったところを助けてもらった形になった。' },
      { speaker: 'ガルド', text: 'お前らの戦いを見ていた。本物の強さだ。よければ…同行させてくれないか。剣の腕だけは誰にも負けない自信がある。' },
      { speaker: '勇者', text: 'もちろんだ！力を貸してくれ、ガルド！一緒に戦おう！' },
      { speaker: 'ガルド', text: '…承知した。この剣、お前たちのために使おう。必ず守ってみせる。それが俺の誓いだ。' },
    ],

    ruinsBoss: [
      { speaker: 'ナレーター', text: '古代遺跡の最深部。巨大な石像が目覚め、地面が割れ、圧倒的な存在感が空間を満たした！' },
      { speaker: 'ガルド', text: 'あの石像が…動いてる！まずいな。完全に魔力で動かされてる！' },
      { speaker: 'エリナ', text: '遺跡の番人よ。魔王の力でここを守護させられている。でも雷に弱いはず！' },
      { speaker: '勇者', text: 'みんな、力を合わせれば必ず倒せる！行くぞ！！' },
    ],

    ruinsClear: [
      { speaker: 'ナレーター', text: '遺跡の番人が崩れ落ちた。その場に静寂が戻り、石板に刻まれた文字が光を放ち始めた。' },
      { speaker: 'ガルド', text: 'ふう…強かったな。だが倒せた。今俺たちは一段階強くなった気がする。' },
      { speaker: 'エリナ', text: '（石板を読む）…「勇者よ、この先の道はさらに険しい。しかし光の血を持つ者は必ず道を切り開く」…励ましてくれてるのね、古代の人たちが。' },
      { speaker: '勇者', text: '行こう。黒岩の洞窟が待っている。絶対に諦めない。' },
    ],

    caveBoss: [
      { speaker: 'ナレーター', text: '黒岩の洞窟の最深部。地の底から唸り声が響き、灼熱の息吹が迫り来る！巨大な龍が炎の中に姿を現した！' },
      { speaker: 'エリナ', text: 'ケイブドラゴン！洞窟の主が魔王に操られてる…！氷に弱いはず、作戦を立てて！' },
      { speaker: 'ガルド', text: 'でかいが怯まない！俺が前に出る。二人は後ろから攻撃しろ！' },
      { speaker: 'ケイブドラゴン', text: 'グルルルル…。人間よ、貴様らが魔王様に歯向かう愚か者どもか。この地は通さぬ！我が炎で灰となれ！！' },
      { speaker: '勇者', text: 'みんな、力を合わせろ！今こそ合体技を使う時だ！！' },
    ],

    caveClear: [
      { speaker: 'ナレーター', text: 'ケイブドラゴンが崩れ落ちた。洞窟の奥から淡い光が差し込み始めた。魔王城が近い…。' },
      { speaker: 'ガルド', text: 'やったな。このドラゴンも操られていたのか…。解放してやれたか。' },
      { speaker: 'エリナ', text: '待って！あそこ、格子の向こうに誰かいる！助けなきゃ！' },
      { speaker: 'ルナ', text: '…助けてください。私はルナ。光の神殿で修行を積んでいた聖職者です。ケイブドラゴンに捕らえられ、ここに閉じ込められていました。' },
      { speaker: '勇者', text: 'ルナさん、もう安全だ。一緒に来てくれますか。魔王を倒す力を貸してほしい。' },
      { speaker: 'ルナ', text: 'ありがとうございます…！あなたたちが選ばれし勇者様ですね。光が、あなたたちの周りで輝いているのが見えます。この命、お役に立てるなら喜んで参ります。' },
    ],

    castleEnter: [
      { speaker: 'ナレーター', text: '魔王城の巨大な門が、何かに引き寄せられるように開いた。中から禍々しい闇の気配が波のように押し寄せてくる…。' },
      { speaker: 'エリナ', text: 'この空気！鳥肌が立つ。クリスタルの光が完全に封じ込められているのが感じ取れる…。' },
      { speaker: 'ガルド', text: '引き返すつもりはない。ここまで来て逃げるくらいなら死んだほうがマシだ。行くぞ！' },
      { speaker: 'ルナ', text: '皆さん、神の加護を。光の力がまだここに残っています。それが私たちを導いてくれる。必ず帰ります…みんなで。' },
      { speaker: '謎の声', text: 'よくここまで来た、人間どもよ…。だが、ここが貴様らの墓場だ。フハハハハ！' },
      { speaker: '勇者', text: '這が魔王の声か。負けるつもりはない。行こう、みんな！今こそ、世界を救う時だ！' },
    ],

    finalBoss: [
      { speaker: 'ナレーター', text: '玉座の間。漆黒のオーラを纏った魔王ゾルディアークが、ゆっくりと立ち上がった。その圧倒的な威圧感に、空気そのものが震える…。' },
      { speaker: '魔王ゾルディアーク', text: 'フハハハ！ここまで辿り着くとは…村の小娘に流れ者の剣士、神殿の娘。寄せ集めの一行よ、その根性だけは認めよう。' },
      { speaker: 'ガルド', text: 'でかい口を叩くな、魔王！クリスタルを返せ！今すぐ！' },
      { speaker: '魔王ゾルディアーク', text: '返す？笑わせるな。世界はもともと闇のものだ。光の時代など、弱者が見る夢に過ぎぬ。力こそが真実！闇こそが世界の本質だ！' },
      { speaker: 'エリナ', text: '違う！光があるから、人も動物も植物も、全ての命が生きられる！あなたには、それが分からないの！？' },
      { speaker: 'ルナ', text: '神よ…。どうかこの戦いを勝ち抜く力を私たちに。光を守るために、今こそ力をお与えください…！' },
      { speaker: '魔王ゾルディアーク', text: 'ハッ！祈りが届くとでも？光の神など存在しない。あるのは力だけだ！さあ来るがよい、小童どもよ！！' },
      { speaker: '勇者', text: '魔王！お前がどんな力を持っていようと、俺たちは諦めない。これが俺たち全員の答えだ！クリスタルを取り戻す！！' },
    ],

    finalBossPhase2: [
      { speaker: '魔王ゾルディアーク', text: 'ぐうっ！…この儂がここまで追い詰められるとは！よかろう！真の力を解放してやる！！' },
      { speaker: 'ナレーター', text: '魔王が変貌した！漆黒のオーラが爆発的に膨れ上がり、城全体が激しく揺れ始めた！！' },
      { speaker: 'エリナ', text: 'この圧力…！ものすごいオーラ…。怖い、でも…負けない！みんな行くよ！！' },
      { speaker: 'ガルド', text: 'まだ終わってないぞ！来い、魔王！この剣で必ずお前を終わらせる！！' },
      { speaker: 'ルナ', text: '…皆さん！四人の光を一つに！今こそ私たちの本当の力を見せる時です！！' },
      { speaker: '魔王ゾルディアーク', text: '愚かな人間どもよ…！これが真の魔王の力だ！地の底に沈めてやる！！' },
    ],

    ending: [
      { speaker: 'ナレーター', text: '魔王ゾルディアークが断末魔の叫びとともに崩れ落ちた。光のクリスタルが玉座の奥から現れ、眩い輝きを放ち始めた…。' },
      { speaker: 'エリナ', text: 'クリスタル！本当に取り戻した！輝いてる…！信じられない、本当に勝ったんだ！！' },
      { speaker: 'ルナ', text: '光の神よ…ありがとうございます。クリスタルが戻ってきた…！皆さん、本当によく頑張りました…！' },
      { speaker: 'ガルド', text: '…終わった。本当に終わったんだな。よくやった、勇者。お前がいなければこの日は来なかった。' },
      { speaker: '勇者', text: 'みんながいたから勝てたんだ。一人じゃ絶対に無理だった。本当にありがとう…ガルド、エリナ、ルナ。' },
      { speaker: 'ナレーター', text: 'しかし、城が崩れ始めた！四人はクリスタルを守りながら、崩落する魔王城から命がけで脱出した！' },
      { speaker: 'ナレーター', text: '城の外に出ると、七日ぶりに空が晴れ渡っていた。太陽が世界を温かく照らし始めた…。' },
      { speaker: 'エリナ', text: '見て！太陽が…！空が青い！クリスタルが世界に力を取り戻している！！' },
      { speaker: 'ガルド', text: '…俺は旅を続けるつもりだ。だがもし次に危機が来たら、また呼んでくれ。すぐに駆けつける。' },
      { speaker: 'エリナ', text: 'もっと強い魔法使いになるわ！またいつかきっと会いましょう、勇者さん。絶対に！' },
      { speaker: 'ルナ', text: '神の加護が、常に皆さんとともにありますように。この冒険を…私は生涯忘れません。' },
      { speaker: 'ナレーター', text: 'こうして勇者と仲間たちの名は永く語り継がれた。光のクリスタルの輝きが続く限り、世界に再び闇は訪れないだろう…。' },
    ],
  },
};
