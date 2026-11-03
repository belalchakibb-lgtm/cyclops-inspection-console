/* CYCLOPS: radiograph (RT film) interpretation trainer.
   Injected under the RT method page. Two parts:
   - an animated, step-by-step interpretation of a simulated weld radiograph on a film viewer
     (viewing conditions, identification, markers, backscatter, density, IQI, artefacts, scan,
     characterisation, measurement, decision and report);
   - an atlas of indications as they look on film, each with a rejected / not rejected case.
   Images are drawn, not real radiographs; acceptance values are training rules to verify against
   the current code edition and the applicable AQCS procedure. */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (pair) => (Array.isArray(pair) ? L(pair[0], pair[1]) : pair);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // learning progress for the Academy (cyclops-academy.js)
  const learn = (id) => window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id } }));
  const ease = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  // ---------- Film rendering (lighter = more material / denser; darker = less material) ----------
  // items: {k:'pore',x,y,r,a} {k:'slag',x1,x2,y,w,a} {k:'crack',x1,x2,y,a} {k:'lof',x1,x2,y,a} {k:'ip',x1,x2,y,a}
  //        {k:'tung',x,y,r} {k:'band',x1,x2,y,h,a,light} {k:'crescent',x,y,r} {k:'scratch',x1,y1,x2,y2}
  //        {k:'text',x,y,s,size} {k:'wire',x,y1,y2,d} {k:'edge',y,a}
  function renderFilm(wmm, hmm, ppm, weld, items, seed) {
    const c = document.createElement('canvas');
    c.width = Math.round(wmm * ppm); c.height = Math.round(hmm * ppm);
    const ctx = c.getContext('2d'), r = rng(seed || 7);
    const X = (x) => x * ppm, Y = (y) => y * ppm;
    ctx.fillStyle = 'rgb(66,68,70)'; ctx.fillRect(0, 0, c.width, c.height);
    if (weld) {
      const y0 = weld.y - weld.cap / 2, y1 = weld.y + weld.cap / 2;
      const g = ctx.createLinearGradient(0, Y(y0 - 1), 0, Y(y1 + 1));
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.12, 'rgba(255,255,255,.10)'); g.addColorStop(0.5, 'rgba(255,255,255,.17)');
      g.addColorStop(0.88, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, Y(y0 - 1), c.width, Y(weld.cap + 2));
      // bead ripples (chevrons) and root band
      ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = Math.max(1, ppm * 0.5);
      for (let x = -4; x < wmm + 4; x += 3.2) { ctx.beginPath(); ctx.moveTo(X(x), Y(y0 + 1)); ctx.quadraticCurveTo(X(x + 2.6), Y(weld.y), X(x), Y(y1 - 1)); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(0, Y(weld.y - 2), c.width, Y(4));
    }
    const dark = (a) => `rgba(0,0,0,${a})`, light = (a) => `rgba(255,255,255,${a})`;
    for (const it of items) {
      ctx.save();
      if ('filter' in ctx && it.k !== 'text' && it.k !== 'wire' && it.k !== 'scratch') ctx.filter = `blur(${Math.max(0.6, ppm * 0.12)}px)`;
      if (it.k === 'pore' || it.k === 'tung') {
        const gr = ctx.createRadialGradient(X(it.x), Y(it.y), 0, X(it.x), Y(it.y), X(it.r));
        const col = it.k === 'tung' ? light : dark, a = it.a || (it.k === 'tung' ? 0.75 : 0.55);
        gr.addColorStop(0, col(a)); gr.addColorStop(0.75, col(a * 0.85)); gr.addColorStop(1, col(0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(X(it.x), Y(it.y), X(it.r), 0, 7); ctx.fill();
      } else if (it.k === 'slag') {
        const rr = rng(Math.round(it.x1 * 31)); ctx.fillStyle = dark(it.a || 0.5); ctx.beginPath();
        const n = 14, pts = [];
        for (let i = 0; i <= n; i++) pts.push([it.x1 + (it.x2 - it.x1) * i / n, it.y - it.w / 2 * (0.4 + rr() * 0.8)]);
        for (let i = n; i >= 0; i--) pts.push([it.x1 + (it.x2 - it.x1) * i / n, it.y + it.w / 2 * (0.4 + rr() * 0.8)]);
        pts.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])))); ctx.closePath(); ctx.fill();
      } else if (it.k === 'crack') {
        const rr = rng(Math.round(it.x1 * 17)); ctx.strokeStyle = dark(it.a || 0.65); ctx.lineWidth = Math.max(1, ppm * 0.3); ctx.beginPath();
        let y = it.y; ctx.moveTo(X(it.x1), Y(y));
        for (let x = it.x1; x <= it.x2; x += 0.6) { y += (rr() - 0.5) * 0.7; y = clamp(y, it.y - 1, it.y + 1); ctx.lineTo(X(x), Y(y)); }
        ctx.stroke(); ctx.lineWidth = Math.max(1, ppm * 0.18);
        ctx.beginPath(); ctx.moveTo(X(it.x1 + (it.x2 - it.x1) * 0.6), Y(it.y)); ctx.lineTo(X(it.x1 + (it.x2 - it.x1) * 0.7), Y(it.y + 1.2)); ctx.stroke();
      } else if (it.k === 'lof' || it.k === 'ip') {
        ctx.strokeStyle = dark(it.a || 0.6); ctx.lineWidth = Math.max(1.2, ppm * (it.k === 'ip' ? 0.7 : 0.45));
        ctx.beginPath(); ctx.moveTo(X(it.x1), Y(it.y)); ctx.lineTo(X(it.x2), Y(it.y + (it.k === 'lof' ? 0.15 : 0))); ctx.stroke();
      } else if (it.k === 'band') {
        const g = ctx.createLinearGradient(0, Y(it.y - it.h / 2), 0, Y(it.y + it.h / 2)), col = it.light ? light : dark;
        g.addColorStop(0, col(0)); g.addColorStop(0.5, col(it.a)); g.addColorStop(1, col(0));
        ctx.fillStyle = g; ctx.fillRect(X(it.x1), Y(it.y - it.h / 2), X(it.x2 - it.x1), Y(it.h));
      } else if (it.k === 'edge') {
        ctx.strokeStyle = dark(it.a || 0.25); ctx.lineWidth = Math.max(1, ppm * 0.35);
        ctx.beginPath(); ctx.moveTo(0, Y(it.y)); ctx.lineTo(c.width, Y(it.y)); ctx.stroke();
      } else if (it.k === 'crescent') {
        ctx.strokeStyle = dark(0.6); ctx.lineWidth = Math.max(1, ppm * 0.5);
        ctx.beginPath(); ctx.arc(X(it.x), Y(it.y), X(it.r), 0.2 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      } else if (it.k === 'scratch') {
        ctx.strokeStyle = dark(0.75); ctx.lineWidth = Math.max(1, ppm * 0.12);
        ctx.beginPath(); ctx.moveTo(X(it.x1), Y(it.y1)); ctx.lineTo(X(it.x2), Y(it.y2)); ctx.stroke();
      } else if (it.k === 'wire') {
        ctx.strokeStyle = light(it.a !== undefined ? it.a : 0.12 + 0.5 * (it.d - 0.2) / 0.6); ctx.lineWidth = Math.max(1, ppm * it.d * 1.6);
        ctx.beginPath(); ctx.moveTo(X(it.x), Y(it.y1)); ctx.lineTo(X(it.x), Y(it.y2)); ctx.stroke();
      } else if (it.k === 'text') {
        ctx.fillStyle = 'rgba(236,236,236,.92)'; ctx.font = `700 ${Math.round(Y(it.size))}px system-ui, sans-serif`; ctx.fillText(it.s, X(it.x), Y(it.y));
      }
      ctx.restore();
    }
    // film grain
    const img = ctx.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() + r() - 1) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n + 1; }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  // ---------- Main radiograph (300 × 100 mm film, weld t = 16 mm) ----------
  const FILM = { w: 300, h: 100, weld: { y: 50, cap: 18 } };
  const WIRES = [[11, 0.81], [10, 0.64], [9, 0.51], [8, 0.41], [7, 0.33], [6, 0.25]];
  const IQI_X = (i) => 252 + i * 3.6;
  const IND = [
    { id: 'A', x1: 53, x2: 63, y: 49.5, type: ['Cluster porosity', 'Nid de soufflures'], size: ['10 mm area, fine pores ≤ 1.6 mm', 'zone de 10 mm, pores fins ≤ 1,6 mm'], ok: true,
      why: ['Within the Appendix 4 chart for t = 16 mm: acceptable.', 'Dans l’abaque de l’Annexe 4 pour e = 16 mm : acceptable.'] },
    { id: 'B', x1: 91, x2: 93, y: 51, type: ['Isolated pore', 'Pore isolé'], size: ['Ø 2.0 mm', 'Ø 2,0 mm'], ok: true,
      why: ['Ø 2.0 mm ≤ 4 mm (¼ t): acceptable.', 'Ø 2,0 mm ≤ 4 mm (¼ e) : acceptable.'] },
    { id: 'C', x1: 121, x2: 130, y: 47.2, type: ['Slag inclusion (elongated)', 'Inclusion de laitier (allongée)'], size: ['length 9 mm', 'longueur 9 mm'], ok: false,
      why: ['Elongated indication 9 mm > 6 mm limit (t < 19 mm): rejected.', 'Indication allongée 9 mm > limite de 6 mm (e < 19 mm) : refusée.'] },
    { id: 'D', x1: 168, x2: 176, y: 53, type: ['Longitudinal crack', 'Fissure longitudinale'], size: ['length 8 mm', 'longueur 8 mm'], ok: false,
      why: ['Crack: rejected whatever its size.', 'Fissure : refusée quelle que soit sa dimension.'] }
  ];
  function mainItems() {
    const it = [];
    [[8, '0'], [103, '1'], [198, '2'], [292, '3']].forEach(([x, s]) => { it.push({ k: 'text', x, y: 9, s, size: 5 }, { k: 'text', x: x - 1, y: 14.5, s: '▼', size: 4 }); });
    it.push({ k: 'text', x: 6, y: 94, s: 'AQCS  J-2611  W-14  F1/3  Ir-192  03.11.26', size: 4.2 });
    it.push({ k: 'text', x: 249, y: 30.5, s: 'ASTM 1B', size: 2.8 });
    WIRES.forEach(([n, d], i) => it.push({ k: 'wire', x: IQI_X(i), y1: 33, y2: 67, d, a: n === 6 ? 0.045 : n === 7 ? 0.22 : undefined }));
    const rr = rng(5);
    for (let i = 0; i < 9; i++) it.push({ k: 'pore', x: 54 + rr() * 8.5, y: 47.5 + rr() * 4.5, r: 0.35 + rr() * 0.45, a: 0.5 });
    it.push({ k: 'pore', x: 92, y: 51, r: 1.0, a: 0.55 });
    it.push({ k: 'slag', x1: 121, x2: 130, y: 47.2, w: 1.3, a: 0.5 });
    it.push({ k: 'crack', x1: 168, x2: 176, y: 53, a: 0.7 });
    it.push({ k: 'crescent', x: 212, y: 26, r: 3.5 });
    return it;
  }
  let filmCanvas = null;
  const film = () => filmCanvas || (filmCanvas = renderFilm(FILM.w, FILM.h, 6, FILM.weld, mainItems(), 11));

  // ---------- Interpretation steps (animated) ----------
  const FULL = { cx: 150, cy: 50, cw: 335, ch: 132 };
  const DENS = [
    { x: 268, y: 50, d: 2.60, label: ['Next to essential wire (IQI density)', 'À côté du fil essentiel (densité IQI)'] },
    { x: 140, y: 50, d: 2.45, label: ['Weld', 'Soudure'] },
    { x: 140, y: 24, d: 3.10, label: ['Parent metal', 'Métal de base'] }
  ];
  const STEPS = [
    { dur: 9, cam: () => FULL, title: ['Viewing conditions', 'Conditions d’observation'],
      text: [['Darken the room and let the eyes adapt before reading (about 30 s from room light, longer when coming from daylight).', 'Assombrissez la salle et laissez les yeux s’adapter avant de lire (environ 30 s depuis l’éclairage de la salle, plus en venant de l’extérieur).'],
        ['Use a film viewer (negatoscope) bright enough for the film densities, with diffuse, uniform and adjustable light.', 'Utilisez un négatoscope assez lumineux pour les densités du film, avec une lumière diffuse, uniforme et réglable.'],
        ['Mask the light around the film so that no glare reaches the eyes.', 'Masquez la lumière autour du film pour qu’aucun éblouissement n’atteigne les yeux.'],
        ['Film clean and dry, no fingerprints. Have a magnifier, a calibrated densitometer, a ruler, the request and the weld map ready.', 'Film propre et sec, sans traces de doigts. Préparez une loupe, un densitomètre étalonné, une règle, la demande et le plan de soudage.']] },
    { dur: 8, cam: () => ({ cx: 52, cy: 86, cw: 110, ch: 26 }), title: ['Check the film identification', 'Vérifier l’identification du film'],
      text: [['The identification must be in lead letters, radiographed with the part (not written afterwards): client / job, weld number, film number, source, date.', 'L’identification doit être en lettres de plomb, radiographiée avec la pièce (pas écrite après) : client / affaire, n° de soudure, n° de film, source, date.'],
        ['Check it against the request, the weld map and the report: here job J-2611, weld W-14, film 1 of 3, Ir-192, 03.11.26.', 'Comparez avec la demande, le plan de soudage et le rapport : ici affaire J-2611, soudure W-14, film 1 sur 3, Ir-192, 03.11.26.'],
        ['Missing or unreadable identification: the film cannot be accepted.', 'Identification absente ou illisible : le film ne peut pas être accepté.']] },
    { dur: 8, cam: () => FULL, title: ['Location markers and coverage', 'Repères de position et couverture'],
      text: [['Lead location markers (0, 1, 2, 3) are fixed on the part: they appear white on the film.', 'Les repères de position en plomb (0, 1, 2, 3) sont fixés sur la pièce : ils apparaissent blancs sur le film.'],
        ['They are used to locate each indication (distance from marker 0) and to find it again on the weld for repair.', 'Ils servent à localiser chaque indication (distance depuis le repère 0) et à la retrouver sur la soudure pour la réparation.'],
        ['Check that consecutive films overlap (the same marker appears on both) so the whole weld length is covered.', 'Vérifiez que les films successifs se chevauchent (le même repère apparaît sur les deux) pour couvrir toute la longueur de la soudure.']] },
    { dur: 8, cam: () => FULL, title: ['Backscatter check ("B" marker)', 'Contrôle du rayonnement rétrodiffusé (repère « B »)'],
      text: [['A lead letter "B" is fixed on the back of the film holder.', 'Une lettre « B » en plomb est fixée au dos du porte-film.'],
        ['A LIGHT "B" on a darker background means backscatter reached the film: the film is rejected (improve back shielding and re-shoot).', 'Un « B » CLAIR sur fond plus sombre signifie que le rayonnement rétrodiffusé a atteint le film : film refusé (améliorer la protection arrière et refaire le cliché).'],
        ['No "B" image, or a dark "B", is acceptable. On this film: no "B" visible → OK.', 'Pas d’image du « B », ou un « B » sombre : acceptable. Sur ce film : pas de « B » visible → OK.']] },
    { dur: 11, cam: () => FULL, title: ['Measure the density', 'Mesurer la densité'],
      text: [['Check the densitometer against a calibrated step wedge (at least at the start of each shift).', 'Vérifiez le densitomètre avec un étalon à échelons étalonné (au moins en début de poste).'],
        ['Read the density next to the essential wire (or through the hole-IQI body) in the area of interest: here 2.60.', 'Lisez la densité à côté du fil essentiel (ou à travers le corps de l’IQI à trous) dans la zone d’intérêt : ici 2,60.'],
        ['Limits (training, based on ASME V T-282): X-ray ≥ 1.8, gamma ≥ 2.0, maximum 4.0. Across the area of interest: −15 % to +30 % of the IQI density → 2.21 to 3.38.', 'Limites (formation, d’après ASME V T-282) : rayons X ≥ 1,8, gamma ≥ 2,0, maximum 4,0. Sur la zone d’intérêt : −15 % à +30 % de la densité IQI → 2,21 à 3,38.'],
        ['Weld 2.45 ✓ and parent metal 3.10 ✓: density acceptable.', 'Soudure 2,45 ✓ et métal de base 3,10 ✓ : densité acceptable.']] },
    { dur: 10, cam: () => ({ cx: 263, cy: 50, cw: 50, ch: 50 }), title: ['Check the image quality indicator (IQI)', 'Vérifier l’indicateur de qualité d’image (IQI)'],
      text: [['Identify the IQI: here ASTM E747 wire set B (wires 6 to 11), placed on the source side, wires across the weld.', 'Identifiez l’IQI : ici jeu de fils ASTM E747 B (fils 6 à 11), placé côté source, fils en travers de la soudure.'],
        ['Essential wire for 16 mm plus reinforcement: wire 7 (0.33 mm) (training, ASME V Table T-276: verify the current edition).', 'Fil essentiel pour 16 mm plus surépaisseur : fil 7 (0,33 mm) (formation, ASME V tableau T-276 : vérifiez l’édition en vigueur).'],
        ['The essential wire must be visible in the area of interest. Wire 7 is visible ✓ (wire 6 is barely visible, it is not required).', 'Le fil essentiel doit être visible dans la zone d’intérêt. Le fil 7 est visible ✓ (le fil 6 est à peine visible, il n’est pas exigé).'],
        ['Essential wire not visible: required sensitivity not reached → film rejected.', 'Fil essentiel non visible : sensibilité exigée non atteinte → film refusé.']] },
    { dur: 9, cam: () => ({ cx: 212, cy: 32, cw: 60, ch: 40 }), title: ['Recognise film artefacts', 'Reconnaître les défauts de film'],
      text: [['Not every dark mark is a weld defect: pressure marks (crescents), scratches, static marks (tree-like), water or chemical stains, light leaks, screen marks.', 'Toute marque sombre n’est pas un défaut de soudure : marques de pression (croissants), rayures, décharges statiques (arborescentes), taches d’eau ou de produits, voiles de lumière, marques d’écran.'],
        ['Clues: they do not follow the weld geometry, can extend outside the weld, and show emulsion damage in reflected light (tilt the film).', 'Indices : elles ne suivent pas la géométrie de la soudure, peuvent sortir de la soudure et montrent un dommage de l’émulsion en lumière réfléchie (inclinez le film).'],
        ['Here: a crescent at 212 mm, partly outside the weld → pressure mark, not an indication. Note it in the report.', 'Ici : un croissant à 212 mm, en partie hors de la soudure → marque de pression, pas une indication. Notez-la dans le rapport.'],
        ['If an artefact hides the area of interest, the film must be re-shot.', 'Si un défaut de film masque la zone d’intérêt, le cliché doit être refait.']] },
    { dur: 12, cam: (t) => ({ cx: 35 + 230 * ease(seg(t, 0.8, 11.2)), cy: 50, cw: 75, ch: 34 }), title: ['Scan the whole weld systematically', 'Examiner toute la soudure méthodiquement'],
      text: [['Scan from marker 0 to the end of the film without skipping, with a magnifier, at a steady pace.', 'Parcourez du repère 0 jusqu’à la fin du film sans sauter de zone, avec une loupe, à vitesse régulière.'],
        ['Look at each zone: root, fill, both fusion lines, cap and heat-affected zone.', 'Regardez chaque zone : racine, remplissage, les deux lignes de fusion, finition et zone affectée thermiquement.'],
        ['Adjust the viewer brightness for the light (weld) and dark (parent metal) areas.', 'Ajustez la luminosité du négatoscope pour les zones claires (soudure) et sombres (métal de base).'],
        ['Mark each finding on the film sleeve (never on the emulsion) and note its distance from marker 0.', 'Repérez chaque constatation sur la pochette du film (jamais sur l’émulsion) et notez sa distance au repère 0.']] },
    { dur: 11, cam: () => ({ cx: 115, cy: 50, cw: 150, ch: 40 }), title: ['Identify and characterise each indication', 'Identifier et caractériser chaque indication'],
      text: [['For each indication note: shape (round, elongated, linear), sharpness of edges, density (darker = less material, lighter = denser material) and position across the weld (centre = root, edge = fusion line).', 'Pour chaque indication notez : forme (ronde, allongée, linéaire), netteté des bords, densité (plus sombre = moins de matière, plus clair = matière plus dense) et position dans la soudure (centre = racine, bord = ligne de fusion).'],
        ['A: cluster porosity at 53–63 mm. B: isolated pore at 92 mm. C: slag inclusion, elongated and irregular, at 121–130 mm. D: longitudinal crack, fine, sharp and jagged, at 168–176 mm.', 'A : nid de soufflures à 53–63 mm. B : pore isolé à 92 mm. C : inclusion de laitier, allongée et irrégulière, à 121–130 mm. D : fissure longitudinale, fine, nette et en zigzag, à 168–176 mm.'],
        ['In doubt (crack, lack of fusion or film mark?): ask the Level 3; an extra exposure at another angle can help.', 'En cas de doute (fissure, manque de fusion ou marque de film ?) : demandez au niveau 3 ; un cliché supplémentaire sous un autre angle peut aider.']] },
    { dur: 12, cam: (t) => { const i = clamp(Math.floor(t / 3), 0, 3), d = IND[i]; return { cx: (d.x1 + d.x2) / 2, cy: 50, cw: 34, ch: 24 }; }, title: ['Measure and compare with the criteria', 'Mesurer et comparer aux critères'],
      text: [['Measure the largest dimension with a ruler or a graticule magnifier and note the distance from marker 0.', 'Mesurez la plus grande dimension avec une règle ou une loupe à réticule et notez la distance au repère 0.'],
        ['Compare with the acceptance criteria of the construction code (training: ASME VIII UW-51 and Appendix 4, t = 16 mm).', 'Comparez aux critères d’acceptation du code de construction (formation : ASME VIII UW-51 et Annexe 4, e = 16 mm).'],
        ['A: within the Appendix 4 chart → acceptable. B: Ø 2.0 mm ≤ 4 mm → acceptable. C: 9 mm > 6 mm → rejected. D: crack → rejected whatever its size.', 'A : dans l’abaque de l’Annexe 4 → acceptable. B : Ø 2,0 mm ≤ 4 mm → acceptable. C : 9 mm > 6 mm → refusée. D : fissure → refusée quelle que soit sa taille.']] },
    { dur: 10, cam: () => FULL, title: ['Decision and report', 'Décision et rapport'],
      text: [['Record the film quality checks (identification, markers, backscatter, density, IQI) and every indication: type, position, size and decision.', 'Consignez les contrôles de qualité du film (identification, repères, rétrodiffusé, densité, IQI) et chaque indication : type, position, dimension et décision.'],
        ['Weld W-14, film 1/3: REJECTED. Repair C (slag) and D (crack), then radiograph the repaired zones again. For spot radiography, apply the code’s additional examination rules.', 'Soudure W-14, film 1/3 : REFUSÉE. Réparer C (laitier) et D (fissure), puis radiographier à nouveau les zones réparées. En radiographie par sondage, appliquer les règles d’examen complémentaire du code.'],
        ['The report is signed by the interpreter (RT Level 2). Disputed interpretations go to the Level 3.', 'Le rapport est signé par l’interprète (RT niveau 2). Les interprétations contestées vont au niveau 3.']] }
  ];

  // ---------- Atlas of indications on film (t = 16 mm, patch 60 × 30 mm) ----------
  const PW = { y: 15, cap: 18 };
  const edgeY = PW.y - PW.cap / 2 + 0.8;
  const ATLAS = {
    crack: { name: ['Crack', 'Fissure'], short: ['Fine, sharp, jagged dark line', 'Ligne sombre fine, nette, en zigzag'],
      look: [['Fine dark line, sharp and irregular (zigzag), sometimes branched; the ends taper out.', 'Ligne sombre fine, nette et irrégulière (zigzag), parfois ramifiée ; les extrémités s’effilent.'], ['Longitudinal (along the weld) or transverse; may be in weld metal or HAZ.', 'Longitudinale (le long de la soudure) ou transversale ; dans le métal fondu ou la ZAT.'], ['Can be faint if the crack is not parallel to the beam.', 'Peut être pâle si la fissure n’est pas parallèle au faisceau.']],
      tip: ['A scratch is perfectly straight, very sharp and shows emulsion damage in reflected light; a crack follows the material.', 'Une rayure est parfaitement droite, très nette et montre un dommage de l’émulsion en lumière réfléchie ; une fissure suit la matière.'],
      cases: {
        reject: { items: [{ k: 'crack', x1: 24, x2: 33, y: 16, a: 0.7 }], ruler: [24, 33, 18.5], measure: ['length 9 mm', 'longueur 9 mm'], reject: true, why: ['Crack: rejected whatever its length.', 'Fissure : refusée quelle que soit sa longueur.'] },
        accept: { label: ['Looked like a crack, but it is a film scratch', 'Ressemblait à une fissure, mais c’est une rayure du film'], items: [{ k: 'scratch', x1: 14, y1: 4, x2: 44, y2: 25 }], ruler: null, measure: ['straight, crosses weld and parent metal', 'droite, traverse soudure et métal de base'], reject: false, why: ['Film artefact (scratch): perfectly straight, crosses the weld edges, emulsion damage in reflected light. Not an indication; re-shoot only if it hides the area of interest.', 'Défaut de film (rayure) : parfaitement droite, traverse les bords de la soudure, émulsion abîmée en lumière réfléchie. Pas une indication ; refaire le cliché seulement si elle masque la zone d’intérêt.'] }
      } },
    lof: { name: ['Lack of side-wall fusion', 'Manque de fusion'], short: ['Straight dark line along the fusion edge', 'Ligne sombre droite le long du bord de fusion'],
      look: [['Straight, narrow dark line running along the fusion line (edge of the weld), sharp on one side.', 'Ligne sombre droite et étroite le long de la ligne de fusion (bord de la soudure), nette d’un côté.'], ['Often intermittent; may be faint because the bevel is not parallel to the beam.', 'Souvent intermittente ; peut être pâle car le chanfrein n’est pas parallèle au faisceau.']],
      tip: ['Its position matches the bevel, not the centre of the weld (that would be incomplete penetration).', 'Sa position correspond au chanfrein, pas au centre de la soudure (ce serait un manque de pénétration).'],
      cases: {
        reject: { items: [{ k: 'lof', x1: 18, x2: 36, y: PW.y - 5.5, a: 0.55 }], ruler: [18, 36, PW.y - 7.5], measure: ['length 18 mm', 'longueur 18 mm'], reject: true, why: ['Lack of fusion: rejected whatever its length.', 'Manque de fusion : refusé quelle que soit sa longueur.'] },
        accept: { label: ['Cap edge line (geometry), not lack of fusion', 'Bord de la passe de finition (géométrie), pas un manque de fusion'], items: [{ k: 'edge', y: edgeY, a: 0.22 }], ruler: null, measure: ['continuous, soft, full length', 'continue, douce, sur toute la longueur'], reject: false, why: ['Soft density change that follows the cap toe along the whole weld and matches the visual profile: geometric, not an indication.', 'Variation douce de densité qui suit le pied de la finition sur toute la soudure et correspond au profil visuel : géométrique, pas une indication.'] }
      } },
    ip: { name: ['Incomplete penetration', 'Manque de pénétration'], short: ['Straight dark line at the weld centre', 'Ligne sombre droite au centre de la soudure'],
      look: [['Straight, dark, sharp-edged line exactly at the centre of the weld (unfused root faces).', 'Ligne sombre, droite, aux bords nets, exactement au centre de la soudure (talons non fondus).'], ['Constant width; can be long and continuous or intermittent.', 'Largeur constante ; peut être longue et continue ou intermittente.']],
      tip: ['Root concavity is also at the centre but wider and diffuse, with soft edges.', 'La retassure de racine est aussi au centre, mais plus large et diffuse, aux bords doux.'],
      cases: {
        reject: { items: [{ k: 'ip', x1: 14, x2: 44, y: PW.y, a: 0.6 }], ruler: [14, 44, PW.y + 3], measure: ['length 30 mm', 'longueur 30 mm'], reject: true, why: ['Incomplete penetration: rejected whatever its length.', 'Manque de pénétration : refusé quelle que soit sa longueur.'] },
        accept: { label: ['Root bead edges (geometry), not incomplete penetration', 'Bords du cordon de racine (géométrie), pas un manque de pénétration'], items: [{ k: 'band', x1: 0, x2: 60, y: PW.y, h: 4, a: 0.12, light: true }], ruler: null, measure: ['light band, continuous', 'bande claire, continue'], reject: false, why: ['A lighter band with soft edges along the whole weld is the root penetration bead (more material): geometric, not an indication.', 'Une bande plus claire aux bords doux sur toute la soudure est le cordon de pénétration (plus de matière) : géométrique, pas une indication.'] }
      } },
    pore: { name: ['Porosity (rounded indication)', 'Soufflure (indication arrondie)'], short: ['Round dark spot with soft edges', 'Tache sombre ronde aux bords doux'],
      look: [['Round or slightly oval dark spot with smooth, soft edges.', 'Tache sombre ronde ou légèrement ovale aux bords lisses et doux.'], ['Darker in the centre (gas has no density). Can be anywhere in the weld metal.', 'Plus sombre au centre (le gaz n’a pas de densité). Peut se trouver partout dans le métal fondu.']],
      tip: ['A long, tail-shaped pore (wormhole) is treated as an elongated indication.', 'Un pore allongé en forme de queue (vermiculaire) est traité comme une indication allongée.'],
      cases: {
        reject: { items: [{ k: 'pore', x: 30, y: 15, r: 3, a: 0.6 }], ruler: [27, 33, 19.5], measure: ['Ø 6 mm', 'Ø 6 mm'], reject: true, why: ['Ø 6 mm is larger than the isolated-indication limit (⅓ t = 5.3 mm for t = 16 mm).', 'Ø 6 mm dépasse la limite d’une indication isolée (⅓ e = 5,3 mm pour e = 16 mm).'] },
        accept: { items: [{ k: 'pore', x: 30, y: 15, r: 1, a: 0.55 }], ruler: [29, 31, 18], measure: ['Ø 2 mm', 'Ø 2 mm'], reject: false, why: ['Ø 2 mm ≤ 4 mm (¼ t): acceptable rounded indication.', 'Ø 2 mm ≤ 4 mm (¼ e) : indication arrondie acceptable.'] }
      } },
    cluster: { name: ['Cluster porosity', 'Nid de soufflures'], short: ['Group of small round dark spots', 'Groupe de petites taches sombres rondes'],
      look: [['Group of small round dark spots close together.', 'Groupe de petites taches sombres rondes rapprochées.'], ['Judge the number and size of pores in a given length against the code charts.', 'Jugez le nombre et la taille des pores sur une longueur donnée par rapport aux abaques du code.']],
      tip: ['Compare with the chart for the right thickness, over the most severe 150 mm (6 in) length.', 'Comparez avec l’abaque de la bonne épaisseur, sur les 150 mm (6 in) les plus défavorables.'],
      cases: {
        reject: { items: (() => { const r = rng(3), a = []; for (let i = 0; i < 26; i++) a.push({ k: 'pore', x: 24 + r() * 12, y: 11 + r() * 8, r: 0.4 + r() * 0.7, a: 0.55 }); return a; })(), ruler: [24, 36, 21], measure: ['26 pores in 12 mm', '26 pores sur 12 mm'], reject: true, why: ['Far denser than the Appendix 4 cluster chart for t = 16 mm: rejected.', 'Beaucoup plus dense que l’abaque de nids de l’Annexe 4 pour e = 16 mm : refusé.'] },
        accept: { items: (() => { const r = rng(9), a = []; for (let i = 0; i < 6; i++) a.push({ k: 'pore', x: 10 + r() * 40, y: 11 + r() * 8, r: 0.35 + r() * 0.25, a: 0.5 }); return a; })(), ruler: [10, 50, 21], measure: ['6 fine pores ≤ 1.2 mm in 40 mm', '6 pores fins ≤ 1,2 mm sur 40 mm'], reject: false, why: ['Scattered fine pores within the Appendix 4 chart: acceptable.', 'Pores fins dispersés dans l’abaque de l’Annexe 4 : acceptable.'] }
      } },
    slag: { name: ['Slag inclusion', 'Inclusion de laitier'], short: ['Irregular, elongated dark shape', 'Forme sombre irrégulière et allongée'],
      look: [['Dark, irregular shape with ragged edges, usually elongated along the weld.', 'Forme sombre, irrégulière, aux bords déchiquetés, généralement allongée le long de la soudure.'], ['Often between passes or near the fusion line; density varies along its length.', 'Souvent entre passes ou près de la ligne de fusion ; densité variable sur sa longueur.']],
      tip: ['Two parallel slag lines at the edges of the root ("wagon tracks") are common in pipe welds.', 'Deux lignes de laitier parallèles aux bords de la racine (« rails ») sont fréquentes sur les tubes.'],
      cases: {
        reject: { items: [{ k: 'slag', x1: 24, x2: 33, y: 13, w: 1.4, a: 0.5 }], ruler: [24, 33, 16.5], measure: ['length 9 mm', 'longueur 9 mm'], reject: true, why: ['Elongated indication 9 mm > 6 mm limit (t < 19 mm): rejected.', 'Indication allongée 9 mm > limite de 6 mm (e < 19 mm) : refusée.'] },
        accept: { items: [{ k: 'slag', x1: 28, x2: 32, y: 13, w: 1.2, a: 0.5 }], ruler: [28, 32, 16.5], measure: ['length 4 mm', 'longueur 4 mm'], reject: false, why: ['Elongated indication 4 mm ≤ 6 mm: acceptable (check alignment with other indications).', 'Indication allongée 4 mm ≤ 6 mm : acceptable (vérifier l’alignement avec d’autres indications).'] }
      } },
    tung: { name: ['Tungsten inclusion', 'Inclusion de tungstène'], short: ['Bright white spot (denser than steel)', 'Tache blanche brillante (plus dense que l’acier)'],
      look: [['Very light, sharp-edged spot: tungsten is much denser than steel.', 'Tache très claire aux bords nets : le tungstène est beaucoup plus dense que l’acier.'], ['Typical of TIG welds (electrode touching the pool).', 'Typique du soudage TIG (électrode touchant le bain).']],
      tip: ['Evaluated like a rounded indication (ASME VIII Appendix 4).', 'Évaluée comme une indication arrondie (ASME VIII Annexe 4).'],
      cases: {
        reject: { items: [{ k: 'tung', x: 30, y: 16, r: 3, a: 0.8 }], ruler: [27, 33, 20.5], measure: ['Ø 6 mm', 'Ø 6 mm'], reject: true, why: ['Ø 6 mm > ⅓ t (5.3 mm): rejected as a rounded indication.', 'Ø 6 mm > ⅓ e (5,3 mm) : refusée comme indication arrondie.'] },
        accept: { items: [{ k: 'tung', x: 30, y: 16, r: 0.75, a: 0.8 }], ruler: [29.25, 30.75, 18.5], measure: ['Ø 1.5 mm', 'Ø 1,5 mm'], reject: false, why: ['Ø 1.5 mm ≤ 4 mm: acceptable rounded indication.', 'Ø 1,5 mm ≤ 4 mm : indication arrondie acceptable.'] }
      } },
    undercut: { name: ['Undercut', 'Caniveau'], short: ['Dark band along the cap edge', 'Bande sombre le long du bord de finition'],
      look: [['Dark, diffuse band along the edge of the cap (toe), on one or both sides.', 'Bande sombre et diffuse le long du bord de la finition (pied), d’un ou des deux côtés.'], ['Darker than the parent metal when it is deep.', 'Plus sombre que le métal de base quand il est profond.']],
      tip: ['Surface defect: its depth is measured with a gauge (visual testing); RT only shows it.', 'Défaut de surface : sa profondeur se mesure à la jauge (contrôle visuel) ; la RT ne fait que le montrer.'],
      cases: {
        reject: { items: [{ k: 'band', x1: 12, x2: 46, y: edgeY - 0.3, h: 2.2, a: 0.42 }], ruler: [12, 46, edgeY - 3], measure: ['34 mm long, gauge depth 1.2 mm', '34 mm de long, profondeur jauge 1,2 mm'], reject: true, why: ['Gauge depth 1.2 mm > 0.8 mm (training, ASME VIII UW-35): rejected, repair by grinding / welding.', 'Profondeur jauge 1,2 mm > 0,8 mm (formation, ASME VIII UW-35) : refusé, réparer par meulage / soudage.'] },
        accept: { items: [{ k: 'band', x1: 12, x2: 46, y: edgeY - 0.3, h: 1.8, a: 0.14 }], ruler: [12, 46, edgeY - 3], measure: ['34 mm long, gauge depth 0.4 mm', '34 mm de long, profondeur jauge 0,4 mm'], reject: false, why: ['Gauge depth 0.4 mm ≤ 0.8 mm: acceptable.', 'Profondeur jauge 0,4 mm ≤ 0,8 mm : acceptable.'] }
      } },
    rootconc: { name: ['Root concavity (suck-back)', 'Retassure de racine'], short: ['Wide, diffuse dark band at the centre', 'Bande sombre large et diffuse au centre'],
      look: [['Wide dark band with soft edges at the centre of the weld.', 'Bande sombre large aux bords doux au centre de la soudure.'], ['Compare its density with the parent metal: darker than parent = the weld is thinner than the plate.', 'Comparez sa densité avec le métal de base : plus sombre que le métal de base = la soudure est plus mince que la tôle.']],
      tip: ['Confirm with a visual check of the root and a thickness measurement when accessible.', 'Confirmez par un contrôle visuel de la racine et une mesure d’épaisseur si accessible.'],
      cases: {
        reject: { items: [{ k: 'band', x1: 10, x2: 50, y: PW.y, h: 5, a: 0.55 }], ruler: [10, 50, PW.y + 4.5], measure: ['density darker than parent metal', 'densité plus sombre que le métal de base'], reject: true, why: ['Darker than the parent metal: total weld thickness is below the plate thickness → rejected (training, ASME VIII UW-35).', 'Plus sombre que le métal de base : l’épaisseur totale de la soudure est inférieure à celle de la tôle → refusée (formation, ASME VIII UW-35).'] },
        accept: { items: [{ k: 'band', x1: 10, x2: 50, y: PW.y, h: 5, a: 0.13 }], ruler: [10, 50, PW.y + 4.5], measure: ['darker than weld, lighter than parent', 'plus sombre que la soudure, plus clair que la tôle'], reject: false, why: ['Still lighter than the parent metal: the weld is at least as thick as the plate → acceptable.', 'Encore plus clair que le métal de base : la soudure est au moins aussi épaisse que la tôle → acceptable.'] }
      } },
    excess: { name: ['Excess penetration', 'Excès de pénétration'], short: ['Light band or drops at the centre', 'Bande ou gouttes claires au centre'],
      look: [['Lighter band (more material) along the centre of the weld, sometimes with light drops ("icicles").', 'Bande plus claire (plus de matière) au centre de la soudure, parfois avec des gouttes claires (« stalactites »).'], ['Height is measured on the part with a gauge, not on the film.', 'La hauteur se mesure sur la pièce avec une jauge, pas sur le film.']],
      tip: ['Limits come from the code / procedure table for the thickness (example used here: 3 mm).', 'Les limites viennent du tableau du code / de la procédure selon l’épaisseur (exemple utilisé ici : 3 mm).'],
      cases: {
        reject: { items: [{ k: 'band', x1: 0, x2: 60, y: PW.y, h: 5, a: 0.38, light: true }, { k: 'tung', x: 34, y: PW.y + 0.5, r: 1.6, a: 0.45 }], ruler: null, measure: ['gauge height 4 mm', 'hauteur jauge 4 mm'], reject: true, why: ['Gauge height 4 mm > 3 mm example limit: rejected, grind flush where accessible.', 'Hauteur jauge 4 mm > limite d’exemple de 3 mm : refusé, araser si accessible.'] },
        accept: { items: [{ k: 'band', x1: 0, x2: 60, y: PW.y, h: 4, a: 0.16, light: true }], ruler: null, measure: ['gauge height 1.5 mm', 'hauteur jauge 1,5 mm'], reject: false, why: ['Gauge height 1.5 mm ≤ 3 mm example limit: acceptable.', 'Hauteur jauge 1,5 mm ≤ limite d’exemple de 3 mm : acceptable.'] }
      } }
  };
  const ATLAS_ORDER = ['crack', 'lof', 'ip', 'pore', 'cluster', 'slag', 'tung', 'undercut', 'rootconc', 'excess'];
  const RULE = ['Training rules based on ASME VIII Div.1 UW-51 (cracks, lack of fusion and incomplete penetration rejected; elongated indications longer than 6 mm for t < 19 mm, t/3 for 19–57 mm, 19 mm above), Appendix 4 for rounded indications (max ¼ t or 4 mm; isolated ⅓ t or 6 mm) and UW-35 for surface profile. Always apply the current edition and the AQCS procedure.',
    'Règles de formation d’après ASME VIII Div.1 UW-51 (fissures, manques de fusion et de pénétration refusés ; indications allongées de plus de 6 mm pour e < 19 mm, e/3 pour 19–57 mm, 19 mm au-delà), Annexe 4 pour les indications arrondies (max ¼ e ou 4 mm ; isolée ⅓ e ou 6 mm) et UW-35 pour le profil de surface. Appliquez toujours l’édition en vigueur et la procédure AQCS.'];
  const patchCache = {};
  const patch = (key, caseKey) => patchCache[key + caseKey] || (patchCache[key + caseKey] = renderFilm(60, 30, 10, PW, ATLAS[key].cases[caseKey].items, ATLAS_ORDER.indexOf(key) + 3));

  // ---------- Drawing helpers ----------
  function fitCanvas(c) {
    const r = window.devicePixelRatio || 1, w = Math.max(200, c.clientWidth), h = Math.max(80, c.clientHeight);
    if (c.width !== Math.round(w * r) || c.height !== Math.round(h * r)) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
    const ctx = c.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
    return { ctx, w, h };
  }
  function label(ctx, x, y, text, opt) {
    opt = opt || {};
    ctx.save(); ctx.globalAlpha = opt.alpha === undefined ? 1 : opt.alpha;
    ctx.font = `${opt.bold ? 700 : 600} ${opt.size || 13}px system-ui, sans-serif`;
    const lines = String(text).split('\n'), pad = 6, lh = (opt.size || 13) + 4;
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2, th = lines.length * lh + pad;
    let bx = x - tw / 2, by = opt.below ? y + 12 : y - th - 12;
    bx = clamp(bx, 4, ctx.canvas.clientWidth - tw - 4); by = clamp(by, 4, ctx.canvas.clientHeight - th - 4);
    ctx.fillStyle = opt.bg || 'rgba(10,16,34,.9)'; ctx.strokeStyle = opt.color || '#ffe14d'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, tw, th, 6) : ctx.rect(bx, by, tw, th); ctx.fill(); ctx.stroke();
    if (!opt.noPointer) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(clamp(x, bx + 8, bx + tw - 8), opt.below ? by : by + th); ctx.stroke(); }
    ctx.fillStyle = opt.textColor || '#fff';
    lines.forEach((l, i) => ctx.fillText(l, bx + pad, by + pad + (i + 1) * lh - 5));
    ctx.restore();
  }
  function ring(ctx, x, y, r, color, alpha, dash) {
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha; ctx.strokeStyle = color; ctx.lineWidth = 2;
    if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke(); ctx.restore();
  }
  function box(ctx, x, y, w, h, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha === undefined ? 1 : alpha; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); ctx.restore();
  }
  function ruler(ctx, x1, x2, y, p, text, scale) {
    // scale: pixels per mm for ticks
    const xe = x1 + (x2 - x1) * ease(p);
    ctx.save(); ctx.strokeStyle = '#ffe14d'; ctx.fillStyle = '#ffe14d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(xe, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y - 7); ctx.lineTo(x1, y + 7); ctx.stroke();
    if (scale) for (let x = x1, i = 0; x <= xe + 0.5; x += scale, i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - (i % 5 ? 3 : 6)); ctx.stroke(); }
    if (p >= 1) { ctx.beginPath(); ctx.moveTo(x2, y - 7); ctx.lineTo(x2, y + 7); ctx.stroke(); ctx.font = '700 13px system-ui, sans-serif'; const tw = ctx.measureText(text).width; ctx.fillStyle = 'rgba(10,16,34,.85)'; ctx.fillRect((x1 + x2) / 2 - tw / 2 - 4, y + 8, tw + 8, 18); ctx.fillStyle = '#ffe14d'; ctx.fillText(text, (x1 + x2) / 2 - tw / 2, y + 22); }
    ctx.restore();
  }

  // ---------- Interpretation player ----------
  const st = { mode: 'steps', step: 0, t: 0, playing: false, voice: false, camFrom: null, atlasKey: 'crack', atlasCase: 'reject', atlasT: 0 };
  let root = null, raf = 0, last = 0;

  function camAt(i, t) { return STEPS[i].cam(t); }
  function currentCam() {
    const target = camAt(st.step, st.t);
    if (!st.camFrom) return target;
    const p = ease(seg(st.t, 0, 1));
    const mix = (k) => st.camFrom[k] + (target[k] - st.camFrom[k]) * p;
    return { cx: mix('cx'), cy: mix('cy'), cw: mix('cw'), ch: mix('ch') };
  }

  function drawViewer(c) {
    const { ctx, w, h } = fitCanvas(c), t = st.t, i = st.step;
    // each camera names the minimum film area (cw × ch mm) that must stay visible
    const cam = currentCam(), s = Math.min(w / cam.cw, h / cam.ch);
    const MX = (x) => (x - cam.cx) * s + w / 2, MY = (y) => (y - cam.cy) * s + h / 2;
    // room, viewer light box, masks
    const dim = i === 0 ? ease(seg(t, 0.5, 3)) : 1;
    const lerp = (a, b) => Math.round(a + (b - a) * dim);
    ctx.fillStyle = `rgb(${lerp(150, 14)},${lerp(158, 18)},${lerp(168, 26)})`; ctx.fillRect(0, 0, w, h);
    const vx = MX(-14), vy = MY(-14), vw = (FILM.w + 28) * s, vh = (FILM.h + 28) * s;
    ctx.fillStyle = '#f6f3e8'; ctx.fillRect(vx, vy, vw, vh);
    if (dim > 0.6) { ctx.save(); ctx.shadowColor = 'rgba(255,250,230,.5)'; ctx.shadowBlur = 30 * dim; ctx.fillRect(vx, vy, vw, vh); ctx.restore(); }
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(film(), MX(0), MY(0), FILM.w * s, FILM.h * s);
    const mask = i === 0 ? ease(seg(t, 4, 6.5)) : 1;
    if (mask > 0) {
      ctx.fillStyle = '#111'; const mh = 14 * s * mask;
      ctx.fillRect(vx, vy, vw, mh); ctx.fillRect(vx, MY(FILM.h + 14) - mh, vw, mh);
      const mw = 14 * s * mask; ctx.fillRect(vx, vy, mw, vh); ctx.fillRect(MX(FILM.w + 14) - mw, vy, mw, vh);
    }
    // step overlays
    const L2 = (pair) => T2(pair);
    if (i === 0) {
      if (t > 0.8 && t < 4) label(ctx, w / 2, 40, L('Dim the room · let the eyes adapt', 'Assombrir la salle · adaptation des yeux'), { noPointer: true, alpha: seg(t, 0.8, 1.4) });
      if (t >= 4 && t < 7) label(ctx, w / 2, 40, L('Mask the light around the film (no glare)', 'Masquer la lumière autour du film (pas d’éblouissement)'), { noPointer: true });
      if (t >= 7) label(ctx, w / 2, 40, L('✓ Ready to read', '✓ Prêt pour la lecture'), { noPointer: true, color: '#42c991' });
    } else if (i === 1) {
      const p = seg(t, 1, 2.5);
      box(ctx, MX(4), MY(88.5), 98 * s, 7.5 * s, '#ffe14d', 0.5 + 0.5 * Math.sin(t * 5));
      const parts = [[L('Job', 'Affaire'), 'J-2611', 25], [L('Weld', 'Soudure'), 'W-14', 44], [L('Film', 'Film'), '1 / 3', 57], [L('Source', 'Source'), 'Ir-192', 69], [L('Date', 'Date'), '03.11.26', 86]];
      parts.forEach(([a, b, x], k) => { if (t > 2 + k * 0.9) label(ctx, MX(x), MY(88), `${a}: ${b}`, { size: 12, alpha: seg(t, 2 + k * 0.9, 2.4 + k * 0.9) }); });
      if (p > 0 && t > 7) label(ctx, w / 2, h - 20, L('✓ Matches the request and weld map', '✓ Conforme à la demande et au plan de soudage'), { noPointer: true, color: '#42c991', below: false });
    } else if (i === 2) {
      [[8, '0'], [103, '1'], [198, '2'], [292, '3']].forEach(([x, s0], k) => { if (t > 0.8 + k * 0.9) { ring(ctx, MX(x + 1.5), MY(9), 4 * s, '#ffe14d'); } });
      if (t > 4.6) { ctx.save(); ctx.strokeStyle = '#3da9ff'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); const y = MY(20); ctx.beginPath(); ctx.moveTo(MX(8), y); ctx.lineTo(MX(8 + 284 * ease(seg(t, 4.6, 6.4))), y); ctx.stroke(); ctx.restore(); }
      if (t > 6.4) label(ctx, MX(292), MY(18), L('Next film must start at marker 3 (overlap)', 'Le film suivant doit commencer au repère 3 (chevauchement)'), { below: true, size: 12 });
    } else if (i === 3) {
      const bw = Math.min(170, w * 0.28), bh = bw * 0.62, y0 = 16;
      const ins = (x, light, txt, col) => {
        ctx.fillStyle = '#3d3f42'; ctx.fillRect(x, y0, bw, bh);
        ctx.fillStyle = light ? 'rgba(235,235,235,.85)' : 'rgba(0,0,0,.35)'; ctx.font = `800 ${bh * 0.62}px system-ui, sans-serif`; ctx.fillText('B', x + bw / 2 - bh * 0.2, y0 + bh * 0.78);
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, y0, bw, bh);
        ctx.fillStyle = col; ctx.font = '700 12px system-ui, sans-serif'; ctx.fillText(txt, x + 4, y0 + bh + 15);
      };
      if (t > 0.8) ins(w - 2 * bw - 26, true, L('Light B → film rejected', 'B clair → film refusé'), '#ff6b78');
      if (t > 2.5) ins(w - bw - 12, false, L('Dark B / none → OK', 'B sombre / absent → OK'), '#42c991');
      if (t > 5) label(ctx, MX(150), MY(75), L('This film: no B image → backscatter OK ✓', 'Ce film : pas d’image du B → rétrodiffusé OK ✓'), { color: '#42c991', noPointer: true });
    } else if (i === 4) {
      DENS.forEach((p, k) => {
        const a = 1 + k * 2.6; if (t < a) return;
        const q = ease(seg(t, a, a + 1)), from = k ? DENS[k - 1] : { x: 150, y: 90 };
        const x = from.x + (p.x - from.x) * q, y = from.y + (p.y - from.y) * q;
        ring(ctx, MX(x), MY(y), Math.max(6, 1.5 * s), '#3da9ff'); ctx.fillStyle = '#3da9ff'; ctx.fillRect(MX(x) - 1, MY(y) - 1, 2, 2);
        if (q >= 1) label(ctx, MX(p.x), MY(p.y), `D = ${p.d.toFixed(2)}\n${L2(p.label)}`, { size: 12, color: '#3da9ff' });
      });
      if (t > 8.6) {
        const bx = 20, by = h - 46, bw = Math.min(360, w - 40);
        const DX = (d) => bx + (d - 1.5) / 2.7 * bw;
        ctx.fillStyle = 'rgba(10,16,34,.9)'; ctx.fillRect(bx - 8, by - 22, bw + 16, 56);
        ctx.fillStyle = 'rgba(66,201,145,.35)'; ctx.fillRect(DX(2.21), by, DX(3.38) - DX(2.21), 10);
        ctx.strokeStyle = '#aebbe3'; ctx.strokeRect(DX(1.5), by, bw, 10);
        ctx.fillStyle = '#fff'; ctx.font = '11px system-ui, sans-serif';
        [[2.0, '2.0'], [2.21, '−15%'], [2.6, 'IQI'], [3.38, '+30%'], [4.0, '4.0']].forEach(([d, s0]) => { ctx.fillRect(DX(d), by - 3, 1, 16); ctx.fillText(s0, DX(d) - 8, by + 25); });
        DENS.forEach((p) => { ctx.fillStyle = '#3da9ff'; ctx.beginPath(); ctx.arc(DX(p.d), by + 5, 4, 0, 7); ctx.fill(); });
        ctx.fillStyle = '#42c991'; ctx.font = '700 12px system-ui, sans-serif'; ctx.fillText(L('All readings in range ✓', 'Toutes les mesures dans la plage ✓'), bx, by - 8);
      }
    } else if (i === 5) {
      WIRES.forEach(([n, d], k) => {
        if (t < 1 + k * 0.6) return;
        const x = MX(IQI_X(k)), col = n === 7 ? '#42c991' : n === 6 ? '#ff9b6b' : '#ffe14d';
        ctx.fillStyle = col; ctx.font = '700 12px system-ui, sans-serif'; ctx.fillText(String(n), x - 6, MY(31.5));
        ctx.fillText(String(n), x - 6, MY(71.5));
      });
      if (t > 5) box(ctx, MX(IQI_X(4)) - 7, MY(33), 14, 34 * s, '#42c991', 0.6 + 0.4 * Math.sin(t * 5));
      if (t > 5.5) label(ctx, MX(IQI_X(4)), MY(40), L('Essential wire 7 (0.33 mm) visible ✓', 'Fil essentiel 7 (0,33 mm) visible ✓'), { color: '#42c991', size: 12 });
      if (t > 7.5) label(ctx, MX(IQI_X(5)), MY(62), L('Wire 6: barely visible (not required)', 'Fil 6 : à peine visible (non exigé)'), { color: '#ff9b6b', size: 12, below: true });
    } else if (i === 6) {
      if (t > 1) ring(ctx, MX(212), MY(27.5), 5.5 * s, '#ff9b6b', 0.6 + 0.4 * Math.sin(t * 5));
      if (t > 2) label(ctx, MX(212), MY(23), L('Crescent mark, partly outside the weld\n→ pressure mark (film artefact)', 'Croissant, en partie hors de la soudure\n→ marque de pression (défaut de film)'), { color: '#ff9b6b', size: 12 });
      if (t > 5) label(ctx, MX(212), MY(41), L('Check in reflected light: emulsion damaged\nNot a weld indication', 'Vérifier en lumière réfléchie : émulsion abîmée\nPas une indication de soudure'), { color: '#ff9b6b', size: 12, below: true });
    } else if (i === 7) {
      const xm = cam.cx, r = Math.min(h * 0.32, 110);
      const cx = MX(xm), cy = MY(50);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
      const z = 2, sz = (r * 2 / s) / z;
      ctx.drawImage(film(), (xm - sz / 2) * 6, (50 - sz / 2) * 6, sz * 6, sz * 6, cx - r, cy - r, r * 2, r * 2);
      ctx.restore(); ring(ctx, cx, cy, r, '#c9d6ff'); ctx.save(); ctx.strokeStyle = '#c9d6ff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx + r * 0.7, cy + r * 0.7); ctx.lineTo(cx + r * 1.1, cy + r * 1.1); ctx.stroke(); ctx.restore();
      IND.concat([{ id: '!', x1: 210, x2: 214, y: 27 }]).forEach((d) => {
        if (xm > d.x1 - 6 && xm < d.x2 + 18 && d.id !== '!') label(ctx, MX((d.x1 + d.x2) / 2), MY(d.y) - 4, `${d.id} · ${Math.round(d.x1)} mm`, { size: 12, color: '#ffe14d' });
      });
      ctx.fillStyle = 'rgba(10,16,34,.85)'; ctx.fillRect(10, h - 28, 210, 20); ctx.fillStyle = '#fff'; ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`${L('Position from marker 0', 'Position depuis le repère 0')}: ${Math.round(xm)} mm`, 16, h - 14);
    } else if (i === 8) {
      IND.forEach((d, k) => {
        const a = 1 + k * 2.2; if (t < a) return;
        const al = seg(t, a, a + 0.5), x = MX((d.x1 + d.x2) / 2), y = MY(d.y);
        box(ctx, MX(d.x1 - 1.5), MY(d.y - 3), (d.x2 - d.x1 + 3) * s, 6 * s, d.ok ? '#42c991' : '#ff6b78', al);
        label(ctx, x, y + (k % 2 ? 3 * s : -3 * s), `${d.id}: ${L2(d.type)}\n${Math.round(d.x1)}–${Math.round(d.x2)} mm`, { size: 12, alpha: al, below: k % 2 === 1, color: '#ffe14d' });
      });
    } else if (i === 9) {
      const k = clamp(Math.floor(t / 3), 0, 3), d = IND[k], lt = t - k * 3;
      ruler(ctx, MX(d.x1), MX(d.x2), MY(d.y + 4), seg(lt, 0.9, 2), T2(d.size), s);
      if (lt > 2.1) label(ctx, MX((d.x1 + d.x2) / 2), MY(d.y - 3), `${d.id}: ${d.ok ? L('ACCEPTABLE', 'ACCEPTABLE') : L('REJECTED', 'REFUSÉE')}\n${T2(d.why)}`, { size: 12, color: d.ok ? '#42c991' : '#ff6b78' });
    } else if (i === 10) {
      const p = ease(seg(t, 0.5, 1.5)), bw = Math.min(520, w - 30), bh = Math.min(h - 24, 250), bx = (w - bw) / 2, by = 12 + (1 - p) * 40;
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(248,249,252,.97)'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#0a0d12'; ctx.font = '700 14px system-ui, sans-serif'; ctx.fillText(L('RT REPORT · Weld W-14 · Film 1/3', 'RAPPORT RT · Soudure W-14 · Film 1/3'), bx + 12, by + 22);
      ctx.font = '12px system-ui, sans-serif';
      const rows = [
        [L('Film quality', 'Qualité du film'), L('ID ✓  markers ✓  B ✓  density 2.45–3.10 ✓  IQI wire 7 ✓', 'ID ✓  repères ✓  B ✓  densité 2,45–3,10 ✓  IQI fil 7 ✓')],
        [L('Artefact', 'Défaut de film'), L('pressure mark at 212 mm (not relevant)', 'marque de pression à 212 mm (non pertinente)')]
      ].concat(IND.map((d) => [`${d.id} ${T2(d.type)}`, `${Math.round(d.x1)} mm · ${T2(d.size)} · ${d.ok ? L('acceptable', 'acceptable') : L('REJECTED', 'REFUSÉE')}`]));
      rows.forEach(([a, b], k) => { if (t > 1.5 + k * 0.6) { ctx.fillStyle = '#2d3440'; ctx.fillText(a, bx + 12, by + 46 + k * 22); ctx.fillStyle = /REJ|REFUS/.test(b) ? '#b00020' : '#0a0d12'; ctx.fillText(b, bx + bw * 0.38, by + 46 + k * 22); } });
      if (t > 6) { ctx.fillStyle = '#b00020'; ctx.font = '800 15px system-ui, sans-serif'; ctx.fillText(L('WELD REJECTED — repair C and D, re-radiograph', 'SOUDURE REFUSÉE — réparer C et D, refaire la RT'), bx + 12, by + bh - 34); }
      if (t > 7.5) { ctx.fillStyle = '#2d3440'; ctx.font = 'italic 12px system-ui, sans-serif'; ctx.fillText(L('Interpreter: RT Level 2 — signature, date', 'Interprète : RT niveau 2 — signature, date'), bx + 12, by + bh - 12); }
      ctx.restore();
    }
    // step progress
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(0, h - 4, w, 4);
    ctx.fillStyle = '#7657e8'; ctx.fillRect(0, h - 4, w * clamp(st.t / STEPS[i].dur, 0, 1), 4);
  }

  function drawAtlas(c) {
    const { ctx, w, h } = fitCanvas(c), a = ATLAS[st.atlasKey], cs = a.cases[st.atlasCase], img = patch(st.atlasKey, st.atlasCase);
    ctx.fillStyle = '#f6f3e8'; ctx.fillRect(0, 0, w, h);
    const s = Math.min((w - 20) / 60, (h - 20) / 30), ox = (w - 60 * s) / 2, oy = (h - 30 * s) / 2;
    ctx.drawImage(img, ox, oy, 60 * s, 30 * s);
    const t = st.atlasT;
    if (cs.ruler) ruler(ctx, ox + cs.ruler[0] * s, ox + cs.ruler[1] * s, oy + cs.ruler[2] * s, seg(t, 0.4, 1.4), T2(cs.measure), s);
    else if (t > 1) label(ctx, w / 2, oy + 30 * s - 8, T2(cs.measure), { noPointer: true, size: 12 });
    // scale bar 10 mm
    ctx.fillStyle = '#0a0d12'; ctx.fillRect(ox, oy + 30 * s + 4, 10 * s, 3); ctx.font = '11px system-ui, sans-serif'; ctx.fillText('10 mm', ox, oy + 30 * s + 17 > h ? h - 2 : oy + 30 * s + 17);
  }

  // ---------- UI ----------
  const css = `
.cyrt-intro { color: var(--muted); margin: 8px 0 10px; }
.cyrt-modes, .cyrt-ctrl { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; align-items: center; }
.cyrt-view { width: 100%; height: 380px; display: block; border-radius: 8px; border: 2px solid #22303f; background: #0e1219; }
.cyrt-layout { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(220px, 1fr); gap: 14px; margin-top: 10px; }
.cyrt-steps { margin: 0; padding-left: 22px; font-size: 13px; }
.cyrt-steps li { margin: 3px 0; cursor: pointer; color: var(--muted); }
.cyrt-steps li.done { color: #7de2b5; } .cyrt-steps li.now { color: var(--text); font-weight: 700; }
.cyrt-text { border-left: 3px solid var(--accent); padding: 4px 12px; }
.cyrt-text h3 { margin: 0 0 6px; font-size: 1.05rem; }
.cyrt-text ul { margin: 4px 0; padding-left: 18px; }
.cyrt-atlas-view { width: 100%; height: 300px; display: block; border-radius: 8px; border: 1px solid var(--line); }
.cyrt-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin-top: 12px; }
.cyrt-card { text-align: left; padding: 8px; display: grid; gap: 4px; align-content: start; }
.cyrt-card canvas { width: 100%; height: 64px; border-radius: 5px; display: block; }
.cyrt-card b { font-size: 13px; } .cyrt-card span { font-size: 11px; color: var(--muted); }
.cyrt-card.on span, .cyrt-card:hover span { color: #fff; }
.cyrt-cases { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
.cyrt-cases button[data-case=reject].on { background: #a3283b; border-color: #a3283b; }
.cyrt-cases button[data-case=accept].on { background: #146c43; border-color: #146c43; }
.cyrt-verdict { padding: 8px 10px; border-radius: 7px; font-weight: 600; margin: 6px 0; }
.cyrt-verdict.reject { background: rgba(163, 40, 59, .3); border: 1px solid #e66b78; }
.cyrt-verdict.accept { background: rgba(20, 108, 67, .3); border: 1px solid #42c991; }
.cyrt-verdict b { display: block; font-size: 1.05rem; letter-spacing: .04em; }
.cyrt-tip { border-left: 3px solid var(--blue); padding: 4px 10px; margin: 8px 0; }
.cyrt-rule, .cyrt-disclaimer { font-size: 12px; color: var(--muted); }
html.field .cyrt-steps li.done { color: #146c43; }
@media (max-width: 820px) { .cyrt-layout { grid-template-columns: minmax(0, 1fr); } .cyrt-view { height: 260px; } .cyrt-atlas-view { height: 200px; } }
`;

  function build(pb) {
    const el = document.createElement('details');
    el.className = 'cyrt'; el.open = true;
    el.innerHTML = `<summary>🎞 ${L('Radiograph interpretation (animated)', 'Interprétation des radiogrammes (animation)')}</summary>
<p class="cyrt-intro">${L('Follow a complete film interpretation on the viewer, step by step, then look at how each indication appears on film with a rejected and a not rejected case.', 'Suivez une interprétation complète d’un film au négatoscope, étape par étape, puis voyez l’aspect de chaque indication sur le film avec un cas refusé et un cas non refusé.')}</p>
<div class="cyrt-modes"><button type="button" data-mode="steps">▶ ${L('Interpretation step by step', 'Interprétation étape par étape')}</button><button type="button" data-mode="atlas">📚 ${L('Indications on film', 'Indications sur film')}</button></div>
<div data-part="steps">
 <canvas class="cyrt-view" aria-label="${L('Film viewer animation', 'Animation du négatoscope')}"></canvas>
 <div class="cyrt-ctrl" style="margin-top:8px"><button type="button" data-act="prev">⏮ ${L('Previous', 'Précédent')}</button><button type="button" data-act="play"></button><button type="button" data-act="next">${L('Next', 'Suivant')} ⏭</button><button type="button" data-act="replay">↺ ${L('Replay step', 'Rejouer l’étape')}</button><button type="button" data-act="voice"></button></div>
 <div class="cyrt-layout"><div class="cyrt-text" data-text></div><ol class="cyrt-steps" data-steps></ol></div>
</div>
<div data-part="atlas">
 <div class="cyrt-layout" style="margin-top:0"><canvas class="cyrt-atlas-view" aria-label="${L('Magnified film area', 'Zone de film agrandie')}"></canvas><div data-atlas-panel></div></div>
 <div class="cyrt-cards" data-cards></div>
</div>
<p class="cyrt-disclaimer">⚠ ${L('Drawn training images, not real radiographs. Acceptance values are training examples: always apply the current code edition and the applicable AQCS procedure. Interpretation is done by a qualified RT Level 2; refer disputes to the Level 3.', 'Images de formation dessinées, pas de vrais radiogrammes. Les valeurs d’acceptation sont des exemples pédagogiques : appliquez toujours l’édition en vigueur du code et la procédure AQCS applicable. L’interprétation est faite par un RT niveau 2 qualifié ; les litiges vont au niveau 3.')}</p>`;
    const anchor = pb.querySelector('.cy3') || pb.querySelector('.cy-course-launch') || pb.querySelector('h2');
    if (anchor) anchor.after(el); else pb.prepend(el);
    root = el;
    el.addEventListener('click', onClick);
    el.addEventListener('toggle', () => { if (el.open) start(); else stopVoice(); });
    sync(); renderText(); renderAtlasPanel(); renderCards(); start();
  }

  function sync() {
    root.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('on', b.dataset.mode === st.mode));
    root.querySelector('[data-part="steps"]').hidden = st.mode !== 'steps';
    root.querySelector('[data-part="atlas"]').hidden = st.mode !== 'atlas';
    root.querySelector('[data-act="play"]').textContent = st.playing ? '⏸ ' + L('Pause', 'Pause') : '▶ ' + L('Play', 'Lecture');
    root.querySelector('[data-act="voice"]').textContent = (st.voice ? '🔊 ' : '🔈 ') + L('Voice', 'Voix') + (st.voice ? ' ON' : ' OFF');
    root.querySelector('[data-act="prev"]').disabled = st.step === 0;
    root.querySelector('[data-act="next"]').disabled = st.step === STEPS.length - 1;
  }
  function renderText() {
    const s = STEPS[st.step];
    root.querySelector('[data-text]').innerHTML = `<h3>${L('Step', 'Étape')} ${st.step + 1} / ${STEPS.length} — ${esc(T2(s.title))}</h3><ul>${s.text.map((x) => `<li>${esc(T2(x))}</li>`).join('')}</ul>`;
    root.querySelector('[data-steps]').innerHTML = STEPS.map((x, i) => `<li data-go="${i}" class="${i < st.step ? 'done' : i === st.step ? 'now' : ''}">${i < st.step ? '✓ ' : ''}${esc(T2(x.title))}</li>`).join('');
  }
  function renderAtlasPanel() {
    const a = ATLAS[st.atlasKey], cs = a.cases[st.atlasCase];
    root.querySelector('[data-atlas-panel]').innerHTML = `<h3 style="margin:0">${esc(T2(a.name))}</h3>
<div class="cyrt-cases"><button type="button" data-case="reject" class="${st.atlasCase === 'reject' ? 'on' : ''}">✖ ${L('Rejected', 'Refusé')}</button><button type="button" data-case="accept" class="${st.atlasCase === 'accept' ? 'on' : ''}">✔ ${L('Not rejected', 'Non refusé')}</button></div>
${cs.label ? `<p><b>${esc(T2(cs.label))}</b></p>` : ''}
<div class="cyrt-verdict ${cs.reject ? 'reject' : 'accept'}"><b>${cs.reject ? L('REJECTED', 'REFUSÉ') : L('NOT REJECTED', 'NON REFUSÉ')}</b>${esc(T2(cs.why))}</div>
<p class="mut">t = 16 mm · ${esc(T2(cs.measure))}</p>
<h4 style="margin:10px 0 4px">${L('How it looks on the film', 'Aspect sur le film')}</h4><ul style="margin:0;padding-left:18px">${a.look.map((x) => `<li>${esc(T2(x))}</li>`).join('')}</ul>
<p class="cyrt-tip">💡 ${esc(T2(a.tip))}</p><p class="cyrt-rule">📘 ${esc(T2(RULE))}</p>`;
  }
  function renderCards() {
    const box0 = root.querySelector('[data-cards]');
    box0.innerHTML = ATLAS_ORDER.map((k) => `<button type="button" class="cyrt-card${k === st.atlasKey ? ' on' : ''}" data-type="${k}"><canvas></canvas><b>${esc(T2(ATLAS[k].name))}</b><span>${esc(T2(ATLAS[k].short))}</span></button>`).join('');
    requestAnimationFrame(() => box0.querySelectorAll('[data-type]').forEach((b) => {
      const { ctx, w, h } = fitCanvas(b.querySelector('canvas')), img = patch(b.dataset.type, 'reject');
      const s = Math.max(w / 60, h / 30); ctx.drawImage(img, (w - 60 * s) / 2, (h - 30 * s) / 2, 60 * s, 30 * s);
    }));
  }

  function stopVoice() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }
  function speak() {
    stopVoice();
    if (!st.voice || !window.speechSynthesis || st.mode !== 'steps') return;
    const s = STEPS[st.step], u = new SpeechSynthesisUtterance(T2(s.title) + '. ' + s.text.map(T2).join(' '));
    u.lang = L('en-US', 'fr-FR'); u.rate = 1.02; window.speechSynthesis.speak(u);
  }
  function goStep(i) {
    st.camFrom = currentCam(); st.step = clamp(i, 0, STEPS.length - 1); st.t = 0;
    if (st.step === STEPS.length - 1) learn('rt-interp');
    renderText(); sync(); speak();
  }

  function onClick(e) {
    const b = e.target.closest('button, [data-go]'); if (!b || !root.contains(b)) return;
    if (b.dataset.mode) { st.mode = b.dataset.mode; if (st.mode !== 'steps') { st.playing = false; stopVoice(); } else st.atlasT = 0; sync(); }
    else if (b.dataset.go !== undefined) goStep(+b.dataset.go);
    else if (b.dataset.act === 'play') { if (!st.playing && st.step === STEPS.length - 1 && st.t >= STEPS[st.step].dur) goStep(0); st.playing = !st.playing; if (st.playing && st.t === 0) speak(); sync(); }
    else if (b.dataset.act === 'next') goStep(st.step + 1);
    else if (b.dataset.act === 'prev') goStep(st.step - 1);
    else if (b.dataset.act === 'replay') goStep(st.step);
    else if (b.dataset.act === 'voice') { st.voice = !st.voice; if (st.voice) speak(); else stopVoice(); sync(); }
    else if (b.dataset.type) { learn('rt-atlas:' + b.dataset.type); st.atlasKey = b.dataset.type; st.atlasCase = 'reject'; st.atlasT = 0; root.querySelectorAll('.cyrt-card').forEach((x) => x.classList.toggle('on', x === b)); renderAtlasPanel(); }
    else if (b.dataset.case) { st.atlasCase = b.dataset.case; st.atlasT = 0; renderAtlasPanel(); }
  }

  function frame(now) {
    raf = 0;
    if (!root || !root.isConnected) { root = null; stopVoice(); return; }
    if (!root.open) return;
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0; last = now;
    if (st.mode === 'steps') {
      if (st.playing) {
        st.t += dt;
        if (st.t >= STEPS[st.step].dur) {
          if (st.step < STEPS.length - 1) goStep(st.step + 1);
          else { st.t = STEPS[st.step].dur; st.playing = false; sync(); }
        }
      } else if (st.t < 1.2) st.t = Math.min(1.2, st.t + dt); // finish the camera move when paused
      drawViewer(root.querySelector('.cyrt-view'));
    } else {
      st.atlasT += dt;
      drawAtlas(root.querySelector('.cyrt-atlas-view'));
    }
  }
  function start() { last = 0; if (!raf) raf = requestAnimationFrame(frame); }

  function currentMethod() { const b = document.querySelector('#ptab .on'); return b && b.dataset.pm; }
  function inject() {
    const pb = document.getElementById('pbody');
    if (!pb || currentMethod() !== 'RT' || pb.querySelector('.cyrt')) return;
    st.playing = false; stopVoice();
    build(pb);
  }
  function init(n) {
    const pb = document.getElementById('pbody');
    if (!pb) { if (n < 20) setTimeout(() => init(n + 1), 300); return; }
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    new MutationObserver(inject).observe(pb, { childList: true });
    inject();
  }
  // Film patch of an indication (atlas cards and Academy challenges), cropped to fill the canvas.
  function drawPatch(cv, key, caseKey) {
    const { ctx, w, h } = fitCanvas(cv), img = patch(key, caseKey || 'reject');
    const s = Math.max(w / 60, h / 30); ctx.drawImage(img, (w - 60 * s) / 2, (h - 30 * s) / 2, 60 * s, 30 * s);
  }
  window.CYRTSIM = { STEPS, ATLAS, drawPatch };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(0)); else init(0);
}());
