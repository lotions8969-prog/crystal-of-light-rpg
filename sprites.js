// ============================================================
//  Monster SVG Sprites - DQ-style hand-crafted artwork
// ============================================================

const SPRITES = {};

SPRITES.slime = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="130" height="130">
  <defs>
    <radialGradient id="sg" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#88aaff"/>
      <stop offset="55%" stop-color="#4477ee"/>
      <stop offset="100%" stop-color="#0033cc"/>
    </radialGradient>
  </defs>
  <path d="M100,14 C68,14 22,48 20,90 Q17,145 100,150 Q183,145 180,90 C178,48 132,14 100,14 Z" fill="url(#sg)" stroke="#0033bb" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="70" cy="68" rx="22" ry="30" fill="rgba(210,225,255,0.52)" transform="rotate(-12,70,68)"/>
  <circle cx="70" cy="102" r="15" fill="white" stroke="#0033bb" stroke-width="2"/>
  <circle cx="130" cy="102" r="15" fill="white" stroke="#0033bb" stroke-width="2"/>
  <circle cx="73" cy="105" r="8" fill="#1a1a3a"/>
  <circle cx="133" cy="105" r="8" fill="#1a1a3a"/>
  <circle cx="77" cy="101" r="3.5" fill="white"/>
  <circle cx="137" cy="101" r="3.5" fill="white"/>
  <path d="M70,122 Q100,136 130,122" stroke="#0033bb" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="150" rx="60" ry="11" fill="#0033bb" opacity="0.22"/>
</svg>`;

SPRITES.goblin = `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" width="125" height="144">
  <defs>
    <radialGradient id="gg" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#88cc44"/>
      <stop offset="68%" stop-color="#50a018"/>
      <stop offset="100%" stop-color="#2e6008"/>
    </radialGradient>
  </defs>
  <ellipse cx="100" cy="165" rx="42" ry="52" fill="#50a018" stroke="#2e6008" stroke-width="3"/>
  <ellipse cx="100" cy="85" rx="52" ry="48" fill="url(#gg)" stroke="#2e6008" stroke-width="3.5"/>
  <path d="M48,74 L25,48 L38,78" fill="#50a018" stroke="#2e6008" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M152,74 L175,48 L162,78" fill="#50a018" stroke="#2e6008" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M35,56 L30,44 L42,56" fill="#ee8844" stroke="#cc4420" stroke-width="1"/>
  <path d="M165,56 L170,44 L158,56" fill="#ee8844" stroke="#cc4420" stroke-width="1"/>
  <circle cx="74" cy="80" r="14" fill="#cc2200" stroke="#881100" stroke-width="2"/>
  <circle cx="126" cy="80" r="14" fill="#cc2200" stroke="#881100" stroke-width="2"/>
  <circle cx="76" cy="82" r="7" fill="#1a0000"/>
  <circle cx="128" cy="82" r="7" fill="#1a0000"/>
  <circle cx="79" cy="79" r="2.8" fill="white"/>
  <circle cx="131" cy="79" r="2.8" fill="white"/>
  <ellipse cx="100" cy="100" rx="9" ry="6" fill="#3e8012"/>
  <circle cx="94" cy="100" r="3.2" fill="#2e6008"/>
  <circle cx="106" cy="100" r="3.2" fill="#2e6008"/>
  <path d="M74,115 Q100,130 126,115" fill="#2a1a06" stroke="#2e6008" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="88" y="115" width="7" height="11" rx="2" fill="white" stroke="#ccc" stroke-width="1"/>
  <rect x="105" y="115" width="7" height="11" rx="2" fill="white" stroke="#ccc" stroke-width="1"/>
  <path d="M58,145 Q32,165 35,192" stroke="#50a018" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M142,145 Q168,165 165,192" stroke="#50a018" stroke-width="18" fill="none" stroke-linecap="round"/>
  <circle cx="35" cy="194" r="14" fill="#408010" stroke="#2e6008" stroke-width="2"/>
  <circle cx="165" cy="194" r="14" fill="#408010" stroke="#2e6008" stroke-width="2"/>
  <ellipse cx="100" cy="222" rx="52" ry="8" fill="#2e6008" opacity="0.25"/>
</svg>`;

SPRITES.wyvern = `<svg viewBox="0 0 260 210" xmlns="http://www.w3.org/2000/svg" width="160" height="130">
  <defs>
    <radialGradient id="wg" cx="38%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#ffbb44"/>
      <stop offset="62%" stop-color="#cc6600"/>
      <stop offset="100%" stop-color="#882200"/>
    </radialGradient>
  </defs>
  <path d="M95,88 L8,25 L26,92 L68,110 Z" fill="#aa4400" stroke="#772200" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M95,88 L12,34" stroke="#882200" stroke-width="1.8" opacity="0.65"/>
  <path d="M95,88 L16,65" stroke="#882200" stroke-width="1.8" opacity="0.65"/>
  <path d="M165,88 L252,25 L234,92 L192,110 Z" fill="#aa4400" stroke="#772200" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M165,88 L248,34" stroke="#882200" stroke-width="1.8" opacity="0.65"/>
  <path d="M165,88 L244,65" stroke="#882200" stroke-width="1.8" opacity="0.65"/>
  <ellipse cx="130" cy="135" rx="55" ry="44" fill="url(#wg)" stroke="#882200" stroke-width="3.5"/>
  <ellipse cx="130" cy="148" rx="36" ry="30" fill="rgba(255,180,80,0.28)"/>
  <path d="M100,103 Q88,72 82,45" stroke="#cc6600" stroke-width="30" fill="none" stroke-linecap="round"/>
  <ellipse cx="76" cy="36" rx="35" ry="26" fill="url(#wg)" stroke="#882200" stroke-width="3" transform="rotate(-18,76,36)"/>
  <path d="M48,36 Q30,42 28,55 Q38,64 52,56 Q52,48 48,36 Z" fill="#cc6600" stroke="#882200" stroke-width="2.5"/>
  <ellipse cx="32" cy="50" rx="5" ry="4" fill="#882200"/>
  <path d="M30,44 Q28,38 31,35" stroke="#ffaa00" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.8"/>
  <circle cx="66" cy="28" r="12" fill="#ffee00" stroke="#882200" stroke-width="2.5"/>
  <ellipse cx="68" cy="30" rx="5.5" ry="8" fill="#1a1a00" transform="rotate(5,68,30)"/>
  <circle cx="70" cy="26" r="2.8" fill="white"/>
  <path d="M90,14 L100,0 L98,16" fill="#882200" stroke="#661100" stroke-width="2" stroke-linejoin="round"/>
  <path d="M78,12 L84,-1 L83,13" fill="#882200" stroke="#661100" stroke-width="2" stroke-linejoin="round"/>
  <path d="M175,148 Q210,162 228,188 Q236,200 226,197" stroke="#cc6600" stroke-width="18" fill="none" stroke-linecap="round"/>
  <path d="M222,194 L238,186 L222,188 Z" fill="#882200"/>
  <path d="M80,178 L68,196 M88,182 L78,198 M98,182 L90,197" stroke="#882200" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M152,182 L164,196 M162,180 L172,194 M172,176 L184,188" stroke="#882200" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="130" cy="204" rx="65" ry="10" fill="#440000" opacity="0.22"/>
</svg>`;

SPRITES.forestTroll = `<svg viewBox="0 0 230 300" xmlns="http://www.w3.org/2000/svg" width="145" height="190">
  <defs>
    <radialGradient id="tg" cx="42%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#88bb44"/>
      <stop offset="62%" stop-color="#507820"/>
      <stop offset="100%" stop-color="#284510"/>
    </radialGradient>
  </defs>
  <path d="M158,62 L195,18 Q200,8 193,4 Q183,-2 176,10 L142,56" fill="#7a5520" stroke="#4a3010" stroke-width="3.5" stroke-linejoin="round"/>
  <ellipse cx="192" cy="10" rx="15" ry="11" fill="#8a6030" stroke="#4a3010" stroke-width="2.5" transform="rotate(-22,192,10)"/>
  <ellipse cx="100" cy="205" rx="66" ry="74" fill="#507820" stroke="#284510" stroke-width="4"/>
  <ellipse cx="100" cy="215" rx="44" ry="50" fill="#608830" opacity="0.42"/>
  <ellipse cx="100" cy="158" rx="60" ry="50" fill="url(#tg)" stroke="#284510" stroke-width="4"/>
  <ellipse cx="100" cy="92" rx="60" ry="56" fill="url(#tg)" stroke="#284510" stroke-width="4"/>
  <path d="M38,70 Q100,54 162,70" stroke="#284510" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="68" cy="88" r="15" fill="#ffee00" stroke="#284510" stroke-width="2.5"/>
  <circle cx="132" cy="88" r="15" fill="#ffee00" stroke="#284510" stroke-width="2.5"/>
  <ellipse cx="70" cy="91" rx="7.5" ry="9" fill="#1a1a00" transform="rotate(12,70,91)"/>
  <ellipse cx="134" cy="91" rx="7.5" ry="9" fill="#1a1a00" transform="rotate(-12,134,91)"/>
  <circle cx="72" cy="86" r="3" fill="white"/>
  <circle cx="136" cy="86" r="3" fill="white"/>
  <path d="M80,106 Q100,118 120,106" fill="#406018" stroke="#284510" stroke-width="2.5"/>
  <circle cx="83" cy="110" r="5.5" fill="#284510"/>
  <circle cx="117" cy="110" r="5.5" fill="#284510"/>
  <path d="M60,126 Q100,118 140,126" fill="#1a2a08" stroke="#284510" stroke-width="3" stroke-linecap="round"/>
  <path d="M70,126 L62,142" stroke="ivory" stroke-width="7" stroke-linecap="round"/>
  <path d="M130,126 L138,142" stroke="ivory" stroke-width="7" stroke-linecap="round"/>
  <path d="M36,158 Q10,190 15,228" stroke="#507820" stroke-width="32" fill="none" stroke-linecap="round"/>
  <path d="M164,148 Q192,172 186,208" stroke="#507820" stroke-width="28" fill="none" stroke-linecap="round"/>
  <circle cx="15" cy="230" r="22" fill="#406018" stroke="#284510" stroke-width="3.5"/>
  <circle cx="186" cy="210" r="20" fill="#406018" stroke="#284510" stroke-width="3.5"/>
  <path d="M3,222 Q15,218 27,222" stroke="#284510" stroke-width="2.5" fill="none"/>
  <path d="M68,268 Q55,282 50,282" stroke="#284510" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M132,268 Q145,282 150,282" stroke="#284510" stroke-width="24" fill="none" stroke-linecap="round"/>
  <ellipse cx="100" cy="290" rx="78" ry="11" fill="#1a3008" opacity="0.28"/>
</svg>`;

SPRITES.skeleton = `<svg viewBox="0 0 190 245" xmlns="http://www.w3.org/2000/svg" width="120" height="155">
  <rect x="145" y="22" width="7" height="115" rx="2.5" fill="#aaaacc" stroke="#6666aa" stroke-width="1.5" transform="rotate(12,149,80)"/>
  <rect x="132" y="58" width="30" height="7" rx="2.5" fill="#888899" stroke="#6666aa" stroke-width="1.5" transform="rotate(12,147,62)"/>
  <ellipse cx="138" cy="76" rx="8" ry="6" fill="#cccc88" stroke="#888866" stroke-width="1.5" transform="rotate(12,138,76)"/>
  <path d="M66,128 Q95,118 124,128" stroke="#ddddd0" stroke-width="3.5" fill="none"/>
  <path d="M63,143 Q95,132 127,143" stroke="#ddddd0" stroke-width="3.5" fill="none"/>
  <path d="M66,158 Q95,148 124,158" stroke="#ddddd0" stroke-width="3.5" fill="none"/>
  <path d="M72,123 Q70,143 74,162" stroke="#ddddd0" stroke-width="2.8" fill="none"/>
  <path d="M95,118 Q95,140 95,162" stroke="#ddddd0" stroke-width="2.8" fill="none"/>
  <path d="M118,123 Q120,143 116,162" stroke="#ddddd0" stroke-width="2.8" fill="none"/>
  <path d="M95,107 L95,210" stroke="#ddddd0" stroke-width="9" stroke-linecap="round" stroke-dasharray="9,6"/>
  <path d="M60,205 Q95,193 130,205 Q127,226 95,228 Q63,226 60,205 Z" fill="#c8c8bc" stroke="#aaaaaa" stroke-width="2.5"/>
  <ellipse cx="95" cy="58" rx="44" ry="47" fill="#ddddd0" stroke="#aaaaaa" stroke-width="3.5"/>
  <path d="M52,40 Q95,28 138,40" stroke="#ccccbb" stroke-width="5" fill="none"/>
  <ellipse cx="72" cy="56" rx="15" ry="17" fill="#1a1a1a" stroke="#888880" stroke-width="2.5"/>
  <ellipse cx="118" cy="56" rx="15" ry="17" fill="#1a1a1a" stroke="#888880" stroke-width="2.5"/>
  <ellipse cx="72" cy="56" rx="7.5" ry="10" fill="#aa4400" opacity="0.65"/>
  <ellipse cx="118" cy="56" rx="7.5" ry="10" fill="#aa4400" opacity="0.65"/>
  <path d="M82,74 Q95,80 108,74 Q95,72 82,74 Z" fill="#aaaaaa"/>
  <rect x="70" y="84" width="9" height="13" rx="2.5" fill="#eeeedd" stroke="#aaaaaa" stroke-width="1.2"/>
  <rect x="83" y="84" width="9" height="13" rx="2.5" fill="#eeeedd" stroke="#aaaaaa" stroke-width="1.2"/>
  <rect x="98" y="84" width="9" height="13" rx="2.5" fill="#eeeedd" stroke="#aaaaaa" stroke-width="1.2"/>
  <rect x="111" y="84" width="8" height="12" rx="2.5" fill="#eeeedd" stroke="#aaaaaa" stroke-width="1.2"/>
  <path d="M60,84 Q95,78 130,84" stroke="#bbbbbb" stroke-width="3.5" fill="none"/>
  <path d="M66,97 Q95,104 124,97" stroke="#aaaaaa" stroke-width="3" fill="none"/>
  <path d="M48,108 Q95,100 142,108" stroke="#ddddd0" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M50,120 Q26,148 20,180" stroke="#c8c8bc" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M140,120 Q164,148 170,180" stroke="#c8c8bc" stroke-width="10" fill="none" stroke-linecap="round"/>
  <circle cx="33" cy="152" r="9" fill="#c8c8bc" stroke="#aaaaaa" stroke-width="1.8"/>
  <circle cx="157" cy="152" r="9" fill="#c8c8bc" stroke="#aaaaaa" stroke-width="1.8"/>
  <circle cx="20" cy="182" r="13" fill="#bbbbaa" stroke="#999988" stroke-width="2.5"/>
  <circle cx="170" cy="182" r="13" fill="#bbbbaa" stroke="#999988" stroke-width="2.5"/>
  <path d="M74,228 Q65,242 60,240" stroke="#c8c8bc" stroke-width="11" fill="none" stroke-linecap="round"/>
  <path d="M116" y="228" d="M116,228 Q125,242 130,240" stroke="#c8c8bc" stroke-width="11" fill="none" stroke-linecap="round"/>
  <ellipse cx="95" cy="238" rx="58" ry="8" fill="#666" opacity="0.2"/>
</svg>`;

SPRITES.caveBat = `<svg viewBox="0 0 280 190" xmlns="http://www.w3.org/2000/svg" width="165" height="112">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#9944dd"/>
      <stop offset="68%" stop-color="#5511aa"/>
      <stop offset="100%" stop-color="#220044"/>
    </radialGradient>
  </defs>
  <path d="M120,94 L18,18 L8,72 L42,94 L80,106 Z" fill="#5511aa" stroke="#330066" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M120,94 L22,26" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <path d="M120,94 L12,56" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <path d="M120,94 L36,88" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <path d="M160,94 L262,18 L272,72 L238,94 L200,106 Z" fill="#5511aa" stroke="#330066" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M160,94 L258,26" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <path d="M160,94 L268,56" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <path d="M160,94 L244,88" stroke="#440088" stroke-width="1.8" opacity="0.68"/>
  <ellipse cx="140" cy="112" rx="34" ry="42" fill="url(#bg2)" stroke="#330066" stroke-width="3.5"/>
  <path d="M108,96 Q140,90 172,96" stroke="#6622aa" stroke-width="2.2" fill="none" opacity="0.65"/>
  <ellipse cx="140" cy="78" rx="32" ry="28" fill="url(#bg2)" stroke="#330066" stroke-width="3.5"/>
  <path d="M114,65 L102,28 L124,60" fill="#440088" stroke="#330066" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M166,65 L178,28 L156,60" fill="#440088" stroke="#330066" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M114,63 L105,34 L118,60" fill="#cc44aa" opacity="0.45"/>
  <path d="M166,63 L175,34 L162,60" fill="#cc44aa" opacity="0.45"/>
  <circle cx="122" cy="76" r="10" fill="#ff2200" stroke="#cc0000" stroke-width="1.8"/>
  <circle cx="158" cy="76" r="10" fill="#ff2200" stroke="#cc0000" stroke-width="1.8"/>
  <circle cx="122" cy="76" r="4.5" fill="#880000"/>
  <circle cx="158" cy="76" r="4.5" fill="#880000"/>
  <circle cx="124" cy="73" r="2.2" fill="rgba(255,200,200,0.8)"/>
  <circle cx="160" cy="73" r="2.2" fill="rgba(255,200,200,0.8)"/>
  <path d="M130,88 Q140,93 150,88" stroke="#440088" stroke-width="2.2" fill="#440088"/>
  <path d="M118,95 Q140,104 162,95" fill="#1a0022" stroke="#330066" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M124,95 L120,107" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M156,95 L160,107" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M120,152 L108,166 M126,156 L120,170 M132,157 L128,172" stroke="#330066" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M160,152 L172,166 M154,156 L160,170 M148,157 L152,172" stroke="#330066" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <ellipse cx="140" cy="175" rx="58" ry="8" fill="#330066" opacity="0.2"/>
</svg>`;

SPRITES.darkMage = `<svg viewBox="0 0 185 260" xmlns="http://www.w3.org/2000/svg" width="118" height="165">
  <defs>
    <radialGradient id="orb" cx="38%" cy="33%" r="62%">
      <stop offset="0%" stop-color="#aaccff"/>
      <stop offset="58%" stop-color="#6688ff"/>
      <stop offset="100%" stop-color="#1133cc"/>
    </radialGradient>
    <radialGradient id="mg" cx="44%" cy="33%" r="62%">
      <stop offset="0%" stop-color="#4422aa"/>
      <stop offset="68%" stop-color="#1a0060"/>
      <stop offset="100%" stop-color="#08001e"/>
    </radialGradient>
  </defs>
  <path d="M58,135 Q33,185 38,248 L148,248 Q153,185 128,135 Z" fill="url(#mg)" stroke="#110033" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M40,238 Q92,228 148,238" stroke="#4422aa" stroke-width="2.2" fill="none"/>
  <path d="M38,222 Q92,212 148,222" stroke="#4422aa" stroke-width="1.5" fill="none" opacity="0.55"/>
  <path d="M58,135 Q42,119 47,103 Q62,114 78,124 Z" fill="#1a0060" stroke="#110033" stroke-width="2.8"/>
  <path d="M128,135 Q143,119 138,103 Q123,114 108,124 Z" fill="#1a0060" stroke="#110033" stroke-width="2.8"/>
  <path d="M55,137 Q27,165 24,200" stroke="#1a0060" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M131,137 Q158,160 162,192" stroke="#1a0060" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M157,200 L178,55" stroke="#6644aa" stroke-width="6.5" fill="none" stroke-linecap="round"/>
  <path d="M162,163 L178,158 M164,143 L180,140" stroke="#9966cc" stroke-width="2.2" fill="none"/>
  <circle cx="181" cy="47" r="22" fill="url(#orb)" stroke="#4466ff" stroke-width="3"/>
  <circle cx="181" cy="47" r="22" fill="none" stroke="rgba(150,200,255,0.45)" stroke-width="1.2"/>
  <circle cx="174" cy="40" r="8.5" fill="rgba(200,230,255,0.6)"/>
  <circle cx="181" cy="47" r="30" fill="rgba(100,150,255,0.12)"/>
  <rect x="84" y="104" width="16" height="24" rx="4.5" fill="#1a0000" stroke="#110033" stroke-width="1.8"/>
  <ellipse cx="92" cy="91" rx="36" ry="30" fill="#200a0a" stroke="#110033" stroke-width="3.5"/>
  <ellipse cx="92" cy="96" rx="28" ry="22" fill="#0e0404" opacity="0.75"/>
  <ellipse cx="77" cy="89" rx="8" ry="6" fill="#ff6600" opacity="0.92"/>
  <ellipse cx="107" cy="89" rx="8" ry="6" fill="#ff6600" opacity="0.92"/>
  <ellipse cx="77" cy="89" rx="12" ry="8" fill="rgba(255,100,0,0.28)"/>
  <ellipse cx="107" cy="89" rx="12" ry="8" fill="rgba(255,100,0,0.28)"/>
  <path d="M92,12 L55,92 Q92,79 129,92 Z" fill="#1a0060" stroke="#110033" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M46,92 Q92,100 138,92" fill="#12003e" stroke="#110033" stroke-width="3" stroke-linecap="round"/>
  <circle cx="92" cy="43" r="5.5" fill="#ffd700" opacity="0.82"/>
  <text x="68" y="178" font-size="13" fill="#6644aa" opacity="0.58" font-family="serif">✦</text>
  <text x="94" y="158" font-size="11" fill="#6644aa" opacity="0.48" font-family="serif">✧</text>
  <text x="108" y="192" font-size="11" fill="#6644aa" opacity="0.48" font-family="serif">✦</text>
  <ellipse cx="92" cy="250" rx="58" ry="8" fill="#110033" opacity="0.28"/>
</svg>`;

SPRITES.caveDragon = `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg" width="185" height="160">
  <defs>
    <radialGradient id="cdg" cx="38%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#ff7755"/>
      <stop offset="58%" stop-color="#cc2200"/>
      <stop offset="100%" stop-color="#880000"/>
    </radialGradient>
    <radialGradient id="cdg2" cx="42%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#ffa888"/>
      <stop offset="68%" stop-color="#cc4422"/>
      <stop offset="100%" stop-color="#881100"/>
    </radialGradient>
  </defs>
  <path d="M108,105 L18,22 L28,84 L62,112 L92,120 Z" fill="#991100" stroke="#660000" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M108,105 L22,32" stroke="#771100" stroke-width="2" opacity="0.68"/>
  <path d="M108,105 L24,68" stroke="#771100" stroke-width="2" opacity="0.68"/>
  <path d="M192,105 L282,22 L272,84 L238,112 L208,120 Z" fill="#991100" stroke="#660000" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M192,105 L278,32" stroke="#771100" stroke-width="2" opacity="0.68"/>
  <path d="M192,105 L276,68" stroke="#771100" stroke-width="2" opacity="0.68"/>
  <ellipse cx="150" cy="165" rx="75" ry="62" fill="url(#cdg)" stroke="#660000" stroke-width="4.5"/>
  <ellipse cx="150" cy="177" rx="48" ry="44" fill="rgba(255,155,80,0.32)"/>
  <path d="M108,155 Q150,144 192,155" stroke="#ff9966" stroke-width="1.8" fill="none" opacity="0.5"/>
  <path d="M106,172 Q150,160 194,172" stroke="#ff9966" stroke-width="1.8" fill="none" opacity="0.5"/>
  <path d="M110,190 Q150,178 190,190" stroke="#ff9966" stroke-width="1.5" fill="none" opacity="0.42"/>
  <path d="M122,112 Q110,80 104,50" stroke="#cc2200" stroke-width="36" fill="none" stroke-linecap="round"/>
  <ellipse cx="96" cy="40" rx="48" ry="33" fill="url(#cdg2)" stroke="#660000" stroke-width="4" transform="rotate(-16,96,40)"/>
  <path d="M52,42 Q32,50 30,66 Q42,78 58,68 Q58,58 52,42 Z" fill="#cc2200" stroke="#660000" stroke-width="3.2"/>
  <path d="M34,58 Q30,50 33,44" stroke="#ffaa00" stroke-width="5.5" fill="none" stroke-linecap="round" opacity="0.82"/>
  <circle cx="35" cy="60" r="5.5" fill="#ff6600" opacity="0.72"/>
  <ellipse cx="37" cy="54" rx="5.5" ry="4.5" fill="#880000"/>
  <circle cx="80" cy="32" r="14" fill="#ffee00" stroke="#880000" stroke-width="3"/>
  <ellipse cx="82" cy="35" rx="6" ry="9.5" fill="#1a0000" transform="rotate(5,82,35)"/>
  <circle cx="84" cy="30" r="3.2" fill="white"/>
  <path d="M112,18 L126,2 L118,20" fill="#880000" stroke="#551100" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M98,16 L105,0 L102,18" fill="#880000" stroke="#551100" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M126,112 L122,84 L134,109" fill="#881100" stroke="#551100" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M146,108 L144,78 L158,106" fill="#881100" stroke="#551100" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M168,112 L169,80 L180,110" fill="#881100" stroke="#551100" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M218,180 Q255,192 276,216 Q285,228 274,224" stroke="#cc2200" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M272,220 L288,212 L270,214 Z" fill="#880000"/>
  <path d="M102,218 L88,236 M114,222 L102,240 M126,222 L118,238" stroke="#881100" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <path d="M178,222 L192,236 M190,218 L202,232 M202,212 L216,224" stroke="#881100" stroke-width="5.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="252" rx="88" ry="12" fill="#440000" opacity="0.25"/>
</svg>`;

SPRITES.darkKnight = `<svg viewBox="0 0 190 265" xmlns="http://www.w3.org/2000/svg" width="120" height="168">
  <defs>
    <radialGradient id="dkg" cx="33%" cy="28%" r="72%">
      <stop offset="0%" stop-color="#5a5a7a"/>
      <stop offset="62%" stop-color="#282840"/>
      <stop offset="100%" stop-color="#080818"/>
    </radialGradient>
  </defs>
  <rect x="155" y="14" width="9" height="125" rx="3.5" fill="#333355" stroke="#111133" stroke-width="1.8" transform="rotate(6,160,77)"/>
  <rect x="152" y="14" width="2.5" height="119" rx="1.2" fill="#8888aa" opacity="0.62" transform="rotate(6,153,74)"/>
  <rect x="136" y="114" width="45" height="10" rx="3.5" fill="#444466" stroke="#222244" stroke-width="1.8" transform="rotate(6,159,119)"/>
  <ellipse cx="150" cy="136" rx="10" ry="7.5" fill="#555577" stroke="#333355" stroke-width="1.8" transform="rotate(6,150,136)"/>
  <path d="M28,110 Q12,136 18,172 Q28,194 44,186 Q56,180 58,155 Q56,126 44,110 Z" fill="#1a1a33" stroke="#333366" stroke-width="3.5"/>
  <path d="M28,114 Q14,138 20,168 Q30,184 42,178" stroke="#4444aa" stroke-width="1.8" fill="none" opacity="0.45"/>
  <path d="M30,136 L42,122 L54,136 L42,175 Z" fill="none" stroke="#aa2222" stroke-width="2.5" opacity="0.65"/>
  <rect x="60" y="224" width="32" height="30" rx="5.5" fill="#1a1a2a" stroke="#333355" stroke-width="2.5"/>
  <rect x="96" y="224" width="32" height="30" rx="5.5" fill="#1a1a2a" stroke="#333355" stroke-width="2.5"/>
  <ellipse cx="76" cy="254" rx="18" ry="6.5" fill="#222244" stroke="#333355" stroke-width="1.8"/>
  <ellipse cx="112" cy="254" rx="18" ry="6.5" fill="#222244" stroke="#333355" stroke-width="1.8"/>
  <rect x="62" y="192" width="30" height="36" rx="4.5" fill="#282840" stroke="#383855" stroke-width="2.8"/>
  <rect x="96" y="192" width="30" height="36" rx="4.5" fill="#282840" stroke="#383855" stroke-width="2.8"/>
  <path d="M54,182 Q56,198 64,200 L64,192 Q60,190 54,182 Z" fill="#222244" stroke="#333355" stroke-width="2.2"/>
  <path d="M130,182 Q128,198 120,200 L120,192 Q124,190 130,182 Z" fill="#222244" stroke="#333355" stroke-width="2.2"/>
  <path d="M57,113 Q46,144 49,182 L135,182 Q138,144 127,113 Z" fill="url(#dkg)" stroke="#333355" stroke-width="4" stroke-linejoin="round"/>
  <path d="M92,118 L92,180" stroke="#383855" stroke-width="3.5" opacity="0.62"/>
  <path d="M62,146 Q92,140 122,146" stroke="#383855" stroke-width="2.2" fill="none" opacity="0.48"/>
  <path d="M62,162 Q92,156 122,162" stroke="#383855" stroke-width="2.2" fill="none" opacity="0.42"/>
  <ellipse cx="54" cy="120" rx="23" ry="17" fill="#282840" stroke="#383855" stroke-width="3.5" transform="rotate(-10,54,120)"/>
  <ellipse cx="130" cy="120" rx="23" ry="17" fill="#282840" stroke="#383855" stroke-width="3.5" transform="rotate(10,130,120)"/>
  <path d="M40,108 L30,88 L46,106" fill="#1a1a33" stroke="#333355" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M144,108 L154,88 L138,106" fill="#1a1a33" stroke="#333355" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50,124 Q30,156 28,188" stroke="#282840" stroke-width="22" fill="none" stroke-linecap="round"/>
  <path d="M134,124 Q154,156 156,188" stroke="#282840" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M37,158 Q32,168 30,178" stroke="#383855" stroke-width="5.5" fill="none"/>
  <path d="M147,158 Q152,168 154,178" stroke="#383855" stroke-width="5.5" fill="none"/>
  <ellipse cx="92" cy="84" rx="44" ry="40" fill="#181828" stroke="#333355" stroke-width="4.5"/>
  <path d="M70,51 Q92,36 114,51" fill="#282840" stroke="#333355" stroke-width="3.5"/>
  <path d="M80,44 Q92,28 104,44" fill="#333366" stroke="#222255" stroke-width="2.5"/>
  <path d="M56,88 Q92,82 128,88 Q128,104 92,106 Q56,104 56,88 Z" fill="#0e0e1e" stroke="#222244" stroke-width="3"/>
  <rect x="65" y="89" width="22" height="7" rx="2.5" fill="#cc0000" opacity="0.92"/>
  <rect x="97" y="89" width="22" height="7" rx="2.5" fill="#cc0000" opacity="0.92"/>
  <rect x="65" y="89" width="22" height="7" rx="2.5" fill="#ff3333" opacity="0.45"/>
  <rect x="97" y="89" width="22" height="7" rx="2.5" fill="#ff3333" opacity="0.45"/>
  <path d="M60,113 Q92,106 124,113 L122,126 Q92,118 62,126 Z" fill="#282840" stroke="#333355" stroke-width="2.8"/>
  <ellipse cx="92" cy="258" rx="62" ry="8" fill="#111122" opacity="0.28"/>
</svg>`;

SPRITES.demon = `<svg viewBox="0 0 210 275" xmlns="http://www.w3.org/2000/svg" width="130" height="170">
  <defs>
    <radialGradient id="demg" cx="44%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#ff6655"/>
      <stop offset="62%" stop-color="#cc2200"/>
      <stop offset="100%" stop-color="#880000"/>
    </radialGradient>
  </defs>
  <path d="M115,205 Q150,228 165,258 Q170,270 162,267 Q154,263 148,250 Q136,232 122,213" stroke="#aa1100" stroke-width="13" fill="none" stroke-linecap="round"/>
  <path d="M159,264 L174,274 L163,258 Z" fill="#880000" stroke="#551100" stroke-width="2.2"/>
  <path d="M74,115 L8,38 L18,98 L50,122 Z" fill="#881100" stroke="#550000" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M74,115 L12,48" stroke="#770000" stroke-width="2" opacity="0.68"/>
  <path d="M74,115 L15,80" stroke="#770000" stroke-width="2" opacity="0.68"/>
  <path d="M136,115 L202,38 L192,98 L160,122 Z" fill="#881100" stroke="#550000" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M136,115 L198,48" stroke="#770000" stroke-width="2" opacity="0.68"/>
  <path d="M136,115 L195,80" stroke="#770000" stroke-width="2" opacity="0.68"/>
  <ellipse cx="105" cy="188" rx="50" ry="62" fill="#cc2200" stroke="#880000" stroke-width="4.5"/>
  <ellipse cx="105" cy="200" rx="34" ry="42" fill="rgba(180,28,0,0.32)"/>
  <path d="M72,162 Q105,150 138,162" stroke="#aa2200" stroke-width="3.2" fill="none" opacity="0.58"/>
  <path d="M70,178 Q105,165 140,178" stroke="#aa2200" stroke-width="2.8" fill="none" opacity="0.48"/>
  <ellipse cx="105" cy="145" rx="52" ry="46" fill="url(#demg)" stroke="#880000" stroke-width="4.5"/>
  <ellipse cx="88" cy="130" rx="22" ry="28" fill="rgba(255,155,100,0.22)" transform="rotate(-10,88,130)"/>
  <path d="M55,135 Q24,168 20,205" stroke="#cc2200" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M155,135 Q186,168 190,205" stroke="#cc2200" stroke-width="24" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="207" r="17" fill="#aa2200" stroke="#880000" stroke-width="3.5"/>
  <path d="M7,200 L-2,186 M13,193 L7,178 M21,191 L16,175 M29,193 L30,178" stroke="#551100" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="190" cy="207" r="17" fill="#aa2200" stroke="#880000" stroke-width="3.5"/>
  <path d="M203,200 L212,186 M197,193 L203,178 M189,191 L194,175 M181,193 L180,178" stroke="#551100" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="105" cy="94" rx="52" ry="50" fill="url(#demg)" stroke="#880000" stroke-width="4.5"/>
  <ellipse cx="86" cy="78" rx="21" ry="27" fill="rgba(255,155,100,0.22)" transform="rotate(-10,86,78)"/>
  <path d="M78,56 Q62,22 70,11 Q83,28 86,56" fill="#770000" stroke="#550000" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M132,56 Q148,22 140,11 Q127,28 124,56" fill="#770000" stroke="#550000" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M79,54 Q65,28 71,16" stroke="#cc2200" stroke-width="2.2" fill="none" opacity="0.48"/>
  <path d="M131,54 Q145,28 139,16" stroke="#cc2200" stroke-width="2.2" fill="none" opacity="0.48"/>
  <path d="M63,82 Q105,68 147,82" stroke="#770000" stroke-width="7.5" fill="none" stroke-linecap="round"/>
  <circle cx="79" cy="92" r="13" fill="#ffcc00" stroke="#883300" stroke-width="2.5"/>
  <circle cx="131" cy="92" r="13" fill="#ffcc00" stroke="#883300" stroke-width="2.5"/>
  <ellipse cx="81" cy="94" rx="5.5" ry="8.5" fill="#1a1a00"/>
  <ellipse cx="133" cy="94" rx="5.5" ry="8.5" fill="#1a1a00"/>
  <circle cx="82" cy="90" r="2.8" fill="white"/>
  <circle cx="134" cy="90" r="2.8" fill="white"/>
  <path d="M91,112 Q105,119 119,112" stroke="#880000" stroke-width="2.8" fill="none"/>
  <circle cx="92" cy="114" r="4.5" fill="#770000"/>
  <circle cx="118" cy="114" r="4.5" fill="#770000"/>
  <path d="M68,124 Q105,142 142,124" fill="#550000" stroke="#880000" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M79,124 L73,140" stroke="ivory" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M94,130 L90,144" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M116,130 L120,144" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M131,124 L137,140" stroke="ivory" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M72,232 Q60,250 56,250" stroke="#bb2000" stroke-width="20" fill="none" stroke-linecap="round"/>
  <path d="M138,232 Q150,250 154,250" stroke="#bb2000" stroke-width="20" fill="none" stroke-linecap="round"/>
  <ellipse cx="105" cy="258" rx="62" ry="11" fill="#440000" opacity="0.28"/>
</svg>`;

SPRITES.archDemon = `<svg viewBox="0 0 255 295" xmlns="http://www.w3.org/2000/svg" width="155" height="178">
  <defs>
    <radialGradient id="adg" cx="44%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#9944cc"/>
      <stop offset="62%" stop-color="#661199"/>
      <stop offset="100%" stop-color="#330055"/>
    </radialGradient>
    <radialGradient id="adh" cx="40%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#cc66ff"/>
      <stop offset="68%" stop-color="#8822cc"/>
      <stop offset="100%" stop-color="#440088"/>
    </radialGradient>
  </defs>
  <path d="M95,120 L10,24 L28,98 L65,126 Z" fill="#440088" stroke="#220055" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M95,120 L14,34" stroke="#330066" stroke-width="2" opacity="0.58"/>
  <path d="M95,120 L17,74" stroke="#330066" stroke-width="2" opacity="0.58"/>
  <path d="M160,120 L245,24 L227,98 L190,126 Z" fill="#440088" stroke="#220055" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M160,120 L241,34" stroke="#330066" stroke-width="2" opacity="0.58"/>
  <path d="M160,120 L238,74" stroke="#330066" stroke-width="2" opacity="0.58"/>
  <path d="M86,148 L44,116 L56,142 L82,155 Z" fill="#330077" stroke="#220055" stroke-width="2.2" opacity="0.72"/>
  <path d="M169,148 L211,116 L199,142 L173,155 Z" fill="#330077" stroke="#220055" stroke-width="2.2" opacity="0.72"/>
  <ellipse cx="128" cy="205" rx="58" ry="68" fill="#661199" stroke="#330055" stroke-width="4.5"/>
  <ellipse cx="113" cy="184" rx="30" ry="37" fill="rgba(185,80,255,0.18)" transform="rotate(-10,113,184)"/>
  <ellipse cx="128" cy="152" rx="58" ry="50" fill="url(#adg)" stroke="#330055" stroke-width="4.5"/>
  <path d="M74,182 Q46,202 40,234" stroke="#661199" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M182,182 Q210,202 215,234" stroke="#661199" stroke-width="16" fill="none" stroke-linecap="round"/>
  <circle cx="40" cy="236" r="13" fill="#551188" stroke="#330055" stroke-width="2.5"/>
  <path d="M28,229 L22,218 M34,224 L30,212 M42,222 L40,210 M50,224 L52,212" stroke="#220044" stroke-width="3.8" fill="none" stroke-linecap="round"/>
  <circle cx="215" cy="236" r="13" fill="#551188" stroke="#330055" stroke-width="2.5"/>
  <path d="M227,229 L233,218 M221,224 L225,212 M213,222 L215,210 M205,224 L203,212" stroke="#220044" stroke-width="3.8" fill="none" stroke-linecap="round"/>
  <path d="M70,136 Q34,166 30,205" stroke="#661199" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M186,136 Q220,166 224,205" stroke="#661199" stroke-width="26" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="207" r="20" fill="#551188" stroke="#330055" stroke-width="3.5"/>
  <path d="M15,198 L6,183 M21,192 L14,176 M29,190 L25,172 M37,192 L39,174" stroke="#220044" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="224" cy="207" r="20" fill="#551188" stroke="#330055" stroke-width="3.5"/>
  <path d="M239,198 L248,183 M233,192 L240,176 M225,190 L229,172 M217,192 L215,174" stroke="#220044" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="128" cy="92" rx="58" ry="52" fill="url(#adh)" stroke="#330055" stroke-width="4.5"/>
  <ellipse cx="108" cy="75" rx="26" ry="32" fill="rgba(225,155,255,0.18)" transform="rotate(-10,108,75)"/>
  <path d="M92,53 Q78,18 84,7 Q98,24 100,52" fill="#330077" stroke="#220055" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M164,53 Q178,18 172,7 Q158,24 156,52" fill="#330077" stroke="#220055" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M108,49 Q104,24 110,15 Q120,28 116,49" fill="#440088" stroke="#220055" stroke-width="2.8"/>
  <path d="M148,49 Q152,24 146,15 Q136,28 140,49" fill="#440088" stroke="#220055" stroke-width="2.8"/>
  <path d="M72,92 Q128,77 184,92" stroke="#330066" stroke-width="9.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="93" cy="99" rx="14" ry="11" fill="#ff0000" stroke="#880000" stroke-width="2.2"/>
  <ellipse cx="163" cy="99" rx="14" ry="11" fill="#ff0000" stroke="#880000" stroke-width="2.2"/>
  <ellipse cx="95" cy="114" rx="10" ry="7.5" fill="#ff6600" stroke="#883300" stroke-width="1.8"/>
  <ellipse cx="161" cy="114" rx="10" ry="7.5" fill="#ff6600" stroke="#883300" stroke-width="1.8"/>
  <ellipse cx="95" cy="101" rx="5.5" ry="7.5" fill="#1a0000"/>
  <ellipse cx="165" cy="101" rx="5.5" ry="7.5" fill="#1a0000"/>
  <ellipse cx="96" cy="115" rx="3.8" ry="5.5" fill="#1a0000"/>
  <ellipse cx="162" cy="115" rx="3.8" ry="5.5" fill="#1a0000"/>
  <path d="M76,134 Q128,154 180,134" fill="#220033" stroke="#330055" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M86,134 L82,148" stroke="ivory" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M100,140 L96,153" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M114,143 L112,157" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M142,143 L145,157" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M156,140 L159,153" stroke="ivory" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M170,134 L174,148" stroke="ivory" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M88,258 Q74,276 70,276" stroke="#551188" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M168,258 L182,276 L186,276" stroke="#551188" stroke-width="24" fill="none" stroke-linecap="round"/>
  <ellipse cx="128" cy="284" rx="80" ry="11" fill="#220033" opacity="0.28"/>
</svg>`;

SPRITES.demonKing = `<svg viewBox="0 0 280 320" xmlns="http://www.w3.org/2000/svg" width="175" height="200">
  <defs>
    <radialGradient id="dkbody" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#7733bb"/>
      <stop offset="52%" stop-color="#1e0040"/>
      <stop offset="100%" stop-color="#04000e"/>
    </radialGradient>
    <radialGradient id="dkh" cx="40%" cy="33%" r="66%">
      <stop offset="0%" stop-color="#4400aa"/>
      <stop offset="62%" stop-color="#16002e"/>
      <stop offset="100%" stop-color="#04000c"/>
    </radialGradient>
    <radialGradient id="aura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(110,0,200,0.4)"/>
      <stop offset="100%" stop-color="rgba(110,0,200,0)"/>
    </radialGradient>
    <filter id="glow2" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="140" cy="182" rx="128" ry="140" fill="url(#aura)"/>
  <path d="M36,82 L22,56 L42,76 L26,52 L48,74" stroke="#9900ff" stroke-width="2.5" fill="none" opacity="0.62" stroke-linejoin="round"/>
  <path d="M244,82 L258,56 L238,76 L254,52 L232,74" stroke="#9900ff" stroke-width="2.5" fill="none" opacity="0.62" stroke-linejoin="round"/>
  <path d="M50,210 L28,226 L55,216 L34,232 L60,220" stroke="#7700cc" stroke-width="2" fill="none" opacity="0.48" stroke-linejoin="round"/>
  <path d="M230,210 L252,226 L225,216 L246,232 L220,220" stroke="#7700cc" stroke-width="2" fill="none" opacity="0.48" stroke-linejoin="round"/>
  <path d="M95,115 L8,18 L26,95 L60,128 Z" fill="#18003a" stroke="#330055" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M95,115 L12,28 M95,115 L14,68 M95,115 L16,96" stroke="#5500bb" stroke-width="2" opacity="0.45"/>
  <path d="M185,115 L272,18 L254,95 L220,128 Z" fill="#18003a" stroke="#330055" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M185,115 L268,28 M185,115 L266,68 M185,115 L264,96" stroke="#5500bb" stroke-width="2" opacity="0.45"/>
  <path d="M95,115 L56,82 L64,110 L90,122 Z" fill="#100028" stroke="#330055" stroke-width="2.2" opacity="0.78"/>
  <path d="M185,115 L224,82 L216,110 L190,122 Z" fill="#100028" stroke="#330055" stroke-width="2.2" opacity="0.78"/>
  <path d="M68,142 Q44,190 50,282 L230,282 Q236,190 212,142 Z" fill="url(#dkbody)" stroke="#330055" stroke-width="4.5" stroke-linejoin="round"/>
  <path d="M68,144 Q46,192 52,278" stroke="#7700cc" stroke-width="1.8" fill="none" opacity="0.45"/>
  <path d="M212,144 Q234,192 228,278" stroke="#7700cc" stroke-width="1.8" fill="none" opacity="0.45"/>
  <path d="M90,185 Q140,174 190,185" stroke="#7700cc" stroke-width="1.8" fill="none" opacity="0.48"/>
  <path d="M86,205 Q140,193 194,205" stroke="#7700cc" stroke-width="1.5" fill="none" opacity="0.38"/>
  <path d="M84,225 Q140,213 196,225" stroke="#7700cc" stroke-width="1.5" fill="none" opacity="0.28"/>
  <path d="M62,150 Q32,180 28,220" stroke="#1e0040" stroke-width="28" fill="none" stroke-linecap="round"/>
  <path d="M218,150 Q248,180 252,220" stroke="#1e0040" stroke-width="28" fill="none" stroke-linecap="round"/>
  <circle cx="28" cy="222" r="22" fill="#2e0055" stroke="#7700cc" stroke-width="3" filter="url(#glow2)"/>
  <path d="M12,212 L2,194 M18,205 L10,186 M26,202 L22,182 M34,205 L36,185 M44,212 L48,194" stroke="#aa00ff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.92"/>
  <circle cx="252" cy="222" r="22" fill="#2e0055" stroke="#7700cc" stroke-width="3" filter="url(#glow2)"/>
  <path d="M268,212 L278,194 M262,205 L270,186 M254,202 L258,182 M246,205 L244,185 M236,212 L232,194" stroke="#aa00ff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity="0.92"/>
  <ellipse cx="140" cy="92" rx="62" ry="58" fill="url(#dkh)" stroke="#330055" stroke-width="5"/>
  <ellipse cx="140" cy="92" rx="62" ry="58" fill="none" stroke="#7700cc" stroke-width="1.2" opacity="0.42"/>
  <ellipse cx="140" cy="99" rx="48" ry="42" fill="#080015" opacity="0.72"/>
  <ellipse cx="108" cy="90" rx="18" ry="14" fill="#cc00ff" stroke="#9900ff" stroke-width="2.2" filter="url(#glow2)" opacity="0.92"/>
  <ellipse cx="172" cy="90" rx="18" ry="14" fill="#cc00ff" stroke="#9900ff" stroke-width="2.2" filter="url(#glow2)" opacity="0.92"/>
  <ellipse cx="108" cy="90" rx="5.5" ry="11" fill="#080010"/>
  <ellipse cx="172" cy="90" rx="5.5" ry="11" fill="#080010"/>
  <ellipse cx="108" cy="90" rx="11" ry="8.5" fill="rgba(220,100,255,0.38)"/>
  <ellipse cx="172" cy="90" rx="11" ry="8.5" fill="rgba(220,100,255,0.38)"/>
  <path d="M90,118 Q140,136 190,118" fill="#080015" stroke="#7700cc" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M92,119 Q140,133 188,119" stroke="#aa00ff" stroke-width="1.8" fill="none" opacity="0.58"/>
  <path d="M100,118 L95,133" stroke="#cc88ff" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
  <path d="M114,125 L111,139" stroke="#cc88ff" stroke-width="4.5" stroke-linecap="round" opacity="0.82"/>
  <path d="M130,128 L130,143" stroke="#cc88ff" stroke-width="4.5" stroke-linecap="round" opacity="0.82"/>
  <path d="M150,128 L152,143" stroke="#cc88ff" stroke-width="4.5" stroke-linecap="round" opacity="0.82"/>
  <path d="M166,125 L169,139" stroke="#cc88ff" stroke-width="4.5" stroke-linecap="round" opacity="0.82"/>
  <path d="M180,118 L185,133" stroke="#cc88ff" stroke-width="5.5" stroke-linecap="round" opacity="0.92"/>
  <path d="M82,50 L68,14 L100,38 L140,3 L180,38 L212,14 L198,50 Z" fill="#5500aa" stroke="#3a0077" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M82,50 Q140,35 198,50 L195,53 Q140,38 85,53 Z" fill="#440088"/>
  <circle cx="140" cy="22" r="10" fill="#ff00ff" stroke="#cc00cc" stroke-width="2.5" filter="url(#glow2)"/>
  <circle cx="108" cy="36" r="6.5" fill="#ff44ff" stroke="#cc00cc" stroke-width="1.8" opacity="0.92"/>
  <circle cx="172" cy="36" r="6.5" fill="#ff44ff" stroke="#cc00cc" stroke-width="1.8" opacity="0.92"/>
  <circle cx="137" cy="18" r="3.5" fill="rgba(255,200,255,0.72)"/>
  <path d="M98,50 Q82,18 90,7 Q104,24 108,50" fill="#1e0035" stroke="#330055" stroke-width="3.5"/>
  <path d="M182,50 Q198,18 190,7 Q176,24 172,50" fill="#1e0035" stroke="#330055" stroke-width="3.5"/>
  <path d="M112,48 Q107,26 114,17 Q122,30 120,48" fill="#2e0050" stroke="#330055" stroke-width="2.8"/>
  <path d="M168,48 Q173,26 166,17 Q158,30 160,48" fill="#2e0050" stroke="#330055" stroke-width="2.8"/>
  <ellipse cx="140" cy="286" rx="96" ry="14" fill="#1e0030" opacity="0.48"/>
  <ellipse cx="140" cy="286" rx="72" ry="9" fill="#5500aa" opacity="0.28" filter="url(#glow2)"/>
</svg>`;
