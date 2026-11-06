/* CYCLOPS engineering workspace: educational calculators with the formula, your values substituted in,
   the result with units and why it matters. UT (sound path, thickness/velocity, Snell, dB), RT (distance,
   decay, geometric unsharpness), pressure (corrosion/remaining life, shell thickness demo, test pressure),
   lifting (sling legs, test loads, rope wear), electrical (Ohm, voltage drop, insulation), units, materials.
   Material values are typical textbook values; code formulas are shown for learning and must be applied with
   the governing code edition, the approved procedure and qualified personnel.
   window.CYWORK = { open(areaOrCalcId) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rad = (d) => d * Math.PI / 180, deg = (r) => r * 180 / Math.PI;
  const f = (v, n) => { if (!isFinite(v)) return '—'; const s = Number(v).toFixed(n == null ? 2 : n); return L(s, s.replace('.', ',')); };
  const num = (v) => Number(String(v).replace(',', '.'));

  // typical values (m/s, g/cm³): longitudinal, shear, density
  const MAT = {
    steel: [['Carbon steel', 'Acier au carbone'], 5920, 3240, 7.85], stainless: [['Austenitic stainless steel', 'Inox austénitique'], 5740, 3100, 7.9],
    aluminium: [['Aluminium', 'Aluminium'], 6320, 3130, 2.7], castiron: [['Cast iron (varies a lot)', 'Fonte (très variable)'], 4600, 2600, 7.2],
    copper: [['Copper', 'Cuivre'], 4660, 2260, 8.9], perspex: [['Perspex (wedge)', 'Plexiglas (sabot)'], 2730, 1430, 1.18],
    water: [['Water', 'Eau'], 1480, 0, 1.0], air: [['Air', 'Air'], 330, 0, 0.0012]
  };
  const matOpts = Object.keys(MAT).map((k) => [k, MAT[k][0]]);

  /* ---------- calculators ----------
     inputs: { k, l:[en,fr], v, u, o? (select options [value,[en,fr]]) }
     run(v) → { steps:[[label, formula, values, result]], ok?:[bool,[en,fr]], svg? } */
  const CALCS = [
    { id: 'ut-path', area: 'UT', icon: '📐', t: ['Angle-beam sound path', 'Parcours en faisceau d’angle'],
      intro: ['From the sound path on the screen to the real position of the reflector in the plate.', 'Du parcours affiché à l’écran à la position réelle du réflecteur dans la tôle.'],
      inputs: [{ k: 'a', l: ['Probe angle θ', 'Angle du traducteur θ'], v: 60, u: '°' }, { k: 'T', l: ['Thickness T', 'Épaisseur T'], v: 20, u: 'mm' }, { k: 'S', l: ['Sound path S', 'Parcours S'], v: 52, u: 'mm' }],
      run: ({ a, T, S }) => {
        const c = Math.cos(rad(a)), s = Math.sin(rad(a)), D = S * c, leg = Math.floor(D / T) + 1, depth = leg % 2 ? D - (leg - 1) * T : leg * T - D;
        return { steps: [
          [L('Vertical travel', 'Trajet vertical'), 'S × cos θ', `${f(S, 1)} × cos ${f(a, 1)}°`, f(D) + ' mm'],
          [L('Leg', 'Parcours n°'), 'floor(S cos θ ÷ T) + 1', `floor(${f(D)} ÷ ${f(T, 1)}) + 1`, String(leg) + (leg === 1 ? L(' (direct)', ' (direct)') : leg === 2 ? L(' (after the back-wall bounce)', ' (après rebond sur le fond)') : '')],
          [L('Depth', 'Profondeur'), leg === 1 ? 'S cos θ' : leg % 2 ? `S cos θ − ${leg - 1}T` : `${leg}T − S cos θ`, leg === 1 ? f(D) : leg % 2 ? `${f(D)} − ${f((leg - 1) * T, 1)}` : `${f(leg * T, 1)} − ${f(D)}`, f(depth) + ' mm'],
          [L('Surface distance from index', 'Distance en surface depuis le point d’émergence'), 'S × sin θ', `${f(S, 1)} × ${f(s, 3)}`, f(S * s) + ' mm'],
          [L('Half skip / full skip', 'Demi-bond / bond'), 'T tan θ / 2T tan θ', `${f(T, 1)} × ${f(Math.tan(rad(a)), 3)}`, f(T * Math.tan(rad(a))) + ' / ' + f(2 * T * Math.tan(rad(a))) + ' mm']
        ], svg: pathSvg(a, T, S, leg, depth) };
      }, why: ['Depth and surface distance tell you where the reflector sits relative to the weld (root, mid-wall, cap, HAZ) — the first step of interpretation. Forgetting the back-wall bounce is the classic mistake.', 'Profondeur et distance en surface situent le réflecteur par rapport à la soudure (racine, mi-épaisseur, chapeau, ZAT) — première étape de l’interprétation. Oublier le rebond sur le fond est l’erreur classique.'] },
    { id: 'ut-thick', area: 'UT', icon: '📏', t: ['Thickness, time of flight and velocity error', 'Épaisseur, temps de vol et erreur de vitesse'],
      intro: ['A 0° thickness gauge measures time and converts it with the velocity you set. A wrong velocity gives a wrong thickness.', 'Un mesureur 0° mesure un temps et le convertit avec la vitesse réglée. Une mauvaise vitesse donne une mauvaise épaisseur.'],
      inputs: [{ k: 't', l: ['Round-trip time t', 'Temps aller-retour t'], v: 6.76, u: 'µs' }, { k: 'vi', l: ['Velocity set on the instrument', 'Vitesse réglée sur l’appareil'], v: 5920, u: 'm/s' }, { k: 'va', l: ['Real velocity of the material', 'Vitesse réelle du matériau'], v: 5740, u: 'm/s' }],
      run: ({ t, vi, va }) => { const shown = vi / 1000 * t / 2, real = va / 1000 * t / 2, err = (shown - real) / real * 100; return { steps: [
        [L('Displayed thickness', 'Épaisseur affichée'), 'd = V_set × t ÷ 2', `${f(vi / 1000, 3)} mm/µs × ${f(t)} ÷ 2`, f(shown) + ' mm'],
        [L('Real thickness', 'Épaisseur réelle'), 'd = V_real × t ÷ 2', `${f(va / 1000, 3)} × ${f(t)} ÷ 2`, f(real) + ' mm'],
        [L('Error', 'Erreur'), '(d_shown − d_real) ÷ d_real', `(${f(shown)} − ${f(real)}) ÷ ${f(real)}`, f(err, 1) + ' %']],
        ok: [Math.abs(err) < 1, Math.abs(err) < 1 ? ['Velocity setting is consistent with the material.', 'Le réglage de vitesse est cohérent avec le matériau.'] : ['Calibrate on a block of the same material (or a known thickness of the part) before measuring.', 'Étalonnez sur un bloc du même matériau (ou une épaisseur connue de la pièce) avant de mesurer.']] }; },
      why: ['Divide by 2 because sound goes there and back. Velocity changes with material (and temperature), which is why calibration on the same material matters.', 'On divise par 2 car le son fait l’aller-retour. La vitesse dépend du matériau (et de la température) : d’où l’étalonnage sur le même matériau.'] },
    { id: 'ut-snell', area: 'UT', icon: '🔀', t: ['Probe angle: Snell’s law and critical angles', 'Angle du traducteur : loi de Snell et angles critiques'],
      intro: ['How the wedge angle becomes the angle in the part, and why angle probes send only shear waves.', 'Comment l’angle du sabot devient l’angle dans la pièce, et pourquoi les traducteurs d’angle n’envoient que des ondes transversales.'],
      inputs: [{ k: 'a1', l: ['Incidence angle in the wedge', 'Angle d’incidence dans le sabot'], v: 46.9, u: '°' }, { k: 'v1', l: ['Wedge velocity (longitudinal)', 'Vitesse du sabot (longitudinale)'], v: 2730, u: 'm/s' }, { k: 'm', l: ['Part material', 'Matériau de la pièce'], v: 'steel', o: matOpts }],
      run: ({ a1, v1, m }) => { const M = MAT[m], sl = Math.sin(rad(a1)) * M[1] / v1, ss = M[2] ? Math.sin(rad(a1)) * M[2] / v1 : 2, c1 = v1 < M[1] ? deg(Math.asin(v1 / M[1])) : NaN, c2 = M[2] && v1 < M[2] ? deg(Math.asin(v1 / M[2])) : NaN; return { steps: [
        [L('Refracted longitudinal wave', 'Onde longitudinale réfractée'), 'sin β_L = sin α × V_L ÷ V₁', `${f(Math.sin(rad(a1)), 3)} × ${M[1]} ÷ ${v1}`, sl <= 1 ? f(deg(Math.asin(sl)), 1) + '°' : L('none (beyond 1st critical angle)', 'aucune (au-delà du 1er angle critique)')],
        [L('Refracted shear wave', 'Onde transversale réfractée'), 'sin β_T = sin α × V_T ÷ V₁', M[2] ? `${f(Math.sin(rad(a1)), 3)} × ${M[2]} ÷ ${v1}` : L('no shear waves in liquids/gases', 'pas d’ondes transversales dans les fluides'), ss <= 1 ? f(deg(Math.asin(ss)), 1) + '°' : L('none', 'aucune')],
        [L('1st critical angle', '1er angle critique'), 'asin(V₁ ÷ V_L)', `asin(${v1} ÷ ${M[1]})`, isFinite(c1) ? f(c1, 1) + '°' : '—'],
        [L('2nd critical angle', '2e angle critique'), 'asin(V₁ ÷ V_T)', M[2] ? `asin(${v1} ÷ ${M[2]})` : '—', isFinite(c2) ? f(c2, 1) + '°' : '—']],
        ok: [sl > 1 && ss <= 1, sl > 1 && ss <= 1 ? ['Between the two critical angles: only a shear wave enters the part — a clean single beam, as wanted for angle-beam testing.', 'Entre les deux angles critiques : seule une onde transversale entre — un faisceau unique et propre, comme voulu en contrôle d’angle.'] : ['Outside the 1st–2nd critical-angle window: two beams (confusing echoes) or no beam at all.', 'Hors de la fenêtre entre 1er et 2e angle critique : deux faisceaux (échos trompeurs) ou aucun faisceau.']] }; },
      why: ['A "60° steel" probe is 60° only in steel: in another material the real angle changes, and depth and position calculations change with it.', 'Un traducteur « 60° acier » ne fait 60° que dans l’acier : dans un autre matériau l’angle réel change, et les calculs de profondeur et de position aussi.'] },
    { id: 'ut-db', area: 'UT', icon: '📶', t: ['Decibels and echo amplitude', 'Décibels et amplitude d’écho'],
      intro: ['Compare two echoes in dB, or predict an echo height after a gain change.', 'Comparer deux échos en dB, ou prévoir la hauteur d’un écho après un changement de gain.'],
      inputs: [{ k: 'a1', l: ['Echo 1 height', 'Hauteur écho 1'], v: 80, u: '%' }, { k: 'a2', l: ['Echo 2 height', 'Hauteur écho 2'], v: 20, u: '%' }, { k: 'g', l: ['Gain change on echo 2', 'Variation de gain sur l’écho 2'], v: 6, u: 'dB' }],
      run: ({ a1, a2, g }) => ({ steps: [
        [L('Difference', 'Écart'), '20 × log₁₀(A₁ ÷ A₂)', `20 × log₁₀(${f(a1, 0)} ÷ ${f(a2, 0)})`, f(20 * Math.log10(a1 / a2), 1) + ' dB'],
        [L('Echo 2 after the gain change', 'Écho 2 après variation de gain'), 'A₂ × 10^(ΔG ÷ 20)', `${f(a2, 0)} × 10^(${f(g, 1)} ÷ 20)`, f(a2 * Math.pow(10, g / 20), 1) + ' %' + (a2 * Math.pow(10, g / 20) > 100 ? L(' (saturated on screen)', ' (saturé à l’écran)') : '')]] }),
      why: ['+6 dB ≈ ×2, −6 dB ≈ ÷2, ±20 dB = ×10. DAC levels (−6 dB = 50 %, −14 dB = 20 %) use exactly this.', '+6 dB ≈ ×2, −6 dB ≈ ÷2, ±20 dB = ×10. Les niveaux DAC (−6 dB = 50 %, −14 dB = 20 %) reposent exactement là-dessus.'] },
    { id: 'rt-rad', area: 'RT', icon: '☢', t: ['Radiation: distance, decay, unsharpness', 'Rayonnement : distance, décroissance, flou'],
      intro: ['Three calculations every radiographer uses: dose with distance, source activity over time, geometric unsharpness.', 'Trois calculs de tout radiologue : dose et distance, activité dans le temps, flou géométrique.'],
      inputs: [{ k: 'd1', l: ['Dose rate D₁', 'Débit de dose D₁'], v: 200, u: 'µSv/h' }, { k: 'x1', l: ['at distance', 'à la distance'], v: 2, u: 'm' }, { k: 'x2', l: ['new distance', 'nouvelle distance'], v: 8, u: 'm' },
        { k: 'iso', l: ['Isotope', 'Isotope'], v: 'ir', o: [['ir', ['Ir-192 (T½ ≈ 74 days)', 'Ir-192 (T½ ≈ 74 jours)']], ['se', ['Se-75 (T½ ≈ 120 days)', 'Se-75 (T½ ≈ 120 jours)']], ['co', ['Co-60 (T½ ≈ 5.27 years)', 'Co-60 (T½ ≈ 5,27 ans)']]] }, { k: 'a0', l: ['Activity today', 'Activité aujourd’hui'], v: 1500, u: 'GBq' }, { k: 'days', l: ['after', 'après'], v: 74, u: L('days', 'jours') },
        { k: 'F', l: ['Focal spot size F', 'Taille du foyer F'], v: 3, u: 'mm' }, { k: 'dd', l: ['Object-to-film distance d', 'Distance objet-film d'], v: 25, u: 'mm' }, { k: 'D', l: ['Source-to-object distance D', 'Distance source-objet D'], v: 700, u: 'mm' }],
      run: ({ d1, x1, x2, iso, a0, days, F, dd, D }) => { const th = { ir: 74, se: 120, co: 1925 }[iso]; return { steps: [
        [L('Inverse square law', 'Loi de l’inverse du carré'), 'D₂ = D₁ × (x₁ ÷ x₂)²', `${f(d1, 0)} × (${f(x1, 1)} ÷ ${f(x2, 1)})²`, f(d1 * Math.pow(x1 / x2, 2), 1) + ' µSv/h'],
        [L('Source decay', 'Décroissance de la source'), 'A = A₀ × 0.5^(t ÷ T½)', `${f(a0, 0)} × 0.5^(${f(days, 0)} ÷ ${th})`, f(a0 * Math.pow(0.5, days / th), 0) + ' GBq'],
        [L('Geometric unsharpness', 'Flou géométrique'), 'Ug = F × d ÷ D', `${f(F, 1)} × ${f(dd, 0)} ÷ ${f(D, 0)}`, f(F * dd / D, 2) + ' mm']] }; },
      why: ['Twice as far = four times less dose. A decayed source needs longer exposures. Ug is reduced by a smaller source, film closer to the part, or a longer source distance — the maximum allowed comes from the code edition.', 'Deux fois plus loin = quatre fois moins de dose. Une source décrue demande des poses plus longues. Ug diminue avec une source plus petite, un film plus proche, ou une distance source plus grande — le maximum autorisé vient de l’édition du code.'] },
    { id: 'press-corr', area: 'APVG', icon: '🛢', t: ['Corrosion rate and remaining life', 'Vitesse de corrosion et durée de vie restante'],
      intro: ['The simplified method used in in-service inspection (API 510 / API 570 style) — a learning estimate.', 'La méthode simplifiée de l’inspection en service (type API 510 / API 570) — une estimation pédagogique.'],
      inputs: [{ k: 'tp', l: ['Previous thickness', 'Épaisseur précédente'], v: 12, u: 'mm' }, { k: 'tc', l: ['Current thickness', 'Épaisseur actuelle'], v: 11.2, u: 'mm' }, { k: 'y', l: ['Years between readings', 'Années entre mesures'], v: 8, u: L('years', 'ans') }, { k: 'tr', l: ['Required thickness', 'Épaisseur requise'], v: 9.5, u: 'mm' }],
      run: ({ tp, tc, y, tr }) => { const cr = (tp - tc) / y, life = (tc - tr) / cr; return { steps: [
        [L('Corrosion rate', 'Vitesse de corrosion'), '(t_prev − t_now) ÷ years', `(${f(tp)} − ${f(tc)}) ÷ ${f(y, 1)}`, f(cr, 3) + ' mm/' + L('year', 'an')],
        [L('Remaining life', 'Durée de vie restante'), '(t_now − t_required) ÷ rate', `(${f(tc)} − ${f(tr)}) ÷ ${f(cr, 3)}`, cr > 0 ? f(life, 1) + ' ' + L('years', 'ans') : L('no measurable loss', 'pas de perte mesurable')]],
        ok: [tc > tr, tc > tr ? ['Above the required thickness. The next inspection interval is set by the regulation and the inspection code (often a fraction of the remaining life).', 'Au-dessus de l’épaisseur requise. L’intervalle d’inspection suivant est fixé par la réglementation et le code d’inspection (souvent une fraction de la durée de vie).'] : ['At or below the required thickness: stop and refer to the inspector/engineer (fitness-for-service, repair or rerating).', 'À ou sous l’épaisseur requise : arrêt et renvoi à l’inspecteur/ingénieur (aptitude au service, réparation ou déclassement).']] }; },
      why: ['Use the thinnest reading of the location (not an average) and readings taken at the same points over time.', 'Utilisez la mesure la plus faible de l’emplacement (pas une moyenne) et des mesures prises aux mêmes points dans le temps.'] },
    { id: 'press-shell', area: 'APVG', icon: '🧱', t: ['Shell thickness and test pressure (demo)', 'Épaisseur de virole et pression d’épreuve (démo)'],
      intro: ['Educational demonstration of the circumferential-stress formula of ASME VIII Div. 1 UG-27(c)(1). S and E must come from the code edition in force and Section II-D.', 'Démonstration pédagogique de la formule de contrainte circonférentielle de l’ASME VIII div. 1 UG-27(c)(1). S et E doivent venir de l’édition en vigueur et de la section II-D.'],
      inputs: [{ k: 'P', l: ['Design pressure P', 'Pression de calcul P'], v: 1.5, u: 'MPa' }, { k: 'R', l: ['Inside radius R', 'Rayon intérieur R'], v: 600, u: 'mm' }, { k: 'S', l: ['Allowable stress S', 'Contrainte admissible S'], v: 138, u: 'MPa' }, { k: 'E', l: ['Joint efficiency E', 'Coefficient de soudure E'], v: 0.85, u: '' }, { k: 'CA', l: ['Corrosion allowance', 'Surépaisseur de corrosion'], v: 3, u: 'mm' }, { k: 'k', l: ['Test factor (training example)', 'Facteur d’épreuve (exemple)'], v: 1.3, u: '×' }],
      run: ({ P, R, S, E, CA, k }) => { const t = P * R / (S * E - 0.6 * P); return { steps: [
        [L('Required thickness (pressure only)', 'Épaisseur requise (pression seule)'), 't = P R ÷ (S E − 0.6 P)', `${f(P)} × ${f(R, 0)} ÷ (${f(S, 0)} × ${f(E)} − 0.6 × ${f(P)})`, f(t) + ' mm'],
        [L('With corrosion allowance', 'Avec surépaisseur de corrosion'), 't + CA', `${f(t)} + ${f(CA, 1)}`, f(t + CA) + ' mm'],
        [L('Test pressure (training example)', 'Pression d’épreuve (exemple)'), 'k × P', `${f(k, 2)} × ${f(P)}`, f(k * P) + ' MPa = ' + f(k * P * 10, 1) + ' bar']] }; },
      why: ['Thicker shell for higher pressure or larger radius; weaker welds (lower E) need more thickness. The real minimum also checks other loads and the nominal plate thickness available. In Algeria, Decree 90-245 requires a test of at least 1.5 × the design pressure.', 'Virole plus épaisse pour plus de pression ou de rayon ; des soudures moins efficaces (E plus faible) demandent plus d’épaisseur. Le minimum réel vérifie aussi d’autres charges et l’épaisseur de tôle disponible. En Algérie, le décret 90-245 exige une épreuve d’au moins 1,5 × la pression de calcul.'] },
    { id: 'lift', area: 'APL', icon: '🏗', t: ['Slings, test loads and rope wear', 'Élingues, charges d’essai et usure du câble'],
      intro: ['The angle of sling legs increases the force in each leg — the most common rigging surprise.', 'L’angle des brins d’élingue augmente l’effort dans chaque brin — la surprise la plus fréquente en élingage.'],
      inputs: [{ k: 'W', l: ['Load', 'Charge'], v: 4, u: 't' }, { k: 'n', l: ['Legs carrying the load', 'Brins porteurs'], v: 2, u: '' }, { k: 'al', l: ['Angle of each leg from vertical', 'Angle de chaque brin par rapport à la verticale'], v: 45, u: '°' }, { k: 'swl', l: ['Hoist SWL', 'CMU du palan'], v: 10, u: 't' }, { k: 'dn', l: ['Rope nominal diameter', 'Diamètre nominal du câble'], v: 16, u: 'mm' }, { k: 'dm', l: ['Rope measured diameter', 'Diamètre mesuré du câble'], v: 15.2, u: 'mm' }],
      run: ({ W, n, al, swl, dn, dm }) => { const leg = W / (n * Math.cos(rad(al))), red = (dn - dm) / dn * 100; return { steps: [
        [L('Force in each leg', 'Effort dans chaque brin'), 'W ÷ (n × cos α)', `${f(W, 1)} ÷ (${f(n, 0)} × ${f(Math.cos(rad(al)), 3)})`, f(leg) + ' t'],
        [L('Angle factor', 'Facteur d’angle'), '1 ÷ cos α', `1 ÷ ${f(Math.cos(rad(al)), 3)}`, '×' + f(1 / Math.cos(rad(al)))],
        [L('Static / dynamic test load (training example 125 % / 110 %)', 'Charge d’épreuve statique / dynamique (exemple 125 % / 110 %)'), 'SWL × 1.25 / × 1.1', `${f(swl, 1)} × 1.25 / × 1.1`, f(swl * 1.25) + ' / ' + f(swl * 1.1) + ' t'],
        [L('Rope diameter reduction', 'Réduction de diamètre du câble'), '(d_nom − d_meas) ÷ d_nom', `(${f(dn, 1)} − ${f(dm, 1)}) ÷ ${f(dn, 1)}`, f(red, 1) + ' %']],
        ok: [al <= 60, al <= 60 ? ['Leg angle acceptable for most rigging practice; check each leg against the sling WLL at this angle.', 'Angle de brin acceptable en pratique courante ; vérifiez chaque brin contre la CMU de l’élingue à cet angle.'] : ['More than 60° from vertical: forces climb very fast — avoid, use a spreader beam or longer slings.', 'Plus de 60° par rapport à la verticale : les efforts grimpent très vite — à éviter, utiliser un palonnier ou des élingues plus longues.']] }; },
      why: ['At 60° from vertical each leg carries the whole load. Rope discard criteria (diameter, broken wires) come from ISO 4309 or the manufacturer — verify the edition.', 'À 60° de la verticale chaque brin porte toute la charge. Les critères de dépose (diamètre, fils cassés) viennent de l’ISO 4309 ou du fabricant — vérifiez l’édition.'] },
    { id: 'elec', area: 'APE', icon: '⚡', t: ['Ohm’s law, voltage drop, insulation', 'Loi d’Ohm, chute de tension, isolement'],
      intro: ['Core electrical-inspection calculations, single-phase copper circuit.', 'Calculs de base de la vérification électrique, circuit monophasé cuivre.'],
      inputs: [{ k: 'U', l: ['Voltage U', 'Tension U'], v: 230, u: 'V' }, { k: 'I', l: ['Current I', 'Courant I'], v: 16, u: 'A' }, { k: 'Lm', l: ['Cable length (one way)', 'Longueur du câble (aller)'], v: 40, u: 'm' }, { k: 'S', l: ['Conductor section', 'Section du conducteur'], v: 2.5, u: 'mm²' }, { k: 'Ri', l: ['Insulation resistance measured', 'Résistance d’isolement mesurée'], v: 0.8, u: 'MΩ' }, { k: 'Rmin', l: ['Minimum required (training value)', 'Minimum exigé (valeur de formation)'], v: 1, u: 'MΩ' }],
      run: ({ U, I, Lm, S, Ri, Rmin }) => { const rho = 0.0225, du = 2 * rho * Lm * I / S; return { steps: [
        [L('Load resistance and power', 'Résistance et puissance de la charge'), 'R = U ÷ I ; P = U × I', `${f(U, 0)} ÷ ${f(I, 1)} ; ${f(U, 0)} × ${f(I, 1)}`, f(U / I) + ' Ω ; ' + f(U * I / 1000) + ' kW'],
        [L('Voltage drop', 'Chute de tension'), 'ΔU = 2 × ρ × L × I ÷ S (ρ ≈ 0.0225 Ω·mm²/m)', `2 × 0.0225 × ${f(Lm, 0)} × ${f(I, 1)} ÷ ${f(S, 1)}`, f(du) + ' V = ' + f(du / U * 100, 1) + ' %'],
        [L('Insulation check', 'Contrôle d’isolement'), 'R_measured ≥ R_min', `${f(Ri)} MΩ ≥ ${f(Rmin)} MΩ`, Ri >= Rmin ? L('PASS', 'CONFORME') : L('FAIL', 'NON CONFORME')]],
        ok: [Ri >= Rmin && du / U * 100 <= 5, Ri < Rmin ? ['Insulation below minimum: find and repair the fault, then re-test. Never work live to investigate.', 'Isolement sous le minimum : trouver et réparer le défaut, puis recontrôler. Jamais sous tension pour chercher.'] : du / U * 100 > 5 ? ['Voltage drop above about 5 %: a larger section or shorter run is usually needed — limits come from the installation standard.', 'Chute de tension au-delà d’environ 5 % : il faut en général une section plus forte ou un trajet plus court — les limites viennent de la norme d’installation.'] : ['Values consistent for this training example.', 'Valeurs cohérentes pour cet exemple de formation.']] }; },
      why: ['×2 because current goes out and back. Insulation minimum values and test voltages come from the installation standard (e.g. IEC 60364-6) — verify the edition and national rules.', '×2 car le courant fait l’aller et le retour. Les minimums d’isolement et tensions d’essai viennent de la norme d’installation (ex. IEC 60364-6) — vérifiez l’édition et les règles nationales.'] },
    { id: 'units', area: 'GEN', icon: '🔁', t: ['Unit converter', 'Convertisseur d’unités'],
      intro: ['The conversions inspectors meet every day, with the factor shown.', 'Les conversions rencontrées chaque jour par les inspecteurs, avec le facteur affiché.'],
      inputs: [{ k: 'cat', l: ['Quantity', 'Grandeur'], v: 'len', o: [['len', ['Length', 'Longueur']], ['press', ['Pressure', 'Pression']], ['temp', ['Temperature', 'Température']], ['force', ['Force / mass', 'Force / masse']], ['vel', ['Velocity', 'Vitesse']]] }, { k: 'x', l: ['Value', 'Valeur'], v: 1, u: '' }, { k: 'from', l: ['From unit', 'Unité de départ'], v: 'in', o: [] }],
      units: { len: [['mm', 1], ['cm', 10], ['m', 1000], ['in', 25.4], ['ft', 304.8]], press: [['bar', 1], ['MPa', 10], ['kPa', 0.01], ['psi', 0.0689476], ['kg/cm²', 0.980665]], temp: [['°C'], ['°F'], ['K']], force: [['kN', 1], ['t (force)', 9.80665], ['kgf', 0.00980665], ['lbf', 0.00444822], ['N', 0.001]], vel: [['m/s', 1], ['mm/µs', 1000], ['in/µs', 25400], ['km/h', 1 / 3.6]] },
      run: null, why: ['Write the unit next to every number: most calculation mistakes are unit mistakes.', 'Écrivez l’unité à côté de chaque nombre : la plupart des erreurs de calcul sont des erreurs d’unité.'] },
    { id: 'mat', area: 'GEN', icon: '🧪', t: ['Material properties and sound', 'Propriétés des matériaux et son'],
      intro: ['Typical acoustic values, wavelength and how much sound reflects at an interface.', 'Valeurs acoustiques typiques, longueur d’onde et part du son réfléchie à une interface.'],
      inputs: [{ k: 'm1', l: ['Material 1', 'Matériau 1'], v: 'steel', o: matOpts }, { k: 'm2', l: ['Material 2 (interface)', 'Matériau 2 (interface)'], v: 'water', o: matOpts }, { k: 'fr', l: ['Probe frequency', 'Fréquence du traducteur'], v: 4, u: 'MHz' }],
      run: ({ m1, m2, fr }) => { const A = MAT[m1], B = MAT[m2], z1 = A[1] * A[3] / 1000, z2 = B[1] * B[3] / 1000, R = Math.pow((z2 - z1) / (z2 + z1), 2) * 100, lam = A[1] / (fr * 1000), lamS = A[2] ? A[2] / (fr * 1000) : NaN; return { steps: [
        [L('Acoustic impedance', 'Impédance acoustique'), 'Z = ρ × V_L', `${f(A[3])} × ${A[1]} / ${f(B[3], 4)} × ${B[1]}`, f(z1, 2) + ' / ' + f(z2, 3) + ' ×10⁶ kg/m²s'],
        [L('Energy reflected at the interface', 'Énergie réfléchie à l’interface'), 'R = ((Z₂ − Z₁) ÷ (Z₂ + Z₁))²', `((${f(z2, 3)} − ${f(z1, 2)}) ÷ (${f(z2, 3)} + ${f(z1, 2)}))²`, f(R, 1) + ' %'],
        [L('Wavelength in material 1', 'Longueur d’onde dans le matériau 1'), 'λ = V ÷ f', `${A[1]} ÷ ${f(fr, 1)} MHz`, f(lam, 2) + ' mm (L) · ' + f(lamS, 2) + ' mm (T)']], table: true }; },
      why: ['Steel–air reflects almost 100 %: that is why couplant is needed and why cracks (thin air gaps) reflect so well. Very roughly, flaws smaller than about half a wavelength are hard to detect — a higher frequency helps but penetrates less.', 'Acier–air réfléchit presque 100 % : d’où le besoin de couplant et la bonne réflexion des fissures (fines lames d’air). Très grossièrement, les défauts plus petits qu’une demi-longueur d’onde sont difficiles à détecter — une fréquence plus haute aide mais pénètre moins.'] }
  ];
  const AREA_FIRST = { UT: 'ut-path', RT: 'rt-rad', APVG: 'press-corr', APL: 'lift', APE: 'elec', GEN: 'units', CODES: 'press-corr', MT: 'units', PT: 'units', VT: 'units' };

  function pathSvg(a, T, S, leg, depth) {
    const W = 520, H = 150, k = Math.min(90 / T, (W - 60) / Math.max(1, S * Math.sin(rad(a)) + 10)), y0 = 30, x0 = 30, th = T * k;
    const pts = [[x0, y0]]; let x = x0, y = y0, rem = S, down = true;
    while (rem > 0.001) { const segLen = Math.min(rem, T / Math.cos(rad(a))); x += segLen * Math.sin(rad(a)) * k; y += (down ? 1 : -1) * segLen * Math.cos(rad(a)) * k; pts.push([x, y]); rem -= segLen; down = !down; }
    const end = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="${L('Beam path in the plate', 'Trajet du faisceau dans la tôle')}">
<rect x="10" y="${y0}" width="${W - 20}" height="${th}" fill="#5d6b80" opacity=".35" stroke="#8fa3c0"/><rect x="${x0 - 22}" y="${y0 - 16}" width="30" height="16" rx="3" fill="#3d7fd6"/>
<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#ffe14d" stroke-width="2" stroke-dasharray="5 3"/>
<circle cx="${end[0].toFixed(1)}" cy="${end[1].toFixed(1)}" r="6" fill="#e66b78"/><text x="${Math.min(end[0] + 9, W - 120).toFixed(1)}" y="${(end[1] - 8).toFixed(1)}" fill="#fff" font-size="12">${L('depth', 'prof.')} ${f(depth, 1)} mm · ${L('leg', 'parcours')} ${leg}</text>
<text x="${W - 14}" y="${y0 + th + 14}" fill="#8fa3c0" font-size="11" text-anchor="end">T = ${f(T, 0)} mm</text></svg>`;
  }

  /* ---------- UI ---------- */
  const css = `
.cyws-layout { display: grid; grid-template-columns: minmax(250px, 320px) minmax(0, 1fr); gap: 16px; }
.cyws-in label { display: grid; gap: 3px; margin-bottom: 9px; font-size: 13px; color: var(--muted); }
.cyws-in input, .cyws-in select { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 8px 10px; font: inherit; }
.cyws-in .row { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center; } .cyws-in .row b { color: var(--text); min-width: 34px; font-size: 12px; }
.cyws-step { border: 1px solid var(--line); border-radius: 10px; padding: 9px 12px; margin-bottom: 8px; background: rgba(16, 25, 35, .6); display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; align-items: center; }
.cyws-step .lab { font-weight: 700; } .cyws-step code { font-family: ui-monospace, Consolas, monospace; font-size: 12.5px; color: #9ed0ff; } .cyws-step .val { color: var(--muted); font-size: 12.5px; font-family: ui-monospace, Consolas, monospace; }
.cyws-step .res { grid-row: 1 / span 3; grid-column: 2; font-weight: 800; font-size: 1.05rem; color: #7de2b5; text-align: right; transition: color .3s; }
.cyws-ok { border-left: 3px solid #42c991; padding: 7px 10px; margin: 8px 0; } .cyws-ko { border-left: 3px solid #e0a526; padding: 7px 10px; margin: 8px 0; }
.cyws-why { border-left: 3px solid var(--blue); padding: 7px 10px; margin: 10px 0; line-height: 1.5; }
.cyws-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; } .cyws-table td, .cyws-table th { border-bottom: 1px solid var(--line); padding: 5px 6px; text-align: left; }
.cyws .cylab-tabs button { font-size: 12.5px; padding: 5px 9px; }
@media (max-width: 760px) { .cyws-layout { grid-template-columns: minmax(0, 1fr); } .cyws .cylab-tabs { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; } .cyws .cylab-tabs button { white-space: nowrap; } }
`;
  let cur = null, vals = {}, ui = null, used = new Set();
  function open(target) {
    if (!window.CYLAB) return;
    const id = CALCS.find((c) => c.id === target) ? target : AREA_FIRST[target] || 'ut-path';
    ui = window.CYLAB.shell({ cls: 'cyws', title: '🧮 ' + L('Engineering workspace', 'Atelier de calcul'), sub: L('Formulas, your values, results and units — step by step · typical values, verify against the governing code', 'Formules, vos valeurs, résultats et unités — pas à pas · valeurs typiques, à vérifier avec le code applicable') });
    if (!document.getElementById('cyws-css')) { const s = document.createElement('style'); s.id = 'cyws-css'; s.textContent = css; document.head.appendChild(s); }
    ui.body.addEventListener('input', onInput); ui.body.addEventListener('change', onInput); ui.body.addEventListener('click', onClick);
    select(id);
  }
  function select(id) {
    cur = CALCS.find((c) => c.id === id); vals = {}; cur.inputs.forEach((i) => { vals[i.k] = i.v; });
    if (cur.id === 'units') vals.from = 'in';
    draw();
  }
  function draw() {
    const groups = [...new Set(CALCS.map((c) => c.area))];
    ui.body.innerHTML = `<div class="cylab-tabs">${groups.map((g) => CALCS.filter((c) => c.area === g).map((c) => `<button type="button" data-ws="${c.id}" class="${c.id === cur.id ? 'on' : ''}">${c.icon} ${esc(T2(c.t))}</button>`).join('')).join('')}</div>
<h2 style="margin:4px 0">${cur.icon} ${esc(T2(cur.t))}</h2><p>${esc(T2(cur.intro))}</p>
<div class="cyws-layout"><div class="cyws-in">${inputsHtml()}<button type="button" data-ws-ai="1">🧒 ${L('Explain this calculation (AI tutor)', 'Explique ce calcul (tuteur IA)')}</button></div><div data-ws-out></div></div>`;
    compute();
  }
  function inputsHtml() {
    return cur.inputs.map((i) => {
      if (cur.id === 'units' && i.k === 'from') return `<label>${esc(T2(i.l))}<select data-k="from">${cur.units[vals.cat].map(([u]) => `<option ${u === vals.from ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></label>`;
      if (i.o) return `<label>${esc(T2(i.l))}<select data-k="${i.k}">${i.o.map(([v, n]) => `<option value="${v}" ${v === vals[i.k] ? 'selected' : ''}>${esc(T2(n))}</option>`).join('')}</select></label>`;
      return `<label>${esc(T2(i.l))}<span class="row"><input data-k="${i.k}" inputmode="decimal" value="${esc(L(String(vals[i.k]), String(vals[i.k]).replace('.', ',')))}"><b>${esc(i.u || '')}</b></span></label>`;
    }).join('');
  }
  function compute() {
    const out = ui.body.querySelector('[data-ws-out]'); if (!out) return;
    const v = {}; for (const i of cur.inputs) v[i.k] = i.o || (cur.id === 'units' && i.k === 'from') ? vals[i.k] : num(vals[i.k]);
    const bad = cur.inputs.filter((i) => !i.o && !(cur.id === 'units' && i.k === 'from') && !isFinite(v[i.k]));
    if (bad.length) { out.innerHTML = `<p class="cyws-ko">${L('Enter a number for: ', 'Entrez un nombre pour : ')}${bad.map((i) => esc(T2(i.l))).join(', ')}</p>`; return; }
    let r;
    if (cur.id === 'units') {
      const list = cur.units[v.cat], from = list.find((u) => u[0] === v.from) || list[0];
      const conv = v.cat === 'temp' ? list.map(([u]) => { const c = from[0] === '°C' ? v.x : from[0] === '°F' ? (v.x - 32) * 5 / 9 : v.x - 273.15; return [u, u === '°C' ? c : u === '°F' ? c * 9 / 5 + 32 : c + 273.15]; }) : list.map(([u, k]) => [u, v.x * from[1] / k]);
      r = { steps: conv.filter(([u]) => u !== from[0]).map(([u, x]) => [`${f(v.x, 3)} ${from[0]} → ${u}`, v.cat === 'temp' ? (u === '°F' ? '°F = °C × 9/5 + 32' : u === 'K' ? 'K = °C + 273.15' : '°C = (°F − 32) × 5/9') : `× ${f(from[1] / list.find((q) => q[0] === u)[1], 5)}`, '', f(x, Math.abs(x) < 10 ? 4 : 2) + ' ' + u]) };
    } else r = cur.run(v);
    out.innerHTML = (r.svg || '') + r.steps.map(([lab, formula, values, res]) => `<div class="cyws-step"><span class="lab">${esc(lab)}</span><span class="res">${esc(res)}</span><code>${esc(formula)}</code>${values ? `<span class="val">= ${esc(values)}</span>` : ''}</div>`).join('') +
      (r.ok ? `<div class="${r.ok[0] ? 'cyws-ok' : 'cyws-ko'}">${r.ok[0] ? '✅' : '⚠'} ${esc(T2(r.ok[1]))}</div>` : '') +
      `<div class="cyws-why">💡 ${esc(T2(cur.why))}</div>` + (r.table ? matTable() : '') +
      `<p class="cylab-note">${L('Educational calculation with typical values. Real work uses measured data, the approved procedure and the governing code edition.', 'Calcul pédagogique avec valeurs typiques. Le travail réel utilise des données mesurées, la procédure approuvée et l’édition du code applicable.')}</p>`;
    if (!used.has(cur.id)) { used.add(cur.id); window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id: 'ws:' + cur.id } })); }
  }
  const matTable = () => `<table class="cyws-table"><tr><th>${L('Material', 'Matériau')}</th><th>V_L (m/s)</th><th>V_T (m/s)</th><th>ρ (g/cm³)</th></tr>${Object.values(MAT).map((m) => `<tr><td>${esc(T2(m[0]))}</td><td>${m[1]}</td><td>${m[2] || '—'}</td><td>${f(m[3], m[3] < 0.1 ? 4 : 2)}</td></tr>`).join('')}</table><p class="cylab-note">${L('Typical values: real velocities vary with alloy, heat treatment and temperature — measure on a reference block of the same material.', 'Valeurs typiques : les vitesses réelles varient selon l’alliage, le traitement thermique et la température — mesurez sur un bloc de référence du même matériau.')}</p>`;
  function onInput(e) {
    const k = e.target.dataset && e.target.dataset.k; if (!k) return;
    vals[k] = e.target.value;
    if (cur.id === 'units' && k === 'cat') { vals.from = cur.units[vals.cat][0][0]; ui.body.querySelector('.cyws-in').innerHTML = inputsHtml() + `<button type="button" data-ws-ai="1">🧒 ${L('Explain this calculation (AI tutor)', 'Explique ce calcul (tuteur IA)')}</button>`; }
    compute();
  }
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ws) return select(b.dataset.ws);
    if (b.dataset.wsAi) {
      const desc = cur.inputs.map((i) => T2(i.l) + ' = ' + (i.o ? vals[i.k] : vals[i.k] + ' ' + (i.u || ''))).join(', ');
      ui.close(); if (window.CY3 && window.CY3.beginner) window.CY3.beginner(L('Explain step by step, with the physical meaning of each step, this calculation: ', 'Explique pas à pas, avec le sens physique de chaque étape, ce calcul : ') + T2(cur.t) + ' (' + desc + ').');
    }
  }
  window.CYWORK = { open, CALCS };
  if (window.CYLAB) window.CYLAB.register({ icon: '🧮', available: () => true, open: () => open('ut-path'), title: () => L('Engineering workspace', 'Atelier de calcul'), desc: () => L('11 step-by-step calculators: UT sound path, thickness, Snell, dB, radiation, corrosion, shell thickness, slings, electrical, units, materials.', 'Calculateurs pas à pas : parcours UT, épaisseur, Snell, dB, rayonnement, corrosion, épaisseur de virole, élingues, électricité, unités, matériaux.') });
}());
