/* CYCLOPS 3D defect lab: educational 3D models of weld and plate discontinuities in a butt-welded test plate.
   - Rotate / zoom, ✂ section (cut through the weld to see the cross-section), 👻 X-ray (see-through metal),
     click the defect to read about it.
   - For each defect: description, typical cause, and how each method may reveal it (UT, RT, MT, PT, VT) with an
     animated overlay in 3D (beam, radiation shadow, magnetic particles, penetrant bleed-out, inspector's eye)
     plus the matching A-scan / film image drawn by the UT and RT simulators.
   - Compare mode: two defects side by side with their detectability.
   The detectability notes are general training guidance: real capability depends on the procedure, technique,
   orientation, size, material and the qualified operator. Models are schematic, not to scale.
   window.CYDEF = { open(key) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PI = Math.PI, BEV = Math.atan(0.3 / 0.6); // bevel half-angle of the schematic V-groove
  const METHODS = ['VT', 'PT', 'MT', 'UT', 'RT'];
  // detectability: 2 = good, 1 = possible / depends, 0 = not expected
  const DEF = {
    crack: { n: ['Toe crack (surface-breaking)', 'Fissure en pied de cordon (débouchante)'], ut: 'crack', rt: 'crack', surf: true,
      d: ['A sharp, planar separation of the metal. Cracks are the most dangerous discontinuity: their sharp tip concentrates stress and can grow under load or fatigue.', 'Une séparation plane et aiguë du métal. Les fissures sont les discontinuités les plus dangereuses : leur pointe concentre les contraintes et peut progresser sous charge ou en fatigue.'],
      c: ['Hydrogen (cold cracking), high restraint, hard heat-affected zone, fatigue in service.', 'Hydrogène (fissuration à froid), bridage élevé, ZAT dure, fatigue en service.'],
      m: { VT: [1, ['Only if open enough and well lit; fine cracks are easily missed by eye.', 'Seulement si assez ouverte et bien éclairée ; les fissures fines échappent facilement à l’œil.']], PT: [2, ['Penetrant enters the opening and bleeds out as a sharp line.', 'Le pénétrant entre dans l’ouverture et ressort en ligne nette.']], MT: [2, ['On ferritic steel, flux leaks at the crack and particles build a sharp line — best when the field crosses it.', 'Sur acier ferritique, le flux fuit à la fissure et les particules forment une ligne nette — au mieux quand le champ la croise.']], UT: [2, ['Planar reflector: strong, jagged echo when the beam hits it square on.', 'Réflecteur plan : écho fort et dentelé quand le faisceau la frappe de face.']], RT: [1, ['Only if the crack plane is roughly parallel to the beam; a tilted crack may be invisible on film.', 'Seulement si le plan de fissure est à peu près parallèle au faisceau ; une fissure inclinée peut être invisible.']] } },
    lof: { n: ['Lack of side-wall fusion', 'Manque de fusion latéral'], ut: 'lof', rt: 'lof', surf: false,
      d: ['The weld metal did not fuse with the bevel face: a thin planar gap along the side wall, inside the weld.', 'Le métal fondu ne s’est pas lié à la face du chanfrein : une fine lame plane le long du bord, dans la soudure.'],
      c: ['Too low heat input, wrong torch angle, too fast travel, poor bevel cleaning.', 'Énergie trop faible, mauvais angle de torche, vitesse trop élevée, chanfrein mal nettoyé.'],
      m: { VT: [0, ['Hidden inside the weld.', 'Cachée dans la soudure.']], PT: [0, ['Not open to the surface.', 'Non débouchante.']], MT: [1, ['Only if very close to the surface.', 'Seulement si très proche de la surface.']], UT: [2, ['The best method: a beam perpendicular to the bevel face (e.g. 60° on a 30° bevel) gives a strong echo.', 'La meilleure méthode : un faisceau perpendiculaire au chanfrein (ex. 60° sur chanfrein 30°) donne un écho fort.']], RT: [1, ['Visible as a thin dark line only if the beam runs along the bevel plane.', 'Visible en fine ligne sombre seulement si le faisceau suit le plan du chanfrein.']] } },
    ip: { n: ['Incomplete root penetration', 'Manque de pénétration à la racine'], ut: 'ip', rt: 'ip', surf: false,
      d: ['The root faces were not melted through: a straight gap at the root, along the centre of the weld.', 'Les talons n’ont pas été fondus : un interstice rectiligne à la racine, au centre de la soudure.'],
      c: ['Root gap too small, root face too thick, current too low, misalignment.', 'Écartement trop faible, talon trop épais, intensité trop faible, désalignement.'],
      m: { VT: [2, ['From the root side, if it can be reached (inside of a pipe: borescope).', 'Côté racine, si on peut y accéder (intérieur de tube : endoscope).']], PT: [1, ['From the root side only.', 'Côté racine seulement.']], MT: [1, ['From the root side only, ferritic steel.', 'Côté racine seulement, acier ferritique.']], UT: [2, ['Corner echo at the root: must be told apart from normal root geometry (position is the key).', 'Écho de coin en racine : à distinguer de la géométrie normale (la position est la clé).']], RT: [2, ['A straight dark line exactly at the weld centre.', 'Une ligne sombre rectiligne exactement au centre de la soudure.']] } },
    pore: { n: ['Porosity (cluster)', 'Porosité (nid de soufflures)'], ut: 'cluster', rt: 'cluster', surf: false,
      d: ['Gas bubbles trapped in the solidifying weld: round cavities, isolated or in clusters.', 'Bulles de gaz piégées pendant la solidification : cavités rondes, isolées ou en nids.'],
      c: ['Moisture, rust or oil, poor gas shielding (draughts), long arc.', 'Humidité, rouille ou huile, mauvaise protection gazeuse (courants d’air), arc trop long.'],
      m: { VT: [1, ['Only surface pores (pinholes).', 'Seulement les piqûres débouchantes.']], PT: [1, ['Only pores open to the surface (round dots).', 'Seulement les pores débouchants (points ronds).']], MT: [0, ['Rounded, subsurface: little flux leakage.', 'Arrondies, sous la surface : peu de fuite de flux.']], UT: [1, ['Weak scattered echoes that change little with angle — small spherical reflectors return little energy.', 'Échos faibles et dispersés qui varient peu avec l’angle — les petits réflecteurs sphériques renvoient peu d’énergie.']], RT: [2, ['The best method: round dark spots with soft edges.', 'La meilleure méthode : points sombres ronds aux bords doux.']] } },
    slag: { n: ['Slag inclusion', 'Inclusion de laitier'], ut: 'slag', rt: 'slag', surf: false,
      d: ['Non-metallic slag trapped between passes or against the side wall: irregular, elongated.', 'Laitier non métallique piégé entre les passes ou contre le bord : irrégulier, allongé.'],
      c: ['Poor cleaning between passes, undercut of the previous pass, wrong electrode angle.', 'Mauvais nettoyage entre passes, caniveau de la passe précédente, mauvais angle d’électrode.'],
      m: { VT: [0, ['Inside the weld.', 'Dans la soudure.']], PT: [0, ['Not open to the surface.', 'Non débouchante.']], MT: [0, ['Not near enough the surface in most cases.', 'Le plus souvent trop profonde.']], UT: [1, ['Irregular, medium echo; less angle-sensitive than a crack.', 'Écho irrégulier, moyen ; moins sensible à l’angle qu’une fissure.']], RT: [2, ['Irregular elongated dark shapes, often along a bevel.', 'Formes sombres irrégulières et allongées, souvent le long d’un chanfrein.']] } },
    undercut: { n: ['Undercut', 'Caniveau'], ut: 'undercut', rt: 'undercut', surf: true,
      d: ['A groove melted into the base metal at the weld toe and not filled: reduces thickness and concentrates stress.', 'Une rainure fondue dans le métal de base au pied du cordon et non remplie : réduit l’épaisseur et concentre les contraintes.'],
      c: ['Current too high, travel too fast, wrong electrode angle.', 'Intensité trop élevée, vitesse trop rapide, mauvais angle d’électrode.'],
      m: { VT: [2, ['The main method: seen and measured with a weld gauge (depth against the code limit).', 'La méthode principale : vu et mesuré à la jauge (profondeur contre la limite du code).']], PT: [1, ['Shows as a broad, diffuse line — not needed if VT sees it.', 'Apparaît en ligne large et diffuse — inutile si le VT le voit.']], MT: [1, ['Broad accumulation at the toe.', 'Accumulation large au pied.']], UT: [1, ['Echo from the toe that moves with the surface; easy to confuse with geometry.', 'Écho du pied qui suit la surface ; facile à confondre avec la géométrie.']], RT: [2, ['Dark irregular line along the edge of the weld image.', 'Ligne sombre irrégulière le long du bord de l’image de la soudure.']] } },
    lamination: { n: ['Lamination (in the plate)', 'Dédoublure (dans la tôle)'], ut: 'lamination', rt: null, surf: false,
      d: ['A flat separation in the rolled plate, parallel to its surface, coming from the steel mill (not from welding).', 'Une séparation plane dans la tôle laminée, parallèle à sa surface, venant de l’aciérie (pas du soudage).'],
      c: ['Inclusions or shrinkage in the ingot flattened by rolling.', 'Inclusions ou retassures du lingot aplaties par le laminage.'],
      m: { VT: [1, ['Only at a cut plate edge.', 'Seulement sur une rive de tôle découpée.']], PT: [1, ['Only at a plate edge or bevel face.', 'Seulement sur une rive ou une face de chanfrein.']], MT: [1, ['Only at a plate edge or bevel face.', 'Seulement sur une rive ou une face de chanfrein.']], UT: [2, ['Ideal for a 0° probe: an echo before the back wall, and the back-wall echo drops.', 'Idéal pour un traducteur 0° : un écho avant le fond, et l’écho de fond chute.']], RT: [0, ['Parallel to the film: almost no change in thickness along the beam, so nothing shows.', 'Parallèle au film : presque aucune variation d’épaisseur traversée, donc rien n’apparaît.']] } }
  };
  const KEYS = Object.keys(DEF);

  // 3D part descriptions (click in the viewer)
  function parts() {
    if (!window.CY3 || !window.CY3.addParts) return;
    const p = { 'cp-plate': ['Base metal plate', 'Tôle (métal de base)', 'Rolled steel plate, 12–20 mm in a real joint (schematic here).', 'Tôle d’acier laminée, 12–20 mm dans un vrai assemblage (schématique ici).'], 'cp-weld': ['Weld metal', 'Métal fondu', 'V-groove butt weld: root at the bottom, cap on top, side walls along the bevels.', 'Soudure bout à bout en V : racine en bas, chapeau en haut, bords le long des chanfreins.'] };
    KEYS.forEach((k) => { p['cp-' + k] = [DEF[k].n[0], DEF[k].n[1], DEF[k].d[0], DEF[k].d[1]]; });
    window.CY3.addParts(p);
  }

  /* ---------- 3D scene ---------- */
  function scene(state) {
    return {
      cam: { d: 3.6, y: 0.42, p: 0.32, t: [0, 0.3, 0] }, // faces the cross-section (camera on the +z side, where ✂ cuts)
      ph: [[T2(DEF[state.key].n), T2(DEF[state.key].n), 1000, '']],
      draw(r, T) {
        const a = state.xray ? 0.26 : 1, steel = [158, 165, 175], weldC = [182, 176, 160], dark = [18, 18, 22];
        r.M(state.xray && r.gl ? 'ghost' : 'steel');
        // plates (thickness 0.6 along y, length along z, joint along x = 0)
        r.part('cp-plate'); r.box([-0.95, 0.3, 0], [1.5, 0.6, 3.2], steel, null, a); r.box([0.95, 0.3, 0], [1.5, 0.6, 3.2], steel, null, a);
        // weld: stacked layers filling the V (width grows with height), cap reinforcement and root bead
        r.part('cp-weld'); r.M(state.xray && r.gl ? 'ghost' : 'cast');
        for (let k = 0; k < 6; k++) { const y = 0.05 + k * 0.1, w = 0.14 + (y / 0.6) * 0.6; r.box([0, y, 0], [w, 0.1, 3.2], weldC, null, a); }
        r.box([0, 0.64, 0], [0.8, 0.08, 3.2], weldC, null, a); r.cyl([0.4, 0.62, 0], 0.035, 3.2, weldC, [PI / 2, 0, 0], 10, null, a); r.cyl([-0.4, 0.62, 0], 0.035, 3.2, weldC, [PI / 2, 0, 0], 10, null, a);
        if (state.key !== 'ip') r.box([0, -0.02, 0], [0.2, 0.05, 3.2], weldC, null, a);
        for (let z = -1.5; z <= 1.5; z += 0.1) r.box([0, 0.685, z], [0.74, 0.018, 0.035], [196, 190, 172], null, a); // cap ripples
        // defect
        r.part('cp-' + state.key); r.M('ink'); drawDefect(r, state.key, dark, T);
        r.part(null); r.M(null);
        if (state.method) drawMethod(r, state, T);
        r.txt([-0.95, 0.85, 1.4], L('base metal', 'métal de base'), [200, 210, 225]); r.txt([0, 0.92, 1.4], L('weld', 'soudure'), [255, 225, 150]);
      }
    };
  }
  function seeded(n) { let s = n; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  function drawDefect(r, k, c, T) {
    if (k === 'crack') { const rnd = seeded(7); for (let z = -0.9; z < 0.9; z += 0.12) { const x = 0.385 + (rnd() - 0.5) * 0.03, d = 0.12 + rnd() * 0.1; r.box([x, 0.62 - d / 2, z], [0.018, d, 0.13], c, [0, 0, (rnd() - 0.5) * 0.4]); } }
    else if (k === 'lof') { r.box([0.2, 0.32, 0], [0.035, 0.34, 1.6], c, [0, 0, -BEV]); }
    else if (k === 'ip') { r.box([0, 0.06, 0], [0.05, 0.13, 2.2], c); }
    else if (k === 'pore') { const rnd = seeded(31); for (let i = 0; i < 26; i++) r.sph([(rnd() - 0.5) * 0.24, 0.25 + rnd() * 0.22, (rnd() - 0.5) * 1.4], 0.018 + rnd() * 0.03, [30, 30, 36]); }
    else if (k === 'slag') { const rnd = seeded(11); for (let i = 0; i < 4; i++) r.box([-0.17 + (rnd() - 0.5) * 0.04, 0.3 + (rnd() - 0.5) * 0.08, -0.9 + i * 0.5 + rnd() * 0.1], [0.05 + rnd() * 0.03, 0.035 + rnd() * 0.02, 0.22 + rnd() * 0.2], [70, 60, 52], [rnd() * 0.3, 0, rnd() * 0.5]); }
    else if (k === 'undercut') { r.cyl([0.43, 0.6, 0], 0.045, 2.0, c, [PI / 2, 0, 0], 12); }
    else if (k === 'lamination') { r.box([-1.0, 0.3, 0], [0.9, 0.028, 1.4], c); }
  }
  // where each defect sits (for beams / shadows)
  const SPOT = { crack: [0.385, 0.52], lof: [0.2, 0.32], ip: [0, 0.06], pore: [0, 0.36], slag: [-0.17, 0.3], undercut: [0.43, 0.6], lamination: [-1.0, 0.3] };
  function drawMethod(r, st, T) {
    const m = st.method, k = st.key, [sx, sy] = SPOT[k], D = DEF[k], score = D.m[m][0], Y = [255, 225, 77], R = [230, 60, 70], B = [80, 160, 255];
    if (m === 'UT') {
      if (k === 'lamination') { r.box([-1.0, 0.68, 0], [0.25, 0.14, 0.25], [60, 120, 210]); r.ln([-1.0, 0.6, 0], [-1.0, 0.31, 0], Y, 3, 0.95); r.txt([-1.0, 0.95, 0], L('0° probe', 'traducteur 0°'), Y); return; }
      // 60° angle probe on the left plate. Deep reflectors: first leg (straight down to the defect).
      // Reflectors near the top surface: second leg (down to the back wall, bounce, up to the defect).
      const tn = Math.tan(PI / 3), pz = 0, second = sy > 0.45; // drawn on the section plane (z = 0) so it shows when cut
      const px = second ? sx - (0.6 + sy) * tn : sx - (0.6 - sy) * tn;
      const path = second ? [[px, 0.6, pz], [px + 0.6 * tn, 0, pz], [sx, sy, pz]] : [[px, 0.6, pz], [sx, sy, pz]];
      r.box([px - 0.12, 0.68, pz], [0.3, 0.14, 0.24], [60, 120, 210]);
      r.path(path, Y, 3, 0.95);
      // pulse travelling along the beam
      const seg = path.length - 1, u = ((T * 0.8) % 1) * seg, i = Math.min(seg - 1, Math.floor(u)), t = u - i, A = path[i], Bp = path[i + 1];
      r.sph([A[0] + (Bp[0] - A[0]) * t, A[1] + (Bp[1] - A[1]) * t, pz], 0.03, Y);
      r.txt([px - 0.12, 0.98, pz], L('60° angle probe', 'traducteur d’angle 60°') + (second ? L(' · 2nd leg', ' · 2e parcours') : ''), Y);
    } else if (m === 'RT') {
      r.sph([sx, 2.3, 0], 0.06, Y); for (let i = -2; i <= 2; i++) r.ln([sx, 2.3, 0], [sx + i * 0.35, -0.12, i * 0.25], Y, 1, 0.5);
      r.box([0, -0.14, 0], [3.4, 0.02, 3.2], [40, 40, 46]);
      if (score > 0 && D.rt) { const w = k === 'pore' ? 0.3 : k === 'lamination' ? 0 : 0.08; r.box([sx * 1.05, -0.125, 0], [Math.max(0.04, w), 0.012, k === 'pore' ? 1.4 : 1.6], [8, 8, 10]); }
      r.txt([sx, 2.5, 0], L('source', 'source'), Y); r.txt([1.4, -0.05, 1.5], L('film', 'film'), [210, 210, 210]);
    } else if (m === 'MT') {
      for (const s of [-1, 1]) r.box([s * 0.9, 0.95, 0.4], [0.16, 0.6, 0.2], R);
      r.box([0, 1.27, 0.4], [1.96, 0.14, 0.2], R);
      for (let i = 0; i < 5; i++) r.path([[-0.9, 0.62, 0.4 + (i - 2) * 0.08], [0, 0.66 + i * 0.01, 0.4 + (i - 2) * 0.08], [0.9, 0.62, 0.4 + (i - 2) * 0.08]], B, 1, 0.6);
      if (score > 0 && D.surf) for (let z = -0.8; z < 0.8; z += 0.05) r.sph([sx + Math.sin(z * 30) * 0.01, 0.635 + 0.008 * Math.sin(T * 4 + z * 9), z], 0.014, [20, 20, 20]);
    } else if (m === 'PT') {
      if (score > 0 && D.surf) { const sp = 0.03 + 0.03 * (0.5 + 0.5 * Math.sin(T)); r.box([sx, 0.665, 0], [sp * (k === 'undercut' ? 2.5 : 1), 0.006, 1.8], [210, 30, 40]); }
      r.box([0, 0.663, 0], [3.2, 0.004, 3.2], [245, 245, 240], null, 0.35);
    } else if (m === 'VT') {
      r.sph([1.2, 1.8, 1.4], 0.12, [230, 230, 235]); r.ln([1.2, 1.8, 1.4], [sx, 0.66, 0.2], [230, 230, 235], 1.5, 0.6);
      r.txt([1.2, 2.05, 1.4], L('eye ≤ 600 mm, ≥ 30°', 'œil ≤ 600 mm, ≥ 30°'), [230, 230, 235]);
    }
  }

  /* ---------- UI ---------- */
  const css = `
.cydf-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(280px, 1fr); gap: 16px; }
.cydf-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; } .cydf-list button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cydf-m { display: grid; grid-template-columns: 48px 66px 1fr; gap: 6px; align-items: start; padding: 6px 0; border-top: 1px solid rgba(52,74,131,.5); font-size: 13px; }
.cydf-m button { padding: 4px 6px; } .cydf-m button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cydf-dots { letter-spacing: 2px; font-weight: 800; } .cydf-dots.g2 { color: #42c991; } .cydf-dots.g1 { color: #e0a526; } .cydf-dots.g0 { color: #e66b78; }
.cydf-img { width: 100%; height: 150px; display: block; border-radius: 8px; border: 1px solid var(--line); margin: 6px 0; background: #03140d; }
.cydf-cmp { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 860px) { .cydf-layout, .cydf-cmp { grid-template-columns: minmax(0, 1fr); } }
`;
  let ui = null, st = null, cmp = null;
  function open(key) {
    if (!window.CYLAB) return; parts();
    if (!document.getElementById('cydf-css')) { const s = document.createElement('style'); s.id = 'cydf-css'; s.textContent = css; document.head.appendChild(s); }
    st = { key: DEF[key] ? key : 'crack', xray: false, method: null }; cmp = null;
    ui = window.CYLAB.shell({ cls: 'cydf', title: '🔬 ' + L('3D defect lab', 'Labo 3D des défauts'), sub: L('Schematic educational models — rotate, cut, see through, and see how each method reveals them', 'Modèles pédagogiques schématiques — tourner, couper, voir à travers, et voir comment chaque méthode les révèle') });
    ui.body.addEventListener('click', onClick); ui.body.addEventListener('change', onChange);
    draw();
  }
  const dots = (n) => `<span class="cydf-dots g${n}">${'●'.repeat(n + 1)}${'○'.repeat(2 - n)}</span>`;
  function viewerBlock(id) { return `<div class="cydf-v" data-v="${id}">${window.CY3 && window.CY3.viewerMarkup ? window.CY3.viewerMarkup().replace('</div><div class="cy3bar">', '</div><div class="cy3bar"><button type="button" data-df-xray="' + id + '">👻 ' + L('X-ray', 'Rayons X') + '</button>') : ''}</div>`; }
  function draw() {
    const D = DEF[st.key];
    ui.body.innerHTML = `<div class="cydf-list">${KEYS.map((k) => `<button type="button" data-df="${k}" class="${k === st.key ? 'on' : ''}">${esc(T2(DEF[k].n))}</button>`).join('')}</div>
${cmp ? compareHtml() : `<div class="cydf-layout"><div>${viewerBlock('a')}<p class="cylab-note">${L('Drag to rotate · wheel/pinch to zoom · ✂ Section cuts through the weld · 👻 X-ray makes the metal transparent · click the defect.', 'Glisser pour tourner · molette/pincer pour zoomer · ✂ Coupe traverse la soudure · 👻 Rayons X rend le métal transparent · cliquez le défaut.')}</p></div>
<div><h2 style="margin:0 0 6px">${esc(T2(D.n))}</h2><p>${esc(T2(D.d))}</p><p><b>${L('Typical causes', 'Causes typiques')}:</b> ${esc(T2(D.c))}</p>
<h3>${L('How each method may reveal it', 'Comment chaque méthode peut le révéler')}</h3>
${METHODS.map((m) => `<div class="cydf-m"><button type="button" data-df-m="${m}" class="${st.method === m ? 'on' : ''}" title="${L('Show in 3D', 'Montrer en 3D')}">${m}</button>${dots(D.m[m][0])}<span>${esc(T2(D.m[m][1]))}</span></div>`).join('')}
<p class="cylab-note">●●● ${L('good', 'bonne')} · ●●○ ${L('possible / depends', 'possible / selon le cas')} · ●○○ ${L('not expected', 'peu probable')} — ${L('general training guidance; real capability depends on procedure, orientation, size and operator.', 'repère de formation général ; la capacité réelle dépend de la procédure, de l’orientation, de la taille et de l’opérateur.')}</p>
${D.ut ? `<h3>📟 ${L('On the UT flaw detector', 'Sur le détecteur UT')}</h3><canvas class="cydf-img" data-df-ut></canvas>` : ''}${D.rt ? `<h3>🎞 ${L('On radiographic film', 'Sur film radiographique')}</h3><canvas class="cydf-img" data-df-rt></canvas>` : ''}
<p><button type="button" data-df-cmp="1">⚖ ${L('Compare with another defect', 'Comparer avec un autre défaut')}</button> <button type="button" data-df-ai="1">🧒 ${L('Explain this defect (AI tutor)', 'Expliquer ce défaut (tuteur IA)')}</button></p></div></div>`}`;
    mountViewer('a', st);
    if (cmp) mountViewer('b', cmp);
    requestAnimationFrame(() => {
      const u = ui.body.querySelector('[data-df-ut]'), rt = ui.body.querySelector('[data-df-rt]');
      try { if (u && window.CYUTSIM) window.CYUTSIM.signature(u, D.ut, 'reject'); if (rt && window.CYRTSIM) window.CYRTSIM.drawPatch(rt, D.rt, 'reject'); } catch (e) { console.error(e); }
    });
    window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id: 'defect3d:' + st.key } }));
  }
  function mountViewer(id, state) {
    const v = ui.body.querySelector(`[data-v="${id}"]`); if (!v || !window.CY3 || !window.CY3.viewer) return;
    try { window.CY3.viewer(v, 'OTH', scene(state)); } catch (e) { console.error(e); }
  }
  function compareHtml() {
    const A = DEF[st.key], B = DEF[cmp.key];
    return `<div class="cydf-cmp"><div>${viewerBlock('a')}<h3>${esc(T2(A.n))}</h3></div><div>${viewerBlock('b')}<h3><select data-df-cmpkey style="font:inherit;background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:6px">${KEYS.filter((k) => k !== st.key).map((k) => `<option value="${k}" ${k === cmp.key ? 'selected' : ''}>${esc(T2(DEF[k].n))}</option>`).join('')}</select></h3></div></div>
<table class="cytw-spec" style="width:100%;border-collapse:collapse;font-size:13px;margin-top:10px"><tr><td></td><td><b>${esc(T2(A.n))}</b></td><td><b>${esc(T2(B.n))}</b></td></tr>${METHODS.map((m) => `<tr><td><b>${m}</b></td><td>${dots(A.m[m][0])} ${esc(T2(A.m[m][1]))}</td><td>${dots(B.m[m][0])} ${esc(T2(B.m[m][1]))}</td></tr>`).join('')}
<tr><td><b>${L('Shape', 'Forme')}</b></td><td>${esc(T2(A.d))}</td><td>${esc(T2(B.d))}</td></tr></table>
<p><button type="button" data-df-cmp="0">← ${L('Back to the single view', 'Retour à la vue simple')}</button></p>`;
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.df) { st = { key: d.df, xray: st.xray, method: null }; if (cmp && cmp.key === d.df) cmp.key = KEYS.find((k) => k !== d.df); return draw(); }
    if (d.dfM) {
      st.method = st.method === d.dfM ? null : d.dfM; ui.body.querySelectorAll('[data-df-m]').forEach((x) => x.classList.toggle('on', x.dataset.dfM === st.method));
      // volumetric methods are shown on the cut plane: switch the section on so the beam / shadow is visible
      const sec = ui.body.querySelector('[data-v="a"] [data-a="sec"]'); if (st.method && (st.method === 'UT' || st.method === 'RT') && sec && !sec.classList.contains('on')) sec.click();
      return;
    }
    if (d.dfXray) { const s = d.dfXray === 'a' ? st : cmp; s.xray = !s.xray; b.classList.toggle('on', s.xray); return; }
    if (d.dfCmp) { cmp = d.dfCmp === '1' ? { key: KEYS.find((k) => k !== st.key), xray: st.xray, method: null } : null; return draw(); }
    if (d.dfAi) { ui.close(); if (window.CY3 && window.CY3.beginner) window.CY3.beginner(L('Explain this weld discontinuity for a beginner: what it is, why it forms, why it matters, and which NDT methods find it best and why: ', 'Explique cette discontinuité de soudure pour un débutant : ce que c’est, pourquoi elle se forme, pourquoi c’est important, et quelles méthodes CND la trouvent le mieux et pourquoi : ') + T2(DEF[st.key].n)); }
  }
  function onChange(e) { if (e.target.matches('[data-df-cmpkey]')) { cmp = { key: e.target.value, xray: cmp ? cmp.xray : false, method: null }; draw(); } }
  window.CYDEF = { open, DEF };
  if (window.CYLAB) window.CYLAB.register({ icon: '🔬', available: () => true, open: () => open('crack'), title: () => L('3D defect lab', 'Labo 3D des défauts'), desc: () => L('7 weld and plate discontinuities in 3D: section and X-ray views, how UT, RT, MT, PT and VT reveal each one, A-scan and film images, side-by-side comparison.', '7 discontinuités de soudure et de tôle en 3D : coupe et rayons X, comment UT, RT, MT, PT et VT révèlent chacune, images A-scan et film, comparaison côte à côte.') });
}());
