/* CYCLOPS: UT flaw detector simulator (training only).
   Injected under the UT method page. Simplified A-scan model of a single-V butt weld:
   angle or 0° probe, gain, range, gate, DAC, probe movement, echo dynamics, defect library
   with a rejected / not rejected case per indication type, and a scored training exercise.
   It is NOT a calibrated instrument and the acceptance rules are training rules to verify
   against the current code edition and the applicable AQCS procedure. */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (pair) => (Array.isArray(pair) ? L(pair[0], pair[1]) : pair);
  const TAN30 = Math.tan(Math.PI / 6);
  const rad = (d) => d * Math.PI / 180;
  const toDb = (r) => 20 * Math.log10(Math.max(r, 1e-6));
  const fromDb = (d) => Math.pow(10, d / 20);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  // learning progress for the Academy (cyclops-academy.js)
  const learn = (id, extra) => window.dispatchEvent(new CustomEvent('cy-learn', { detail: Object.assign({ id }, extra) }));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function erf(x) { // Abramowitz & Stegun 7.1.26
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
  }

  // ---------- Instrument model ----------
  const REF_GAIN = 42;                         // gain that puts the reference reflector on the DAC
  const EVAL_DB = -14;                         // 20 % DAC evaluation level
  const dac = (s) => 48 * Math.exp(-s / 120);  // DAC (% FSH at reference gain) vs sound path
  const lengthLimit = (T) => (T < 19 ? 6 : T <= 57 ? T / 3 : 19);
  // Materials for the Explore mode: longitudinal / shear velocity (m/s) and an illustrative attenuation (dB per 100 mm sound path).
  const MATERIALS = {
    steel: { n: ['Carbon steel', 'Acier au carbone'], vl: 5920, vs: 3240, att: 0 },
    stainless: { n: ['Austenitic stainless (weld)', 'Inox austénitique (soudure)'], vl: 5740, vs: 3100, att: 6 },
    aluminium: { n: ['Aluminium', 'Aluminium'], vl: 6320, vs: 3130, att: 0 },
    castiron: { n: ['Grey cast iron', 'Fonte grise'], vl: 4600, vs: 2600, att: 15 },
    copper: { n: ['Copper', 'Cuivre'], vl: 4660, vs: 2260, att: 2 }
  };
  const STEEL_VS = 3240, STEEL_VL = 5920;
  const vMat = (s) => (s.angle === 0 ? MATERIALS[s.mat || 'steel'].vl : MATERIALS[s.mat || 'steel'].vs);
  const vCal = (s) => s.vInst || (s.angle === 0 ? STEEL_VL : STEEL_VS);   // velocity the instrument was calibrated with
  const pathScale = (s) => vCal(s) / vMat(s);                             // displayed sound path ÷ true sound path
  // Real refracted angle (Snell's law): the wedge is designed to give the nominal angle in steel.
  function actualAngle(s) {
    if (s.angle === 0) return 0;
    const k = Math.sin(rad(s.angle)) * MATERIALS[s.mat || 'steel'].vs / STEEL_VS;
    return k >= 1 ? null : Math.asin(k);
  }
  // attenuation values are given at the nominal 4 MHz; scattering grows with frequency (illustrative linear model)
  const attFactor = (s, S) => fromDb(-(MATERIALS[s.mat || 'steel'].att) * ((s.freq || 4) / 4) * S / 100);
  const fScale = (s) => 4 / (s.freq || 4); // pulse length scales with the period (1/f)
  const bevelX = (T, z) => 1 + (T - z) * TAN30; // single-V 60°, 2 mm root gap: fusion face position

  // ---------- Indication library ----------
  // dB = amplitude relative to DAC at the echo peak (optimum angle, probe centred on the flaw).
  const TYPES = {
    crack: {
      cls: 'planar', shape: 'crack', opt: 60, spread: 25,
      name: ['Crack', 'Fissure'],
      short: ['Jagged, multi-peak echo that "walks"', 'Écho dentelé à plusieurs pics qui « marche »'],
      look: [
        ['Sharp, jagged echo made of several peaks close together (one per crack facet).', 'Écho net et dentelé, composé de plusieurs pics rapprochés (un par facette de la fissure).'],
        ['Peaks rise and fall independently when the probe moves or swivels: the echo "walks" along the time base.', 'Les pics montent et descendent indépendamment quand on déplace ou pivote le palpeur : l’écho « marche » sur la base de temps.'],
        ['Small tip-diffraction signals can appear just before and after the main echo (crack ends).', 'De petits signaux de diffraction peuvent apparaître juste avant et après l’écho principal (extrémités de la fissure).'],
        ['Echo dynamics: irregular curve with several maxima.', 'Dynamique d’écho : courbe irrégulière avec plusieurs maxima.']
      ],
      tip: ['Check with a second angle (45° / 70°): a crack changes a lot, a pore hardly changes.', 'Vérifiez avec un second angle (45° / 70°) : une fissure varie beaucoup, un pore très peu.'],
      cases: {
        reject: { T: 20, x: 0.4, z: 11, h: 5, L: 18, dB: 4 },
        accept: { T: 20, x: 0.4, z: 11, h: 1.5, L: 4, dB: -18,
          note: ['If the echo shape looks like a crack, inform the Level 2/3 even below 20 % DAC: many procedures still require it to be reported.', 'Si la forme de l’écho évoque une fissure, informez le niveau 2/3 même sous 20 % DAC : beaucoup de procédures exigent quand même de la signaler.'] }
      }
    },
    lof: {
      cls: 'planar', shape: 'lof', opt: 60, spread: 6,
      name: ['Lack of side-wall fusion', 'Manque de fusion (paroi)'],
      short: ['Single sharp, very high echo, angle-sensitive', 'Écho unique, net, très haut, sensible à l’angle'],
      look: [
        ['One clean, sharp, high echo with a steep rise and fall.', 'Un seul écho propre, net et élevé, avec une montée et une descente rapides.'],
        ['Very strong when the beam is perpendicular to the bevel (60° for a 60° V), drops quickly at 45° or 70°.', 'Très fort quand le faisceau est perpendiculaire au chanfrein (60° pour un V à 60°), chute vite à 45° ou 70°.'],
        ['Plots on the fusion line (bevel face), not in the weld centre.', 'Se positionne sur la ligne de fusion (face du chanfrein), pas au centre de la soudure.'],
        ['Echo dynamics: one smooth, narrow peak.', 'Dynamique d’écho : un seul pic lisse et étroit.']
      ],
      tip: ['Plot the reflector: if it sits exactly on the bevel line, suspect lack of fusion.', 'Positionnez le réflecteur : s’il est exactement sur la ligne du chanfrein, suspectez un manque de fusion.'],
      cases: {
        reject: { T: 20, side: 1, z: 10, h: 6, L: 20, dB: 2 },
        accept: { T: 20, side: 1, z: 10, h: 2, L: 5, dB: -18 }
      }
    },
    ip: {
      cls: 'planar', shape: 'ip', opt: 55, spread: 25,
      name: ['Incomplete root penetration', 'Manque de pénétration'],
      short: ['Strong corner echo at full thickness', 'Écho de coin fort à l’épaisseur totale'],
      look: [
        ['Strong, sharp echo at the end of the first leg (depth = thickness).', 'Écho fort et net en fin de premier parcours (profondeur = épaisseur).'],
        ['Plots on the root face on the probe side, just before the weld centre line.', 'Se positionne sur le talon côté palpeur, juste avant l’axe de la soudure.'],
        ['Seen from both sides of the weld, often continuous along the weld.', 'Visible des deux côtés de la soudure, souvent continu le long du cordon.']
      ],
      tip: ['Root bead echoes plot at or beyond the centre line; incomplete penetration plots before it.', 'Les échos de pénétration (géométrie) se placent sur ou au-delà de l’axe ; le manque de pénétration se place avant.'],
      cases: {
        reject: { T: 20, x: -1, z: 18.5, h: 3, L: 25, dB: 3 },
        accept: { T: 20, x: -1, z: 19.5, h: 1, L: 6, dB: -17 }
      }
    },
    pore: {
      cls: 'volumetric', shape: 'pore', opt: 60, spread: 1e9,
      name: ['Porosity (single pore)', 'Soufflure (pore isolé)'],
      short: ['Low, narrow, rounded echo', 'Écho bas, étroit et arrondi'],
      look: [
        ['Single narrow echo with a rounded top, usually low amplitude.', 'Écho unique et étroit au sommet arrondi, généralement de faible amplitude.'],
        ['Almost the same amplitude from any angle or direction (spherical reflector).', 'Presque la même amplitude quel que soit l’angle ou la direction (réflecteur sphérique).'],
        ['Disappears quickly when the probe moves along the weld (short length).', 'Disparaît vite quand on déplace le palpeur le long de la soudure (faible longueur).'],
        ['Echo dynamics: one smooth bell curve.', 'Dynamique d’écho : une seule courbe en cloche, lisse.']
      ],
      tip: ['A long pore (wormhole / piping) behaves like a pore but keeps its echo over a length.', 'Une soufflure allongée (vermiculaire) se comporte comme un pore mais garde son écho sur une longueur.'],
      cases: {
        reject: { T: 20, x: 0, z: 9, L: 10, dB: 2, label: ['Elongated pore (wormhole), longer than the limit', 'Soufflure allongée (vermiculaire), plus longue que la limite'] },
        accept: { T: 20, x: 0, z: 9, L: 2, dB: 4 }
      }
    },
    cluster: {
      cls: 'volumetric', shape: 'cluster', opt: 60, spread: 1e9,
      name: ['Cluster porosity', 'Nid de soufflures'],
      short: ['Group of small flickering echoes', 'Groupe de petits échos qui scintillent'],
      look: [
        ['Several small echoes side by side on the time base, each low amplitude.', 'Plusieurs petits échos côte à côte sur la base de temps, chacun de faible amplitude.'],
        ['The echoes flicker and swap heights as the probe moves.', 'Les échos scintillent et changent de hauteur quand le palpeur bouge.'],
        ['Similar response from all angles.', 'Réponse similaire quel que soit l’angle.']
      ],
      tip: ['Measure the length of the whole group, not of each pore.', 'Mesurez la longueur de l’ensemble du groupe, pas de chaque pore.'],
      cases: {
        reject: { T: 20, x: -0.5, z: 8, L: 12, dB: 1 },
        accept: { T: 20, x: -0.5, z: 8, L: 15, dB: -5 }
      }
    },
    slag: {
      cls: 'volumetric', shape: 'slag', opt: 60, spread: 1e9,
      name: ['Slag inclusion', 'Inclusion de laitier'],
      short: ['Broad, irregular, medium echo', 'Écho large, irrégulier, moyen'],
      look: [
        ['Broader echo with a rough, irregular top (two or three lobes).', 'Écho plus large au sommet rugueux et irrégulier (deux ou trois lobes).'],
        ['Medium amplitude; changes moderately with angle.', 'Amplitude moyenne ; varie modérément avec l’angle.'],
        ['Often between passes or at the side of a pass; elongated slag gives a measurable length.', 'Souvent entre passes ou en bord de passe ; un laitier allongé donne une longueur mesurable.']
      ],
      tip: ['Rougher than a pore, less angle-sensitive than lack of fusion.', 'Plus rugueux qu’un pore, moins sensible à l’angle qu’un manque de fusion.'],
      cases: {
        reject: { T: 20, x: -2, z: 13, L: 12, dB: 3 },
        accept: { T: 20, x: -2, z: 13, L: 5, dB: 2 }
      }
    },
    rootgeom: {
      cls: 'geometry', shape: 'geom', opt: 60, spread: 1e9,
      name: ['Root geometry (non-relevant)', 'Géométrie de racine (non pertinente)'],
      short: ['Continuous echo plotting on the root bead', 'Écho continu positionné sur la pénétration'],
      look: [
        ['Echo at about full thickness, present all along the weld at a nearly constant height.', 'Écho à environ l’épaisseur totale, présent tout le long de la soudure avec une hauteur presque constante.'],
        ['Plots on the root bead (at or beyond the centre line), outside the weld metal.', 'Se positionne sur la pénétration (sur ou au-delà de l’axe), hors du métal fondu.'],
        ['Seen from the other side of the weld, it moves to the other root toe.', 'Vu de l’autre côté de la soudure, il passe à l’autre pied de racine.']
      ],
      tip: ['Always plot root echoes before calling them geometry. A visual check of the root confirms it.', 'Positionnez toujours les échos de racine avant de conclure à la géométrie. Un contrôle visuel de la racine le confirme.'],
      cases: {
        reject: { T: 20, x: -1, z: 18.5, h: 3, L: 25, dB: 3, as: 'ip', label: ['Looked like root geometry, but plots on the root face: incomplete penetration', 'Ressemblait à la géométrie, mais se place sur le talon : manque de pénétration'] },
        accept: { T: 20, x: 1.8, z: 20, L: 100, dB: 4 }
      }
    },
    undercut: {
      cls: 'surface', shape: 'undercut', opt: 60, spread: 1e9,
      name: ['Undercut', 'Caniveau'],
      short: ['Echo at the cap toe at the end of the 2nd leg', 'Écho au pied de cordon en fin de 2e parcours'],
      look: [
        ['Echo at the end of the second leg (sound path ≈ 2 × thickness / cos θ), at the surface.', 'Écho en fin de second parcours (parcours ≈ 2 × épaisseur / cos θ), en surface.'],
        ['Plots at the toe of the cap on the far side.', 'Se positionne au pied de la passe de finition, côté opposé.'],
        ['Moves with surface condition; touching the toe with a wet finger damps it.', 'Varie avec l’état de surface ; toucher le pied avec un doigt mouillé l’atténue.']
      ],
      tip: ['Undercut is judged by visual testing (depth gauge), not by UT amplitude.', 'Le caniveau se juge par contrôle visuel (jauge de profondeur), pas par l’amplitude UT.'],
      cases: {
        reject: { T: 20, z: 0.6, h: 1.2, L: 15, dB: 5, vt: 1.5 },
        accept: { T: 20, z: 0.3, h: 0.6, L: 15, dB: 0, vt: 0.5 }
      }
    },
    lamination: {
      cls: 'lamination', shape: 'lam', opt: 0, spread: 1e9, probe: 0,
      name: ['Lamination (parent plate, 0° probe)', 'Dédoublure (tôle, palpeur 0°)'],
      short: ['Echo at mid-wall, back wall drops or disappears', 'Écho à mi-paroi, l’écho de fond baisse ou disparaît'],
      look: [
        ['With a 0° probe: a sharp echo appears between the surface and the back wall, with its own repeats.', 'Avec un palpeur 0° : un écho net apparaît entre la surface et le fond, avec ses propres répétitions.'],
        ['The back-wall echo drops, or disappears completely over the laminated area.', 'L’écho de fond baisse, ou disparaît complètement sur la zone dédoublée.'],
        ['Parallel to the surface: an angle probe hardly sees it. Scan the parent plate with 0° before angle-beam testing.', 'Parallèle à la surface : un palpeur d’angle la voit à peine. Contrôlez la tôle au 0° avant le contrôle en angle.']
      ],
      tip: ['Map the area where the back wall is completely lost, then compare with the size limit.', 'Cartographiez la zone de perte totale du fond, puis comparez avec la limite de dimension.'],
      cases: {
        reject: { T: 20, z: 9, x1: -100, x2: -10, y1: 5, y2: 95 },
        accept: { T: 20, z: 9, x1: -70, x2: -52, y1: 41, y2: 59 }
      }
    }
  };
  // ---------- Guided DAC construction (basic calibration block, side-drilled holes at T/4, T/2, 3T/4) ----------
  const CAL_T = 20;
  const DAC_STEPS = [
    { kind: 'info', title: ['Calibrate the time base and the probe', 'Étalonner la base de temps et le palpeur'],
      text: ['On the IIW (V1) block: set the sound velocity and the zero (probe delay) with the 100 mm radius echo, check the probe index point and measure the real beam angle. Set the range so that the screen covers at least the full second leg (here 100 mm sound path for t = 20 mm at 60°).',
        'Sur le bloc IIW (V1) : réglez la vitesse et le zéro (retard palpeur) avec l’écho du rayon de 100 mm, vérifiez le point d’émergence et mesurez l’angle réel. Réglez la base de temps pour couvrir au moins tout le deuxième parcours (ici 100 mm de parcours pour e = 20 mm à 60°).'] },
    { kind: 'info', title: ['Set up on the basic calibration block', 'Se placer sur le bloc d’étalonnage de base'],
      text: ['Use a block of the same material, similar thickness and surface finish as the part, with side-drilled holes at T/4, T/2 and 3T/4 (here t = 20 mm: holes at 5, 10 and 15 mm). Use the same couplant as on the part. The holes are shown in the cross-section: the dashed pink ring is the hole to find, the yellow ring shows where the echo on the screen comes from.',
        'Utilisez un bloc de même matériau, d’épaisseur et d’état de surface proches de la pièce, avec des trous génératrices à T/4, T/2 et 3T/4 (ici e = 20 mm : trous à 5, 10 et 15 mm). Utilisez le même couplant que sur la pièce. Les trous sont visibles sur la coupe : l’anneau rose en pointillés indique le trou à trouver, l’anneau jaune montre d’où vient l’écho affiché.'] },
    { kind: 'mark', z: CAL_T / 4, leg: 1, title: ['Point 1: T/4 hole, 1st leg (sets the reference gain)', 'Point 1 : trou à T/4, 1er parcours (fixe le gain de référence)'],
      text: ['Move the probe toward the block edge until the T/4 hole echo appears, then move slowly back and forth to get its maximum. Adjust the gain to bring that maximum to 80 % of full screen height (±5 %). This gain is the reference gain. Press "Mark point".',
        'Avancez le palpeur jusqu’à voir l’écho du trou à T/4, puis faites de petits va-et-vient pour obtenir son maximum. Réglez le gain pour amener ce maximum à 80 % de la hauteur d’écran (±5 %). Ce gain est le gain de référence. Appuyez sur « Marquer le point ».'] },
    { kind: 'mark', z: CAL_T / 2, leg: 1, title: ['Point 2: T/2 hole, 1st leg', 'Point 2 : trou à T/2, 1er parcours'],
      text: ['Do NOT change the gain any more. Move the probe back to find and peak the T/2 hole echo, then mark the top of the echo.', 'Ne touchez PLUS au gain. Reculez le palpeur pour trouver et maximiser l’écho du trou à T/2, puis marquez le sommet de l’écho.'] },
    { kind: 'mark', z: 3 * CAL_T / 4, leg: 1, title: ['Point 3: 3T/4 hole, 1st leg', 'Point 3 : trou à 3T/4, 1er parcours'],
      text: ['Same gain. Peak the 3T/4 hole echo and mark it.', 'Même gain. Maximisez l’écho du trou à 3T/4 et marquez-le.'] },
    { kind: 'mark', z: 3 * CAL_T / 4, leg: 2, title: ['Point 4: 3T/4 hole, 2nd leg', 'Point 4 : trou à 3T/4, 2e parcours'],
      text: ['Move further back. After the back-wall bounce the beam goes up again and reaches the 3T/4 hole a second time, at a longer sound path (about 5T/4 deep in the unfolded path). Peak it and mark it.',
        'Reculez encore. Après le rebond sur le fond, le faisceau remonte et atteint de nouveau le trou à 3T/4, avec un parcours plus long (environ 5T/4 en parcours déplié). Maximisez-le et marquez-le.'] },
    { kind: 'mark', z: CAL_T / 2, leg: 2, title: ['Point 5: T/2 hole, 2nd leg', 'Point 5 : trou à T/2, 2e parcours'],
      text: ['Continue backward: peak the T/2 hole on the second leg and mark it.', 'Continuez à reculer : maximisez le trou à T/2 au deuxième parcours et marquez-le.'] },
    { kind: 'mark', z: CAL_T / 4, leg: 2, title: ['Point 6: T/4 hole, 2nd leg', 'Point 6 : trou à T/4, 2e parcours'],
      text: ['Last point: the T/4 hole on the second leg. The DAC must cover the whole sound path used during the examination.', 'Dernier point : le trou à T/4 au deuxième parcours. La DAC doit couvrir tout le parcours utilisé pendant le contrôle.'] },
    { kind: 'info', title: ['Join the points: this is the DAC', 'Relier les points : c’est la DAC'],
      text: ['The marked points are joined by straight lines: this is the DAC (100 % reference level). The 50 % DAC (−6 dB) and 20 % DAC (−14 dB) curves are drawn under it. Record on the calibration sheet: instrument, probe, angle, block, couplant, reference gain and each point (sound path and amplitude).',
        'Les points marqués sont reliés par des segments : c’est la DAC (niveau de référence 100 %). Les courbes 50 % DAC (−6 dB) et 20 % DAC (−14 dB) sont tracées dessous. Notez sur la fiche d’étalonnage : appareil, palpeur, angle, bloc, couplant, gain de référence et chaque point (parcours et amplitude).'] },
    { kind: 'info', title: ['Transfer correction and scanning gain', 'Correction de transfert et gain de balayage'],
      text: ['Compare the coupling and attenuation between the block and the part (transfer correction) and add the difference to the reference gain if needed. Scan with at least +6 dB above the reference gain; evaluate and size indications at the reference gain.',
        'Comparez le couplage et l’atténuation entre le bloc et la pièce (correction de transfert) et ajoutez la différence au gain de référence si nécessaire. Balayez avec au moins +6 dB au-dessus du gain de référence ; évaluez et dimensionnez les indications au gain de référence.'] },
    { kind: 'info', title: ['Check the calibration during the work', 'Vérifier l’étalonnage pendant le travail'],
      text: ['Check at least one DAC point at the start and end of each examination, when the operator, probe, cable or instrument changes, and at least every 4 hours. If a point has dropped by more than 20 % (2 dB), void the examinations since the last good check and redo them. If it has risen by more than 20 %, re-evaluate the recorded indications. (Based on ASME V Article 4: verify the current edition and the AQCS procedure.)',
        'Vérifiez au moins un point de la DAC au début et à la fin de chaque contrôle, à chaque changement d’opérateur, de palpeur, de câble ou d’appareil, et au moins toutes les 4 heures. Si un point a baissé de plus de 20 % (2 dB), les contrôles depuis la dernière vérification correcte sont annulés et à refaire. S’il a augmenté de plus de 20 %, réévaluez les indications enregistrées. (D’après l’ASME V Article 4 : vérifiez l’édition en vigueur et la procédure AQCS.)'] }
  ];
  const holeLabel = (z, T) => (z === T / 4 ? 'T/4' : z === T / 2 ? 'T/2' : '3T/4');
  const stepS = (step, T, angle) => (step.leg === 1 ? step.z : 2 * T - step.z) / Math.cos(rad(angle));
  const marksBefore = (i) => DAC_STEPS.slice(0, i).filter((s) => s.kind === 'mark').length;
  function calBlock() {
    const T = CAL_T;
    return { key: 'cal', cls: 'cal', shape: 'sdh', T, x: 0, z: T / 2, holes: [T / 4, T / 2, 3 * T / 4], y1: 0, y2: 100, L: 100, dB: 0, opt: 60, spread: 1e9 };
  }

  const ORDER = ['crack', 'lof', 'ip', 'pore', 'cluster', 'slag', 'rootgeom', 'undercut', 'lamination'];
  const EXERCISE_TYPES = ['crack', 'lof', 'ip', 'pore', 'cluster', 'slag', 'rootgeom'];

  function makeDefect(key, caseKey, jitter) {
    const t = TYPES[key], c = t.cases[caseKey];
    const d = Object.assign({ key, caseKey, cls: t.cls, shape: t.shape, opt: t.opt, spread: t.spread, h: 2 }, c);
    if (c.as) { const real = TYPES[c.as]; Object.assign(d, { cls: real.cls, shape: real.shape, opt: real.opt, spread: real.spread }); }
    d.answer = c.as || key;
    if (t.shape === 'lof') d.x = d.side * bevelX(d.T, d.z);
    if (t.shape === 'undercut') d.x = bevelX(d.T, 0) + 1.5;
    if (jitter) {
      d.dB += (Math.random() * 2 - 1);
      if (d.L < 100) d.L = Math.round(d.L * (0.9 + Math.random() * 0.2) * 10) / 10;
    }
    if (d.cls !== 'lamination') {
      const center = jitter && d.L < 90 ? 10 + d.L / 2 + Math.random() * (80 - d.L) : 50;
      d.y1 = Math.max(0, center - d.L / 2); d.y2 = Math.min(100, center + d.L / 2);
    }
    return d;
  }

  // Training acceptance rule (ASME VIII Div.1 App. 12 style for welds, SA-578 Level A style for plate, UW-35 style for undercut).
  function evaluate(d) {
    const lim = lengthLimit(d.T);
    if (d.cls === 'lamination') {
      const size = Math.max(d.x2 - d.x1, d.y2 - d.y1), max = Math.max(75, d.T / 2);
      return size > max
        ? { reject: true, why: [`Total loss of back wall over about ${size} mm: cannot be contained in a ${max} mm circle.`, `Perte totale du fond sur environ ${size} mm : ne tient pas dans un cercle de ${max} mm.`] }
        : { reject: false, why: [`Laminated area about ${size} mm: fits in a ${max} mm circle.`, `Zone dédoublée d’environ ${size} mm : tient dans un cercle de ${max} mm.`] };
    }
    if (d.cls === 'surface') {
      const max = Math.min(0.8, d.T * 0.1);
      return d.vt > max
        ? { reject: true, why: [`Visual check: undercut ${d.vt} mm deep, more than the ${max} mm limit.`, `Contrôle visuel : caniveau de ${d.vt} mm, plus que la limite de ${max} mm.`] }
        : { reject: false, why: [`Visual check: undercut ${d.vt} mm deep, within the ${max} mm limit.`, `Contrôle visuel : caniveau de ${d.vt} mm, dans la limite de ${max} mm.`] };
    }
    if (d.cls === 'geometry') return { reject: false, why: ['Non-relevant geometric indication: it plots on the root bead, outside the weld metal.', 'Indication géométrique non pertinente : elle se place sur la pénétration, hors du métal fondu.'] };
    if (d.dB < EVAL_DB) return { reject: false, why: [`Echo ${d.dB.toFixed(0)} dB to DAC, below the 20 % DAC (−14 dB) evaluation level: no evaluation required.`, `Écho à ${d.dB.toFixed(0)} dB / DAC, sous le niveau d’évaluation de 20 % DAC (−14 dB) : pas d’évaluation requise.`] };
    if (d.cls === 'planar') return { reject: true, why: ['Crack, lack of fusion or incomplete penetration: unacceptable whatever the length.', 'Fissure, manque de fusion ou manque de pénétration : inacceptable quelle que soit la longueur.'] };
    const over = d.dB > 0, long = d.L > lim;
    if (over && long) return { reject: true, why: [`Above the reference level (+${d.dB.toFixed(0)} dB) and ${d.L} mm long, more than the ${lim.toFixed(1)} mm limit for t = ${d.T} mm.`, `Au-dessus du niveau de référence (+${d.dB.toFixed(0)} dB) et ${d.L} mm de long, plus que la limite de ${lim.toFixed(1)} mm pour e = ${d.T} mm.`] };
    if (!over) return { reject: false, why: [`Volumetric indication below the reference level (${d.dB.toFixed(0)} dB): acceptable whatever the length.`, `Indication volumique sous le niveau de référence (${d.dB.toFixed(0)} dB) : acceptable quelle que soit la longueur.`] };
    return { reject: false, why: [`Above the reference level but only ${d.L} mm long, within the ${lim.toFixed(1)} mm limit for t = ${d.T} mm.`, `Au-dessus du niveau de référence mais seulement ${d.L} mm de long, dans la limite de ${lim.toFixed(1)} mm pour e = ${d.T} mm.`] };
  }
  const RULE = {
    weld: ['Training rule based on ASME VIII Div.1 Appendix 12: investigate echoes above 20 % DAC; cracks, lack of fusion and incomplete penetration are rejected whatever the length; other indications are rejected when above the reference level (100 % DAC) and longer than 6 mm (t < 19 mm), t/3 (19–57 mm) or 19 mm (t > 57 mm).',
      'Règle de formation inspirée de l’ASME VIII Div.1 Annexe 12 : examiner les échos au-dessus de 20 % DAC ; fissures, manques de fusion et manques de pénétration sont refusés quelle que soit la longueur ; les autres indications sont refusées si elles dépassent le niveau de référence (100 % DAC) et sont plus longues que 6 mm (e < 19 mm), e/3 (19–57 mm) ou 19 mm (e > 57 mm).'],
    lamination: ['Training rule based on ASME SA-578 Level A: reject an area of total back-wall loss that cannot be contained in a 75 mm circle (or t/2 if larger).', 'Règle de formation inspirée de l’ASME SA-578 niveau A : refuser une zone de perte totale du fond qui ne tient pas dans un cercle de 75 mm (ou e/2 si plus grand).'],
    surface: ['Training rule based on ASME VIII UW-35: undercut depth not more than 0.8 mm or 10 % of the thickness, whichever is less. Measured by visual testing.', 'Règle de formation inspirée de l’ASME VIII UW-35 : profondeur de caniveau au plus 0,8 mm ou 10 % de l’épaisseur, la plus petite valeur. Mesurée par contrôle visuel.']
  };
  const ruleFor = (d) => RULE[d.cls === 'lamination' ? 'lamination' : d.cls === 'surface' ? 'surface' : 'weld'];

  // ---------- Physics (simplified) ----------
  const CLUSTER = [[0, 0], [1.2, -0.8], [-1, 0.9], [0.4, 1.6], [-1.5, -1.2], [1.8, 0.7], [-0.4, -1.7]];
  function facets(d, y, xp) {
    const f = [];
    if (d.shape === 'crack') {
      for (let i = 0; i < 5; i++) f.push({ x: d.x + (i % 2 ? 0.5 : -0.5) * Math.min(1, d.h / 3), z: d.z - d.h / 2 + i * d.h / 4, off: -7 * (0.5 + 0.5 * Math.sin(i * 2.3 + y * 0.9 + xp * 0.7)) });
      f.push({ x: d.x, z: d.z - d.h / 2 - 0.4, off: -18 }, { x: d.x, z: d.z + d.h / 2 + 0.4, off: -20 });
    } else if (d.shape === 'lof') {
      for (let i = -1; i <= 1; i++) { const dz = i * d.h / 3; f.push({ x: d.x - d.side * dz * TAN30, z: d.z + dz, off: 0 }); }
    } else if (d.shape === 'ip') {
      f.push({ x: d.x, z: d.z - d.h / 4, off: -2 }, { x: d.x, z: Math.min(d.T, d.z + d.h / 4), off: 0 });
    } else if (d.shape === 'cluster') {
      CLUSTER.forEach(([dx, dz], i) => f.push({ x: d.x + dx, z: d.z + dz, off: -2 - 6 * (0.5 + 0.5 * Math.sin(i * 1.7 + y * 1.3 + xp * 0.9)) }));
      f[0].off = Math.max(f[0].off, -1);
    } else if (d.shape === 'slag') {
      [[0, 0, 0], [0.9, 0.7, -3], [-0.8, -0.6, -4], [0.3, -1.1, -6]].forEach(([dx, dz, o], i) => f.push({ x: d.x + dx, z: d.z + dz, off: o - 1.5 * (0.5 + 0.5 * Math.sin(i + y * 0.5)) }));
      f[0].off = 0;
    } else if (d.shape === 'sdh') {
      d.holes.forEach((z) => f.push({ x: d.x, z, off: 0 }));
    } else if (d.shape === 'geom') {
      f.push({ x: d.x, z: d.T, off: 0 }, { x: d.x + 0.8, z: d.T, off: -4 });
    } else {
      f.push({ x: d.x, z: d.z, off: 0 });
    }
    return f;
  }

  // Echoes (sound path s, amplitude at reference gain, pulse width) for the current probe state.
  function echoes(st, d, opt) {
    // Physics uses the real angle and velocity of the material; positions on screen are what the
    // instrument shows: true sound path × (calibrated velocity ÷ real velocity).
    const out = [], th = actualAngle(st), T = st.T, k = pathScale(st), maxS = ((opt && opt.maxS) || st.range + 6) / k;
    if (st.angle === 0) {
      let cov = 0;
      if (d && d.cls === 'lamination') { const w = 4; cov = 0.25 * (erf((d.x2 - st.xp) / w) - erf((d.x1 - st.xp) / w)) * (erf((d.y2 - st.y) / w) - erf((d.y1 - st.y) / w)); }
      for (let n = 1; n * T <= maxS; n++) out.push({ s: n * T * k, a: 92 * Math.pow(0.62, n - 1) * (1 - 0.98 * cov) * attFactor(st, 2 * n * T), w: 0.8, bw: true });
      if (cov > 0.002) for (let n = 1; n * d.z <= maxS; n++) out.push({ s: n * d.z * k, a: 105 * Math.pow(0.55, n - 1) * cov * attFactor(st, 2 * n * d.z), w: 0.8 });
    }
    if (!d || d.cls === 'lamination' || th === null) return out;
    const ang = d.spread > 1e6 ? 1 : Math.exp(-Math.pow((th * 180 / Math.PI - d.opt) / d.spread, 2));
    for (const f of facets(d, st.y, st.xp)) {
      for (let n = 1; n <= 3; n++) {
        const D = (n - 1) * T + (n % 2 ? f.z : T - f.z);
        const S = D / Math.cos(th);
        if (S > maxS) break;
        const perp = Math.abs(f.x - st.xp - D * Math.tan(th)) * Math.cos(th);
        const w = 1.6 + 0.035 * S;
        const lat = Math.exp(-Math.pow(perp / w, 2));
        if (lat < 1e-4) continue;
        const sy = 0.85 * w;
        const cov = (0.5 * (erf((d.y2 - st.y) / sy) - erf((d.y1 - st.y) / sy))) / Math.max(1e-6, erf((d.y2 - d.y1) / 2 / sy));
        // small round reflectors (pores) scatter more energy back at higher frequency (shorter wavelength); illustrative
        const small = d.key === 'pore' || d.key === 'cluster' ? Math.min(1.6, Math.max(0.45, (st.freq || 4) / 4)) : 1;
        const a = dac(S) * fromDb(d.dB + f.off) * ang * lat * cov * (st.angle === 0 ? 0.35 : 1) * attFactor(st, 2 * S) * small;
        if (a > 0.03) out.push({ s: S * k, a, w: d.shape === 'slag' ? 1.3 : 0.85 });
      }
    }
    return out;
  }

  // Screen trace (reference-gain amplitudes, no noise) sampled at n points over 0..range.
  function trace(st, d, n) {
    const arr = new Float32Array(n), list = echoes(st, d), fs = fScale(st);
    for (let i = 0; i < n; i++) {
      const s = (i / (n - 1)) * st.range;
      let v = 0;
      if (st.angle === 0 && s < 2.5 * fs) v = 120 * (1 - s / (2.5 * fs));
      for (const e of list) {
        const u = (s - e.s) / (e.w * fs);
        if (u > -4 && u < 4) v = Math.max(v, e.a * Math.exp(-u * u) * (0.62 + 0.38 * Math.abs(Math.cos(Math.PI * (s - e.s) / (0.8 * fs)))));
      }
      arr[i] = v;
    }
    return arr;
  }

  function gatedPeak(st, arr) {
    const n = arr.length, i0 = Math.max(0, Math.floor(st.gateStart / st.range * (n - 1))), i1 = Math.min(n - 1, Math.ceil((st.gateStart + st.gateWidth) / st.range * (n - 1)));
    let best = -1, bi = -1;
    for (let i = i0; i <= i1; i++) if (arr[i] > best) { best = arr[i]; bi = i; }
    if (bi < 0) return null;
    const s = (bi / (n - 1)) * st.range;
    return { s, a: best };
  }

  function locate(st, s) {
    if (st.angle === 0) return { depth: s, surf: 0, x: st.xp, leg: 1 };
    const th = rad(st.angle), D = s * Math.cos(th), leg = Math.floor(D / st.T);
    const depth = leg % 2 === 0 ? D - leg * st.T : (leg + 1) * st.T - D;
    const surf = s * Math.sin(th);
    return { depth, surf, x: st.xp + surf, leg: leg + 1 };
  }

  function xpRange(st) {
    if (st.angle === 0) return [-110, -5];
    return [-Math.round(2 * st.T * Math.tan(rad(st.angle)) + 25), -5];
  }

  function defaultRange(st) {
    if (st.angle === 0) return Math.max(50, Math.ceil(st.T * 3.2 / 10) * 10);
    return Math.ceil((2.3 * st.T / Math.cos(rad(st.angle))) / 10) * 10;
  }

  // Move the probe to the highest gated echo (library helper).
  function autoPeak(st, d) {
    if (!d) return;
    if (d.cls === 'lamination') { st.xp = clamp(Math.round((d.x1 + d.x2) / 2), -110, -5); st.y = (d.y1 + d.y2) / 2; return; }
    st.y = (d.y1 + d.y2) / 2;
    const [a, b] = xpRange(st);
    let best = -1, bx = st.xp;
    for (let x = a; x <= b; x += 0.25) {
      const s2 = Object.assign({}, st, { xp: x });
      const p = gatedPeak(s2, trace(s2, d, 300));
      if (p && p.a > best) { best = p.a; bx = x; }
    }
    st.xp = bx;
  }

  // ---------- State ----------
  const st = {
    mode: 'library', key: 'crack', caseKey: 'reject', angle: 60, T: 20, gain: REF_GAIN + 6, range: 100,
    xp: -30, y: 50, gateStart: 5, gateWidth: 90, autoscan: false, scanDir: 1,
    defect: null, exercise: null, score: { right: 0, total: 0 }, dac: null,
    mat: 'steel', vInst: null, xkey: 'pore'
  };
  const steelSetup = () => { st.mat = 'steel'; st.vInst = null; st.freq = 4; };
  // Explore mode: free experiments with material, instrument velocity, thickness and probe angle.
  const EXPLORE_TYPES = ['pore', 'none', 'crack', 'lof', 'ip', 'slag', 'cluster'];
  function newExplore() {
    let d = null;
    if (st.xkey !== 'none') {
      d = makeDefect(st.xkey, 'reject', false);
      const T = st.T, k = T / d.T;
      d.z = d.shape === 'ip' ? T - (d.T - d.z) : Math.min(T - 1, Math.round(d.z * k * 10) / 10);
      if (d.h) d.h = Math.min(d.h * k, T * 0.4);
      d.T = T; if (d.shape === 'lof') d.x = d.side * bevelX(T, d.z);
    }
    st.defect = d; st.range = Math.round(defaultRange(st) * Math.max(1, pathScale(st)) / 10) * 10; st.gateStart = st.angle === 0 ? 4 : 5; st.gateWidth = st.range - st.gateStart; st.gain = REF_GAIN + 6;
    if (d) autoPeak(st, d); else { st.xp = Math.round(-(st.T * Math.tan(rad(st.angle || 1)) + 10)); st.y = 50; }
  }
  // Plain-language explanation of what the current settings do to the signal.
  function whyExplore() {
    const M = MATERIALS[st.mat], k = pathScale(st), real = actualAngle(st), out = [], d = st.defect;
    const deg = (a) => (a * 180 / Math.PI).toFixed(1);
    if (st.angle) {
      const skip = 2 * st.T * Math.tan(real === null ? rad(st.angle) : real);
      out.push(L(`Thickness ${st.T} mm: one full skip (down and back up) covers ${skip.toFixed(1)} mm of surface. A thicker plate moves every echo to a longer sound path, and a flaw near the bottom may be reached only on the second leg.`, `Épaisseur ${st.T} mm : un bond complet (aller-retour) couvre ${skip.toFixed(1)} mm en surface. Une tôle plus épaisse repousse chaque écho vers un parcours plus long, et un défaut proche du fond peut n’être atteint qu’au second parcours.`));
      if (real === null) out.push(L(`No shear wave enters this material: by Snell’s law sin θ = sin ${st.angle}° × ${M.vs} / ${STEEL_VS} would exceed 1. The wedge, designed for steel, cannot produce this angle here, so no echo appears.`, `Aucune onde transversale n’entre dans ce matériau : selon la loi de Snell, sin θ = sin ${st.angle}° × ${M.vs} / ${STEEL_VS} dépasserait 1. Le sabot, prévu pour l’acier, ne peut pas produire cet angle ici : aucun écho.`));
      else if (Math.abs(real - rad(st.angle)) > 0.004) out.push(L(`Snell’s law: the ${st.angle}° wedge is designed for steel (shear velocity ${STEEL_VS} m/s). In ${M.n[0].toLowerCase()} the shear velocity is ${M.vs} m/s, so sin θ = sin ${st.angle}° × ${M.vs} / ${STEEL_VS} → the real beam angle is ${deg(real)}°. The instrument still assumes ${st.angle}° (dashed line), so the plotted position is wrong.`, `Loi de Snell : le sabot ${st.angle}° est prévu pour l’acier (vitesse transversale ${STEEL_VS} m/s). Dans ce matériau la vitesse vaut ${M.vs} m/s, donc sin θ = sin ${st.angle}° × ${M.vs} / ${STEEL_VS} → l’angle réel est ${deg(real)}°. L’appareil suppose toujours ${st.angle}° (trait pointillé) : la position tracée est fausse.`));
      else out.push(L(`The beam travels at the nominal ${st.angle}° because the material’s shear velocity matches the steel the wedge was designed for.`, `Le faisceau part bien à ${st.angle}° car la vitesse transversale du matériau correspond à l’acier prévu pour le sabot.`));
    } else out.push(L(`0° probe: a longitudinal wave goes straight down; the back-wall echo marks the thickness (${st.T} mm in reality).`, `Traducteur 0° : une onde longitudinale descend droit ; l’écho de fond marque l’épaisseur (${st.T} mm en réalité).`));
    if (Math.abs(k - 1) > 0.004) {
      const truth = st.angle === 0 ? st.T : (d && real !== null ? d.z : null);
      let shown = null;
      if (st.angle === 0) shown = st.T * k;
      else if (truth !== null) { const S = truth / Math.cos(real) * k, D = S * Math.cos(rad(st.angle)), leg = Math.floor(D / st.T); shown = leg % 2 === 0 ? D - leg * st.T : (leg + 1) * st.T - D; }
      out.push(L(`Velocity: the instrument converts time into distance with ${vCal(st)} m/s, but sound really travels at ${vMat(st)} m/s in this material. Every sound path is multiplied by ${k.toFixed(3)}${truth !== null ? `: a reflector really at ${truth.toFixed(1)} mm deep is shown at about ${shown.toFixed(1)} mm` : ''}. Fix: calibrate the range on a block of the same material (button "Calibrate on this material").`, `Vitesse : l’appareil convertit le temps en distance avec ${vCal(st)} m/s, mais le son va réellement à ${vMat(st)} m/s dans ce matériau. Chaque parcours est multiplié par ${k.toFixed(3)}${truth !== null ? ` : un réflecteur réellement à ${truth.toFixed(1)} mm de profondeur apparaît vers ${shown.toFixed(1)} mm` : ''}. Correction : étalonner la base de temps sur un bloc du même matériau (bouton « Étalonner sur ce matériau »).`));
    } else out.push(L(`Velocity: the instrument is calibrated with ${vCal(st)} m/s, the real velocity of this wave in the material, so the distances on screen are correct.`, `Vitesse : l’appareil est étalonné avec ${vCal(st)} m/s, la vitesse réelle de cette onde dans le matériau : les distances affichées sont justes.`));
    {
      const f = st.freq || 4, V = st.angle ? M.vs : M.vl, lam = V / (f * 1000), N = (10 * 10 * f * 1000) / (4 * M.vl);
      out.push(L(`Frequency ${f} MHz: wavelength λ = V ÷ f = ${V} ÷ ${f} MHz ≈ ${lam.toFixed(2)} mm (${st.angle ? 'shear' : 'longitudinal'} wave). As a rule of thumb, reflectors smaller than about λ/2 (${(lam / 2).toFixed(2)} mm) are hard to detect. A higher frequency gives shorter pulses (better resolution — look at the echo width) and stronger echoes from small pores, but loses more energy in coarse-grained materials. Near field of a 10 mm crystal: N = D²·f ÷ 4V ≈ ${N.toFixed(0)} mm — echoes inside it can fluctuate.`, `Fréquence ${f} MHz : longueur d’onde λ = V ÷ f = ${V} ÷ ${f} MHz ≈ ${lam.toFixed(2)} mm (onde ${st.angle ? 'transversale' : 'longitudinale'}). En première approximation, les réflecteurs plus petits qu’environ λ/2 (${(lam / 2).toFixed(2)} mm) sont difficiles à détecter. Une fréquence plus haute donne des impulsions plus courtes (meilleure résolution — regardez la largeur de l’écho) et des échos plus forts sur les petits pores, mais perd plus d’énergie dans les matériaux à gros grains. Champ proche d’un cristal de 10 mm : N = D²·f ÷ 4V ≈ ${N.toFixed(0)} mm — les échos à l’intérieur peuvent fluctuer.`));
    }
    if (M.att > 0) out.push(L(`Attenuation: ${M.n[0].toLowerCase()} scatters and absorbs sound (coarse grains). In this model the echo loses about ${M.att} dB per 100 mm travelled (there and back), so deep reflectors look smaller and may drop under the evaluation level. In practice: lower frequency, transfer correction, specific procedure.`, `Atténuation : ce matériau diffuse et absorbe le son (gros grains). Dans ce modèle, l’écho perd environ ${M.att} dB par 100 mm parcourus (aller-retour) : les réflecteurs profonds paraissent plus petits et peuvent passer sous le niveau d’évaluation. En pratique : fréquence plus basse, correction de transfert, procédure spécifique.`));
    return out;
  }
  function enterDac(restart) {
    if (restart || !st.dac) st.dac = { step: 0, points: [], refGain: null, msg: null, block: calBlock() };
    steelSetup(); st.defect = st.dac.block; st.T = CAL_T; st.angle = 60; st.range = defaultRange(st);
    st.gateStart = 3; st.gateWidth = st.range - 3; st.y = 50; st.autoscan = false;
    st.gain = st.dac.refGain !== null ? st.dac.refGain : REF_GAIN - 4;
    if (restart || st.dac.step === 0) st.xp = -40;
  }
  // Validate and record the current DAC point.
  function markPoint() {
    const dc = st.dac, step = DAC_STEPS[dc.step];
    const peak = gatedPeak(st, trace(st, st.defect, 800)), g = fromDb(st.gain - REF_GAIN);
    const expS = stepS(step, st.T, st.angle), hole = holeLabel(step.z, st.T);
    const fail = (en, fr) => { dc.msg = { ok: false, text: [en, fr] }; };
    if (!peak || peak.a * g < 5) return fail('No echo in gate A. Move the probe to find the hole echo.', 'Aucun écho dans la porte A. Déplacez le palpeur pour trouver l’écho du trou.');
    if (Math.abs(peak.s - expS) > 2) return fail(`This echo (${peak.s.toFixed(1)} mm) is not the ${hole} hole on leg ${step.leg}: it should be near ${expS.toFixed(1)} mm sound path. Bring the yellow ring onto the dashed pink ring in the cross-section.`, `Cet écho (${peak.s.toFixed(1)} mm) n’est pas le trou ${hole} au parcours ${step.leg} : il doit être vers ${expS.toFixed(1)} mm de parcours. Amenez l’anneau jaune sur l’anneau rose en pointillés de la coupe.`);
    if (peak.a < 0.89 * dac(expS)) return fail('Not at the maximum yet: move the probe slowly back and forth until the echo is at its highest, then mark.', 'Pas encore au maximum : faites de petits va-et-vient avec le palpeur jusqu’à ce que l’écho soit au plus haut, puis marquez.');
    const shown = peak.a * g;
    if (dc.refGain === null) {
      if (shown < 75 || shown > 85) return fail(`Echo at ${shown.toFixed(0)} % FSH. Adjust the gain to bring it to 80 % (75–85 %).`, `Écho à ${shown.toFixed(0)} % de l’écran. Réglez le gain pour l’amener à 80 % (75–85 %).`);
      dc.refGain = st.gain;
    } else if (Math.abs(st.gain - dc.refGain) > 0.05) {
      return fail(`The gain was changed. Set it back to the reference gain ${dc.refGain.toFixed(1)} dB: all DAC points are recorded at the same gain.`, `Le gain a été modifié. Remettez le gain de référence ${dc.refGain.toFixed(1)} dB : tous les points de la DAC sont relevés au même gain.`);
    }
    dc.points.push({ s: peak.s, a: shown, depth: step.z, leg: step.leg, hole });
    if (dc.points.length === marksBefore(DAC_STEPS.length)) learn('ut-dac');
    dc.msg = { ok: true, text: [`Point ${dc.points.length} marked: ${peak.s.toFixed(1)} mm, ${shown.toFixed(0)} % FSH.`, `Point ${dc.points.length} marqué : ${peak.s.toFixed(1)} mm, ${shown.toFixed(0)} % écran.`] };
    dc.step++;
  }
  function loadLibrary(key, caseKey) {
    st.key = key; st.caseKey = caseKey; steelSetup();
    const d = makeDefect(key, caseKey, false);
    st.defect = d; st.T = d.T;
    st.angle = TYPES[key].probe === 0 ? 0 : 60;
    st.range = defaultRange(st); st.gateStart = st.angle === 0 ? 4 : 5; st.gateWidth = st.range - st.gateStart;
    // Echoes below the 20 % DAC evaluation level are shown with +14 dB so their shape stays visible.
    st.gain = d.dB !== undefined && d.dB < EVAL_DB ? REF_GAIN + 14 : REF_GAIN;
    autoPeak(st, d);
  }
  function newExercise() {
    steelSetup();
    const key = EXERCISE_TYPES[Math.floor(Math.random() * EXERCISE_TYPES.length)];
    const caseKey = Math.random() < 0.5 ? 'reject' : 'accept';
    const d = makeDefect(key, caseKey, true);
    const T = [12, 16, 20, 25, 32][Math.floor(Math.random() * 5)];
    const k = T / d.T;
    // Scale the depth to the new thickness; keep root / bevel flaws on the root / bevel.
    d.z = d.shape === 'ip' || d.shape === 'geom' ? T - (d.T - d.z) : Math.round(d.z * k * 10) / 10;
    d.T = T;
    if (d.shape === 'lof') d.x = d.side * bevelX(T, d.z);
    st.defect = d; st.T = T; st.angle = 60; st.range = defaultRange(st);
    st.gateStart = 5; st.gateWidth = st.range - 5; st.gain = REF_GAIN + 6; st.y = 0;
    st.xp = Math.round(-(T * Math.tan(rad(60)) + 12));
    st.exercise = { answered: false, decision: evaluate(d), defect: d };
  }
  loadLibrary('crack', 'reject');

  // ---------- Drawing ----------
  function fitCanvas(c) {
    const r = window.devicePixelRatio || 1, w = Math.max(200, c.clientWidth), h = Math.max(80, c.clientHeight);
    if (c.width !== Math.round(w * r) || c.height !== Math.round(h * r)) { c.width = Math.round(w * r); c.height = Math.round(h * r); }
    const ctx = c.getContext('2d'); ctx.setTransform(r, 0, 0, r, 0, 0);
    return { ctx, w, h };
  }

  function drawAscan(c, opts) {
    const { ctx, w, h } = fitCanvas(c);
    const s = opts.st, d = opts.d, small = opts.small;
    const padL = small ? 4 : 30, padR = small ? 4 : 8, padT = small ? 4 : 22, padB = small ? 4 : 20;
    const W = w - padL - padR, H = h - padT - padB;
    ctx.fillStyle = '#03140d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(120,255,170,.13)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(padL + W * i / 10, padT); ctx.lineTo(padL + W * i / 10, padT + H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, padT + H * i / 10); ctx.lineTo(padL + W, padT + H * i / 10); ctx.stroke();
    }
    const g = fromDb(s.gain - REF_GAIN);
    const X = (sp) => padL + (sp / s.range) * W, Y = (a) => padT + H - (clamp(a, 0, 100) / 100) * H;
    // DAC and 20 % DAC follow the gain (hidden while the trainee builds their own DAC)
    if (!small && !opts.userDac) {
      ctx.strokeStyle = '#ff5c5c'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const sp = 3 + (s.range - 3) * i / 80; const a = dac(sp) * g; i ? ctx.lineTo(X(sp), Y(a)) : ctx.moveTo(X(sp), Y(a)); }
      ctx.stroke();
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#ffae42'; ctx.beginPath();
      for (let i = 0; i <= 80; i++) { const sp = 3 + (s.range - 3) * i / 80; const a = dac(sp) * g * fromDb(EVAL_DB); i ? ctx.lineTo(X(sp), Y(a)) : ctx.moveTo(X(sp), Y(a)); }
      ctx.stroke(); ctx.setLineDash([]);
    }
    if (!small && opts.userDac) {
      // Trainee's DAC: marked points joined by straight lines; −6 dB and −14 dB curves once complete.
      const u = opts.userDac, k = u.refGain === null ? 1 : fromDb(s.gain - u.refGain);
      const line = (f, color, dash) => {
        ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash(dash); ctx.beginPath();
        u.points.forEach((p, i) => (i ? ctx.lineTo(X(p.s), Y(p.a * k * f)) : ctx.moveTo(X(p.s), Y(p.a * k * f))));
        ctx.stroke(); ctx.setLineDash([]);
      };
      if (u.points.length > 1) line(1, '#ff5c5c', []);
      if (u.complete) { line(fromDb(-6), '#ff8a5c', [8, 4]); line(fromDb(EVAL_DB), '#ffae42', [5, 4]); }
      u.points.forEach((p, i) => {
        ctx.fillStyle = '#ff5c5c'; ctx.beginPath(); ctx.arc(X(p.s), Y(p.a * k), 4, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffd0d0'; ctx.font = '10px system-ui, sans-serif'; ctx.fillText(String(i + 1), X(p.s) - 3, Y(p.a * k) - 7);
      });
    }
    if (!small) {
      // gate A
      ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(X(s.gateStart), Y(20)); ctx.lineTo(X(Math.min(s.range, s.gateStart + s.gateWidth)), Y(20)); ctx.stroke();
    }
    const n = Math.max(200, Math.round(W));
    const arr = opts.arr || trace(s, d, n);
    const noise = small ? 0 : 1.1 * g;
    ctx.strokeStyle = '#a6ff6e'; ctx.lineWidth = small ? 1.2 : 1.6; ctx.shadowColor = 'rgba(166,255,110,.6)'; ctx.shadowBlur = small ? 0 : 4;
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i] * g + noise * Math.random() * (0.4 + Math.random());
      const x = padL + (i / (arr.length - 1)) * W;
      i ? ctx.lineTo(x, Y(a)) : ctx.moveTo(x, Y(a));
    }
    ctx.stroke(); ctx.shadowBlur = 0;
    if (!small) {
      ctx.fillStyle = 'rgba(200,255,220,.75)'; ctx.font = '11px system-ui, sans-serif';
      for (let i = 0; i <= 5; i++) { const sp = s.range * i / 5; ctx.fillText(sp.toFixed(0), X(sp) - (i === 5 ? 16 : i ? 7 : 0), h - 6); }
      for (let i = 0; i <= 100; i += 50) ctx.fillText(i + '%', 2, Y(i) + 4);
      const rel = `${s.gain >= REF_GAIN ? '+' : '−'}${Math.abs(s.gain - REF_GAIN).toFixed(1)}`;
      ctx.fillText(w < 520 ? `${s.angle}° · ${s.gain.toFixed(1)} dB (${rel}) · t ${s.T}` : `${s.angle}°  ·  ${L('Gain', 'Gain')} ${s.gain.toFixed(1)} dB (${L('ref', 'réf')} ${REF_GAIN.toFixed(1)} ${rel})  ·  ${L('Range', 'Base')} ${s.range} mm  ·  t ${s.T} mm`, padL, 14);
      if (!opts.userDac || opts.userDac.complete) { ctx.fillStyle = '#ff5c5c'; ctx.fillText('DAC', w - 70, 14); ctx.fillStyle = '#ffae42'; ctx.fillText('20%', w - 40, 14); }
    }
    return arr;
  }

  function drawSection(c, s, d, showDefect, peakLoc, target) {
    const { ctx, w, h } = fitCanvas(c);
    const field = document.documentElement.classList.contains('field');
    ctx.fillStyle = field ? '#ffffff' : '#0b1530'; ctx.fillRect(0, 0, w, h);
    const stripH = 34, T = s.T, th = rad(s.angle);
    const xmin = s.xp - 16, xmax = Math.max(bevelX(T, 0) + 16, 22), zmin = -9, zmax = T + 5;
    const sc = Math.min((w - 16) / (xmax - xmin), (h - stripH - 14) / (zmax - zmin));
    const ox = 8 - xmin * sc, oz = 6 - zmin * sc;
    const P = (x, z) => [ox + x * sc, oz + z * sc];
    // plate
    ctx.fillStyle = field ? '#d8dee6' : '#3a4a6e';
    ctx.fillRect(0, P(0, 0)[1], w, T * sc);
    const block = d && d.shape === 'sdh';
    if (block) {
      // calibration block: side-drilled holes, the one to find ringed in yellow
      d.holes.forEach((z) => {
        const [hx, hz] = P(d.x, z);
        ctx.fillStyle = field ? '#0a0d12' : '#0b1530'; ctx.beginPath(); ctx.arc(hx, hz, Math.max(2.5, 1.2 * sc), 0, 7); ctx.fill();
        if (target && target.z === z) { ctx.strokeStyle = '#ff7ad9'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(hx, hz, Math.max(8, 3 * sc), 0, 7); ctx.stroke(); ctx.setLineDash([]); }
      });
    }
    // weld metal: single-V with cap and root reinforcement
    const cap = bevelX(T, 0) + 1.5;
    if (!block) {
    ctx.fillStyle = field ? '#b9c3d0' : '#56658c';
    ctx.beginPath();
    ctx.moveTo(...P(-cap, 0)); ctx.quadraticCurveTo(...P(0, -2.2), ...P(cap, 0));
    ctx.lineTo(...P(1, T)); ctx.quadraticCurveTo(...P(0, T + 2), ...P(-1, T)); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = field ? '#4a5565' : 'rgba(200,215,255,.45)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(...P(-bevelX(T, 0), 0)); ctx.lineTo(...P(-1, T)); ctx.moveTo(...P(bevelX(T, 0), 0)); ctx.lineTo(...P(1, T)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...P(0, -4)); ctx.lineTo(...P(0, T + 3)); ctx.stroke(); ctx.setLineDash([]);
    }
    // defect
    if (d && showDefect && !block) {
      ctx.strokeStyle = '#ff4d5e'; ctx.fillStyle = '#ff4d5e'; ctx.lineWidth = 3;
      if (d.shape === 'crack') { ctx.beginPath(); for (let i = 0; i <= 6; i++) { const z = d.z - d.h / 2 + i * d.h / 6; const p = P(d.x + (i % 2 ? 0.5 : -0.4), z); i ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke(); }
      else if (d.shape === 'lof') { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...P(d.side * bevelX(T, d.z - d.h / 2), d.z - d.h / 2)); ctx.lineTo(...P(d.side * bevelX(T, d.z + d.h / 2), d.z + d.h / 2)); ctx.stroke(); }
      else if (d.shape === 'ip') { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...P(d.x, T)); ctx.lineTo(...P(d.x, T - d.h)); ctx.stroke(); }
      else if (d.shape === 'pore') { ctx.beginPath(); ctx.arc(...P(d.x, d.z), Math.max(2.5, 0.8 * sc), 0, 7); ctx.fill(); }
      else if (d.shape === 'cluster') CLUSTER.forEach(([dx, dz]) => { ctx.beginPath(); ctx.arc(...P(d.x + dx, d.z + dz), Math.max(1.6, 0.35 * sc), 0, 7); ctx.fill(); });
      else if (d.shape === 'slag') { ctx.beginPath(); [[-1.4, 0], [-0.5, -0.9], [0.9, -0.6], [1.5, 0.3], [0.4, 0.9], [-0.9, 0.7]].forEach(([dx, dz], i) => { const p = P(d.x + dx, d.z + dz); i ? ctx.lineTo(...p) : ctx.moveTo(...p); }); ctx.closePath(); ctx.fill(); }
      else if (d.shape === 'geom') { ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(...P(d.x - 0.4, T), Math.max(3, 1 * sc), 0, Math.PI); ctx.stroke(); }
      else if (d.shape === 'undercut') { ctx.beginPath(); ctx.moveTo(...P(d.x - 1.2, 0)); ctx.lineTo(...P(d.x, d.h)); ctx.lineTo(...P(d.x + 1.2, 0)); ctx.closePath(); ctx.fill(); }
      else if (d.shape === 'lam') { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(...P(Math.max(xmin, d.x1), d.z)); ctx.lineTo(...P(Math.min(-2, d.x2), d.z)); ctx.stroke(); }
    }
    // probe and beam
    const px = P(s.xp, 0);
    ctx.fillStyle = '#3da9ff';
    ctx.beginPath(); ctx.moveTo(px[0] - 18, px[1] - 12); ctx.lineTo(px[0] + 8, px[1] - 12); ctx.lineTo(px[0] + 12, px[1]); ctx.lineTo(px[0] - 18, px[1]); ctx.closePath(); ctx.fill();
    // real beam (real angle, real length covered by the screen range); dashed = what the instrument assumes
    const beam = (ang, len, style, dash) => {
      ctx.strokeStyle = style; ctx.lineWidth = 1.5; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(...P(s.xp, 0));
      let x = s.xp, z = 0, left = len, down = true;
      if (s.angle === 0) ctx.lineTo(...P(s.xp, T));
      else while (left > 0.1) {
        const dz = down ? T - z : z, seg = Math.min(left, dz / Math.cos(ang));
        x += seg * Math.sin(ang); z += (down ? 1 : -1) * seg * Math.cos(ang); left -= seg;
        ctx.lineTo(...P(x, z)); down = !down;
        if (x > xmax) break;
      }
      ctx.stroke(); ctx.setLineDash([]);
    };
    const real = actualAngle(s), mismatch = real === null || Math.abs(real - th) > 0.004 || Math.abs(pathScale(s) - 1) > 0.004;
    if (mismatch && s.angle) beam(th, s.range, 'rgba(200,210,230,.55)', [5, 4]);
    if (real !== null) beam(real, s.range / pathScale(s), 'rgba(61,169,255,.9)');
    // plotted reflector
    if (peakLoc) {
      const [qx, qz] = P(peakLoc.x, peakLoc.depth);
      ctx.strokeStyle = '#ffe14d'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(qx, qz, 9, 0, 7); ctx.moveTo(qx - 14, qz); ctx.lineTo(qx - 9, qz); ctx.moveTo(qx + 9, qz); ctx.lineTo(qx + 14, qz); ctx.stroke();
    }
    // top view strip: along-weld position
    const sy = h - stripH + 6, sx0 = 10, sw = w - 20;
    ctx.fillStyle = field ? '#eef1f5' : '#121d3b'; ctx.fillRect(sx0, sy, sw, stripH - 12);
    ctx.fillStyle = field ? '#4a5565' : '#aebbe3'; ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(L('along weld 0', 'le long 0'), sx0 + 2, sy + 10); ctx.fillText('100 mm', sx0 + sw - 42, sy + 10);
    if (d && showDefect && !block && d.y1 !== undefined) { ctx.fillStyle = '#ff4d5e'; ctx.fillRect(sx0 + sw * d.y1 / 100, sy + 13, Math.max(2, sw * (d.y2 - d.y1) / 100), 6); }
    ctx.fillStyle = '#3da9ff'; ctx.fillRect(sx0 + sw * s.y / 100 - 2, sy + 11, 4, 10);
  }

  function drawDynamics(c, s, d) {
    const { ctx, w, h } = fitCanvas(c);
    const field = document.documentElement.classList.contains('field');
    ctx.fillStyle = field ? '#ffffff' : '#0b1530'; ctx.fillRect(0, 0, w, h);
    const [a, b] = xpRange(s), pts = [];
    let max = 1;
    for (let i = 0; i <= 120; i++) {
      const x = a + (b - a) * i / 120, s2 = Object.assign({}, s, { xp: x });
      let peak = 0;
      for (const e of echoes(s2, d)) if (e.s >= s.gateStart && e.s <= s.gateStart + s.gateWidth && !e.bw) peak = Math.max(peak, e.a);
      pts.push(peak); max = Math.max(max, peak);
    }
    ctx.strokeStyle = '#3da9ff'; ctx.lineWidth = 1.5; ctx.beginPath();
    pts.forEach((p, i) => { const X = 6 + (w - 12) * i / 120, Y = h - 6 - (p / max) * (h - 14); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.stroke();
    const mx = 6 + (w - 12) * (s.xp - a) / (b - a);
    ctx.strokeStyle = '#ffe14d'; ctx.beginPath(); ctx.moveTo(mx, 4); ctx.lineTo(mx, h - 4); ctx.stroke();
  }

  // ---------- UI ----------
  let root = null, raf = 0, lastFrame = 0, lastTime = 0;
  const css = `
.cyut { }
.cyut-intro { color: var(--muted); margin: 8px 0 10px; }
.cyut-modes { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.cyut-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); gap: 14px; }
.cyut-ascan { width: 100%; height: 300px; display: block; border-radius: 8px; border: 2px solid #22303f; background: #03140d; }
.cyut-xs { width: 100%; height: 210px; display: block; border-radius: 8px; border: 1px solid var(--line); }
.cyut-dyn { width: 100%; height: 70px; display: block; border-radius: 8px; border: 1px solid var(--line); }
.cyut-label { font-size: 12px; color: var(--muted); margin: 8px 0 3px; }
.cyut-read { display: grid; grid-template-columns: repeat(auto-fit, minmax(105px, 1fr)); gap: 6px; margin: 8px 0; }
.cyut-read div { border: 1px solid var(--line); border-radius: 7px; padding: 5px 8px; background: rgba(8, 17, 38, .55); }
.cyut-read span { display: block; font-size: 11px; color: var(--muted); }
.cyut-read b { font-variant-numeric: tabular-nums; font-size: 15px; }
.cyut-ctrl { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 8px 14px; }
.cyut-ctrl label { display: block; font-size: 13px; color: var(--muted); }
.cyut-ctrl input[type=range] { width: 100%; accent-color: var(--blue); }
.cyut-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.cyut-row button { padding: 5px 10px; }
.cyut-row output { min-width: 64px; text-align: center; font-variant-numeric: tabular-nums; font-weight: 700; }
.cyut-panel { margin-top: 10px; border: 1px solid var(--line); border-radius: 8px; padding: 12px; background: rgba(8, 17, 38, .45); }
.cyut-panel h3 { margin: 0 0 8px; font-size: 1.05rem; }
.cyut-panel h4 { margin: 12px 0 4px; font-size: .95rem; }
.cyut-panel ul { margin: 4px 0; padding-left: 18px; }
.cyut-cases { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.cyut-cases button[data-case=reject].on { background: #a3283b; border-color: #a3283b; }
.cyut-cases button[data-case=accept].on { background: #146c43; border-color: #146c43; }
.cyut-verdict { padding: 8px 10px; border-radius: 7px; font-weight: 600; margin: 6px 0; }
.cyut-verdict.reject { background: rgba(163, 40, 59, .3); border: 1px solid #e66b78; }
.cyut-verdict.accept { background: rgba(20, 108, 67, .3); border: 1px solid #42c991; }
.cyut-verdict b { display: block; font-size: 1.05rem; letter-spacing: .04em; }
.cyut-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cyut-table td { border-top: 1px solid var(--line); padding: 4px 6px; }
.cyut-table td:last-child { text-align: right; font-weight: 600; }
.cyut-rule, .cyut-disclaimer { font-size: 12px; color: var(--muted); }
.cyut-tip { border-left: 3px solid var(--blue); padding: 4px 10px; margin: 8px 0; }
.cyut-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; margin-top: 14px; }
.cyut-card { text-align: left; padding: 8px; display: grid; gap: 4px; align-content: start; }
.cyut-card canvas { width: 100%; height: 56px; border-radius: 5px; display: block; }
.cyut-card b { font-size: 13px; } .cyut-card span { font-size: 11px; color: var(--muted); }
.cyut-card.on span, .cyut-card:hover span { color: #fff; }
.cyut-ex label { display: block; margin: 6px 0; }
.cyut-ex select { width: 100%; margin-top: 3px; border: 1px solid var(--line); border-radius: 7px; background: #0b1530; color: var(--text); padding: 7px; font: inherit; }
.cyut-score { font-weight: 700; margin-top: 8px; }
.cyut-steps { margin: 0 0 10px; padding-left: 22px; font-size: 13px; color: var(--muted); }
.cyut-steps li { margin: 2px 0; }
.cyut-steps li.done { color: #7de2b5; }
.cyut-steps li.now { color: var(--text); font-weight: 700; }
.cyut-step { border-left: 3px solid var(--accent); padding: 4px 10px; margin: 8px 0; }
.cyut-step p { margin: 6px 0 0; }
.cyut-msg { padding: 6px 10px; border-radius: 7px; margin: 8px 0; }
.cyut-msg.ok { color: #7de2b5; } .cyut-msg.err { color: #ffd27a; border: 1px solid #ffd27a; }
html.field .cyut-steps li.done, html.field .cyut-msg.ok { color: #146c43; } html.field .cyut-msg.err { color: #8a5a00; border-color: #8a5a00; }
html.field .cyut-read div, html.field .cyut-panel { background: #fff; }
html.field .cyut-ex select { background: #fff; color: #0a0d12; }
html.field .cyut-card.on span, html.field .cyut-card:hover span { color: #fff; }
@media (max-width: 820px) { .cyut-grid { grid-template-columns: minmax(0, 1fr); } .cyut-ascan { height: 240px; } }
`;

  function readout(label, id) { return `<div><span>${label}</span><b data-r="${id}">–</b></div>`; }
  function slider(label, id, min, max, step, value) {
    return `<label>${label} <b data-v="${id}"></b><input type="range" data-s="${id}" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
  }

  function build(pb) {
    const el = document.createElement('details');
    el.className = 'cyut'; el.open = true;
    el.innerHTML = `<summary>📟 ${L('Flaw detector simulator (training)', 'Simulateur de détecteur de défauts (formation)')}</summary>
<p class="cyut-intro">${L('Click an indication type to see how it looks on the A-scan, then switch between the rejected and not rejected situations. Move the probe to watch the echo change. In training mode, find and judge a hidden indication.', 'Cliquez sur un type d’indication pour voir son aspect sur l’A-scan, puis passez de la situation refusée à la situation acceptée. Déplacez le palpeur pour voir l’écho évoluer. En mode entraînement, trouvez et jugez une indication cachée.')}</p>
<div class="cyut-modes"><button type="button" data-mode="library">📚 ${L('Indication library', 'Bibliothèque des indications')}</button><button type="button" data-mode="exercise">🎯 ${L('Training exercise', 'Exercice d’entraînement')}</button><button type="button" data-mode="dac">📈 ${L('Draw the DAC', 'Tracer la DAC')}</button><button type="button" data-mode="explore">🔬 ${L('Explore: material, velocity, thickness', 'Explorer : matériau, vitesse, épaisseur')}</button></div>
<div class="cyut-grid">
 <div>
  <canvas class="cyut-ascan" aria-label="${L('A-scan screen', 'Écran A-scan')}"></canvas>
  <div class="cyut-read">${readout(L('Sound path', 'Parcours'), 's')}${readout(L('Depth', 'Profondeur'), 'depth')}${readout(L('Surface dist.', 'Dist. surface'), 'surf')}${readout(L('From weld axis', 'Depuis l’axe'), 'pos')}${readout(L('Amplitude', 'Amplitude'), 'amp')}${readout(L('dB to DAC', 'dB / DAC'), 'dbdac')}${readout(L('Leg', 'Parcours n°'), 'leg')}</div>
  <div class="cyut-ctrl">
   <div><label>${L('Probe', 'Palpeur')}</label><div class="cyut-row" data-angles>${[0, 45, 60, 70].map((a) => `<button type="button" data-angle="${a}">${a}°</button>`).join('')}</div></div>
   <div><label>${L('Gain', 'Gain')}</label><div class="cyut-row"><button type="button" data-gain="-6">−6</button><button type="button" data-gain="-1">−1</button><output data-gainout></output><button type="button" data-gain="1">+1</button><button type="button" data-gain="6">+6</button><button type="button" data-gain="ref">${L('Ref', 'Réf')}</button></div></div>
   ${slider(L('Probe position (mm from weld axis)', 'Position du palpeur (mm depuis l’axe)'), 'xp', -110, -5, 0.5, st.xp)}
   ${slider(L('Position along the weld (mm)', 'Position le long de la soudure (mm)'), 'y', 0, 100, 0.5, st.y)}
   ${slider(L('Range (mm sound path)', 'Base de temps (mm parcours)'), 'range', 25, 250, 5, st.range)}
   ${slider(L('Gate A start (mm)', 'Début porte A (mm)'), 'gateStart', 0, 240, 1, st.gateStart)}
   ${slider(L('Gate A width (mm)', 'Largeur porte A (mm)'), 'gateWidth', 5, 250, 1, st.gateWidth)}
   <div><label>&nbsp;</label><div class="cyut-row"><button type="button" data-act="peak">🎯 ${L('Find max echo', 'Chercher l’écho max')}</button><button type="button" data-act="scan">▶ ${L('Auto-scan along weld', 'Balayage auto')}</button></div></div>
  </div>
 </div>
 <div>
  <canvas class="cyut-xs" aria-label="${L('Weld cross-section with beam path', 'Coupe de la soudure avec le faisceau')}"></canvas>
  <div class="cyut-label">${L('Echo dynamics: gated amplitude while moving the probe toward the weld (yellow = current position)', 'Dynamique d’écho : amplitude dans la porte en avançant vers la soudure (jaune = position actuelle)')}</div>
  <canvas class="cyut-dyn"></canvas>
  <div class="cyut-panel" data-panel></div>
 </div>
</div>
<div class="cyut-cards" data-cards></div>
<p class="cyut-disclaimer">⚠ ${L('Training simulator with a simplified physical model. Amplitudes, shapes and acceptance rules are teaching examples: always apply the current code edition, the applicable AQCS procedure and the calibration made on the real instrument. In case of doubt, refer to the Level 3 / supervisor.', 'Simulateur de formation avec un modèle physique simplifié. Amplitudes, formes et règles d’acceptation sont des exemples pédagogiques : appliquez toujours l’édition en vigueur du code, la procédure AQCS applicable et l’étalonnage réalisé sur l’appareil réel. En cas de doute, référez-vous au niveau 3 / superviseur.')}</p>`;
    const anchor = pb.querySelector('.cy3') || pb.querySelector('.cy-course-launch') || pb.querySelector('h2');
    if (anchor) anchor.after(el); else pb.prepend(el);
    root = el;
    el.addEventListener('click', onClick);
    el.addEventListener('input', onInput);
    el.addEventListener('change', onInput);
    el.addEventListener('toggle', () => { if (el.open) start(); });
    syncControls(); renderPanel(); renderCards(); start();
  }

  function syncControls() {
    if (!root) return;
    const [a, b] = xpRange(st);
    st.xp = clamp(st.xp, a, b);
    const set = (id, v, min, max) => { const i = root.querySelector(`[data-s="${id}"]`); if (!i) return; if (min !== undefined) { i.min = min; i.max = max; } i.value = v; const o = root.querySelector(`[data-v="${id}"]`); if (o) o.textContent = (+v).toFixed(id === 'xp' || id === 'y' ? 1 : 0); };
    set('xp', st.xp, a, b); set('y', st.y); set('range', st.range);
    set('gateStart', st.gateStart, 0, st.range - 5); set('gateWidth', st.gateWidth, 5, st.range);
    root.querySelectorAll('[data-angle]').forEach((x) => { x.classList.toggle('on', +x.dataset.angle === st.angle); x.disabled = st.mode === 'dac' && +x.dataset.angle !== st.angle; });
    root.querySelectorAll('[data-mode]').forEach((x) => x.classList.toggle('on', x.dataset.mode === st.mode));
    root.querySelector('[data-gainout]').textContent = st.gain.toFixed(1) + ' dB';
    root.querySelector('[data-act="peak"]').hidden = st.mode !== 'library' && st.mode !== 'explore';
    root.querySelector('[data-act="scan"]').textContent = (st.autoscan ? '⏸ ' : '▶ ') + L('Auto-scan along weld', 'Balayage auto');
    root.querySelector('[data-cards]').hidden = st.mode !== 'library';
  }

  function renderPanel() {
    const p = root.querySelector('[data-panel]'), d = st.defect;
    if (st.mode === 'library') {
      const t = TYPES[st.key], c = t.cases[st.caseKey], ev = evaluate(d);
      const rows = [[L('Thickness t', 'Épaisseur e'), d.T + ' mm']];
      if (d.cls === 'lamination') rows.push([L('Depth', 'Profondeur'), d.z + ' mm'], [L('Total back-wall loss area', 'Zone de perte totale du fond'), `${d.x2 - d.x1} × ${d.y2 - d.y1} mm`], [L('Probe', 'Palpeur'), '0°']);
      else {
        rows.push([L('Depth (centre)', 'Profondeur (centre)'), d.z.toFixed(1) + ' mm'], [L('Length along weld', 'Longueur'), d.L >= 100 ? L('continuous', 'continue') : d.L + ' mm'], [L('Amplitude at peak', 'Amplitude au maximum'), (d.dB >= 0 ? '+' : '') + d.dB.toFixed(0) + ' dB / DAC'], [L('Probe', 'Palpeur'), '60°']);
        if (d.cls === 'surface') rows.push([L('Visual depth (gauge)', 'Profondeur visuelle (jauge)'), d.vt + ' mm']);
        else if (d.cls !== 'geometry') rows.push([L('Length limit for this t', 'Limite de longueur pour cette e'), lengthLimit(d.T).toFixed(1) + ' mm']);
      }
      p.innerHTML = `<h3>${esc(T2(t.name))}</h3>
<div class="cyut-cases"><button type="button" data-case="reject" class="${st.caseKey === 'reject' ? 'on' : ''}">✖ ${L('Rejected', 'Refusé')}</button><button type="button" data-case="accept" class="${st.caseKey === 'accept' ? 'on' : ''}">✔ ${L('Not rejected', 'Non refusé')}</button></div>
${c.label ? `<p><b>${esc(T2(c.label))}</b></p>` : ''}
<div class="cyut-verdict ${ev.reject ? 'reject' : 'accept'}"><b>${ev.reject ? L('REJECTED', 'REFUSÉ') : L('NOT REJECTED', 'NON REFUSÉ')}</b>${esc(T2(ev.why))}</div>
${c.note ? `<p class="cyut-tip">${esc(T2(c.note))}</p>` : ''}
<table class="cyut-table">${rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>
<h4>${L('How it looks on the flaw detector', 'Aspect sur le détecteur de défauts')}</h4><ul>${t.look.map((x) => `<li>${esc(T2(x))}</li>`).join('')}</ul>
<p class="cyut-tip">💡 ${esc(T2(t.tip))}</p>
<p class="cyut-rule">📘 ${esc(T2(ruleFor(d)))}</p>`;
    } else if (st.mode === 'explore') {
      const names = { none: ['No defect', 'Aucun défaut'] };
      p.innerHTML = `<h3>🔬 ${L('Explore: why does the echo move?', 'Explorer : pourquoi l’écho bouge-t-il ?')}</h3>
<p class="mut">${L('Change one setting at a time and watch the A-scan, the beam and the explanation below. The dashed beam is what the instrument assumes; the blue beam is what really happens.', 'Changez un réglage à la fois et regardez l’A-scan, le faisceau et l’explication ci-dessous. Le faisceau pointillé est ce que suppose l’appareil ; le faisceau bleu est ce qui se passe réellement.')}</p>
<div class="cyut-ex">
<label>${L('Reflector', 'Réflecteur')}<select data-x="def">${EXPLORE_TYPES.map((k) => `<option value="${k}"${k === st.xkey ? ' selected' : ''}>${esc(T2(k === 'none' ? names.none : TYPES[k].name))}</option>`).join('')}</select></label>
<label>${L('Thickness', 'Épaisseur')} <b data-xv="T">${st.T}</b> mm<input type="range" data-x="T" min="8" max="60" step="1" value="${st.T}" style="width:100%"></label>
<label>${L('Material (real sound velocity)', 'Matériau (vitesse réelle du son)')}<select data-x="mat">${Object.keys(MATERIALS).map((k) => `<option value="${k}"${k === st.mat ? ' selected' : ''}>${esc(T2(MATERIALS[k].n))} · L ${MATERIALS[k].vl} / T ${MATERIALS[k].vs} m/s</option>`).join('')}</select></label>
<label>${L('Instrument velocity setting (m/s)', 'Vitesse réglée sur l’appareil (m/s)')}<input type="number" data-x="v" min="1000" max="7000" step="10" value="${vCal(st)}" style="width:100%;margin-top:3px;border:1px solid var(--line);border-radius:7px;background:#0b1530;color:var(--text);padding:7px;font:inherit"></label>
<label>${L('Probe frequency', 'Fréquence du traducteur')}<select data-x="f">${[1, 2, 2.25, 4, 5, 10].map((f) => `<option value="${f}"${f === (st.freq || 4) ? ' selected' : ''}>${f} MHz</option>`).join('')}</select></label>
<div class="cyut-row"><button type="button" data-act="calmat">🎯 ${L('Calibrate on this material', 'Étalonner sur ce matériau')}</button><button type="button" data-act="calsteel">↺ ${L('Steel calibration', 'Étalonnage acier')}</button></div>
</div>
<h4>💡 ${L('Why?', 'Pourquoi ?')}</h4><ul data-why>${whyExplore().map((t) => '<li>' + esc(t) + '</li>').join('')}</ul>
<p class="cyut-rule">${L('Velocities are typical handbook values; attenuation is illustrative. Real work uses the velocity measured on the actual material and the approved procedure.', 'Les vitesses sont des valeurs typiques ; l’atténuation est illustrative. Sur le terrain, on utilise la vitesse mesurée sur le matériau réel et la procédure approuvée.')}</p>`;
    } else if (st.mode === 'dac') {
      const dc = st.dac, step = DAC_STEPS[dc.step], done = dc.points.length === marksBefore(DAC_STEPS.length);
      const extra = step.kind === 'mark' ? `<p class="mut">${L('Target', 'Cible')}: ${holeLabel(step.z, CAL_T)} (${step.z} mm) · ${L('leg', 'parcours')} ${step.leg} · ${L('expected sound path ≈', 'parcours attendu ≈')} ${stepS(step, CAL_T, st.angle).toFixed(1)} mm${dc.refGain !== null ? ' · ' + L('reference gain', 'gain de référence') + ' ' + dc.refGain.toFixed(1) + ' dB' : ''}</p>` : '';
      p.innerHTML = `<h3>📈 ${L('How to draw the DAC', 'Comment tracer la DAC')}</h3>
<ol class="cyut-steps">${DAC_STEPS.map((s, i) => `<li class="${i < dc.step ? 'done' : i === dc.step ? 'now' : ''}">${i < dc.step ? '✓ ' : ''}${esc(T2(s.title))}</li>`).join('')}</ol>
<div class="cyut-step"><b>${L('Step', 'Étape')} ${dc.step + 1} / ${DAC_STEPS.length}: ${esc(T2(step.title))}</b><p>${esc(T2(step.text))}</p>${extra}</div>
${dc.msg ? `<p class="cyut-msg ${dc.msg.ok ? 'ok' : 'err'}">${dc.msg.ok ? '✅' : '⚠'} ${esc(T2(dc.msg.text))}</p>` : ''}
<div class="cyut-row">${step.kind === 'mark' ? `<button type="button" class="ft-primary" data-act="mark">📍 ${L('Mark point', 'Marquer le point')}</button>` : dc.step < DAC_STEPS.length - 1 ? `<button type="button" class="ft-primary" data-act="dacnext">${L('Next step', 'Étape suivante')} →</button>` : `<span class="cyut-msg ok">🏁 ${L('DAC complete', 'DAC terminée')}</span>`}
${dc.step > 0 ? `<button type="button" data-act="dacback">← ${L('Back', 'Retour')}</button>` : ''}<button type="button" data-act="dacrestart">↺ ${L('Restart', 'Recommencer')}</button></div>
${dc.points.length ? `<h4>${L('Calibration sheet', 'Fiche d’étalonnage')}${done ? '' : ' (' + L('in progress', 'en cours') + ')'}</h4><table class="cyut-table"><tr><td><b>${L('Point', 'Point')}</b></td><td><b>${L('Sound path · amplitude', 'Parcours · amplitude')}</b></td></tr>${dc.points.map((x, i) => `<tr><td>${i + 1}. ${x.hole} (${x.depth} mm), ${L('leg', 'parcours')} ${x.leg}</td><td>${x.s.toFixed(1)} mm · ${x.a.toFixed(0)} %</td></tr>`).join('')}<tr><td>${L('Reference gain', 'Gain de référence')}</td><td>${dc.refGain.toFixed(1)} dB</td></tr><tr><td>${L('Probe / block', 'Palpeur / bloc')}</td><td>60° · t ${CAL_T} mm</td></tr></table>` : ''}`;
    } else {
      const ex = st.exercise;
      const opts = Object.keys(TYPES).filter((k) => k !== 'lamination' && k !== 'undercut').map((k) => `<option value="${k}">${esc(T2(TYPES[k].name))}</option>`).join('');
      p.innerHTML = `<div class="cyut-ex"><h3>🎯 ${L('Training exercise', 'Exercice d’entraînement')}</h3>
<p>${L('A hidden indication is somewhere in this weld. Scan along the weld and toward it, maximise the echo, plot it, measure the dB to DAC and the length (6 dB drop), then decide.', 'Une indication cachée se trouve dans cette soudure. Balayez le long et vers la soudure, maximisez l’écho, positionnez-le, mesurez les dB / DAC et la longueur (chute de 6 dB), puis décidez.')}</p>
<p class="mut">t = ${st.T} mm · ${L('length limit', 'limite de longueur')} ${lengthLimit(st.T).toFixed(1)} mm</p>
<label>${L('Indication type', 'Type d’indication')}<select data-ex="type"><option value="">—</option>${opts}</select></label>
<label>${L('Decision', 'Décision')}<select data-ex="decision"><option value="">—</option><option value="reject">${L('Rejected', 'Refusé')}</option><option value="accept">${L('Not rejected', 'Non refusé')}</option></select></label>
<div class="cyut-row"><button type="button" data-act="check" class="ft-primary">${L('Check my answer', 'Vérifier ma réponse')}</button><button type="button" data-act="new">🎲 ${L('New exercise', 'Nouvel exercice')}</button></div>
<div data-ex="result">${ex && ex.answered ? ex.html : ''}</div>
<p class="cyut-score">${L('Score', 'Score')}: ${st.score.right} / ${st.score.total}</p></div>`;
      if (ex && ex.answered) { p.querySelector('[data-ex="type"]').value = ex.type; p.querySelector('[data-ex="decision"]').value = ex.dec; }
    }
  }

  function renderCards() {
    const box = root.querySelector('[data-cards]');
    box.innerHTML = ORDER.map((k) => `<button type="button" class="cyut-card${k === st.key ? ' on' : ''}" data-type="${k}"><canvas></canvas><b>${esc(T2(TYPES[k].name))}</b><span>${esc(T2(TYPES[k].short))}</span></button>`).join('');
    requestAnimationFrame(() => box.querySelectorAll('[data-type]').forEach((b) => signature(b.querySelector('canvas'), b.dataset.type, 'reject')));
  }
  // Static A-scan of an indication type at its maximum echo (cards and Academy challenges); always on steel.
  function signature(cv, key, caseKey) {
    const s = Object.assign({}, st, { mat: 'steel', vInst: null, freq: 4 }); const d = makeDefect(key, caseKey || 'reject', false);
    s.T = d.T; s.angle = TYPES[key].probe === 0 ? 0 : 60; s.range = defaultRange(s); s.gateStart = 5; s.gateWidth = s.range - 5; s.gain = REF_GAIN + 2;
    autoPeak(s, d);
    drawAscan(cv, { st: s, d, small: true });
  }

  function checkAnswer() {
    const ex = st.exercise; if (!ex || ex.answered) return;
    const type = root.querySelector('[data-ex="type"]').value, dec = root.querySelector('[data-ex="decision"]').value;
    if (!type || !dec) { root.querySelector('[data-ex="result"]').innerHTML = `<p class="quiz-error">${L('Choose a type and a decision first.', 'Choisissez d’abord un type et une décision.')}</p>`; return; }
    const d = st.defect, ev = ex.decision;
    const typeOk = type === d.answer, decOk = (dec === 'reject') === ev.reject;
    st.score.total += 2; st.score.right += (typeOk ? 1 : 0) + (decOk ? 1 : 0);
    learn('ut-ex', { ok: typeOk && decOk });
    ex.answered = true; ex.type = type; ex.dec = dec;
    ex.html = `<div class="cyut-verdict ${ev.reject ? 'reject' : 'accept'}"><b>${ev.reject ? L('REJECTED', 'REFUSÉ') : L('NOT REJECTED', 'NON REFUSÉ')}</b>${esc(T2(ev.why))}</div>
<p>${typeOk ? '✅' : '❌'} ${L('Type', 'Type')}: <b>${esc(T2(TYPES[d.answer].name))}</b> · ${decOk ? '✅' : '❌'} ${L('Decision', 'Décision')}</p>
<table class="cyut-table"><tr><td>${L('Depth (centre)', 'Profondeur (centre)')}</td><td>${d.z.toFixed(1)} mm</td></tr><tr><td>${L('Length', 'Longueur')}</td><td>${d.L >= 100 ? L('continuous', 'continue') : d.L.toFixed(1) + ' mm'} (${d.y1.toFixed(0)}–${d.y2.toFixed(0)})</td></tr><tr><td>${L('Amplitude', 'Amplitude')}</td><td>${(d.dB >= 0 ? '+' : '') + d.dB.toFixed(1)} dB / DAC</td></tr></table>
<p class="cyut-tip">💡 ${esc(T2(TYPES[d.answer].tip))}</p>`;
    renderPanel();
  }

  function onClick(e) {
    const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.dataset.mode) {
      st.mode = b.dataset.mode; st.autoscan = false;
      if (st.mode === 'library') loadLibrary(st.key, st.caseKey);
      else if (st.mode === 'dac') enterDac(false);
      else if (st.mode === 'explore') { if (!st.defect || st.defect.cls === 'cal') st.T = 20; newExplore(); }
      else if (!st.exercise) newExercise();
      else { st.defect = st.exercise.defect; st.T = st.defect.T; st.angle = 60; st.range = defaultRange(st); st.gateStart = 5; st.gateWidth = st.range - 5; }
      syncControls(); renderPanel();
    } else if (b.dataset.type) {
      loadLibrary(b.dataset.type, 'reject'); st.autoscan = false;
      learn('ut-lib:' + b.dataset.type);
      root.querySelectorAll('.cyut-card').forEach((x) => x.classList.toggle('on', x === b));
      syncControls(); renderPanel();
    } else if (b.dataset.case) {
      loadLibrary(st.key, b.dataset.case); syncControls(); renderPanel();
    } else if (b.dataset.angle !== undefined) {
      st.angle = +b.dataset.angle; st.range = defaultRange(st); st.gateStart = st.angle === 0 ? 4 : 5; st.gateWidth = st.range - st.gateStart;
      if (st.mode === 'library') autoPeak(st, st.defect);
      if (st.mode === 'explore') { st.vInst = null; newExplore(); renderPanel(); }
      syncControls();
    } else if (b.dataset.gain) {
      st.gain = b.dataset.gain === 'ref' ? REF_GAIN : clamp(st.gain + +b.dataset.gain, 0, 100); syncControls();
    } else if (b.dataset.act === 'peak') { autoPeak(st, st.defect); syncControls(); }
    else if (b.dataset.act === 'scan') { st.autoscan = !st.autoscan; syncControls(); }
    else if (b.dataset.act === 'new') { newExercise(); syncControls(); renderPanel(); }
    else if (b.dataset.act === 'check') checkAnswer();
    else if (b.dataset.act === 'mark') { markPoint(); renderPanel(); }
    else if (b.dataset.act === 'dacnext') { st.dac.step++; st.dac.msg = null; renderPanel(); }
    else if (b.dataset.act === 'dacback') {
      // Stepping back over a marked point removes it (and the reference gain with the first one).
      const dc = st.dac; dc.step--; dc.msg = null;
      dc.points.length = Math.min(dc.points.length, marksBefore(dc.step));
      if (!dc.points.length) dc.refGain = null;
      renderPanel();
    } else if (b.dataset.act === 'dacrestart') { enterDac(true); syncControls(); renderPanel(); }
    else if (b.dataset.act === 'calmat') { st.vInst = vMat(st); learn('ut-explore'); newExplore(); syncControls(); renderPanel(); }
    else if (b.dataset.act === 'calsteel') { st.vInst = null; newExplore(); syncControls(); renderPanel(); }
  }

  function onInput(e) {
    const x = e.target.closest('[data-x]');
    if (x) {
      if (e.type === 'input' && x.tagName === 'SELECT') return; // selects are handled on change
      const k = x.dataset.x;
      if (k === 'T') st.T = +x.value;
      if (k === 'mat') { st.mat = x.value; learn('ut-explore'); }
      if (k === 'v') { const v = +x.value; st.vInst = v > 500 ? v : null; learn('ut-explore'); }
      if (k === 'def') st.xkey = x.value;
      if (k === 'f') { st.freq = +x.value; learn('ut-explore'); }
      if (e.type === 'change' || k === 'T') { newExplore(); syncControls(); if (k !== 'T') renderPanel(); else { const o = root.querySelector('[data-xv="T"]'); if (o) o.textContent = st.T; const wl = root.querySelector('[data-why]'); if (wl) wl.innerHTML = whyExplore().map((t) => '<li>' + esc(t) + '</li>').join(''); } }
      return;
    }
    const i = e.target.closest('[data-s]'); if (!i) return;
    st[i.dataset.s] = +i.value;
    if (i.dataset.s === 'range') { st.gateStart = Math.min(st.gateStart, st.range - 5); st.gateWidth = Math.min(st.gateWidth, st.range - st.gateStart); }
    if (i.dataset.s === 'y') st.autoscan = false;
    syncControls();
  }

  function frame(now) {
    raf = 0;
    if (!root || !root.isConnected) { root = null; return; }
    if (!root.open) return;
    raf = requestAnimationFrame(frame);
    if (now - lastFrame < 60) return;
    const dt = lastTime ? Math.min(0.2, (now - lastTime) / 1000) : 0; lastTime = now; lastFrame = now;
    if (st.autoscan) {
      st.y += st.scanDir * 15 * dt;
      if (st.y >= 100) { st.y = 100; st.scanDir = -1; } else if (st.y <= 0) { st.y = 0; st.scanDir = 1; }
      const i = root.querySelector('[data-s="y"]'); i.value = st.y; root.querySelector('[data-v="y"]').textContent = st.y.toFixed(1);
    }
    const d = st.defect, show = st.mode !== 'exercise' || (st.exercise && st.exercise.answered);
    const dc = st.mode === 'dac' ? st.dac : null, dstep = dc && DAC_STEPS[dc.step];
    const userDac = dc ? { points: dc.points, refGain: dc.refGain, complete: dc.points.length === marksBefore(DAC_STEPS.length) } : null;
    const arr = drawAscan(root.querySelector('.cyut-ascan'), { st, d, userDac });
    const g = fromDb(st.gain - REF_GAIN), peak = gatedPeak(st, arr);
    const r = (id, v) => { const x = root.querySelector(`[data-r="${id}"]`); if (x) x.textContent = v; };
    let loc = null;
    if (peak && peak.a * g >= 20) {
      loc = locate(st, peak.s);
      const shown = peak.a * g;
      r('s', peak.s.toFixed(1) + ' mm'); r('depth', loc.depth.toFixed(1) + ' mm'); r('surf', loc.surf.toFixed(1) + ' mm'); r('pos', loc.x.toFixed(1) + ' mm');
      r('amp', shown > 100 ? '>100 %' : shown.toFixed(0) + ' %');
      const dd = toDb(peak.a / dac(peak.s)); r('dbdac', (dd >= 0 ? '+' : '') + dd.toFixed(1) + ' dB'); r('leg', String(loc.leg));
    } else ['s', 'depth', 'surf', 'pos', 'amp', 'dbdac', 'leg'].forEach((id) => r(id, id === 'amp' ? L('< gate', '< porte') : '–'));
    drawSection(root.querySelector('.cyut-xs'), st, d, show, loc, dstep && dstep.kind === 'mark' ? dstep : null);
    drawDynamics(root.querySelector('.cyut-dyn'), st, d);
  }
  function start() { lastTime = 0; if (!raf) raf = requestAnimationFrame(frame); }

  function currentMethod() { const b = document.querySelector('#ptab .on'); return b && b.dataset.pm; }
  function inject() {
    const pb = document.getElementById('pbody');
    if (!pb || currentMethod() !== 'UT' || pb.querySelector('.cyut')) return;
    build(pb);
  }
  function init(n) {
    const pb = document.getElementById('pbody');
    if (!pb) { if (n < 20) setTimeout(() => init(n + 1), 300); return; }
    const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    new MutationObserver(inject).observe(pb, { childList: true });
    inject();
  }
  window.CYUTSIM = { TYPES, evaluate, makeDefect, signature };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(0)); else init(0);
}());
