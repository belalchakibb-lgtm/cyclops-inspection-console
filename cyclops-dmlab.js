/* CYCLOPS damage-mechanism lab (API RP 571, 3rd edition 2020): the 67 damage mechanisms on a realistic 3D
   cut sample. Physically based steel, rust, scale, pits, grooves, blisters and cracks are painted procedurally into
   colour, height (real displacement), bump and roughness/metal maps. A stage slider shows how the damage starts,
   grows and ends. Inspection methods are shown on the sample (PT bleed-out, MT and WFMT indications, UT probe with a
   thickness C-scan, profile radiograph, VT light), with a wall cross-section and the code used to assess it.
   Training illustrations, not to scale. RP 571 explains mechanisms and does not set acceptance limits: the
   assessment notes point to the in-service and fitness-for-service codes, to verify in the edition in force.
   Data: cyclops-dm-data.js, cyclops-dm-data2.js.   window.CYDM = { open(key) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const FAM = { thin: ['Thinning & corrosion', 'Amincissement & corrosion', '#e0792b'], scc: ['Environmental cracking', 'Fissuration environnementale', '#e66b78'], h2: ['Hydrogen damage', 'Dommages par l’hydrogène', '#9a7bff'], ht: ['High-temperature', 'Haute température', '#ffb347'], mech: ['Mechanical & fatigue', 'Mécanique & fatigue', '#3da9ff'], metal: ['Metallurgical change', 'Changement métallurgique', '#42c991'] };
  const METH = {
    VT: ['Visual testing', 'Contrôle visuel'], UT: ['UT thickness', 'Épaisseur UT'], UTS: ['UT scanning / AUT (C-scan)', 'Cartographie UT / AUT (C-scan)'], SWUT: ['Angle-beam UT', 'UT d’angle'], PAUT: ['Phased array UT', 'UT multiéléments (PAUT)'], TOFD: ['TOFD', 'TOFD'],
    RT: ['Radiography (profile)', 'Radiographie (de profil)'], MT: ['Magnetic particle', 'Magnétoscopie'], WFMT: ['Wet fluorescent MT', 'Magnétoscopie fluorescente'], PT: ['Penetrant testing', 'Ressuage'], ECT: ['Eddy current', 'Courants de Foucault'], ACFM: ['ACFM', 'ACFM'],
    GWT: ['Guided wave (screening)', 'Ondes guidées (dépistage)'], EMAT: ['EMAT', 'EMAT'], HT: ['Hardness testing', 'Essai de dureté'], FMR: ['Field replication (metallography)', 'Répliques métallographiques'], DT: ['Sample + lab test (impact, metallography)', 'Prélèvement + essai labo (résilience, métallo)'],
    MON: ['Process & corrosion monitoring', 'Suivi procédé & corrosion'], IRT: ['Infrared thermography', 'Thermographie infrarouge'], DIM: ['Diameter / strain measurement', 'Mesure de diamètre / déformation'], VIB: ['Vibration survey', 'Mesure vibratoire'], CP: ['Cathodic protection survey', 'Mesure de protection cathodique'], PMI: ['Material verification (PMI)', 'Vérification des matériaux (PMI)'], HAM: ['Hammer test', 'Test au marteau'], AET: ['Acoustic emission', 'Émission acoustique']
  };
  const SHOW = new Set(['VT', 'PT', 'MT', 'WFMT', 'UT', 'UTS', 'SWUT', 'PAUT', 'TOFD', 'RT']);
  // Where acceptance comes from (RP 571 itself has no acceptance criteria). Part numbers: API 579-1/ASME FFS-1, verify the edition.
  const ASSESS = {
    GML: [['General metal loss: accept if the measured thickness stays at or above the minimum required by the design code, plus the corrosion allowance for the next interval (API 510 vessels, API 570 piping, API 653 tanks). Otherwise: fitness-for-service, API 579-1 Part 4, repair or rerate.', 'Perte générale : acceptable si l’épaisseur mesurée reste au moins égale au minimum exigé par le code de construction, plus la surépaisseur pour l’intervalle suivant (API 510 capacités, API 570 tuyauteries, API 653 bacs). Sinon : aptitude au service, API 579-1 partie 4, réparation ou déclassement.']],
    LML: [['Local metal loss: compare the thinnest reading with the required thickness; local thin areas can be assessed with API 579-1 Part 5 (critical thickness profiles) by a qualified engineer. Remaining life = (measured − required) ÷ corrosion rate (API 510/570).', 'Perte locale : comparer la mesure la plus faible à l’épaisseur requise ; les zones minces locales s’évaluent avec l’API 579-1 partie 5 (profils d’épaisseur critiques) par un ingénieur qualifié. Durée de vie = (mesurée − requise) ÷ vitesse de corrosion (API 510/570).']],
    PIT: [['Pitting: API 579-1 Part 6 (pit-couple and pit-chart methods); API 510/570 allow isolated pits under conditions; tank bottoms per API 653. Widespread pitting may be treated as general loss.', 'Piqûres : API 579-1 partie 6 (couples de piqûres et abaques) ; l’API 510/570 admet des piqûres isolées sous conditions ; fonds de bacs selon API 653. Des piqûres généralisées peuvent être traitées comme une perte générale.']],
    CRACK: [['Cracks: no crack is accepted by a simple measurement. Remove and repair per the construction code and API 510/570, or assess as a crack-like flaw with API 579-1 Part 9 (length and depth from UT sizing) by a qualified engineer.', 'Fissures : aucune fissure n’est acceptée par simple mesure. Éliminer et réparer selon le code et l’API 510/570, ou évaluer comme défaut plan avec l’API 579-1 partie 9 (longueur et profondeur dimensionnées en UT) par un ingénieur qualifié.']],
    HIC: [['Blisters, HIC and SOHIC: API 579-1 Part 7 (with Part 9 for cracks near welds and SOHIC); size and spacing from UT or PAUT; NACE guidance for sour service.', 'Cloques, HIC et SOHIC : API 579-1 partie 7 (avec la partie 9 pour les fissures près des soudures et la SOHIC) ; dimensions et espacements par UT ou PAUT ; guides NACE pour le service acide.']],
    CREEP: [['Creep: remaining life with API 579-1 Part 10 (temperature and stress history, diameter growth, replication results); heater tubes per API 530 design life and API 573.', 'Fluage : durée de vie restante avec l’API 579-1 partie 10 (historique température-contrainte, gonflement, répliques) ; tubes de four selon API 530 et API 573.']],
    FIRE: [['Fire or overheating: API 579-1 Part 11 (heat exposure zones, hardness, metallography, dimensional checks); heaters per API 573.', 'Incendie ou surchauffe : API 579-1 partie 11 (zones d’exposition, dureté, métallographie, contrôles dimensionnels) ; fours selon API 573.']],
    BRIT: [['Brittle fracture: screening and assessment with API 579-1 Part 3 (minimum allowable temperature); ASME VIII UCS-66 curves for new design.', 'Rupture fragile : évaluation avec l’API 579-1 partie 3 (température minimale admissible) ; courbes UCS-66 de l’ASME VIII pour la conception.']],
    FAT: [['Fatigue cracks: remove the cause (vibration, thermal cycles) and treat cracks as crack-like flaws (API 579-1 Part 9); fatigue life with API 579-1 Part 14.', 'Fissures de fatigue : supprimer la cause (vibrations, cycles thermiques) et traiter les fissures comme défauts plans (API 579-1 partie 9) ; durée de vie en fatigue avec l’API 579-1 partie 14.']],
    MAT: [['Metallurgical damage has no NDT acceptance limit: a materials engineer decides from samples, hardness, replicas or impact tests; brittle-fracture risk with API 579-1 Part 3; HTHA per API RP 941.', 'Les dommages métallurgiques n’ont pas de limite d’acceptation CND : un ingénieur matériaux décide à partir de prélèvements, dureté, répliques ou résilience ; risque de rupture fragile avec l’API 579-1 partie 3 ; HTHA selon l’API RP 941.']]
  };

  /* ---------- seeded random ---------- */
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ---------- procedural surface painter ---------- */
  const W = 1024, H = 512;
  const BASE = { cs: [104, 106, 110], ss: [184, 188, 194], brass: [190, 158, 80], cast: [86, 86, 88], ni: [160, 164, 160], ti: [150, 156, 168] };
  const TINT = { rust: [139, 72, 34], black: [34, 33, 34], grey: [96, 99, 104], salt: [204, 206, 190], copper: [168, 82, 52], charcoal: [48, 49, 52], green: [74, 160, 98], soot: [20, 20, 22], slag: [92, 70, 60], sulfide: [70, 72, 78], oxide: [44, 38, 36], soil: [110, 84, 56], dark: [58, 60, 66] };
  function makeCanvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function noiseFill(g, base, amp, rnd, cells) {
    g.fillStyle = `rgb(${base.join(',')})`; g.fillRect(0, 0, W, H);
    for (let i = 0; i < cells; i++) { const x = rnd() * W, y = rnd() * H, r = 6 + rnd() * 50, d = (rnd() - 0.5) * amp; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${d > 0 ? '255,255,255' : '0,0,0'},${Math.abs(d) / 255})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  }
  function blob(g, x, y, rx, ry, rgba, soft) { g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, rgba); gr.addColorStop(soft == null ? 1 : soft, rgba.replace(/[\d.]+\)$/, '0)')); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore(); }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // paints one surface (OD or ID) of the sample for mechanism d at stage s (0 starts, 1 grows, 2 ends)
  function paint(d, s, surf) {
    const m = d.m, rnd = rng(hash(d.k + surf)), k = (s + 1) / 3, dmgHere = (m.side || 'ID') === surf || m.t === 'bulge' || m.t === 'none' || m.t === 'galv' && surf === 'OD';
    const col = makeCanvas(), hgt = makeCanvas(), rm = makeCanvas(), cc = col.getContext('2d'), hc = hgt.getContext('2d'), rc = rm.getContext('2d');
    const base = BASE[m.comp] || BASE.cs, tint = TINT[m.c] || TINT.rust, P = { cc, hc, rc, rnd, k, s, cracks: [], pits: [] };
    noiseFill(cc, base, 26, rnd, 420); noiseFill(hc, [128, 128, 128], 10, rnd, 260);
    // roughness (G) / metalness (B): bare steel smooth-ish and metallic
    rc.fillStyle = m.comp === 'ss' || m.comp === 'ni' || m.comp === 'ti' ? 'rgb(0,95,200)' : 'rgb(0,150,140)'; rc.fillRect(0, 0, W, H); // used steel: fairly rough, half metallic
    // brushed / mill texture streaks along the length
    for (let i = 0; i < 260; i++) { const y = rnd() * H; cc.fillStyle = `rgba(255,255,255,${rnd() * 0.035})`; cc.fillRect(0, y, W, 1); }
    // weld bead band at mid-length (canvas y = H/2): rough, slightly raised, darker heat tint
    const wy = H / 2;
    if (!m.noweld) { for (let x = 0; x < W; x += 6) { blob(cc, x, wy + (rnd() - 0.5) * 6, 16, 12, rgba([118, 112, 100], 0.55)); blob(hc, x, wy, 18, 14, 'rgba(255,255,255,0.18)'); } rc.fillStyle = 'rgba(0,210,90,0.7)'; rc.fillRect(0, wy - 18, W, 36); for (const o of [-1, 1]) { cc.fillStyle = 'rgba(70,60,90,0.18)'; cc.fillRect(0, wy + o * 34 - 10, W, 20); } }
    // in service, the process side of carbon steel carries a dark oxide / sulfide film; bare outside stays grey mill finish
    if (surf === 'ID' && (!m.comp || m.comp === 'cs' || m.comp === 'cast' || m.comp === 'pipe' || m.comp === 'vessel' || m.comp === 'tube')) { cc.fillStyle = 'rgba(48,44,42,0.62)'; cc.fillRect(0, 0, W, H); for (let i = 0; i < 220; i++) blob(cc, rnd() * W, rnd() * H, 10 + rnd() * 60, 8 + rnd() * 40, `rgba(${rnd() < 0.5 ? '78,60,46' : '30,30,32'},${0.15 + rnd() * 0.2})`); rc.fillStyle = 'rgba(0,205,70,0.8)'; rc.fillRect(0, 0, W, H); }
    const scale = (x, y, r, c, a) => { blob(cc, x, y, r, r * (0.6 + rnd() * 0.6), rgba(c, a)); blob(rc, x, y, r, r, `rgba(0,245,20,${a})`); };
    const lower = (x, y, rx, ry, a, soft) => blob(hc, x, y, rx, ry, `rgba(0,0,0,${a})`, soft);
    const raise = (x, y, rx, ry, a) => blob(hc, x, y, rx, ry, `rgba(255,255,255,${a})`);
    const crack = (pts, width) => {
      P.cracks.push(pts);
      for (const [g, c, w] of [[hc, 'rgba(0,0,0,0.95)', width + 1.2], [cc, 'rgba(12,10,10,0.95)', width]]) { g.strokeStyle = c; g.lineWidth = w; g.lineJoin = 'round'; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
    };
    const walk = (x, y, ang, len, step, wob) => { const pts = [[x, y]]; for (let i = 0; i < len; i++) { ang += (rnd() - 0.5) * wob; x += Math.cos(ang) * step; y += Math.sin(ang) * step; pts.push([x, y]); } return pts; };
    const branched = (x, y, ang, len, depth) => { const pts = walk(x, y, ang, len, 3.2, 0.7); crack(pts, depth > 1 ? 1.4 : 0.9); if (depth > 0) for (let i = 3; i < pts.length; i += 5 + Math.floor(rnd() * 6)) if (rnd() < 0.55) branched(pts[i][0], pts[i][1], ang + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.7), Math.floor(len * (0.35 + rnd() * 0.25)), depth - 1); };
    const cx = W * 0.5, cy = H * 0.5;
    if (dmgHere) {
      const t = m.t;
      if (t === 'uniform') { cc.fillStyle = rgba(tint, 0.55 + 0.2 * k); cc.fillRect(0, 0, W, H); for (let i = 0; i < 900 * k; i++) { const x = rnd() * W, y = rnd() * H, r = 3 + rnd() * 16; lower(x, y, r, r, 0.12 + 0.1 * k); scale(x, y, r * 1.4, tint, 0.25); } hc.fillStyle = `rgba(0,0,0,${0.12 + 0.22 * k})`; hc.fillRect(0, 0, W, H); rc.fillStyle = 'rgba(0,235,40,0.7)'; rc.fillRect(0, 0, W, H); }
      if (t === 'local' || t === 'cui' || t === 'galv') {
        const px = t === 'galv' ? cx : cx + (rnd() - 0.5) * 80, py = t === 'galv' ? cy + 70 : cy + (m.side === 'ID' ? 60 : -50), rx = (t === 'cui' ? 200 : 150) * (0.55 + 0.45 * k), ry = (t === 'galv' ? 40 : 110) * (0.6 + 0.4 * k);
        if (t === 'galv') { cc.fillStyle = rgba(BASE.ss, 0.95); cc.fillRect(0, 0, W, cy - 6); rc.fillStyle = 'rgba(0,90,230,1)'; rc.fillRect(0, 0, W, cy - 6); }
        scale(px, py, rx * 1.15, tint, 0.9); for (let i = 0; i < 160 * k; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * rx, x = px + Math.cos(a) * r, y = py + Math.sin(a) * r * ry / rx, pr = 4 + rnd() * 14; lower(x, y, pr, pr, 0.25 + 0.3 * k); scale(x, y, pr * 1.5, tint.map((v) => v * 0.7), 0.5); }
        lower(px, py, rx, ry, 0.35 + 0.4 * k, 0.95);
        if (t === 'cui') for (let i = 0; i < 40; i++) { const x = px + (rnd() - 0.5) * rx * 2, y = py + (rnd() - 0.5) * ry * 2; scale(x, y, 10 + rnd() * 26, [150, 92, 50], 0.6); } // flaky scale
      }
      if (t === 'groove') {
        const n = m.flow ? 5 : 3, clean = m.flow || m.c === 'grey'; for (let i = 0; i < n; i++) { const x = cx - 160 + i * (320 / n) + rnd() * 30, y0 = cy - 200 + rnd() * 60, len = (220 + rnd() * 120) * (0.5 + 0.5 * k), w = (12 + rnd() * 12) * (0.6 + 0.4 * k);
          for (let y = y0; y < y0 + len; y += 4) { const xx = x + Math.sin(y * 0.03) * 8; lower(xx, y, w, 7, 0.2 + 0.2 * k); if (clean) { blob(cc, xx, y, w * 0.9, 6, 'rgba(150,152,156,0.5)'); blob(rc, xx, y, w, 7, 'rgba(0,70,230,0.6)'); } else blob(cc, xx, y, w, 7, 'rgba(18,16,16,0.35)'); } // erosion leaves bright clean metal, chemical grooves stay dark
          if (m.flow) { lower(x, y0 + len, w * 1.6, w * 1.2, 0.6 * k); blob(cc, x, y0 + len, w * 1.5, w * 1.1, 'rgba(160,162,166,0.6)'); } }
        if (m.dep) for (let i = 0; i < 30; i++) scale(cx + (rnd() - 0.5) * 360, cy + (rnd() - 0.5) * 300, 8 + rnd() * 16, [40, 36, 32], 0.6);
      }
      if (t === 'pits' || t === 'tuber') {
        const n = Math.floor((t === 'tuber' ? 30 : 60) * (0.4 + 0.6 * k));
        for (let i = 0; i < n; i++) {
          const x = cx + (rnd() - 0.5) * 520, y = cy + (rnd() - 0.5) * 380, r = (m.sharp ? 4 : 6) + rnd() * (m.round ? 16 : 11) * (0.6 + 0.6 * k); P.pits.push([x, y, r]);
          lower(x, y, r, r * (m.sharp ? 0.8 : 1), m.sharp ? 0.95 : 0.85, m.sharp ? 0.55 : 1);
          blob(cc, x, y, r, r, rgba(m.c === 'soot' ? TINT.soot : tint.map((v) => v * 0.55), 0.95)); blob(rc, x, y, r * 1.3, r * 1.3, 'rgba(0,240,30,0.9)');
          if (t === 'tuber' && rnd() < 0.85 - 0.25 * s) { const tr = r * (2.2 + rnd()); blob(hc, x, y, tr, tr, 'rgba(255,255,255,0.6)', 0.8); blob(cc, x, y, tr, tr, rgba([150, 74, 30], 0.97), 0.82); for (let j = 0; j < 7; j++) blob(cc, x + (rnd() - 0.5) * tr, y + (rnd() - 0.5) * tr, tr * 0.3, tr * 0.25, rgba([206, 128, 58], 0.8), 0.7); blob(rc, x, y, tr, tr, 'rgba(0,250,0,1)', 0.85); }
          if (m.dep && rnd() < 0.6) scale(x + 6, y + 4, r * 2.2, m.c === 'salt' ? TINT.salt : m.c === 'green' ? TINT.green : [190, 190, 170], 0.55);
        }
        if (m.rough || m.slime) for (let i = 0; i < 300; i++) scale(rnd() * W, rnd() * H, 4 + rnd() * 18, m.slime ? [70, 74, 50] : tint, 0.25);
      }
      if (t === 'scc') {
        const n = 2 + Math.floor(5 * k), side = m.side === 'ID' ? 1 : -1;
        for (let i = 0; i < n; i++) { const x = 60 + rnd() * (W - 120), y = cy + side * (48 + rnd() * 70) * (rnd() < 0.5 ? 1 : -1); branched(x, y, (rnd() < 0.85 ? 0 : Math.PI / 2) + (rnd() - 0.5) * 0.4, Math.floor(18 + 40 * k), (m.branch || 2) - (s === 0 ? 1 : 0)); }
        if (m.dep) for (let i = 0; i < 12; i++) scale(cx + (rnd() - 0.5) * 500, cy + (rnd() - 0.5) * 300, 8 + rnd() * 14, TINT.green, 0.6);
        if (m.insul) for (let i = 0; i < 60; i++) scale(rnd() * W, rnd() * H, 6 + rnd() * 20, [170, 160, 140], 0.18);
      }
      if (t === 'crack') {
        const n = m.multi ? Math.min(m.multi + s, 5) : 1, y0 = m.toe || m.haz || m.fusion || m.hard ? cy + (m.fusion ? 26 : 36) : cy + 90;
        for (let i = 0; i < n; i++) { const yy = y0 + i * 14, len = (120 + 260 * k) * (m.straight ? 1.2 : 1), x0 = cx - len / 2 + (rnd() - 0.5) * 60; crack(walk(x0, yy, 0, Math.floor(len / 4), 4, m.straight || m.beach ? 0.08 : 0.35), m.straight ? 1.6 : 1.2); }
        if (m.pits) for (let i = 0; i < 10; i++) { const x = cx + (rnd() - 0.5) * 300, y = y0 + (rnd() - 0.5) * 30, r = 4 + rnd() * 5; lower(x, y, r, r, 0.7); blob(cc, x, y, r, r, rgba([60, 40, 30], 0.9)); }
        if (m.chevron && s === 2) for (let i = -6; i <= 6; i++) { if (!i) continue; const x = cx + i * 28; crack([[x, y0], [x - Math.sign(i) * 16, y0 - 20]], 0.6); crack([[x, y0], [x - Math.sign(i) * 16, y0 + 20]], 0.6); }
        if (m.drip) for (let i = 0; i < 14; i++) scale(cx + (rnd() - 0.5) * 300, y0 - 40 + rnd() * 80, 6 + rnd() * 12, [190, 196, 200], 0.8);
        if (m.dmw) { cc.fillStyle = rgba(BASE.ss, 0.9); cc.fillRect(0, 0, W, cy - 14); }
      }
      if (t === 'craze') { const n = m.local ? 26 : 60, k2 = 0.4 + 0.6 * k, ox = cx, oy = cy + 80; for (let i = 0; i < n * k2; i++) { const x = ox + (rnd() - 0.5) * (m.local ? 220 : 520), y = oy + (rnd() - 0.5) * (m.local ? 160 : 260); crack(walk(x, y, rnd() * Math.PI, 6 + Math.floor(rnd() * 10), 5, 0.6), 1.6); } scale(ox, oy, 260, [60, 40, 30], 0.3); }
      if (t === 'blister') { const n = Math.floor(5 + 12 * k); for (let i = 0; i < n; i++) { const x = cx + (rnd() - 0.5) * 520, y = cy + 40 + (rnd() - 0.5) * 320, r = (14 + rnd() * 34) * (0.5 + 0.7 * k); raise(x, y, r, r, 1); raise(x, y, r * 0.6, r * 0.6, 0.6); blob(cc, x + r * 0.25, y + r * 0.3, r * 1.05, r * 0.95, 'rgba(10,10,12,0.45)'); blob(cc, x - r * 0.25, y - r * 0.3, r * 0.55, r * 0.45, 'rgba(190,190,196,0.35)'); blob(rc, x, y, r, r, 'rgba(0,110,200,0.7)'); if (s === 2 && rnd() < 0.35) crack(walk(x - r * 0.6, y, 0, Math.floor(r / 3), 4, 0.3), 1); }
        if (s >= 1) for (let i = 0; i < 4 + 3 * s; i++) crack(walk(cx - 220 + rnd() * 440, cy + 34 + i * 3, 0, 10, 5, 0.25), 1); // SOHIC / SSC near the weld
        cc.fillStyle = 'rgba(30,30,34,0.35)'; cc.fillRect(0, 0, W, H); }
      if (t === 'scale') { const c2 = m.c === 'slag' ? [86, 72, 66] : m.c === 'sulfide' ? [46, 48, 54] : tint; cc.fillStyle = rgba(c2, 0.95); cc.fillRect(0, 0, W, H); rc.fillStyle = m.c === 'sulfide' ? 'rgba(0,120,170,0.9)' : 'rgba(0,200,60,0.85)'; rc.fillRect(0, 0, W, H); // iron sulfide scale is dark and slightly shiny hc.fillStyle = `rgba(0,0,0,${0.15 + 0.25 * k})`; hc.fillRect(0, 0, W, H);
        for (let i = 0; i < 160; i++) { const x = rnd() * W, y = rnd() * H, r = 6 + rnd() * 26; raise(x, y, r, r, 0.15); blob(cc, x, y, r, r, rgba(c2.map((v) => v * (0.7 + rnd() * 0.6)), 0.5)); }
        if (m.c === 'sulfide') for (let i = 0; i < 200; i++) blob(cc, rnd() * W, rnd() * H, 2 + rnd() * 5, 2, 'rgba(210,215,225,0.25)'); // shiny facets
        const sp = 3 + Math.floor(6 * k); for (let i = 0; i < sp; i++) { const x = rnd() * W, y = rnd() * H, r = 10 + rnd() * 28; blob(cc, x, y, r, r * 0.7, rgba([92, 90, 88], 0.8), 0.8); lower(x, y, r, r * 0.7, 0.3); blob(rc, x, y, r, r, 'rgba(0,110,220,0.9)'); } // spalled scale shows metal
        if (m.c === 'slag') for (let i = 0; i < 40 * k; i++) { const x = cx + (rnd() - 0.5) * 600, y = cy + (rnd() - 0.5) * 300, r = 6 + rnd() * 12; lower(x, y, r, r, 0.6); } }
      if (t === 'color' || t === 'layer') { const c2 = tint, n = t === 'color' ? 6 + Math.floor(8 * k) : 1; if (t === 'layer') { cc.fillStyle = rgba(c2, 0.35 + 0.35 * k); cc.fillRect(0, 0, W, H); } else for (let i = 0; i < n; i++) { const x = cx + (rnd() - 0.5) * 520, y = cy + (rnd() - 0.5) * 300, r = 30 + rnd() * 70 * k; scale(x, y, r, c2, 0.85); lower(x, y, r, r, 0.08); blob(rc, x, y, r, r, 'rgba(0,250,10,0.95)'); }
        if (m.craze && s === 2) for (let i = 0; i < 40; i++) crack(walk(rnd() * W, rnd() * H, rnd() * 3, 6, 5, 0.8), 0.8); }
      if (t === 'refr') { cc.fillStyle = 'rgb(160,152,140)'; cc.fillRect(0, 0, W, H); noiseFill(cc, [150, 144, 132], 40, rnd, 300); rc.fillStyle = 'rgb(0,250,0)'; rc.fillRect(0, 0, W, H); hc.fillStyle = 'rgba(255,255,255,0.25)'; hc.fillRect(0, 0, W, H);
        for (let i = 0; i < 14 + 30 * k; i++) crack(walk(rnd() * W, rnd() * H, rnd() * 6, 10 + Math.floor(rnd() * 20), 6, 0.5), 2); for (let i = 0; i < 2 + 5 * s; i++) { const x = rnd() * W, y = rnd() * H, r = 30 + rnd() * 50; lower(x, y, r, r * 0.8, 0.8); blob(cc, x, y, r, r * 0.8, 'rgba(70,64,60,0.9)'); } }
      if (t === 'burn') { const r = 120 + 140 * k; blob(cc, cx, cy - 60, r * 1.6, r, 'rgba(40,40,80,0.6)'); blob(cc, cx, cy - 60, r, r * 0.6, 'rgba(10,8,8,0.9)'); if (s === 2) { lower(cx, cy - 60, 60, 40, 1, 0.5); blob(cc, cx, cy - 60, 60, 40, 'rgba(0,0,0,1)'); } }
      if (t === 'voids' && s >= 1) for (let i = 0; i < 8 * s; i++) { const x = cx + (rnd() - 0.5) * 400, y = cy + 40 + (rnd() - 0.5) * 200, r = 8 + rnd() * 12; raise(x, y, r, r, 0.3 * s); }
    }
    if (m.t === 'bulge' && surf === 'OD') { cc.fillStyle = 'rgba(92,80,74,0.6)'; cc.fillRect(0, 0, W, H); blob(cc, cx, cy, 240, 200, 'rgba(110,60,40,0.5)'); if (m.rupture && s === 2) crack(walk(cx - 70, cy, 0, 35, 4, 0.1), 7); else if (s === 2) crack(walk(cx - 50, cy, 0, 25, 4, 0.5), 3); }
    grain(cc, rnd, 18); grain(hc, rnd, 6); // fine surface grain: real steel is never smooth at this scale
    return { col, hgt, rm, cracks: P.cracks, pits: P.pits };
  }
  function grain(g, rnd, amp) { const im = g.getImageData(0, 0, W, H), d = im.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * amp; d[i] = clamp(d[i] + n, 0, 255); d[i + 1] = clamp(d[i + 1] + n, 0, 255); d[i + 2] = clamp(d[i + 2] + n, 0, 255); } g.putImageData(im, 0, 0); }

  /* ---------- 3D (Three.js r170 from /vendor) ---------- */
  let THREE = null, renderer = null, env = null, failed = false;
  const loadThree = () => (window.__cyThreeMod ||= import(new URL('./vendor/three.module.min.js', document.baseURI).href)).then((mod) => { THREE = mod; if (!renderer && !failed) init(); }).catch((e) => { failed = true; console.warn('CYCLOPS damage lab: 3D unavailable', e); });
  function init() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); // keeps the last frame readable (snapshots)
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85; renderer.shadowMap.enabled = true;
      const room = new THREE.Scene(), add = (w, h, p, r, k, c) => { const mm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c || 0xffffff).multiplyScalar(k), side: THREE.DoubleSide })); mm.position.set(...p); mm.rotation.set(...r); room.add(mm); };
      room.add(new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), new THREE.MeshBasicMaterial({ color: 0x2c3240, side: THREE.BackSide })));
      add(10, 4, [0, 4.9, 0], [Math.PI / 2, 0, 0], 7); add(4, 6, [-9.9, 1, 2], [0, Math.PI / 2, 0], 3.2, 0xffe0c0); add(4, 6, [9.9, 0, -3], [0, -Math.PI / 2, 0], 2, 0xc0d8ff); add(12, 1.5, [0, -1, -9.9], [0, 0, 0], 1.2);
      const pm = new THREE.PMREMGenerator(renderer); env = pm.fromScene(room, 0.03).texture; pm.dispose();
    } catch (e) { failed = true; renderer = null; console.warn('CYCLOPS damage lab: WebGL unavailable', e); }
  }
  const R = 1, TW = 0.17, LEN = 4.4, T0 = Math.PI * 0.4, TL = Math.PI * 1.2; // half-pipe sample: outer radius, wall, length, visible arc
  function arcGeometry(r, open) { return new THREE.CylinderGeometry(r, r, LEN, 300, 120, true, open ? T0 : 0, open ? TL : Math.PI * 2); }
  function edgeGeometry() { // the cut faces (two along the length, two at the ends) so the wall thickness reads as solid metal
    const pos = [], quad = (a, b, c, d) => pos.push(...a, ...b, ...c, ...a, ...c, ...d), P = (r, th, y) => [r * Math.sin(th), y, r * Math.cos(th)];
    for (const th of [T0, T0 + TL]) quad(P(R - TW, th, -LEN / 2), P(R, th, -LEN / 2), P(R, th, LEN / 2), P(R - TW, th, LEN / 2));
    for (const y of [-LEN / 2, LEN / 2]) for (let i = 0; i < 80; i++) { const a = T0 + TL * i / 80, b = T0 + TL * (i + 1) / 80; quad(P(R - TW, a, y), P(R, a, y), P(R, b, y), P(R - TW, b, y)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  }
  function bulge(geom, amount, outer) { // creep / overheating: swell the tube locally (both surfaces)
    const p = geom.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const th = Math.atan2(v.x, v.z), d = Math.hypot((th - Math.PI) * 0.9, v.y * 1.1), f = amount * Math.exp(-d * d / 0.35), r = Math.hypot(v.x, v.z), nr = r + f * (outer ? 1 : 0.9); p.setXYZ(i, v.x * nr / r, v.y, v.z * nr / r); }
    p.needsUpdate = true; geom.computeVertexNormals();
  }
  function tex(c, srgb) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

  const st = { key: null, stage: 1, method: null, family: 'all', q: '', yaw: 0, pitch: 0.5, dist: 4.4, pan: 0, raf: 0, scene: null, camera: null, group: null, maps: null, dlg: null, ui: null, drag: null, lights: null };
  function buildScene() {
    if (!renderer) return; const d = byKey(st.key), m = d.m;
    if (st.scene) dispose();
    const scene = new THREE.Scene(); scene.environment = env; scene.background = new THREE.Color(0x0b1224);
    const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x1b2030, 0.3), key = new THREE.DirectionalLight(0xfff0dd, 1.15), rim = new THREE.DirectionalLight(0x9ec0ff, 1.1);
    key.position.set(4, 6, 5); key.castShadow = true; rim.position.set(-5, 2, -4); scene.add(hemi, key, rim);
    const spot = new THREE.SpotLight(0xfff6d8, 0, 12, 0.32, 0.5); spot.position.set(1.5, 2.6, 3); scene.add(spot, spot.target);
    const head = new THREE.DirectionalLight(0xffffff, 1.3); scene.add(head, head.target); // follows the camera so the inside of the pipe is lit
    const group = new THREE.Group(); group.rotation.z = Math.PI / 2; scene.add(group);
    const od = paint(d, st.stage, 'OD'), id = paint(d, st.stage, 'ID');
    st.maps = { od, id, d };
    const isBulge = m.t === 'bulge', amp = isBulge ? [0.05, 0.13, 0.22][st.stage] : 0;
    const mat = (maps, inner) => new THREE.MeshStandardMaterial({ map: tex(maps.col, true), bumpMap: tex(maps.hgt), bumpScale: inner ? -1.4 : 1.4, displacementMap: tex(maps.hgt), displacementScale: inner ? -0.12 : 0.12, displacementBias: inner ? 0.06 : -0.06, roughnessMap: tex(maps.rm), metalnessMap: tex(maps.rm), roughness: 1, metalness: 1, side: inner ? THREE.BackSide : THREE.FrontSide, envMapIntensity: inner ? 0.35 : 0.6 });
    const outerG = arcGeometry(R, true), innerG = arcGeometry(R - TW, true); if (isBulge) { bulge(outerG, amp, true); bulge(innerG, amp, false); }
    const outer = new THREE.Mesh(outerG, mat(od, false)), inner = new THREE.Mesh(innerG, mat(id, true)), edges = new THREE.Mesh(edgeGeometry(), new THREE.MeshStandardMaterial({ color: 0x9aa3ad, metalness: 0.9, roughness: 0.35 }));
    outer.castShadow = inner.castShadow = true; group.add(outer, inner, edges);
    // weld cap reinforcement around the outside at mid-length
    if (!m.noweld) { const arc = []; for (let i = 0; i <= 120; i++) { const th = T0 + TL * i / 120, r = R + 0.012; arc.push(new THREE.Vector3(r * Math.sin(th), 0, r * Math.cos(th))); } const bead = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 240, 0.05, 12, false), new THREE.MeshStandardMaterial({ color: 0x8d877c, metalness: 0.75, roughness: 0.62 })); bead.scale.set(1, 0.55, 1); group.add(bead); }
    // insulation and jacketing, cut back to show the steel (CUI, chloride SCC under insulation)
    if (m.insul || m.t === 'cui') { const ins = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.22, R + 0.22, LEN * 0.32, 120, 1, true, T0, TL), new THREE.MeshStandardMaterial({ color: 0xc9b06a, roughness: 1, metalness: 0, side: THREE.DoubleSide })); ins.position.y = -LEN * 0.34; const jac = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.25, R + 0.25, LEN * 0.32, 120, 1, true, T0, TL), new THREE.MeshStandardMaterial({ color: 0xb8bec6, roughness: 0.55, metalness: 0.8, side: THREE.DoubleSide })); jac.position.y = -LEN * 0.34; group.add(ins, jac); }
    // dissimilar metals (galvanic, DMW): the second half is stainless, joined at the weld
    const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.MeshStandardMaterial({ color: 0x141c33, roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.35; floor.receiveShadow = true; scene.add(floor);
    const camera = new THREE.PerspectiveCamera(36, 1.6, 0.05, 60);
    Object.assign(st, { scene, camera, group, lights: { spot, key, head } });
    st.yaw = ((m.side === 'OD' || m.t === 'bulge') && m.t !== 'none' ? Math.PI : 0) + 0.55; st.pitch = 0.5; st.pan = 0; // three-quarter view of the damaged surface
    addMethodProps(); fit();
  }
  function dispose() { st.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach((x) => { ['map', 'bumpMap', 'displacementMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'].forEach((k) => x[k] && x[k].dispose()); x.dispose(); }); }); st.scene = null; }

  // inspection overlays painted on the sample and props placed beside it
  function addMethodProps() {
    if (!st.scene) return; const g = st.group, d = st.maps.d, side = d.m.side || 'ID', maps = side === 'OD' ? st.maps.od : st.maps.id, mesh = g.children[side === 'OD' ? 0 : 1], M = st.method;
    g.children.filter((c) => c.userData.prop).forEach((c) => { g.remove(c); c.geometry && c.geometry.dispose(); });
    st.lights.spot.intensity = M === 'VT' ? 60 : 0; st.lights.key.intensity = M === 'WFMT' ? 0.12 : 1.15; st.scene.background = new THREE.Color(M === 'WFMT' ? 0x05060c : 0x0b1224);
    const base = maps.col, over = document.createElement('canvas'); over.width = W; over.height = H; const o = over.getContext('2d'); o.drawImage(base, 0, 0);
    const cracks = maps.cracks, pits = maps.pits, line = (c, w, blur) => { o.save(); o.strokeStyle = c; o.lineWidth = w; o.lineCap = 'round'; if (blur) o.filter = `blur(${blur}px)`; for (const p of cracks) { o.beginPath(); p.forEach((q, i) => (i ? o.lineTo(q[0], q[1]) : o.moveTo(q[0], q[1]))); o.stroke(); } o.restore(); };
    let emissive = null;
    if (M === 'PT') { o.fillStyle = 'rgba(246,246,240,0.86)'; o.fillRect(0, 0, W, H); line('rgba(205,20,30,0.9)', 7, 3); line('rgba(160,0,10,1)', 2.5); pits.forEach(([x, y, r]) => blob(o, x, y, r * 2.2, r * 2.2, 'rgba(205,20,30,0.85)')); }
    if (M === 'MT') { o.fillStyle = 'rgba(240,240,236,0.8)'; o.fillRect(0, 0, W, H); line('rgba(20,20,22,0.95)', 4, 1); }
    if (M === 'WFMT') { o.fillStyle = 'rgba(10,12,30,0.85)'; o.fillRect(0, 0, W, H); const e = document.createElement('canvas'); e.width = W; e.height = H; const eg = e.getContext('2d'); eg.fillStyle = '#000'; eg.fillRect(0, 0, W, H); eg.strokeStyle = 'rgb(140,255,90)'; eg.lineWidth = 3.5; eg.filter = 'blur(1.2px)'; for (const p of cracks) { eg.beginPath(); p.forEach((q, i) => (i ? eg.lineTo(q[0], q[1]) : eg.moveTo(q[0], q[1]))); eg.stroke(); } emissive = e;
      const uv = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0x3a2d6e, emissive: 0x7a4dff, emissiveIntensity: 2 })); uv.position.set(side === 'OD' ? 0 : 0, 0, side === 'OD' ? -1.7 : -0.3); uv.userData.prop = 1; g.add(uv); }
    const mtl = mesh.material; mtl.map.dispose(); mtl.map = tex(M && /PT|MT|WFMT/.test(M) ? over : base, true); if (mtl.emissiveMap) { mtl.emissiveMap.dispose(); mtl.emissiveMap = null; } if (emissive) { mtl.emissiveMap = tex(emissive, true); mtl.emissive = new THREE.Color(0xffffff); mtl.emissiveIntensity = 1.6; } else mtl.emissive = new THREE.Color(0x000000); mtl.needsUpdate = true;
    if (M && /UT|UTS|SWUT|PAUT|TOFD/.test(M)) { // probe on the outer surface over the damaged zone
      const pr = new THREE.Group(); pr.userData.prop = 1; const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0x2b6cb0, metalness: 0.4, roughness: 0.4 })); const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.18), new THREE.MeshStandardMaterial({ color: 0xc58b2b, roughness: 0.5 })); body.position.y = 0.16; pr.add(body, wedge); const cab = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.015, 8, 40, Math.PI), new THREE.MeshStandardMaterial({ color: 0x111111 })); cab.position.set(0.4, 0.27, 0); pr.add(cab);
      pr.position.set(0, 0, R + 0.03); pr.rotation.set(Math.PI / 2, 0, 0); const holder = new THREE.Group(); // on the outside wall, probe axis pointing into the metal holder.userData.prop = 1; holder.add(pr); holder.rotation.y = Math.PI; g.add(holder); st.probe = pr;
    } else st.probe = null;
    if (M === 'RT') { const src = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0xe2b324, roughness: 0.4 })); src.position.set(0, 0, 2.3); src.userData.prop = 1; const film = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.1), new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.6, side: THREE.DoubleSide })); film.position.set(0, 0, -1.25); film.userData.prop = 1; g.add(src, film); }
  }

  function fit() { if (!renderer || !st.ui) return; const box = st.ui.querySelector('.cydm-v'); const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1)); renderer.setSize(w, h, false); if (st.camera) { st.camera.aspect = w / h; st.camera.updateProjectionMatrix(); } }
  function frame(t) {
    st.raf = requestAnimationFrame(frame); if (!st.scene || !renderer) return;
    const c = st.camera, r = st.dist * Math.max(1, 1.5 / c.aspect), px = Math.cos(st.yaw) * st.pan, pz = -Math.sin(st.yaw) * st.pan; // pan: slide sideways
    c.position.set(px + Math.sin(st.yaw) * Math.cos(st.pitch) * r, Math.sin(st.pitch) * r + 0.1, pz + Math.cos(st.yaw) * Math.cos(st.pitch) * r); c.lookAt(px, 0, pz);
    if (st.probe) st.probe.parent.rotation.y = Math.PI + Math.sin(t / 900) * 0.35; // probe scanning across the zone
    st.lights.head.position.copy(c.position); st.lights.head.intensity = st.method === 'WFMT' ? 0.05 : 0.4;
    if (st.lights.spot.intensity) { st.lights.spot.position.set(c.position.x * 0.6, c.position.y + 1.2, c.position.z * 0.6); st.lights.spot.target.position.set(0, 0, 0); }
    renderer.render(st.scene, c);
  }

  /* ---------- 2D views: wall cross-section, UT C-scan, profile radiograph, microstructure ---------- */
  function lossAt(maps, x, y) { const g = maps.hgt.getContext('2d'); const p = g.getImageData(clamp(x | 0, 0, W - 1), clamp(y | 0, 0, H - 1), 1, 1).data[0]; return clamp((128 - p) / 128, 0, 1); }
  function drawSection(cv, d, s) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, m = d.m, rnd = rng(hash(d.k + 'sec')), k = (s + 1) / 3;
    g.fillStyle = '#0a1228'; g.fillRect(0, 0, w, h); const top = 46, bot = h - 34, wall = bot - top, id = (m.side || 'ID') === 'ID';
    // metal wall, OD at top, ID at bottom
    const grad = g.createLinearGradient(0, top, 0, bot); grad.addColorStop(0, '#9aa3ad'); grad.addColorStop(1, '#7d8692'); g.fillStyle = grad; g.fillRect(20, top, w - 40, wall);
    g.fillStyle = '#c9d6f5'; g.font = '12px system-ui, sans-serif'; g.fillText(L('OD (outside)', 'Extérieur'), 22, top - 8); g.fillText(L('ID (process side)', 'Intérieur (côté procédé)'), 22, bot + 18);
    const surfY = id ? bot : top, dir = id ? -1 : 1, maps = id ? st.maps.id : st.maps.od;
    if (/uniform|local|groove|pits|tuber|cui|galv|scale/.test(m.t)) { g.fillStyle = '#0a1228'; g.beginPath(); g.moveTo(20, surfY); for (let x = 20; x <= w - 20; x += 3) { const u = (x - 20) / (w - 40) * W, l = Math.max(lossAt(maps, u, H * 0.5 + (id ? 60 : -50)), lossAt(maps, u, H * 0.42)); g.lineTo(x, surfY + dir * l * wall * 0.9); } g.lineTo(w - 20, surfY); g.closePath(); g.fill(); if (/tuber|scale/.test(m.t)) { g.fillStyle = m.t === 'scale' ? '#3d3a40' : '#9b5a2a'; for (let i = 0; i < 18; i++) { const x = 30 + rnd() * (w - 60); g.beginPath(); g.ellipse(x, surfY - dir * 4, 10 + rnd() * 16, 6 + rnd() * 6, 0, 0, Math.PI * 2); g.fill(); } } }
    const crackLine = (x, depth, branch, wob) => { g.strokeStyle = '#0a0a0c'; g.lineWidth = 1.6; const go = (x0, y0, a, n, b) => { let x1 = x0, y1 = y0; g.beginPath(); g.moveTo(x0, y0); for (let i = 0; i < n; i++) { a += (rnd() - 0.5) * wob; x1 += Math.sin(a) * 4; y1 += dir * Math.cos(a) * 4; g.lineTo(x1, y1); if (b > 0 && rnd() < 0.18) { g.stroke(); go(x1, y1, a + (rnd() < 0.5 ? -0.7 : 0.7), Math.floor(n / 3), b - 1); g.beginPath(); g.moveTo(x1, y1); } } g.stroke(); }; go(x, surfY, 0, Math.floor(depth * wall / 4), branch); };
    if (m.t === 'scc') for (let i = 0; i < 2 + 2 * s; i++) crackLine(60 + rnd() * (w - 120), 0.25 + 0.55 * k, m.branch || 2, 0.8);
    if (m.t === 'crack') { for (let i = 0; i < (m.multi ? 1 + s : 1); i++) crackLine(w / 2 - 20 + i * 18, 0.2 + 0.7 * k, 0, m.straight ? 0.05 : 0.25); if (s === 2 && (m.straight || m.chevron)) { g.fillStyle = '#ff9a9a'; g.fillText(L('final fracture', 'rupture finale'), w / 2 + 10, h / 2); } }
    if (m.t === 'craze') for (let i = 0; i < 6 + 4 * s; i++) { g.fillStyle = '#3a2a22'; const x = 30 + rnd() * (w - 60), dd = (0.08 + 0.3 * k) * wall; g.beginPath(); g.moveTo(x - 3, surfY); g.lineTo(x + 3, surfY); g.lineTo(x, surfY + dir * dd); g.fill(); }
    if (m.t === 'blister' || m.hic) { for (let i = 0; i < 3 + 2 * s; i++) { const x = 50 + rnd() * (w - 100), y = top + wall * (0.35 + rnd() * 0.4), len = 30 + 40 * k; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len * 0.4, y); g.lineTo(x + len * 0.45, y + 6); g.lineTo(x + len, y + 6); g.stroke(); }
      for (let i = 0; i < 2 + s; i++) { const x = 60 + rnd() * (w - 120); g.fillStyle = '#0a1228'; g.beginPath(); g.ellipse(x, bot - 10, 24 + 10 * k, 7, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#9aa3ad'; g.beginPath(); g.ellipse(x, bot + 2, 26 + 10 * k, 10, 0, Math.PI, 0); g.stroke(); }
      if (s >= 1) { for (let j = 0; j < 4 + 2 * s; j++) { g.strokeStyle = '#111'; g.beginPath(); g.moveTo(w * 0.72, bot - 8 - j * 9); g.lineTo(w * 0.72 + 18, bot - 8 - j * 9); g.stroke(); } g.fillStyle = '#ffd27a'; g.fillText('SOHIC', w * 0.72 + 22, bot - 30); } g.fillStyle = '#ffd27a'; g.fillText(L('stepwise HIC (inside the wall)', 'HIC en escalier (dans la paroi)'), 26, top + 16); }
    if (m.t === 'voids' || m.voids) { for (let i = 0; i < 40 * k; i++) { const x = 30 + rnd() * (w - 60), y = (m.htha ? bot - rnd() * wall * 0.55 : top + rnd() * wall); g.fillStyle = '#16181c'; g.beginPath(); g.arc(x, y, 1.2 + rnd() * 1.8 * k, 0, Math.PI * 2); g.fill(); if (s === 2 && rnd() < 0.3) { g.strokeStyle = '#16181c'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + (rnd() - 0.5) * 6); g.stroke(); } } g.fillStyle = '#ffd27a'; g.fillText(m.htha ? L('methane voids → fissures (HTHA)', 'cavités de méthane → fissures (HTHA)') : L('creep voids at grain boundaries', 'cavités de fluage aux joints de grains'), 26, top + 16); }
    if (m.t === 'layer') { g.fillStyle = m.soft ? 'rgba(220,220,230,0.5)' : 'rgba(40,44,52,0.75)'; const dd = wall * (0.08 + 0.3 * k); g.fillRect(20, id ? bot - dd : top, w - 40, dd); g.fillStyle = '#ffd27a'; g.fillText(m.soft ? L('soft decarburized layer', 'couche décarburée douce') : L('hard diffusion layer', 'couche de diffusion dure'), 26, id ? bot - dd - 6 : top + dd + 14); }
    if (m.t === 'color') { g.fillStyle = m.c === 'copper' ? 'rgba(176,84,52,0.85)' : 'rgba(46,47,50,0.9)'; const dd = wall * (0.1 + 0.5 * k); g.fillRect(20, id ? bot - dd : top, w - 40, dd); }
    if (m.t === 'bulge') { g.fillStyle = '#ffd27a'; g.fillText(L('wall stretches and thins as the tube bulges', 'la paroi s’étire et s’amincit quand le tube gonfle'), 26, top + 16); }
    if (m.t === 'refr') { g.fillStyle = '#a39a8c'; g.fillRect(20, bot - wall * 0.9, w - 40, wall * 0.5); g.fillStyle = '#ffd27a'; g.fillText(L('refractory lining (cracks, spalls)', 'revêtement réfractaire (fissures, écaillages)'), 26, bot - wall * 0.9 - 6); }
    // dimension and scale text
    g.fillStyle = '#9fb0d6'; g.fillText(L('Cross-section through the wall (illustrative, not to scale)', 'Coupe de la paroi (illustrative, pas à l’échelle)'), w - 340, 18);
  }
  function drawMicro(cv, d, s) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, rnd = rng(hash(d.k + 'micro')), m = d.m.micro || 'grain', k = (s + 1) / 3;
    g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, w, h); const pts = []; for (let i = 0; i < 42; i++) pts.push([rnd() * w, rnd() * h]);
    // grain boundaries by nearest-site borders (Voronoi drawn on a coarse grid)
    const img = g.getImageData(0, 0, w, h), near = (x, y) => { let b = 0, bd = 1e9; for (let i = 0; i < pts.length; i++) { const dd = (pts[i][0] - x) ** 2 + (pts[i][1] - y) ** 2; if (dd < bd) { bd = dd; b = i; } } return b; };
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const a = near(x, y); if (near(x + 2, y) !== a || near(x, y + 2) !== a) for (let yy = 0; yy < 2; yy++) for (let xx = 0; xx < 2; xx++) { const o = ((y + yy) * w + x + xx) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 70; } }
    g.putImageData(img, 0, 0);
    const dots = (n, r, c, onB) => { for (let i = 0; i < n; i++) { const p = pts[Math.floor(rnd() * pts.length)], x = onB ? p[0] + (rnd() - 0.5) * 60 : rnd() * w, y = onB ? p[1] + (rnd() - 0.5) * 60 : rnd() * h; g.fillStyle = c; g.beginPath(); g.arc(x, y, r * (0.6 + rnd()), 0, Math.PI * 2); g.fill(); } };
    if (m === 'precip') dots(400 * k, 0.9, '#5b4f44');
    if (m === 'graphite') { for (let i = 0; i < 8 + 18 * k; i++) { const y = h * 0.55 + (rnd() - 0.5) * 30 * (2 - k), x = rnd() * w; g.fillStyle = '#1d1d1f'; g.beginPath(); g.ellipse(x, y, 5 + 4 * k, 3, 0, 0, Math.PI * 2); g.fill(); } }
    if (m === 'sigma') dots(80 * k, 2.4, '#3d4652', true);
    if (m === 'sphero') { dots(260 * (1 - k * 0.5), 1.2, '#4a4038'); if (s < 2) for (let i = 0; i < 30 * (1 - k); i++) { g.strokeStyle = '#4a4038'; const x = rnd() * w, y = rnd() * h; for (let j = 0; j < 4; j++) { g.beginPath(); g.moveTo(x, y + j * 3); g.lineTo(x + 14, y + j * 3); g.stroke(); } } }
    if (m === 'hydride') for (let i = 0; i < 70 * k; i++) { g.strokeStyle = '#2a2d36'; g.lineWidth = 1.2; const x = rnd() * w, y = rnd() * h, a = rnd() < 0.5 ? 0.2 : -0.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); g.stroke(); }
    if (m === 'grain') { g.strokeStyle = 'rgba(120,40,30,0.8)'; g.lineWidth = 1 + 2 * k; for (let i = 0; i < 10 * k; i++) { const p = pts[Math.floor(rnd() * pts.length)]; g.beginPath(); g.arc(p[0], p[1], 22, rnd() * 6, rnd() * 6 + 1.4); g.stroke(); } }
    g.fillStyle = 'rgba(10,18,40,0.78)'; g.fillRect(0, h - 24, w, 24); g.fillStyle = '#e8f0ff'; g.font = '12px system-ui, sans-serif'; g.fillText(L('Microstructure (metallography) — not visible to NDT', 'Microstructure (métallographie) — invisible au CND'), 8, h - 8);
  }
  function drawCscan(cv, d) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, maps = (d.m.side || 'ID') === 'OD' ? st.maps.od : st.maps.id, src = maps.hgt.getContext('2d').getImageData(0, 0, W, H).data, img = g.createImageData(w, h);
    const t0 = 12.7; let min = t0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = Math.floor(x / w * W), v = Math.floor(y / h * H), p = src[(v * W + u) * 4], loss = clamp((128 - p) / 128, 0, 0.95), t = t0 * (1 - loss * 0.85); if (t < min) min = t; const f = clamp((t0 - t) / (t0 * 0.6), 0, 1), o = (y * w + x) * 4; img.data[o] = 40 + 215 * f; img.data[o + 1] = 120 + 100 * (1 - Math.abs(f - 0.5) * 2) - 60 * f; img.data[o + 2] = 220 * (1 - f) + 20; img.data[o + 3] = 255; }
    g.putImageData(img, 0, 0); g.fillStyle = 'rgba(10,18,40,0.8)'; g.fillRect(0, 0, w, 22); g.fillStyle = '#e8f0ff'; g.font = 'bold 12px system-ui, sans-serif';
    const planar = /scc|crack|craze/.test(d.m.t);
    g.fillText(planar ? L('C-scan (0° thickness): cracks barely change thickness → use angle beam', 'C-scan (épaisseur 0°) : les fissures changent peu l’épaisseur → faisceau d’angle') : L(`C-scan thickness · nominal 12.7 mm · min ≈ ${min.toFixed(1)} mm`, `C-scan d’épaisseur · nominal 12,7 mm · min ≈ ${min.toFixed(1).replace('.', ',')} mm`), 6, 15);
    return min;
  }
  function drawRT(cv, d) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, a = st.maps.od.hgt.getContext('2d').getImageData(0, 0, W, H).data, b = st.maps.id.hgt.getContext('2d').getImageData(0, 0, W, H).data, img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = Math.floor(x / w * W), v = Math.floor(y / h * H), i = (v * W + u) * 4, loss = clamp((128 - a[i]) / 128, 0, 1) + clamp((128 - b[i]) / 128, 0, 1), weld = Math.exp(-(((v - H / 2) / 26) ** 2)) * 0.25, dens = clamp(0.45 + loss * 0.9 - weld, 0, 1), c = 225 - dens * 190, o = (y * w + x) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = c; img.data[o + 3] = 255; }
    g.putImageData(img, 0, 0); g.fillStyle = 'rgba(10,18,40,0.8)'; g.fillRect(0, 0, w, 22); g.fillStyle = '#e8f0ff'; g.font = 'bold 12px system-ui, sans-serif'; g.fillText(L('Profile radiograph: darker = less metal; tight cracks may not show', 'Radiographie de profil : plus sombre = moins de métal ; les fissures serrées peuvent ne pas apparaître'), 6, 15);
  }

  /* ---------- UI ---------- */
  const css = `
dialog.cydm .cylab-body { padding: 0; }
.cydm-wrap { display: grid; grid-template-columns: 250px minmax(0, 1fr) minmax(300px, 34%); height: min(82dvh, 900px); }
.cydm-list { overflow: auto; border-right: 1px solid var(--line); padding: 8px; } .cydm-list input { width: 100%; box-sizing: border-box; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 7px 9px; font: inherit; margin-bottom: 6px; }
.cydm-fam { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px; } .cydm-fam button { font-size: 11px; padding: 3px 7px; border-radius: 99px; } .cydm-fam button.on { background: var(--accent); color: #fff; border-color: var(--accent); }
.cydm-item { display: block; width: 100%; text-align: left; padding: 6px 8px; margin: 2px 0; font-size: 12.5px; border-color: transparent; background: transparent; line-height: 1.3; } .cydm-item.on { background: rgba(61,169,255,.2); border-color: var(--blue); } .cydm-item small { color: var(--muted); margin-right: 4px; } .cydm-item i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.cydm-mid { display: grid; grid-template-rows: minmax(0, 1fr) auto; min-width: 0; } .cydm-v { position: relative; background: #0b1224; min-height: 260px; cursor: grab; touch-action: none; } .cydm-v canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.cydm-tag { position: absolute; top: 8px; left: 10px; right: 10px; pointer-events: none; color: #e8f0ff; text-shadow: 0 1px 4px #000; } .cydm-tag b { font-size: 16px; } .cydm-tag small { display: block; color: #9fd0ff; }
.cydm-hint { position: absolute; bottom: 8px; left: 10px; font-size: 11px; color: #9fb0d6; pointer-events: none; text-shadow: 0 1px 3px #000; }
.cydm-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px; border-top: 1px solid var(--line); } .cydm-bar button.on { background: var(--accent); border-color: var(--accent); color: #fff; } .cydm-stage { display: flex; gap: 4px; } .cydm-stage button { font-size: 12px; }
.cydm-info { overflow: auto; padding: 10px 12px; border-left: 1px solid var(--line); font-size: 13.5px; line-height: 1.45; } .cydm-info h2 { margin: 0 0 4px; font-size: 18px; } .cydm-info h3 { margin: 12px 0 4px; font-size: 13px; color: #7cc4ff; text-transform: uppercase; letter-spacing: .04em; }
.cydm-badge { display: inline-block; border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 700; color: #071022; margin-right: 6px; }
.cydm-st { border-left: 3px solid var(--line); padding: 4px 8px; margin: 4px 0; color: var(--muted); } .cydm-st.on { border-color: #ffd27a; color: var(--text); background: rgba(255,210,122,.08); }
.cydm-m { display: grid; grid-template-columns: 64px 1fr; gap: 6px; align-items: center; padding: 3px 0; border-top: 1px solid rgba(52,74,131,.5); } .cydm-m button { font-size: 11px; padding: 3px 4px; } .cydm-m button.on { background: var(--accent); color: #fff; border-color: var(--accent); } .cydm-m button:disabled { opacity: .55; cursor: default; }
.cydm-dots { font-weight: 800; letter-spacing: 1px; } .cydm-dots.g2 { color: #42c991; } .cydm-dots.g1 { color: #e0a526; } .cydm-dots.g0 { color: #e66b78; }
.cydm-assess { border: 1px solid #e2b324; border-radius: 10px; padding: 8px 10px; background: rgba(226,179,36,.08); }
.cydm-cv { width: 100%; display: block; border-radius: 8px; border: 1px solid var(--line); margin: 6px 0; }
@media (max-width: 980px) { .cydm-wrap { grid-template-columns: minmax(0, 1fr); height: auto; } .cydm-list { max-height: 30dvh; border-right: 0; border-bottom: 1px solid var(--line); } .cydm-v { min-height: 46dvh; } .cydm-info { border-left: 0; } }
`;
  const byKey = (k) => (window.CYDM_DATA || []).find((d) => d.k === k);
  const methods = (d) => d.insp.split(',').map((x) => { const [c, v] = x.split(':'); return [c, Number(v)]; }).sort((a, b) => b[1] - a[1]);
  const dots = (n) => `<span class="cydm-dots g${n}">${'●'.repeat(n + 1)}${'○'.repeat(2 - n)}</span>`;
  function listHtml() {
    const q = st.q.trim().toLowerCase(), all = (window.CYDM_DATA || []).slice().sort((a, b) => parseFloat(a.s.slice(2)) - parseFloat(b.s.slice(2)));
    return all.filter((d) => (st.family === 'all' || d.f === st.family) && (!q || (T2(d.n) + ' ' + d.n[0] + ' ' + d.s).toLowerCase().includes(q)))
      .map((d) => `<button type="button" class="cydm-item${d.k === st.key ? ' on' : ''}" data-dm="${d.k}"><i style="background:${FAM[d.f][2]}"></i><small>${d.s}</small>${esc(T2(d.n))}</button>`).join('') || `<p class="cylab-note">${L('No match.', 'Aucun résultat.')}</p>`;
  }
  function infoHtml(d) {
    const stg = [L('Starts', 'Début'), L('Grows', 'Progression'), L('Ends', 'Fin')];
    return `<h2>${esc(T2(d.n))}</h2><span class="cydm-badge" style="background:${FAM[d.f][2]}">${esc(T2(FAM[d.f]))}</span><small style="color:var(--muted)">API RP 571 (2020) § ${d.s}</small>
<h3>${L('How it starts and grows', 'Comment il démarre et progresse')}</h3>${d.st.map((x, i) => `<div class="cydm-st${i === st.stage ? ' on' : ''}"><b>${i + 1}. ${stg[i]}</b> — ${esc(T2(x))}</div>`).join('')}
<h3>${L('What it looks like', 'À quoi il ressemble')}</h3><p>${esc(T2(d.look))}</p>
<h3>${L('Where and which materials', 'Où et quels matériaux')}</h3><p>${esc(T2(d.where))}.<br><b>${L('Materials', 'Matériaux')}:</b> ${esc(T2(d.mat))}.</p>
<h3>${L('How to inspect it', 'Comment l’inspecter')}</h3>${methods(d).map(([c, v]) => `<div class="cydm-m"><button type="button" data-dm-m="${c}" class="${st.method === c ? 'on' : ''}" ${SHOW.has(c) ? '' : 'disabled'} title="${SHOW.has(c) ? L('Show on the sample', 'Montrer sur l’échantillon') : L('Described only', 'Décrit seulement')}">${c}</button><span>${dots(v)} ${esc(T2(METH[c] || [c, c]))}</span></div>`).join('')}
<p style="margin-top:6px"><b>${L('Focus', 'Cibler')}:</b> ${esc(T2(d.focus))}</p><div data-dm-extra></div>
<h3>${L('Cross-section', 'Coupe')}</h3><canvas class="cydm-cv" data-dm-sec width="560" height="210"></canvas>
<h3>${L('Prevention', 'Prévention')}</h3><p>${esc(T2(d.prev))}</p>
<h3>${L('Acceptance / assessment', 'Acceptation / évaluation')}</h3><div class="cydm-assess"><span class="cypc-st verify">${L('verify', 'à vérifier')}</span>${esc(T2(ASSESS[d.a][0]))}<p class="cylab-note" style="margin:6px 0 0">${L('API RP 571 describes damage mechanisms; it does not give acceptance criteria. Use the code and edition named in your inspection plan, and a qualified inspector or engineer for fitness-for-service.', 'L’API RP 571 décrit les mécanismes ; elle ne donne pas de critères d’acceptation. Appliquez le code et l’édition de votre plan d’inspection, et un inspecteur ou ingénieur qualifié pour l’aptitude au service.')}</p></div>
<p style="margin-top:10px"><button type="button" data-dm-ai>🤖 ${L('Ask the AI about this mechanism', 'Interroger l’IA sur ce mécanisme')}</button></p>
<p class="cylab-note">${L('Summary written for CYCLOPS training from API RP 571, 3rd edition (2020); read the standard for full details, figures and critical factors. 3D and sections are illustrations, not to scale.', 'Résumé rédigé pour la formation CYCLOPS d’après l’API RP 571, 3e édition (2020) ; lire la norme pour le détail complet, les figures et facteurs critiques. 3D et coupes illustratives, pas à l’échelle.')}</p>`;
  }
  function render() {
    const d = byKey(st.key); if (!d) return;
    st.ui.querySelector('.cydm-list-items').innerHTML = listHtml();
    st.ui.querySelector('.cydm-info').innerHTML = infoHtml(d);
    st.ui.querySelector('.cydm-tag').innerHTML = `<small>API RP 571 § ${d.s} · ${esc(T2(FAM[d.f]))}</small><b>${esc(T2(d.n))}</b>`;
    st.ui.querySelectorAll('[data-dm-stage]').forEach((b) => b.classList.toggle('on', Number(b.dataset.dmStage) === st.stage));
    buildScene(); views();
    window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id: 'dm:' + d.k } }));
  }
  function views() {
    const d = byKey(st.key), sec = st.ui.querySelector('[data-dm-sec]'), extra = st.ui.querySelector('[data-dm-extra]');
    if (!st.maps) { st.maps = { od: paint(d, st.stage, 'OD'), id: paint(d, st.stage, 'ID'), d }; }
    if (sec) { if (d.m.t === 'none') drawMicro(sec, d, st.stage); else drawSection(sec, d, st.stage); }
    if (!extra) return; const M = st.method;
    if (M && /UT|UTS|PAUT|SWUT|TOFD/.test(M)) { extra.innerHTML = `<canvas class="cydm-cv" data-dm-cs width="560" height="200"></canvas><p class="cylab-note">${/SWUT|PAUT|TOFD/.test(M) ? L('Angle-beam, PAUT and TOFD find and size cracks and HIC that a 0° thickness map misses.', 'Le faisceau d’angle, le PAUT et le TOFD détectent et dimensionnent fissures et HIC qu’une carte d’épaisseur 0° manque.') : L('Thickness map from the outside surface, as with AUT corrosion mapping.', 'Carte d’épaisseur depuis l’extérieur, comme une cartographie AUT.')} ${L('The probe scans the outside wall: press ⟲ to see it.', 'Le traducteur balaie la paroi extérieure : appuyez sur ⟲ pour le voir.')}</p>`; drawCscan(extra.querySelector('canvas'), d); }
    else if (M === 'RT') { extra.innerHTML = `<canvas class="cydm-cv" data-dm-rt width="560" height="200"></canvas>`; drawRT(extra.querySelector('canvas'), d); }
    else if (M === 'PT' || M === 'MT' || M === 'WFMT') extra.innerHTML = `<p class="cylab-note">${(d.m.side || 'ID') === 'ID' ? L('Shown on the inside (process) surface: in the field this needs internal access during a shutdown.', 'Montré sur la surface intérieure (procédé) : sur site, il faut un accès interne pendant un arrêt.') : L('Shown on the outside surface after cleaning.', 'Montré sur la surface extérieure après nettoyage.')} ${d.m.t === 'none' || /uniform|local|groove|scale|layer|color/.test(d.m.t) ? L('This mechanism gives no crack indication: surface methods are not the right tool here.', 'Ce mécanisme ne donne pas d’indication de fissure : les méthodes de surface ne sont pas adaptées ici.') : ''}</p>`;
    else extra.innerHTML = '';
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return; const dd = b.dataset;
    if (dd.dm) { st.key = dd.dm; st.method = null; st.maps = null; return render(); }
    if (dd.dmFam) { st.family = dd.dmFam; st.ui.querySelectorAll('[data-dm-fam]').forEach((x) => x.classList.toggle('on', x.dataset.dmFam === st.family)); st.ui.querySelector('.cydm-list-items').innerHTML = listHtml(); return; }
    if (dd.dmStage) { st.stage = Number(dd.dmStage); st.maps = null; return render(); }
    if (dd.dmM) { st.method = st.method === dd.dmM ? null : dd.dmM; st.ui.querySelectorAll('[data-dm-m]').forEach((x) => x.classList.toggle('on', x.dataset.dmM === st.method)); if (st.scene) addMethodProps(); views(); return; }
    if (dd.dmFlip != null) { st.yaw += Math.PI; return; }
    if (dd.dmAi != null) { const d = byKey(st.key); st.dlg.close(); if (window.CY3 && window.CY3.send) { window.CY3.open(); window.CY3.send(L('Explain this damage mechanism for a working inspector (API RP 571): how it starts, where to look, which NDT finds it best, and which code is used to assess it: ', 'Explique ce mécanisme de dégradation pour un inspecteur (API RP 571) : comment il démarre, où chercher, quel CND le trouve le mieux, et quel code sert à l’évaluer : ') + T2(d.n) + ' (§ ' + d.s + ')'); } }
  }
  const panBy = (d) => { st.pan = clamp(st.pan + d * st.dist, -LEN * 0.6, LEN * 0.6); };
  function bindViewer(v) {
    const pts = new Map(); let pinch = 0, panDrag = false, hold = 0;
    v.tabIndex = 0; v.addEventListener('contextmenu', (e) => e.preventDefault());
    v.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); panBy(-0.05); } else if (e.key === 'ArrowRight') { e.preventDefault(); panBy(0.05); } });
    // ◀ ▶ buttons in the bar: press and hold to keep moving
    const stop = () => { clearInterval(hold); hold = 0; };
    st.ui.addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-dm-pan]'); if (!b) return; e.preventDefault(); stop(); const d = Number(b.dataset.dmPan); panBy(d * 0.03); hold = setInterval(() => panBy(d * 0.012), 16); ['pointerup', 'pointercancel', 'blur'].forEach((ev) => window.addEventListener(ev, stop, { once: true })); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => st.ui.addEventListener(ev, stop));
    v.addEventListener('pointerdown', (e) => { v.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); v.style.cursor = 'grabbing'; panDrag = e.button === 2 || e.button === 1 || e.shiftKey; });
    v.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; const p = pts.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()], dist = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) st.dist = clamp(st.dist * pinch / dist, 2.2, 9); pinch = dist; panBy(-dx * 0.0008); return; } // two fingers: pinch to zoom, slide sideways
      if (panDrag) { panBy(-dx * 0.0016); return; }
      st.yaw -= dx * 0.008; st.pitch = clamp(st.pitch + dy * 0.006, -1.2, 1.3); });
    const up = (e) => { pts.delete(e.pointerId); pinch = 0; v.style.cursor = 'grab'; }; v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
    v.addEventListener('wheel', (e) => { e.preventDefault(); st.dist = clamp(st.dist * (e.deltaY > 0 ? 1.08 : 0.92), 2.2, 9); }, { passive: false });
  }
  async function open(key) {
    if (!window.CYLAB || !(window.CYDM_DATA || []).length) return;
    if (!document.getElementById('cydm-css')) { const s = document.createElement('style'); s.id = 'cydm-css'; s.textContent = css; document.head.appendChild(s); }
    st.key = byKey(key) ? key : (st.key || 'cui'); st.method = null; st.maps = null;
    const ui = window.CYLAB.shell({ cls: 'cydm', title: '🛢 ' + L('Damage mechanisms 3D — API RP 571', 'Mécanismes de dégradation 3D — API RP 571'), sub: L('67 mechanisms on a realistic cut sample: how each starts, how to inspect it, and how it is assessed · training illustrations', '67 mécanismes sur un échantillon coupé réaliste : comment chacun démarre, comment l’inspecter, comment l’évaluer · illustrations de formation') });
    st.dlg = ui.dlg;
    ui.body.innerHTML = `<div class="cydm-wrap"><div class="cydm-list"><input type="search" data-dm-q placeholder="${L('Search 67 mechanisms…', 'Chercher parmi 67 mécanismes…')}" aria-label="${L('Search', 'Chercher')}"><div class="cydm-fam"><button type="button" data-dm-fam="all" class="on">${L('All', 'Tous')}</button>${Object.keys(FAM).map((f) => `<button type="button" data-dm-fam="${f}" style="border-color:${FAM[f][2]}">${esc(T2(FAM[f]))}</button>`).join('')}</div><div class="cydm-list-items"></div></div>
<div class="cydm-mid"><div class="cydm-v"><div class="cydm-tag"></div><div class="cydm-hint">${L('Drag to rotate · wheel or pinch to zoom · ◀ ▶, right-drag or two fingers to move sideways · ⟲ flips inside/outside', 'Glisser pour tourner · molette ou pincer pour zoomer · ◀ ▶, clic droit glissé ou deux doigts pour aller sur le côté · ⟲ retourne intérieur/extérieur')}</div></div>
<div class="cydm-bar"><span>${L('Stage', 'Stade')}:</span><div class="cydm-stage">${[L('1 · Starts', '1 · Début'), L('2 · Grows', '2 · Progression'), L('3 · Ends', '3 · Fin')].map((t, i) => `<button type="button" data-dm-stage="${i}">${t}</button>`).join('')}</div><button type="button" data-dm-flip>⟲ ${L('Inside / outside', 'Intérieur / extérieur')}</button><button type="button" data-dm-pan="-1" title="${L('Move left (hold)', 'Aller à gauche (maintenir)')}" aria-label="${L('Move left', 'Aller à gauche')}">◀</button><button type="button" data-dm-pan="1" title="${L('Move right (hold)', 'Aller à droite (maintenir)')}" aria-label="${L('Move right', 'Aller à droite')}">▶</button><span class="cylab-note" style="margin-left:auto">${L('Illustrative, not to scale', 'Illustratif, pas à l’échelle')}</span></div></div>
<div class="cydm-info"></div></div>`;
    st.ui = ui.body; ui.body.addEventListener('click', onClick);
    ui.body.querySelector('[data-dm-q]').addEventListener('input', (e) => { st.q = e.target.value; ui.body.querySelector('.cydm-list-items').innerHTML = listHtml(); });
    ui.dlg.addEventListener('close', () => { cancelAnimationFrame(st.raf); st.raf = 0; if (st.scene) dispose(); if (st.resize) st.resize.disconnect(); st.ui = null; });
    const v = ui.body.querySelector('.cydm-v'); bindViewer(v);
    render();
    await loadThree(); if (!st.ui) return;
    if (renderer) { v.prepend(renderer.domElement); st.resize = new ResizeObserver(fit); st.resize.observe(v); buildScene(); st.raf = requestAnimationFrame(frame); }
    else v.insertAdjacentHTML('beforeend', `<p style="position:absolute;top:60px;left:12px;color:#ffd27a">${L('3D is not available on this device; the descriptions and sections still work.', '3D indisponible sur cet appareil ; descriptions et coupes restent disponibles.')}</p>`);
    const item = ui.body.querySelector('.cydm-item.on'); if (item) item.scrollIntoView({ block: 'center' });
  }
  window.CYDM = { open, maps: () => st.maps, list: () => window.CYDM_DATA || [], state: () => ({ key: st.key, stage: st.stage, method: st.method, pan: st.pan, yaw: st.yaw, scene: !!st.scene, children: st.group ? st.group.children.length : 0 }), ASSESS, METH };
  if (window.CYLAB) window.CYLAB.register({ icon: '🛢', available: () => (window.CYDM_DATA || []).length > 0, open: () => open(), title: () => L('Damage mechanisms 3D (API RP 571)', 'Mécanismes de dégradation 3D (API RP 571)'), desc: () => L('All 67 API RP 571 mechanisms on a realistic 3D sample: how each starts and grows, inspection methods shown on the part, cross-sections, and the code used to assess it.', 'Les 67 mécanismes de l’API RP 571 sur un échantillon 3D réaliste : démarrage et progression, méthodes d’inspection montrées sur la pièce, coupes, et code d’évaluation.') });
}());
