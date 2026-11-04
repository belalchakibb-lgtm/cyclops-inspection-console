/* CYCLOPS surface-method simulators (training only).
   - MT (magnetic particle): move and rotate a yoke over a welded plate with hidden cracks, choose AC/DC,
     particles and material, apply particles and see which cracks show and WHY (angle to the field, pole
     zone, depth vs AC/DC, ferromagnetic or not). Goal: find every crack.
   - PT (penetrant): choose cleaning, penetrant type, dwell, excess removal, developer, development time and
     lighting; the developed specimen shows which defects appear and WHY each was found or missed.
   Injected under the MT and PT method pages. Simplified teaching models: real values come from the
   approved procedure and the applicable code (e.g. ASME V Art. 6 / 7, ISO 3452, ISO 17638). */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rad = (d) => d * Math.PI / 180, TAU = Math.PI * 2;
  const learn = (id, extra) => window.dispatchEvent(new CustomEvent('cy-learn', { detail: Object.assign({ id }, extra) }));
  const fit = (c) => { const r = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight; if (c.width !== Math.round(w * r)) { c.width = Math.round(w * r); c.height = Math.round(h * r); } const g = c.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return { g, w, h }; };

  const css = `
.cysurf summary { font-weight: 700; }
.cysurf-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 14px; margin-top: 8px; }
.cysurf canvas { width: 100%; height: 330px; display: block; border-radius: 10px; border: 1px solid var(--line); background: #0b1530; }
.cysurf-ctrl { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px 14px; margin-top: 8px; }
.cysurf-ctrl label { display: block; font-size: 13px; color: var(--muted); }
.cysurf-ctrl input[type=range] { width: 100%; accent-color: var(--blue); }
.cysurf-ctrl select { width: 100%; margin-top: 3px; border: 1px solid var(--line); border-radius: 7px; background: #0b1530; color: var(--text); padding: 7px; font: inherit; }
.cysurf-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; } .cysurf-row button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cysurf-primary { background: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important; }
.cysurf-panel { border: 1px solid var(--line); border-radius: 9px; padding: 10px 12px; background: rgba(8, 17, 38, .45); }
.cysurf-panel h3 { margin: 0 0 6px; font-size: 1.02rem; } .cysurf-panel ul { margin: 6px 0; padding-left: 18px; } .cysurf-panel li { margin: 5px 0; line-height: 1.45; }
.cysurf-ok { color: #7de2b5; } .cysurf-ko { color: #ff9eaa; } .cysurf-warn { color: #ffd27a; }
.cysurf-score { font-weight: 800; font-size: 1.05rem; margin: 6px 0; }
.cysurf-note { color: var(--muted); font-size: 12px; }
html.field .cysurf-panel { background: #fff; } html.field .cysurf-ctrl select { background: #fff; color: #0a0d12; }
@media (max-width: 820px) { .cysurf-grid { grid-template-columns: minmax(0, 1fr); } .cysurf canvas { height: 240px; } }
`;

  /* ============================ MT simulator ============================ */
  // Plate 300 × 180 mm, weld along y = 90. Angles in degrees from the x axis (weld direction).
  const MT_CRACKS = [
    { id: 'A', x: 75, y: 90, a: 90, len: 14, depth: 0, n: ['transverse crack across the weld', 'fissure transversale au cordon'] },
    { id: 'B', x: 175, y: 92, a: 0, len: 18, depth: 0, n: ['longitudinal crack in the weld', 'fissure longitudinale dans le cordon'] },
    { id: 'C', x: 240, y: 66, a: 45, len: 12, depth: 0, n: ['45° crack in the heat-affected zone', 'fissure à 45° dans la ZAT'] },
    { id: 'D', x: 115, y: 96, a: 0, len: 16, depth: 2, n: ['longitudinal crack 2 mm below the surface', 'fissure longitudinale 2 mm sous la surface'] }
  ];
  const mt = { x: 150, y: 90, a: 90, cur: 'AC', part: 'wet-visible', mat: 'ferro', shots: [], found: {}, last: null, t0: 0, rewarded: false };
  // Field strength at a point for a yoke centred at (x, y), axis angle a, poles 100 mm apart (simplified longitudinal field).
  function mtField(px, py, s) {
    const ax = Math.cos(rad(s.a)), ay = Math.sin(rad(s.a)), dx = px - s.x, dy = py - s.y;
    const along = dx * ax + dy * ay, across = Math.abs(-dx * ay + dy * ax);
    if (Math.abs(along) > 50) return 0;
    return Math.exp(-Math.pow(across / 32, 2)) * (0.75 + 0.25 * Math.cos(along / 50 * Math.PI / 2));
  }
  function mtResult(c, s) {
    const f = mtField(c.x, c.y, s), diff = Math.abs(((c.a - s.a) % 180 + 180) % 180), angF = Math.abs(Math.sin(rad(diff)));
    const depthF = c.depth === 0 ? (s.cur === 'AC' ? 1 : 0.9) : (s.cur === 'AC' ? 0.08 : 0.6);
    const partF = { 'wet-visible': 1, 'wet-fluo': 1.3, dry: 0.8 }[s.part];
    const matF = s.mat === 'ferro' ? 1 : 0;
    const I = f * angF * depthF * partF * matF;
    const why = [];
    if (!matF) why.push(L('austenitic stainless steel is not ferromagnetic: no magnetic field, no leakage, no indication. Use PT instead.', 'l’inox austénitique n’est pas ferromagnétique : pas de champ, pas de fuite, pas d’indication. Utiliser le PT.'));
    else if (f < 0.25) why.push(L('outside the zone between the poles: the field there is too weak.', 'hors de la zone entre les pôles : le champ y est trop faible.'));
    else {
      if (angF < 0.4) why.push(L(`almost parallel to the field (${Math.round(Math.min(diff, 180 - diff))}° from it): the flux flows along the crack, so it hardly leaks. Rotate the yoke about 90°.`, `presque parallèle au champ (${Math.round(Math.min(diff, 180 - diff))}° d’écart) : le flux longe la fissure et fuit à peine. Tournez le yoke d’environ 90°.`));
      else if (angF < 0.85) why.push(L(`at ${Math.round(Math.min(diff, 180 - diff))}° to the field: detected, but weaker than at 90°.`, `à ${Math.round(Math.min(diff, 180 - diff))}° du champ : détectée, mais moins nette qu’à 90°.`));
      else why.push(L('across the field (close to 90°): the flux is cut and leaks strongly.', 'en travers du champ (proche de 90°) : le flux est coupé et fuit fortement.'));
      if (c.depth > 0) why.push(s.cur === 'AC' ? L('it is 2 mm below the surface: AC concentrates the field at the surface (skin effect), so the leakage barely reaches the particles. Try DC.', 'elle est 2 mm sous la surface : le CA concentre le champ en surface (effet de peau), la fuite atteint à peine les particules. Essayez le CC.') : L('it is 2 mm below the surface: DC penetrates deeper, so a weaker but readable indication forms.', 'elle est 2 mm sous la surface : le CC pénètre plus, une indication plus faible mais lisible se forme.'));
      if (s.part === 'dry' && I > 0.2 && I < 0.5) why.push(L('dry powder is less sensitive than wet particles.', 'la poudre sèche est moins sensible que les particules humides.'));
      if (s.part === 'wet-fluo') why.push(L('fluorescent particles under UV-A give the most contrast.', 'les particules fluorescentes sous UV-A donnent le meilleur contraste.'));
    }
    return { I, why, seen: I > 0.35 };
  }
  function mtShot() {
    const s = { x: mt.x, y: mt.y, a: mt.a, cur: mt.cur, part: mt.part, mat: mt.mat };
    mt.shots.push(s); mt.last = s; mt.t0 = performance.now();
    MT_CRACKS.forEach((c) => { if (mtResult(c, s).seen) mt.found[c.id] = true; });
    if (!mt.rewarded && MT_CRACKS.every((c) => mt.found[c.id])) { mt.rewarded = true; learn('mt-sim', { score: 100 }); }
  }
  function mtDraw(cv, t) {
    if (cv.clientWidth < 40 || cv.clientHeight < 40) return; // hidden page: nothing to draw
    const { g, w, h } = fit(cv), sc = Math.min((w - 20) / 300, (h - 20) / 180), ox = (w - 300 * sc) / 2, oy = (h - 180 * sc) / 2;
    const X = (x) => ox + x * sc, Y = (y) => oy + y * sc, uv = mt.last && mt.last.part === 'wet-fluo';
    g.fillStyle = uv ? '#05060c' : '#0b1530'; g.fillRect(0, 0, w, h);
    g.fillStyle = uv ? '#15171e' : (mt.part === 'wet-visible' ? '#ececec' : '#8b929c'); g.fillRect(X(0), Y(0), 300 * sc, 180 * sc);
    g.fillStyle = uv ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; g.fillRect(X(0), Y(78), 300 * sc, 24 * sc);
    // coverage of previous shots
    mt.shots.forEach((s) => { g.save(); g.translate(X(s.x), Y(s.y)); g.rotate(rad(s.a)); g.strokeStyle = uv ? 'rgba(200,255,60,.12)' : 'rgba(61,120,255,.18)'; g.lineWidth = 1; g.strokeRect(-50 * sc, -32 * sc, 100 * sc, 64 * sc); g.restore(); });
    // particles at cracks from the last shot (build up over 1.5 s)
    if (mt.last) {
      const p = clamp((t - mt.t0) / 1500, 0, 1);
      MT_CRACKS.forEach((c) => {
        const r = mtResult(c, mt.last); if (r.I < 0.08) return;
        const a = rad(c.a), dx = Math.cos(a) * c.len / 2, dy = Math.sin(a) * c.len / 2;
        g.strokeStyle = uv ? `rgba(200,255,60,${clamp(r.I, 0, 1) * p})` : `rgba(20,20,24,${clamp(r.I, 0, 1) * p})`;
        if (uv) { g.shadowColor = '#c8ff3c'; g.shadowBlur = 10 * r.I; }
        g.lineWidth = (1.5 + 3.5 * r.I) * Math.max(1, sc * 0.8); g.lineCap = 'round';
        g.beginPath(); g.moveTo(X(c.x - dx), Y(c.y - dy)); g.lineTo(X(c.x + dx), Y(c.y + dy)); g.stroke(); g.shadowBlur = 0;
        if (r.seen) { g.fillStyle = uv ? '#c8ff3c' : '#d4202c'; g.font = '700 12px system-ui'; g.fillText(c.id, X(c.x) + 10, Y(c.y) - 8); }
      });
    }
    // yoke and field lines
    g.save(); g.translate(X(mt.x), Y(mt.y)); g.rotate(rad(mt.a));
    const pulse = 0.5 + 0.5 * Math.sin(t / 300);
    for (let i = -3; i <= 3; i++) { g.strokeStyle = `rgba(77,179,255,${0.25 + 0.2 * pulse})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 50 * sc, Math.abs(i) * 9 * sc + 2, 0, i < 0 ? Math.PI : 0, i < 0 ? TAU : Math.PI); g.stroke(); }
    g.fillStyle = '#c63a3a'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 50 * sc, 0, 9 * sc, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(198,58,58,.55)'; g.fillRect(-50 * sc, -5 * sc, 100 * sc, 10 * sc);
    g.restore();
    g.fillStyle = '#fff'; g.font = '12px system-ui'; g.textAlign = 'left';
    g.fillText(L('Found', 'Trouvées') + ': ' + Object.keys(mt.found).length + ' / ' + MT_CRACKS.length + ' · ' + mt.cur + ' · ' + (mt.mat === 'ferro' ? L('carbon steel', 'acier carbone') : L('austenitic stainless', 'inox austénitique')), 10, 18);
  }
  function mtPanel(el) {
    const res = mt.last ? MT_CRACKS.map((c) => [c, mtResult(c, mt.last)]) : [];
    el.innerHTML = `<h3>🧲 ${L('What the last shot shows — and why', 'Ce que montre la dernière aimantation — et pourquoi')}</h3>` +
      (mt.last ? '<ul>' + res.map(([c, r]) => `<li class="${r.seen ? 'cysurf-ok' : r.I > 0.08 ? 'cysurf-warn' : 'cysurf-ko'}"><b>${c.id}</b> ${mt.found[c.id] ? '· ' + esc(T2(c.n)) : ''} — ${r.seen ? L('visible', 'visible') : r.I > 0.08 ? L('faint', 'faible') : L('not visible', 'non visible')}: ${esc(r.why.join('; '))}</li>`).join('') + '</ul>' : `<p>${L('Place the yoke over the weld, choose the current and the particles, then press "Magnetise + apply particles". There are 4 hidden cracks.', 'Placez le yoke sur la soudure, choisissez le courant et les particules, puis appuyez sur « Aimanter + appliquer les particules ». Il y a 4 fissures cachées.')}</p>`) +
      `<p class="cysurf-score">${L('Cracks found', 'Fissures trouvées')}: ${Object.keys(mt.found).length} / ${MT_CRACKS.length}${MT_CRACKS.every((c) => mt.found[c.id]) ? ' 🏆 ' + L('all found! You used two directions and the right current.', 'toutes trouvées ! Vous avez utilisé deux directions et le bon courant.') : ''}</p>` +
      `<p class="cysurf-note">${L('Tips: examine each area in two directions about 90° apart; the useful zone is between the poles; AC is best for surface cracks, DC reaches slightly below the surface.', 'Astuces : contrôlez chaque zone dans deux directions à environ 90° ; la zone utile est entre les pôles ; le CA est idéal pour les fissures débouchantes, le CC atteint un peu sous la surface.')}</p>`;
  }

  /* ============================ PT simulator ============================ */
  const PT_DEFECTS = [
    { id: 'tight', x: 70, y: 88, len: 26, linear: true, need: 10, thr: 0.5, n: ['tight fatigue crack', 'fissure de fatigue fine'] },
    { id: 'wide', x: 170, y: 93, len: 20, linear: true, need: 3, thr: 0.25, n: ['open crack', 'fissure ouverte'] },
    { id: 'pores', x: 245, y: 90, len: 0, linear: false, need: 5, thr: 0.35, n: ['surface porosity', 'soufflures débouchantes'] }
  ];
  const pt = { clean: 'solvent', type: 'visible', dwell: 10, removal: 'cloth', dev: 'thin', wait: 15, lux: 1200, uv: 'dark', ran: null, t0: 0, best: 0 };
  function ptRun() {
    const c = pt, res = [], spray = c.removal === 'spray', none = c.removal === 'none', water = c.removal === 'water';
    const bg = none ? 0.85 : water ? 0.45 : c.clean === 'none' ? 0.25 : 0.04;
    const lightF = c.type === 'visible' ? (c.lux >= 1000 ? 1 : c.lux >= 500 ? 0.75 : 0.4) : (c.uv === 'off' ? 0 : c.uv === 'dark' ? 1.25 : 0.35);
    for (const d of PT_DEFECTS) {
      const why = [], f = {};
      f.clean = c.clean === 'solvent' ? 1 : c.clean === 'wipe' ? (d.id === 'tight' ? 0.45 : 0.75) : (d.id === 'tight' ? 0.05 : 0.35);
      f.dwell = Math.min(1, c.dwell / d.need);
      f.remove = spray ? ({ tight: 0.15, wide: 0.6, pores: 0.45 }[d.id]) : water ? 0.75 : 1;
      f.dev = c.dev === 'thin' ? 1 : c.dev === 'thick' ? (d.id === 'tight' ? 0.3 : 0.75) : 0.3;
      f.time = c.wait < 10 ? Math.min(1, c.wait / (d.id === 'tight' ? 10 : 5)) : 1;
      f.light = lightF; f.sens = c.type === 'fluo' ? 1.15 : 1;
      let s = f.clean * f.dwell * f.remove * f.dev * f.time * f.light * f.sens;
      const masked = bg > 0.4;
      const found = s > d.thr && !masked;
      if (f.clean < 0.5) why.push(c.clean === 'none' ? L('the surface was not cleaned: oil and dirt fill the opening, so penetrant cannot enter', 'la surface n’a pas été nettoyée : huile et saleté bouchent l’ouverture, le pénétrant ne peut pas entrer') : L('a simple wipe leaves residue inside the fine opening', 'un simple essuyage laisse des résidus dans l’ouverture fine'));
      if (f.dwell < 0.99) why.push(L(`dwell ${c.dwell} min is too short for this opening (about ${d.need} min needed here): capillarity had no time to fill it`, `temps de pénétration de ${c.dwell} min trop court pour cette ouverture (environ ${d.need} min ici) : la capillarité n’a pas eu le temps de la remplir`));
      if (spray) why.push(L('spraying solvent directly washed the penetrant out of the defect (over-removal)', 'la pulvérisation directe du solvant a rincé le pénétrant hors du défaut (sur-élimination)'));
      if (water) why.push(L('rinsing a solvent-removable penetrant with water removes it unevenly: partial background and weaker indications', 'rincer à l’eau un pénétrant éliminable au solvant l’enlève mal : fond partiel et indications plus faibles'));
      if (c.dev === 'thick' && d.id === 'tight') why.push(L('the thick developer layer hides the small amount of penetrant from a fine crack', 'la couche épaisse de révélateur masque le peu de pénétrant d’une fissure fine'));
      if (c.dev === 'none') why.push(L('without developer nothing draws the penetrant out: only very faint traces remain', 'sans révélateur rien ne fait ressortir le pénétrant : seules des traces très faibles restent'));
      if (f.time < 0.99) why.push(L(`interpreted after only ${c.wait} min: the indication has not finished developing`, `interprété après seulement ${c.wait} min : l’indication n’a pas fini de se révéler`));
      if (f.light < 0.99 && c.type === 'visible') why.push(L(`only ${c.lux} lux on the surface: too dark to see faint red indications (at least 1 000 lux in ASME V)`, `seulement ${c.lux} lux sur la surface : trop sombre pour voir des indications rouges faibles (au moins 1 000 lux selon l’ASME V)`));
      if (c.type === 'fluo' && c.uv === 'off') why.push(L('fluorescent penetrant without UV-A light is invisible', 'un pénétrant fluorescent sans lumière UV-A est invisible'));
      if (c.type === 'fluo' && c.uv === 'bright') why.push(L('UV-A used in a bright room: the glow loses its contrast (the area must be darkened)', 'UV-A utilisée dans une pièce éclairée : la fluorescence perd son contraste (la zone doit être assombrie)'));
      if (masked) why.push(L('the red background left by poor excess removal hides the indications and creates false ones', 'le fond rouge laissé par une mauvaise élimination masque les indications et en crée de fausses'));
      if (found && !why.length) why.push(L('every step was right for this defect', 'chaque étape convenait à ce défaut'));
      res.push({ d, s, found, why, blur: c.wait > 60 });
    }
    const falseCalls = bg > 0.4;
    const score = Math.round((res.filter((r) => r.found).length / res.length) * 100) - (falseCalls ? 30 : 0);
    pt.ran = { res, bg, falseCalls, score: Math.max(0, score), over: c.wait > 60 };
    pt.t0 = performance.now(); pt.best = Math.max(pt.best, pt.ran.score);
    learn('pt-run', { score: pt.ran.score });
    if (pt.ran.score >= 100) learn('pt-sim', { score: 100 });
  }
  function ptDraw(cv, t) {
    if (cv.clientWidth < 40 || cv.clientHeight < 40) return; // hidden page: nothing to draw
    const { g, w, h } = fit(cv), sc = Math.min((w - 20) / 300, (h - 20) / 180), ox = (w - 300 * sc) / 2, oy = (h - 180 * sc) / 2;
    const X = (x) => ox + x * sc, Y = (y) => oy + y * sc, r = pt.ran, fluo = pt.type === 'fluo', p = r ? clamp((t - pt.t0) / 1800, 0, 1) : 0;
    g.fillStyle = fluo ? '#05060c' : '#0b1530'; g.fillRect(0, 0, w, h);
    const devCol = fluo ? '#15171e' : (r && pt.dev !== 'none' ? '#f4f4f2' : '#9aa1ab');
    g.fillStyle = devCol; g.fillRect(X(0), Y(0), 300 * sc, 180 * sc);
    g.fillStyle = fluo ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.07)'; g.fillRect(X(0), Y(78), 300 * sc, 24 * sc);
    if (!r) { g.fillStyle = '#fff'; g.font = '13px system-ui'; g.textAlign = 'center'; g.fillText(L('Choose the process settings, then press "Run the test".', 'Choisissez les réglages du procédé, puis « Lancer le contrôle ».'), w / 2, h / 2); return; }
    const col = (a) => (fluo ? `rgba(200,255,60,${a})` : `rgba(208,32,44,${a})`);
    if (r.bg > 0.03) { g.fillStyle = col(r.bg * 0.55 * p); g.fillRect(X(0), Y(0), 300 * sc, 180 * sc); }
    if (r.falseCalls) { g.strokeStyle = col(0.6 * p); g.lineWidth = 3; for (const [x, y] of [[30, 40], [120, 140], [210, 30]]) { g.beginPath(); g.moveTo(X(x), Y(y)); g.lineTo(X(x + 18), Y(y + 4)); g.stroke(); } }
    const light = pt.type === 'visible' ? clamp(pt.lux / 1000, 0.35, 1) : 1;
    r.res.forEach(({ d, s, blur }) => {
      const a = clamp(s, 0, 1) * p * light; if (a < 0.03) return;
      if (fluo) { g.shadowColor = '#c8ff3c'; g.shadowBlur = 12 * a; }
      g.fillStyle = col(a); g.strokeStyle = col(a);
      const spread = (blur ? 2.2 : 1) * (1 + p);
      if (d.linear) { g.lineCap = 'round'; g.lineWidth = (2 + 3 * a) * spread * Math.max(1, sc * 0.7); g.beginPath(); g.moveTo(X(d.x - d.len / 2), Y(d.y)); g.lineTo(X(d.x + d.len / 2), Y(d.y + 1.5)); g.stroke(); }
      else for (const [dx, dy, rr] of [[0, 0, 2.2], [7, 3, 1.6], [-6, -2, 1.8], [3, -6, 1.3]]) { g.beginPath(); g.arc(X(d.x + dx), Y(d.y + dy), rr * spread * sc, 0, TAU); g.fill(); }
      g.shadowBlur = 0;
    });
    if (pt.type === 'visible' && pt.lux < 1000) { g.fillStyle = `rgba(0,0,0,${0.55 * (1 - pt.lux / 1000)})`; g.fillRect(0, 0, w, h); }
    g.fillStyle = '#fff'; g.font = '12px system-ui'; g.textAlign = 'left'; g.fillText((fluo ? L('Fluorescent · UV-A', 'Fluorescent · UV-A') : L('Visible red · ', 'Rouge visible · ') + pt.lux + ' lux'), 10, 18);
  }
  function ptPanel(el) {
    const r = pt.ran;
    el.innerHTML = `<h3>🧪 ${L('Result — and why', 'Résultat — et pourquoi')}</h3>` + (r ? '<ul>' + r.res.map(({ d, found, why }) => `<li class="${found ? 'cysurf-ok' : 'cysurf-ko'}"><b>${found ? '✓ ' + L('Found', 'Trouvé') : '✗ ' + L('Missed', 'Manqué')}</b> — ${esc(T2(d.n))}: ${esc(why.join('; '))}.</li>`).join('') + '</ul>' +
      (r.falseCalls ? `<p class="cysurf-ko">⚠ ${L('False indications: excess penetrant left on the surface looks like defects. Clean and re-test.', 'Fausses indications : l’excès de pénétrant resté en surface ressemble à des défauts. Nettoyer et recontrôler.')}</p>` : '') +
      (r.over ? `<p class="cysurf-warn">⚠ ${L('Waited too long: indications spread and close ones merge, so sizes are overestimated.', 'Attente trop longue : les indications s’étalent et se rejoignent, les dimensions sont surestimées.')}</p>` : '') +
      `<p class="cysurf-score">${L('Score', 'Score')}: ${r.score} % · ${L('best', 'meilleur')} ${pt.best} %${r.score >= 100 ? ' 🏆' : ''}</p>` : `<p>${L('Set each step of the penetrant process as you would on site, then run the test. Three real defects are hidden in this weld.', 'Réglez chaque étape du ressuage comme sur chantier, puis lancez le contrôle. Trois vrais défauts sont cachés dans cette soudure.')}</p>`) +
      `<p class="cysurf-note">${L('Teaching model with typical values; the dwell and development times, temperature range and light levels to apply come from your approved procedure.', 'Modèle pédagogique avec des valeurs typiques ; les temps de pénétration et de révélation, la plage de température et l’éclairement à appliquer viennent de votre procédure approuvée.')}</p>`;
  }

  /* ============================ mounting ============================ */
  let raf = 0;
  const sel = (k, opts, v) => `<select data-k="${k}">${opts.map(([val, lab]) => `<option value="${val}"${String(val) === String(v) ? ' selected' : ''}>${esc(T2(lab))}</option>`).join('')}</select>`;
  function buildMT(pb) {
    const el = document.createElement('details'); el.className = 'cysurf cymt'; el.open = true;
    el.innerHTML = `<summary>🧲 ${L('Magnetic particle simulator (training)', 'Simulateur de magnétoscopie (formation)')}</summary>
<p class="mut">${L('Find the 4 hidden cracks. Move and rotate the yoke, choose AC or DC and the particles, then magnetise. Each result explains why a crack shows or not.', 'Trouvez les 4 fissures cachées. Déplacez et tournez le yoke, choisissez CA ou CC et les particules, puis aimantez. Chaque résultat explique pourquoi une fissure apparaît ou non.')}</p>
<div class="cysurf-grid"><div><canvas aria-label="${L('Plate seen from above with the yoke', 'Tôle vue de dessus avec le yoke')}"></canvas>
<div class="cysurf-ctrl">
<label>${L('Yoke position along the weld', 'Position du yoke le long de la soudure')} <b data-v="x">${mt.x}</b> mm<input type="range" data-k="x" min="40" max="260" value="${mt.x}"></label>
<label>${L('Yoke position across', 'Position du yoke en travers')} <b data-v="y">${mt.y}</b> mm<input type="range" data-k="y" min="30" max="150" value="${mt.y}"></label>
<label>${L('Yoke rotation (0° = along the weld)', 'Rotation du yoke (0° = le long de la soudure)')} <b data-v="a">${mt.a}</b>°<input type="range" data-k="a" min="0" max="180" step="5" value="${mt.a}"></label>
<label>${L('Current', 'Courant')}${sel('cur', [['AC', ['AC (alternating)', 'CA (alternatif)']], ['DC', ['DC (direct)', 'CC (continu)']]], mt.cur)}</label>
<label>${L('Particles', 'Particules')}${sel('part', [['wet-visible', ['Wet visible (black ink on white paint)', 'Humides visibles (encre noire sur peinture blanche)']], ['wet-fluo', ['Wet fluorescent (UV-A)', 'Humides fluorescentes (UV-A)']], ['dry', ['Dry powder', 'Poudre sèche']]], mt.part)}</label>
<label>${L('Material', 'Matériau')}${sel('mat', [['ferro', ['Carbon steel (ferromagnetic)', 'Acier carbone (ferromagnétique)']], ['aust', ['Austenitic stainless steel', 'Inox austénitique']]], mt.mat)}</label>
</div>
<div class="cysurf-row"><button type="button" class="cysurf-primary" data-act="shot">⚡ ${L('Magnetise + apply particles', 'Aimanter + appliquer les particules')}</button><button type="button" data-act="reset">↺ ${L('Demagnetise, clean and start again', 'Désaimanter, nettoyer et recommencer')}</button></div></div>
<div class="cysurf-panel" data-panel></div></div>`;
    place(pb, el); el.addEventListener('input', (e) => onMT(e, el)); el.addEventListener('change', (e) => onMT(e, el)); el.addEventListener('click', (e) => onMT(e, el));
    mtPanel(el.querySelector('[data-panel]')); loop(el, mtDraw);
  }
  function onMT(e, el) {
    const k = e.target.dataset && e.target.dataset.k;
    if (k) { const v = e.target.value; mt[k] = ['x', 'y', 'a'].includes(k) ? Number(v) : v; const o = el.querySelector('[data-v="' + k + '"]'); if (o) o.textContent = v; return; }
    const b = e.target.closest && e.target.closest('button'); if (!b || e.type !== 'click') return;
    if (b.dataset.act === 'shot') { mtShot(); mtPanel(el.querySelector('[data-panel]')); }
    if (b.dataset.act === 'reset') { mt.shots = []; mt.found = {}; mt.last = null; mt.rewarded = false; mtPanel(el.querySelector('[data-panel]')); }
  }
  function buildPT(pb) {
    const el = document.createElement('details'); el.className = 'cysurf cypt'; el.open = true;
    el.innerHTML = `<summary>🧪 ${L('Penetrant testing simulator (training)', 'Simulateur de ressuage (formation)')}</summary>
<p class="mut">${L('Run the whole penetrant process. Each choice changes what appears on the developer, and the result explains why every defect was found or missed.', 'Réalisez tout le procédé de ressuage. Chaque choix change ce qui apparaît sur le révélateur, et le résultat explique pourquoi chaque défaut a été trouvé ou manqué.')}</p>
<div class="cysurf-grid"><div><canvas aria-label="${L('Weld surface after development', 'Surface de la soudure après révélation')}"></canvas>
<div class="cysurf-ctrl">
<label>1. ${L('Pre-cleaning', 'Pré-nettoyage')}${sel('clean', [['solvent', ['Solvent clean, then let dry', 'Nettoyage solvant, puis séchage']], ['wipe', ['Quick wipe with a rag', 'Essuyage rapide au chiffon']], ['none', ['None (oily surface)', 'Aucun (surface grasse)']]], pt.clean)}</label>
<label>2. ${L('Penetrant', 'Pénétrant')}${sel('type', [['visible', ['Type II visible red (solvent-removable)', 'Type II rouge visible (éliminable au solvant)']], ['fluo', ['Type I fluorescent (solvent-removable)', 'Type I fluorescent (éliminable au solvant)']]], pt.type)}</label>
<label>3. ${L('Dwell time', 'Temps de pénétration')} <b data-v="dwell">${pt.dwell}</b> min<input type="range" data-k="dwell" min="1" max="30" value="${pt.dwell}"></label>
<label>4. ${L('Excess removal', 'Élimination de l’excès')}${sel('removal', [['cloth', ['Dry cloth, then cloth lightly moistened with remover', 'Chiffon sec, puis chiffon légèrement imbibé']], ['spray', ['Spray remover directly on the part', 'Pulvériser le nettoyant directement']], ['water', ['Rinse with water', 'Rincer à l’eau']], ['none', ['No removal', 'Pas d’élimination']]], pt.removal)}</label>
<label>5. ${L('Developer', 'Révélateur')}${sel('dev', [['thin', ['Thin, even coat', 'Couche fine et régulière']], ['thick', ['Thick coat', 'Couche épaisse']], ['none', ['No developer', 'Pas de révélateur']]], pt.dev)}</label>
<label>6. ${L('Development time before reading', 'Temps de révélation avant lecture')} <b data-v="wait">${pt.wait}</b> min<input type="range" data-k="wait" min="0" max="90" value="${pt.wait}"></label>
<label data-light>7. ${L('Light on the surface (visible)', 'Éclairement (visible)')} <b data-v="lux">${pt.lux}</b> lux<input type="range" data-k="lux" min="100" max="2000" step="50" value="${pt.lux}"></label>
<label data-uv>7. ${L('UV-A conditions (fluorescent)', 'Conditions UV-A (fluorescent)')}${sel('uv', [['dark', ['UV-A lamp, darkened area', 'Lampe UV-A, zone assombrie']], ['bright', ['UV-A lamp, bright room', 'Lampe UV-A, pièce éclairée']], ['off', ['No UV lamp', 'Pas de lampe UV']]], pt.uv)}</label>
</div>
<div class="cysurf-row"><button type="button" class="cysurf-primary" data-act="run">▶ ${L('Run the test', 'Lancer le contrôle')}</button><button type="button" data-act="good">📋 ${L('Load good practice', 'Charger la bonne pratique')}</button></div></div>
<div class="cysurf-panel" data-panel></div></div>`;
    place(pb, el); el.addEventListener('input', (e) => onPT(e, el)); el.addEventListener('change', (e) => onPT(e, el)); el.addEventListener('click', (e) => onPT(e, el));
    ptLight(el); ptPanel(el.querySelector('[data-panel]')); loop(el, ptDraw);
  }
  const ptLight = (el) => { el.querySelector('[data-light]').hidden = pt.type !== 'visible'; el.querySelector('[data-uv]').hidden = pt.type !== 'fluo'; };
  function onPT(e, el) {
    const k = e.target.dataset && e.target.dataset.k;
    if (k) { const v = e.target.value; pt[k] = ['dwell', 'wait', 'lux'].includes(k) ? Number(v) : v; const o = el.querySelector('[data-v="' + k + '"]'); if (o) o.textContent = v; if (k === 'type') ptLight(el); return; }
    const b = e.target.closest && e.target.closest('button'); if (!b || e.type !== 'click') return;
    if (b.dataset.act === 'run') { ptRun(); ptPanel(el.querySelector('[data-panel]')); }
    if (b.dataset.act === 'good') { Object.assign(pt, { clean: 'solvent', type: 'visible', dwell: 10, removal: 'cloth', dev: 'thin', wait: 15, lux: 1200, uv: 'dark' }); const pb = el.parentElement; el.remove(); buildPT(pb.closest('#pbody') || pb); }
  }
  function place(pb, el) { const a = pb.querySelector('.cy3') || pb.querySelector('.cy-course-launch') || pb.querySelector('h2'); if (a) a.after(el); else pb.prepend(el); }
  function loop(el, draw) {
    cancelAnimationFrame(raf);
    const cv = el.querySelector('canvas');
    const f = (t) => { if (!cv.isConnected) return; if (el.open) draw(cv, t); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
  }
  function inject() {
    const pb = document.getElementById('pbody'); if (!pb) return;
    const b = document.querySelector('#ptab .on'), m = b && b.dataset.pm;
    if (m === 'MT' && !pb.querySelector('.cymt')) buildMT(pb);
    if (m === 'PT' && !pb.querySelector('.cypt')) buildPT(pb);
  }
  function init(n) {
    const pb = document.getElementById('pbody'); if (!pb) { if (n < 20) setTimeout(() => init(n + 1), 300); return; }
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    new MutationObserver(inject).observe(pb, { childList: true }); inject();
  }
  window.CYSURF = { mtResult, MT_CRACKS, ptRun: () => { ptRun(); return pt.ran; }, pt, mt };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(0)); else init(0);
}());
