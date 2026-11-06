/* CYCLOPS digital twins: three FICTIONAL pieces of equipment, one per department, used for hands-on training.
   Each twin: 3D model (existing department scene), nameplate and technical specifications, components,
   simulated operating conditions with live status, hands-on inspection simulators and a virtual history.
     APVG  air receiver  — thickness survey (corrosion rate, remaining life) and hydrostatic test
     APL   overhead crane — wire-rope inspection and load test (brake, hook)
     APE   distribution board — lockout/tagout, insulation test, RCD test, thermography
   Values are generated for training; criteria are training values labelled as such (real ones come from the
   regulation, the code edition, the manufacturer and the approved procedure).
   window.CYTWIN = { open(dept) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const f = (v, n) => { const s = Number(v).toFixed(n == null ? 1 : n); return L(s, s.replace('.', ',')); };
  const num = (v) => Number(String(v).replace(',', '.').replace(/[^0-9.\-]/g, ''));
  const rnd = (a, b) => a + Math.random() * (b - a), pick = (a) => a[Math.floor(Math.random() * a.length)];
  const learn = (id, score) => window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id, score } }));
  const answer = (area, skill, ok, q, given, right, why) => window.dispatchEvent(new CustomEvent('cy-answer', { detail: { src: 'twin', area, skill, ok, q, given, right, why } }));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ======================= twin definitions ======================= */
  const TWINS = {
    APVG: { icon: '🛢', name: ['Air receiver AR-204', 'Réservoir d’air AR-204'],
      spec: [['Type', 'Type', ['Horizontal compressed-air receiver on two saddles', 'Réservoir d’air comprimé horizontal sur deux berceaux']], ['MAWP', 'PMS', '10 bar'], ['Design temperature', 'Température de calcul', '120 °C'], ['Volume', 'Volume', '2 000 L'], ['Shell / heads', 'Virole / fonds', ['10.0 mm carbon steel, torispherical heads', '10,0 mm acier au carbone, fonds torisphériques']], ['Required thickness (calculation)', 'Épaisseur requise (calcul)', '7.5 mm'], ['Corrosion allowance', 'Surépaisseur de corrosion', '1.5 mm'], ['Safety valve set pressure', 'Tarage de la soupape', '10 bar'], ['Year built', 'Année de construction', '2012']],
      parts: [['Shell', 'Virole', ['Cylindrical pressure boundary: thickness survey points (CMLs) are placed on it.', 'Enveloppe cylindrique sous pression : les points de mesure d’épaisseur (CML) y sont placés.']], ['Heads', 'Fonds', ['Dished ends closing the shell; check knuckle areas and welds.', 'Fonds bombés fermant la virole ; contrôler les zones de carre et les soudures.']], ['Nozzles & manway', 'Piquages et trou d’homme', ['Openings with reinforcement; gaskets and bolting are checked.', 'Ouvertures renforcées ; joints et boulonnerie sont contrôlés.']], ['Safety valve (PSV)', 'Soupape de sûreté', ['Protects against overpressure: set pressure, seal and test certificate are checked.', 'Protège contre la surpression : tarage, plomb et certificat d’essai sont vérifiés.']], ['Pressure gauge', 'Manomètre', ['Shows the operating pressure; red mark at MAWP; must be calibrated.', 'Indique la pression de service ; trait rouge à la PMS ; doit être étalonné.']], ['Drain valve', 'Purge', ['Removes condensate: water left inside causes internal corrosion at the bottom.', 'Évacue les condensats : l’eau restée à l’intérieur corrode le fond.']], ['Supports', 'Supports', ['Legs or skirt: check corrosion at the base and anchor bolts.', 'Pieds ou jupe : contrôler la corrosion en pied et les ancrages.']]],
      history: [['2012', ['Initial hydrostatic test 13 bar — passed. Shell 10.0 mm everywhere.', 'Épreuve initiale 13 bar — satisfaisante. Virole 10,0 mm partout.']], ['2016', ['Periodic inspection: drain valve seized, replaced. Light external rust on legs.', 'Inspection périodique : purge grippée, remplacée. Légère rouille extérieure sur les pieds.']], ['2020', ['Safety valve recalibrated, new seal. Thickness survey: minimum 9.7 mm at CML 8 (6 o’clock, near the drain).', 'Soupape réétalonnée, nouveau plomb. Mesures d’épaisseur : minimum 9,7 mm au CML 8 (6 h, près de la purge).']], ['2024', ['Operator report: water found when draining (automatic drain out of order).', 'Rapport exploitant : eau trouvée à la purge (purgeur automatique hors service).']]],
      tests: ['thick', 'hydro'] },
    APL: { icon: '🏗', name: ['Overhead crane OHC-12', 'Pont roulant OHC-12'],
      spec: [['Type', 'Type', ['Single-girder overhead travelling crane', 'Pont roulant monopoutre']], ['Safe working load (SWL)', 'Charge maximale d’utilisation (CMU)', '10 t'], ['Span / lift', 'Portée / levée', '18 m / 8 m'], ['Wire rope', 'Câble', ['16 mm, 6×36 IWRC, 30 m', '16 mm, 6×36 âme métallique, 30 m']], ['Hook', 'Crochet', ['Single hook with safety latch, reference gauge marks 60.0 mm apart', 'Crochet simple avec linguet, repères de contrôle à 60,0 mm']], ['Overload limiter', 'Limiteur de charge', ['Set to trip at 110 % SWL (training value)', 'Réglé pour couper à 110 % de la CMU (valeur de formation)']], ['Year built', 'Année de construction', '2009']],
      parts: [['Girder', 'Poutre', ['Main beam carrying the trolley: check welds, deformation, bolted joints.', 'Poutre principale portant le chariot : contrôler soudures, déformations, assemblages boulonnés.']], ['End carriages & runway', 'Sommiers et chemin de roulement', ['Wheels on rails: check flanges, rails, end stops and buffers.', 'Galets sur rails : contrôler boudins, rails, butées et tampons.']], ['Trolley & hoist', 'Chariot et palan', ['Gearbox, drum, motor; the hoist brake must hold the test load.', 'Réducteur, tambour, moteur ; le frein du palan doit retenir la charge d’essai.']], ['Wire rope', 'Câble', ['Inspected along its length: broken wires, diameter, corrosion, kinks, birdcaging.', 'Contrôlé sur sa longueur : fils cassés, diamètre, corrosion, coques, cages d’oiseau.']], ['Hook block', 'Moufle et crochet', ['Throat opening, twist, wear and the safety latch.', 'Ouverture, vrillage, usure et linguet.']], ['Limit switches & limiter', 'Fins de course et limiteur', ['Upper/lower hoist limits and the overload limiter are function-tested.', 'Fins de course haut/bas et limiteur de charge sont testés en fonctionnement.']]],
      history: [['2009', ['Commissioning: static test 12.5 t and dynamic test 11 t — passed.', 'Mise en service : épreuve statique 12,5 t et dynamique 11 t — satisfaisantes.']], ['2017', ['Wire rope replaced (broken wires near the drum).', 'Câble remplacé (fils cassés près du tambour).']], ['2022', ['Hoist brake linings replaced. Overload limiter recalibrated.', 'Garnitures de frein remplacées. Limiteur de charge réétalonné.']], ['2025', ['Operator log: load slowly drifting down when stopped (to be checked).', 'Registre : la charge descend lentement à l’arrêt (à vérifier).']]],
      tests: ['rope', 'load'] },
    APE: { icon: '⚡', name: ['Distribution board DB-3', 'Armoire de distribution DB-3'],
      spec: [['Supply', 'Alimentation', '400/230 V, TN-S, 63 A'], ['Outgoing circuits', 'Départs', ['6 circuits (C1–C6) with MCBs', '6 circuits (C1–C6) avec disjoncteurs']], ['RCDs', 'Différentiels', ['3 × 30 mA, type A', '3 × 30 mA, type A']], ['Enclosure', 'Enveloppe', 'IP54, metal'], ['Year installed', 'Année d’installation', '2014']],
      parts: [['Main switch', 'Interrupteur général', ['Isolating device for lockout: must be lockable in the OFF position.', 'Organe de séparation pour la consignation : doit être cadenassable en position ouverte.']], ['RCDs', 'Différentiels', ['Detect earth-leakage current and disconnect to protect people.', 'Détectent le courant de fuite à la terre et coupent pour protéger les personnes.']], ['MCBs', 'Disjoncteurs', ['Protect each circuit against overload and short circuit.', 'Protègent chaque circuit contre les surcharges et courts-circuits.']], ['Busbars & terminals', 'Jeux de barres et bornes', ['Loose terminals heat up under load: found by thermography.', 'Les bornes desserrées chauffent en charge : détectées par thermographie.']], ['Earth bar', 'Barrette de terre', ['Connects protective conductors; continuity is tested.', 'Relie les conducteurs de protection ; la continuité est testée.']]],
      history: [['2014', ['Initial verification — compliant.', 'Vérification initiale — conforme.']], ['2019', ['RCD 2 replaced (did not trip).', 'Différentiel 2 remplacé (ne déclenchait pas).']], ['2023', ['Two circuits added (C5, C6) by a subcontractor.', 'Deux circuits ajoutés (C5, C6) par un sous-traitant.']], ['2025', ['Operator report: smell of hot plastic near C3 under heavy load.', 'Rapport exploitant : odeur de plastique chaud près de C3 en forte charge.']]],
      tests: ['loto', 'ins', 'rcd', 'thermo'] }
  };
  const TEST_NAME = { thick: ['Thickness survey', 'Mesures d’épaisseur'], hydro: ['Hydrostatic test', 'Épreuve hydraulique'], rope: ['Wire-rope inspection', 'Contrôle du câble'], load: ['Load test', 'Essai de charge'], loto: ['Lockout / tagout', 'Consignation'], ins: ['Insulation test', 'Mesure d’isolement'], rcd: ['RCD test', 'Essai des différentiels'], thermo: ['Thermography', 'Thermographie'] };

  /* ======================= shell ======================= */
  const css = `
.cytw-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; } .cytw-tabs button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cytw-two { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(260px, 1fr); gap: 16px; }
.cytw-spec { width: 100%; border-collapse: collapse; font-size: 13px; } .cytw-spec td { border-bottom: 1px solid var(--line); padding: 5px 6px; vertical-align: top; } .cytw-spec td:first-child { color: var(--muted); width: 45%; }
.cytw-part { border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; margin: 6px 0; font-size: 13px; } .cytw-part b { display: block; }
.cytw-panel { border: 1px solid var(--line); border-radius: 10px; padding: 12px; margin: 10px 0; background: rgba(16, 25, 35, .6); }
.cytw-panel h3 { margin: 0 0 8px; }
.cytw-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 8px 0; }
.cytw-row input[type=number], .cytw-row input[type=text], .cytw-row select { border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 7px 9px; font: inherit; width: 120px; }
.cytw-row input[type=range] { flex: 1; min-width: 160px; }
.cytw-badge { display: inline-block; border-radius: 99px; padding: 3px 10px; font-weight: 700; font-size: 12px; }
.cytw-ok { background: rgba(28,106,78,.5); color: #7de2b5; } .cytw-warn { background: rgba(130,96,20,.5); color: #ffd27a; } .cytw-bad { background: rgba(130,47,61,.55); color: #ff9eaa; }
.cytw-cv { width: 100%; height: 230px; display: block; border-radius: 8px; border: 1px solid var(--line); background: #0b1220; touch-action: none; }
.cytw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.cytw-grid button.done { border-color: #42c991; } .cytw-grid button.bad { border-color: #e66b78; }
.cytw-deb li { margin: 6px 0; line-height: 1.45; }
.cytw-hist li { margin: 8px 0; } .cytw-hist b { color: var(--blue); }
.cytw-seq { display: flex; flex-wrap: wrap; gap: 6px; min-height: 34px; border: 1px dashed var(--line); border-radius: 8px; padding: 6px; } .cytw-seq span { background: var(--accent); color: #fff; border-radius: 6px; padding: 4px 8px; font-size: 13px; }
@media (max-width: 820px) { .cytw-two { grid-template-columns: minmax(0, 1fr); } }
`;
  let ui = null, dept = 'APVG', tab = 'overview', test = null;
  function open(d) {
    if (!window.CYLAB) return;
    dept = TWINS[d] ? d : 'APVG'; tab = 'overview'; test = null;
    if (!document.getElementById('cytw-css')) { const s = document.createElement('style'); s.id = 'cytw-css'; s.textContent = css; document.head.appendChild(s); }
    const tw = TWINS[dept];
    ui = window.CYLAB.shell({ cls: 'cytw', title: tw.icon + ' ' + L('Digital twin', 'Jumeau numérique') + ' · ' + esc(T2(tw.name)), sub: L('Fictional equipment for training: specifications, operation, hands-on inspection and history', 'Équipement fictif de formation : caractéristiques, fonctionnement, inspection pratique et historique'),
      actions: Object.keys(TWINS).map((k) => `<button type="button" data-tw-dept="${k}" ${k === dept ? 'class="cysurf-primary"' : ''}>${TWINS[k].icon} ${k}</button>`).join('') });
    ui.dlg.addEventListener('click', onClick); ui.dlg.addEventListener('input', onInput);
    draw();
  }
  function draw() {
    const tw = TWINS[dept];
    ui.body.innerHTML = `<div class="cytw-tabs">${[['overview', '🧊 ' + L('Overview', 'Vue d’ensemble')], ['operate', '🎛 ' + L('Operating conditions', 'Conditions de fonctionnement')], ['inspect', '🔧 ' + L('Inspect', 'Inspecter')], ['history', '🗂 ' + L('History', 'Historique')]].map(([k, n]) => `<button type="button" data-tw-tab="${k}" class="${tab === k ? 'on' : ''}">${n}</button>`).join('')}</div><div data-tw-body></div>`;
    const b = ui.body.querySelector('[data-tw-body]');
    if (tab === 'overview') {
      b.innerHTML = `<div class="cytw-two"><div class="cytw-3d">${window.CY3 && window.CY3.viewerMarkup ? window.CY3.viewerMarkup() : ''}<p class="cylab-note">${L('Drag to rotate · click a part to inspect it · 🧩 explode · ✂ section.', 'Glisser pour tourner · cliquer une pièce pour l’inspecter · 🧩 éclater · ✂ coupe.')}</p></div>
<div><h3>📋 ${L('Nameplate & specifications', 'Plaque et caractéristiques')}</h3><table class="cytw-spec">${tw.spec.map(([en, fr, v]) => `<tr><td>${esc(L(en, fr))}</td><td>${esc(T2(v))}</td></tr>`).join('')}</table><p class="cylab-note">⚠ ${L('Fictional equipment created for training.', 'Équipement fictif créé pour la formation.')}</p></div></div>
<h3>🔩 ${L('Components', 'Composants')}</h3><div class="cytw-grid" style="grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${tw.parts.map(([en, fr, d]) => `<div class="cytw-part"><b>${esc(L(en, fr))}</b>${esc(T2(d))}</div>`).join('')}</div>
<p><button type="button" class="cysurf-primary" data-tw-tab="inspect">🔧 ${L('Start the inspection', 'Commencer l’inspection')}</button></p>`;
      const v = b.querySelector('.cytw-3d'); if (v && window.CY3 && window.CY3.viewer) try { window.CY3.viewer(v, dept); } catch (e) { console.error(e); }
      learn('twin:' + dept);
    } else if (tab === 'operate') { b.innerHTML = operateHtml(); updateOperate(); }
    else if (tab === 'history') {
      b.innerHTML = `<h3>🗂 ${L('Virtual inspection history', 'Historique d’inspection virtuel')}</h3><ul class="cytw-hist">${tw.history.map(([y, t]) => `<li><b>${y}</b> — ${esc(T2(t))}</li>`).join('')}</ul>
<p class="cylab-note">${L('Fictional history. In real work, always read the previous reports before inspecting: they tell you where to look (here, the last entry is a clue for the inspection).', 'Historique fictif. En réalité, lisez toujours les rapports précédents avant d’inspecter : ils disent où regarder (ici, la dernière ligne est un indice pour l’inspection).')}</p>`;
    } else {
      if (!test) b.innerHTML = `<h3>🔧 ${L('Choose an inspection task', 'Choisissez une tâche d’inspection')}</h3><div class="cytw-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${tw.tests.map((k) => `<button type="button" data-tw-test="${k}" style="text-align:left;padding:14px"><b>${esc(T2(TEST_NAME[k]))}</b></button>`).join('')}</div>`;
      else { b.innerHTML = `<button type="button" data-tw-back="1">← ${L('All tasks', 'Toutes les tâches')}</button><div data-tw-test-body></div>`; TESTS[test.k].draw(b.querySelector('[data-tw-test-body]')); }
    }
  }

  /* ======================= operating conditions ======================= */
  const op = { APVG: { p: 7, t: 40 }, APL: { w: 4, x: 50 }, APE: { load: 60, min: 30 } };
  function operateHtml() {
    const o = op[dept], R = (k, l, min, max, step, u) => `<div class="cytw-row"><label style="min-width:200px">${esc(l)}</label><input type="range" data-op="${k}" min="${min}" max="${max}" step="${step}" value="${o[k]}"><b data-op-v="${k}">${f(o[k], step < 1 ? 1 : 0)} ${u}</b></div>`;
    const sliders = dept === 'APVG' ? R('p', L('Operating pressure', 'Pression de service'), 0, 12, 0.1, 'bar') + R('t', L('Temperature', 'Température'), 0, 160, 1, '°C')
      : dept === 'APL' ? R('w', L('Load on the hook', 'Charge au crochet'), 0, 13, 0.1, 't') + R('x', L('Trolley position along the span', 'Position du chariot sur la portée'), 0, 100, 1, '%')
        : R('load', L('Load (% of the 63 A rating)', 'Charge (% des 63 A)'), 0, 140, 1, '%') + R('min', L('Duration at this load', 'Durée à cette charge'), 1, 120, 1, 'min');
    return `<div class="cytw-two"><div class="cytw-panel"><h3>🎛 ${L('Simulated operating conditions', 'Conditions de fonctionnement simulées')}</h3>${sliders}<canvas class="cytw-cv" data-op-cv></canvas></div><div class="cytw-panel"><h3>📟 ${L('Live status', 'État en direct')}</h3><div data-op-out></div></div></div>
<p class="cylab-note">${L('Illustrative behaviour for learning, not a design calculation of this equipment.', 'Comportement illustratif pour apprendre, pas un calcul de conception de cet équipement.')}</p>`;
  }
  function updateOperate() {
    const out = ui.body.querySelector('[data-op-out]'), cv = ui.body.querySelector('[data-op-cv]'); if (!out || !cv) return;
    const o = op[dept], st = [], badge = (cls, t) => `<span class="cytw-badge ${cls}">${esc(t)}</span>`;
    let gaugeVal, gaugeMax, gaugeMark, gaugeUnit;
    if (dept === 'APVG') {
      const r = o.p / 10;
      st.push(r < 0.9 ? badge('cytw-ok', L('Normal operation', 'Fonctionnement normal')) : r < 1 ? badge('cytw-warn', L('Close to set pressure: the safety valve may start to simmer', 'Proche du tarage : la soupape peut commencer à fuir')) : r <= 1.1 ? badge('cytw-bad', L('Safety valve lifting: relieving overpressure', 'Soupape ouverte : décharge de la surpression')) : badge('cytw-bad', L('Above 110 % MAWP: the safety valve should already be relieving — stop, investigate the PSV and the control system', 'Au-delà de 110 % PMS : la soupape devrait déjà décharger — arrêt, vérifier la soupape et la régulation')));
      st.push(o.t <= 120 ? badge('cytw-ok', L('Within design temperature (120 °C)', 'Dans la température de calcul (120 °C)')) : badge('cytw-bad', L('Above design temperature: the material allowable stress is no longer guaranteed', 'Au-delà de la température de calcul : la contrainte admissible n’est plus garantie')));
      st.push(`<p>${L('Pressure', 'Pression')} = <b>${f(r * 100, 0)} %</b> ${L('of MAWP', 'de la PMS')}. ${L('Stored energy grows with pressure × volume: this is why gas pressure tests are far more dangerous than hydrostatic tests.', 'L’énergie stockée croît avec pression × volume : c’est pourquoi les épreuves au gaz sont bien plus dangereuses que les épreuves hydrauliques.')}</p>`);
      gaugeVal = o.p; gaugeMax = 16; gaugeMark = 10; gaugeUnit = 'bar';
    } else if (dept === 'APL') {
      const r = o.w / 10, end = Math.min(o.x, 100 - o.x) / 50;
      st.push(r <= 1 ? badge('cytw-ok', L('Within SWL', 'Dans la CMU')) : r <= 1.1 ? badge('cytw-warn', L('Overload: above SWL — not allowed in service', 'Surcharge : au-delà de la CMU — interdit en service')) : badge('cytw-bad', L('Overload limiter trips: hoisting up is stopped', 'Le limiteur coupe : la montée est bloquée')));
      st.push(`<p>${L('Utilisation', 'Taux d’utilisation')} = <b>${f(r * 100, 0)} %</b>. ${L('Girder bending is largest with the trolley at mid-span', 'La flexion de la poutre est maximale avec le chariot à mi-portée')} (${L('now', 'maintenant')} ${f(end * 100, 0)} % ${L('of the maximum effect', 'de l’effet maximal')}); ${L('end-carriage wheel loads are largest with the trolley at one end.', 'les charges sur galets sont maximales chariot en bout de pont.')}</p>`);
      gaugeVal = o.w; gaugeMax = 14; gaugeMark = 10; gaugeUnit = 't';
    } else {
      const r = o.load / 100, rise = 40 * r * r * (1 - Math.exp(-o.min / 20)), trip = r > 1.13 && o.min * (r - 1.05) > 3;
      st.push(trip ? badge('cytw-bad', L('Overload: the circuit breaker has tripped (thermal release)', 'Surcharge : le disjoncteur a déclenché (protection thermique)')) : r > 1 ? badge('cytw-warn', L('Overload: the breaker will trip after some time', 'Surcharge : le disjoncteur déclenchera au bout d’un certain temps')) : badge('cytw-ok', L('Within rating', 'Dans le calibre')));
      st.push(`<p>${L('Current', 'Courant')} ≈ <b>${f(63 * r, 0)} A</b>. ${L('Busbar temperature rise', 'Échauffement des barres')} ≈ <b>${f(trip ? 0 : rise, 0)} °C</b> (${L('heating ∝ I²: 2× current = 4× heat', 'échauffement ∝ I² : 2× le courant = 4× la chaleur')}). ${L('A loose terminal adds extra heating — that is what thermography finds.', 'Une borne desserrée ajoute un échauffement — c’est ce que trouve la thermographie.')}</p>`);
      gaugeVal = 63 * r; gaugeMax = 90; gaugeMark = 63; gaugeUnit = 'A';
    }
    out.innerHTML = st.join('<br>');
    gauge(cv, gaugeVal, gaugeMax, gaugeMark, gaugeUnit);
  }
  function fit(cv) { const r = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * r; cv.height = h * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return { g, w, h }; }
  function gauge(cv, v, max, mark, unit) {
    const { g, w, h } = fit(cv), cx = w / 2, cy = h * 0.62, R = Math.min(w * 0.42, h * 0.5), a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, ang = (x) => a0 + (a1 - a0) * Math.min(1, Math.max(0, x / max));
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    g.lineWidth = 12; g.strokeStyle = '#26324a'; g.beginPath(); g.arc(cx, cy, R, a0, a1); g.stroke();
    g.strokeStyle = '#42c991'; g.beginPath(); g.arc(cx, cy, R, a0, ang(mark * 0.9)); g.stroke();
    g.strokeStyle = '#e0a526'; g.beginPath(); g.arc(cx, cy, R, ang(mark * 0.9), ang(mark)); g.stroke();
    g.strokeStyle = '#e66b78'; g.beginPath(); g.arc(cx, cy, R, ang(mark), a1); g.stroke();
    g.fillStyle = '#8fa3c0'; g.font = '11px system-ui'; g.textAlign = 'center';
    for (let i = 0; i <= 8; i++) { const x = max * i / 8, a = ang(x); g.fillText(f(x, 0), cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22) + 4); }
    const a = ang(v); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 6), cy + Math.sin(a) * (R - 6)); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fill(); g.font = '700 18px system-ui'; g.fillText(f(v, 1) + ' ' + unit, cx, cy + 34);
  }

  /* ======================= inspection simulators ======================= */
  // shared debrief: items [ok, text]
  function debrief(el, k, items, extra) {
    const score = Math.round(items.filter((x) => x[0]).length / items.length * 100);
    el.insertAdjacentHTML('beforeend', `<div class="cytw-panel"><h3>${score >= 80 ? '🏆' : score >= 60 ? '👍' : '💪'} ${L('Debrief', 'Débriefing')} — ${score} %</h3><ul class="cytw-deb">${items.map(([ok, t]) => `<li>${ok ? '✅' : '❌'} ${esc(T2(t))}</li>`).join('')}</ul>${extra || ''}<p><button type="button" data-tw-test="${k}">↻ ${L('New attempt (new values)', 'Nouvel essai (nouvelles valeurs)')}</button> <button type="button" data-tw-ai="${k}">🧒 ${L('Ask the AI tutor about this test', 'Interroger le tuteur IA sur cet essai')}</button></p><p class="cylab-note">${L('Training simulation with generated values — not a real inspection result.', 'Simulation de formation avec valeurs générées — pas un résultat d’inspection réel.')}</p></div>`);
    learn('twin:' + dept + ':' + k, score);
  }
  const TESTS = {
    /* ---- APVG thickness survey ---- */
    thick: {
      init() { const prev = [10.0, 9.9, 9.9, 10.0, 9.8, 9.9, 9.8, 9.7], bad = 7, cur = prev.map((p, i) => +(p - (i === bad ? rnd(1.2, 1.9) : rnd(0.05, 0.35))).toFixed(2)); return { prev, cur, seen: new Set(), years: 6, treq: 7.5, done: false }; },
      draw(el) {
        // horizontal vessel: x along the length, y around the circumference (12 o'clock top, 6 o'clock bottom)
        const s = test.s, pts = [[L('left head', 'fond gauche'), 0.06, 0.5], [L('shell 1, 12 o’clock', 'virole 1, 12 h'), 0.3, 0.2], [L('shell 1, 3 o’clock', 'virole 1, 3 h'), 0.3, 0.5], [L('shell 2, 12 o’clock', 'virole 2, 12 h'), 0.62, 0.2], [L('shell 2, 3 o’clock', 'virole 2, 3 h'), 0.62, 0.5], [L('right head', 'fond droit'), 0.94, 0.5], [L('shell 1, 6 o’clock', 'virole 1, 6 h'), 0.3, 0.8], [L('shell 2, 6 o’clock (drain)', 'virole 2, 6 h (purge)'), 0.62, 0.8]];
        el.innerHTML = `<div class="cytw-panel"><h3>📏 ${L('Thickness survey — 8 condition monitoring locations (CMLs)', 'Mesures d’épaisseur — 8 emplacements de mesure (CML)')}</h3><p>${L('Click every CML to take the ultrasonic thickness reading (instrument already calibrated on a step block). Previous survey: 6 years ago. Required thickness: 7.5 mm.', 'Cliquez chaque CML pour prendre la mesure d’épaisseur ultrasonore (appareil déjà étalonné sur cale à gradins). Mesures précédentes : il y a 6 ans. Épaisseur requise : 7,5 mm.')}</p>
<div class="cytw-two"><svg viewBox="0 0 300 170" style="max-height:260px" role="img" aria-label="${L('Air receiver with measurement points', 'Réservoir avec points de mesure')}"><rect x="40" y="35" width="220" height="90" fill="#4d5b70" stroke="#8fa3c0"/><ellipse cx="40" cy="80" rx="24" ry="45" fill="#56657c" stroke="#8fa3c0"/><ellipse cx="260" cy="80" rx="24" ry="45" fill="#56657c" stroke="#8fa3c0"/><line x1="150" y1="35" x2="150" y2="125" stroke="#8fa3c0" stroke-dasharray="3 3"/><rect x="70" y="125" width="30" height="30" fill="#3a4556"/><rect x="200" y="125" width="30" height="30" fill="#3a4556"/><rect x="183" y="125" width="6" height="14" fill="#8fa3c0"/>
${pts.map(([n, x, y], i) => `<g data-cml="${i}" style="cursor:pointer"><circle cx="${16 + x * 268}" cy="${35 + y * 90}" r="10" fill="${s.seen.has(i) ? '#42c991' : '#ffe14d'}" stroke="#000"/><text x="${16 + x * 268}" y="${39 + y * 90}" font-size="10" text-anchor="middle">${i + 1}</text></g>`).join('')}</svg>
<div><table class="cytw-spec"><tr><td>CML</td><td>${L('previous / now (mm)', 'précédent / actuel (mm)')}</td></tr>${pts.map(([n], i) => `<tr><td>${i + 1}. ${esc(n)}</td><td>${f(s.prev[i], 2)} / ${s.seen.has(i) ? '<b>' + f(s.cur[i], 2) + '</b>' : '—'}</td></tr>`).join('')}</table></div></div>
${s.seen.size === 8 ? `<div class="cytw-row"><label>${L('Minimum thickness now', 'Épaisseur minimale actuelle')} <input type="text" inputmode="decimal" data-th="min"> mm</label><label>${L('Corrosion rate at that CML', 'Vitesse de corrosion à ce CML')} <input type="text" inputmode="decimal" data-th="rate"> mm/${L('yr', 'an')}</label><label>${L('Remaining life', 'Durée de vie restante')} <input type="text" inputmode="decimal" data-th="life"> ${L('years', 'ans')}</label></div>
<div class="cytw-row"><label>${L('Decision', 'Décision')} <select data-th="dec" style="width:auto"><option value="">—</option><option value="ok">${L('Fit for service; next inspection at half the remaining life (max 10 years)', 'Apte au service ; prochaine inspection à la moitié de la durée de vie (max 10 ans)')}</option><option value="stop">${L('Below required thickness: remove from service', 'Sous l’épaisseur requise : retirer du service')}</option><option value="same">${L('Fit for service; same interval as before', 'Apte au service ; même intervalle qu’avant')}</option></select></label><button type="button" class="cysurf-primary" data-th-check="1" ${s.done ? 'disabled' : ''}>✔ ${L('Validate', 'Valider')}</button></div>` : `<p class="cylab-note">${s.seen.size}/8 ${L('readings taken', 'mesures prises')}</p>`}</div>`;
        el.querySelectorAll('[data-cml]').forEach((g) => g.addEventListener('click', () => { s.seen.add(Number(g.dataset.cml)); TESTS.thick.draw(el); }));
        const chk = el.querySelector('[data-th-check]');
        if (chk) chk.addEventListener('click', () => {
          const v = (k) => num(el.querySelector(`[data-th="${k}"]`).value), dec = el.querySelector('[data-th="dec"]').value;
          const i = s.cur.indexOf(Math.min(...s.cur)), min = s.cur[i], rate = (s.prev[i] - min) / s.years, life = (min - s.treq) / rate;
          const items = [
            [Math.abs(v('min') - min) < 0.02, [`Minimum thickness: ${f(min, 2)} mm at CML ${i + 1} — the 6 o’clock position, where condensate collects (the history warned about the drain).`, `Épaisseur minimale : ${f(min, 2)} mm au CML ${i + 1} — la position 6 h, où les condensats s’accumulent (l’historique signalait la purge).`]],
            [Math.abs(v('rate') - rate) <= 0.01, [`Corrosion rate = (${f(s.prev[i], 2)} − ${f(min, 2)}) ÷ ${s.years} = ${f(rate, 3)} mm/year. Use the worst CML, not an average.`, `Vitesse = (${f(s.prev[i], 2)} − ${f(min, 2)}) ÷ ${s.years} = ${f(rate, 3)} mm/an. Utiliser le pire CML, pas une moyenne.`]],
            [Math.abs(v('life') - life) <= 0.3, [`Remaining life = (${f(min, 2)} − 7.5) ÷ ${f(rate, 3)} = ${f(life, 1)} years.`, `Durée de vie = (${f(min, 2)} − 7,5) ÷ ${f(rate, 3)} = ${f(life, 1)} ans.`]],
            [dec === (min > s.treq ? 'ok' : 'stop'), min > s.treq ? [`Still above 7.5 mm: fit for service, but the interval shrinks to about ${f(Math.min(10, life / 2), 1)} years (training rule in the style of API 510: half the remaining life, max 10 years — verify the edition and your regulation). Also fix the drain and check internally.`, `Toujours au-dessus de 7,5 mm : apte, mais l’intervalle passe à environ ${f(Math.min(10, life / 2), 1)} ans (règle de formation type API 510 : moitié de la durée de vie, max 10 ans — vérifiez l’édition et la réglementation). Réparer aussi la purge et contrôler l’intérieur.`] : [`Below the required thickness: remove from service for engineering assessment or repair.`, `Sous l’épaisseur requise : retrait du service pour évaluation ou réparation.`]]
          ];
          answer('APVG', 'calc', items[1][0] && items[2][0], ['Corrosion rate and remaining life from a thickness survey', 'Vitesse de corrosion et durée de vie à partir des mesures d’épaisseur'], v('life'), +life.toFixed(2), items[2][1]);
          s.done = true; chk.disabled = true; debrief(el, 'thick', items);
        });
      }
    },
    /* ---- APVG hydrostatic test ---- */
    hydro: {
      init() { return { gauge: '', vent: false, zone: false, target: '', p: 0, phase: 'setup', leak: Math.random() < 0.45, over: false, held: false, drop: 0, log: [] }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>💧 ${L('Hydrostatic test of AR-204', 'Épreuve hydraulique d’AR-204')} <span class="cytw-badge cytw-warn">${L('training example: 1.3 × MAWP', 'exemple de formation : 1,3 × PMS')}</span></h3><p class="cylab-note">${L('This exercise uses an ASME-style factor. In Algeria, Decree 90-245 Art. 11 requires at least 1.5 × the design pressure: see the APVG professional course.', 'Cet exercice utilise un facteur de type ASME. En Algérie, le décret 90-245 art. 11 exige au moins 1,5 × la pression de calcul : voir le cours professionnel APVG.')}</p>
<div class="cytw-row"><label>${L('Test gauge', 'Manomètre d’essai')} <select data-hy="gauge" style="width:auto" ${s.phase !== 'setup' ? 'disabled' : ''}><option value="">—</option><option value="16" ${s.gauge === '16' ? 'selected' : ''}>0–16 bar</option><option value="25" ${s.gauge === '25' ? 'selected' : ''}>0–25 bar</option><option value="100" ${s.gauge === '100' ? 'selected' : ''}>0–100 bar</option></select></label>
<label>${L('Test pressure', 'Pression d’épreuve')} <input type="text" inputmode="decimal" data-hy="target" value="${esc(s.target)}" ${s.phase !== 'setup' ? 'disabled' : ''}> bar</label></div>
<div class="cytw-row"><label><input type="checkbox" data-hy="vent" ${s.vent ? 'checked' : ''} ${s.phase !== 'setup' ? 'disabled' : ''}> ${L('Filled with water and all air vented at the top', 'Rempli d’eau et tout l’air purgé en point haut')}</label></div>
<div class="cytw-row"><label><input type="checkbox" data-hy="zone" ${s.zone ? 'checked' : ''} ${s.phase !== 'setup' ? 'disabled' : ''}> ${L('Exclusion zone set up, PSV removed or blanked, test plan signed', 'Zone d’exclusion en place, soupape déposée ou obturée, plan d’essai signé')}</label></div>
<canvas class="cytw-cv" data-hy-cv></canvas>
<div class="cytw-row">${s.phase === 'setup' ? `<button type="button" class="cysurf-primary" data-hy-start="1">▶ ${L('Start pressurising', 'Commencer la mise en pression')}</button>` : ''}
${s.phase === 'pump' ? `<button type="button" data-hy-pump="0.5">+0.5 bar</button><button type="button" data-hy-pump="2">+2 bar</button><button type="button" class="cysurf-primary" data-hy-hold="1">⏱ ${L('Isolate the pump and hold 10 min', 'Isoler la pompe et maintenir 10 min')}</button>` : ''}
${s.phase === 'decide' ? `<b>${L('Your conclusion:', 'Votre conclusion :')}</b> <button type="button" data-hy-dec="pass">✅ ${L('Test passed', 'Épreuve satisfaisante')}</button><button type="button" data-hy-dec="fail">❌ ${L('Test failed: depressurise, find and repair the leak', 'Épreuve non satisfaisante : dépressuriser, chercher et réparer la fuite')}</button>` : ''}</div>
<div class="cylab-note">${s.log.map(esc).join('<br>')}</div></div>`;
        const cv = el.querySelector('[data-hy-cv]'); requestAnimationFrame(() => hydroDraw(cv, s));
        el.querySelectorAll('[data-hy]').forEach((x) => x.addEventListener(x.type === 'checkbox' ? 'change' : 'input', () => { const k = x.dataset.hy; s[k] = x.type === 'checkbox' ? x.checked : x.value; }));
        const on = (sel, fn) => el.querySelectorAll(sel).forEach((b) => b.addEventListener('click', fn));
        on('[data-hy-start]', () => { s.phase = 'pump'; s.log.push(L('Pump connected. Raise the pressure gradually.', 'Pompe raccordée. Montez la pression progressivement.')); if (!s.vent) s.log.push(L('⚠ The pressure jumps irregularly: there is air in the vessel.', '⚠ La pression monte par à-coups : il y a de l’air dans le réservoir.')); TESTS.hydro.draw(el); });
        on('[data-hy-pump]', (e) => { s.p = Math.round((s.p + Number(e.target.dataset.hyPump) * (s.vent ? 1 : 0.6)) * 10) / 10; const t = num(s.target); if (s.p > Math.max(t, 13) + 0.6) { s.over = true; s.log.push(L('⚠ Overpressure above the test pressure!', '⚠ Surpression au-dessus de la pression d’épreuve !')); } if (s.p > Number(s.gauge || 99)) s.log.push(L('⚠ The needle is off the scale of this gauge.', '⚠ L’aiguille sort de l’échelle de ce manomètre.')); TESTS.hydro.draw(el); });
        on('[data-hy-hold]', () => {
          if (Math.abs(s.p - num(s.target)) > 0.4) { s.log.push(L('Reach the test pressure you entered before holding.', 'Atteignez la pression d’épreuve saisie avant le maintien.')); return TESTS.hydro.draw(el); }
          s.phase = 'hold'; s.log.push(L('Holding… (10 minutes shown in 8 seconds)', 'Maintien… (10 minutes montrées en 8 secondes)')); TESTS.hydro.draw(el);
          let t = 0; const id = setInterval(() => { t++; if (s.leak) { s.p = Math.round((s.p - 0.1) * 100) / 100; s.drop += 0.1; } const c = el.querySelector('[data-hy-cv]'); if (!c) return clearInterval(id); hydroDraw(c, s, t / 8); if (t >= 8) { clearInterval(id); s.held = true; s.phase = 'decide'; s.log.push(s.leak ? L('After 10 min the gauge reads lower; water drips at the bottom flange gasket.', 'Après 10 min le manomètre indique moins ; de l’eau goutte au joint de la bride basse.') : L('After 10 min the pressure is steady. Visual check of welds and joints: dry.', 'Après 10 min la pression est stable. Examen visuel des soudures et joints : secs.')); TESTS.hydro.draw(el); } }, 1000);
        });
        on('[data-hy-dec]', (e) => {
          const pass = e.target.dataset.hyDec === 'pass', okDec = pass === !s.leak, t = num(s.target);
          const items = [
            [s.gauge === '25', ['Gauge 0–25 bar: about twice the test pressure keeps the reading in the accurate middle of the scale.', 'Manomètre 0–25 bar : environ deux fois la pression d’épreuve, lecture au milieu, précis.']],
            [Math.abs(t - 13) < 0.05, ['Test pressure = 1.3 × 10 bar = 13 bar (training example; the real factor comes from the code edition and regulation).', 'Pression d’épreuve = 1,3 × 10 bar = 13 bar (exemple ; le vrai facteur vient du code et de la réglementation).']],
            [s.vent, ['Air must be vented: trapped air stores energy and makes a hydrotest dangerous, and gives unstable readings.', 'L’air doit être purgé : l’air piégé stocke de l’énergie, rend l’épreuve dangereuse et les lectures instables.']],
            [s.zone, ['Exclusion zone, PSV removed/blanked and a signed test plan are required before pressurising.', 'Zone d’exclusion, soupape déposée/obturée et plan d’essai signé sont requis avant la mise en pression.']],
            [!s.over, ['Never exceed the test pressure: raise it gradually in steps.', 'Ne jamais dépasser la pression d’épreuve : monter par paliers.']],
            [okDec, s.leak ? ['Pressure drop + leak at the flange = test not satisfactory: depressurise, repair, re-test.', 'Chute de pression + fuite à la bride = épreuve non satisfaisante : dépressuriser, réparer, recommencer.'] : ['Steady pressure and no leak = satisfactory (record it with the gauge certificate number).', 'Pression stable et aucune fuite = satisfaisante (consigner avec le n° de certificat du manomètre).']]
          ];
          answer('APVG', 'decision', okDec, ['Hydrostatic test conclusion', 'Conclusion d’une épreuve hydraulique'], pass ? L('passed', 'satisfaisante') : L('failed', 'non satisfaisante'), s.leak ? L('failed', 'non satisfaisante') : L('passed', 'satisfaisante'), items[5][1]);
          s.phase = 'done'; TESTS.hydro.draw(el); debrief(el, 'hydro', items);
        });
      }
    },
    /* ---- APL wire rope ---- */
    rope: {
      init() { const zones = [0, 1, 2].map(() => ({ bw: Math.random() < 0.4 ? Math.floor(rnd(5, 8)) : Math.floor(rnd(0, 4)), d: +(16 - rnd(0.2, Math.random() < 0.3 ? 1.4 : 0.9)).toFixed(2), counted: '', measured: false })); return { zones, view: 0, done: false }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>🪢 ${L('Wire-rope inspection (16 mm, 6×36)', 'Contrôle du câble (16 mm, 6×36)')}</h3><p>${L('Three zones of 6 × d (96 mm) are marked where the rope is most stressed (drum, sheave, equaliser). In each zone: count the broken wires and measure the diameter.', 'Trois zones de 6 × d (96 mm) sont repérées là où le câble souffre le plus (tambour, poulie, palonnier). Dans chaque zone : comptez les fils cassés et mesurez le diamètre.')}</p>
<div class="cytw-row">${s.zones.map((z, i) => `<button type="button" data-rp-z="${i}" class="${s.view === i ? 'cysurf-primary' : ''}">${L('Zone', 'Zone')} ${'ABC'[i]}</button>`).join('')}</div>
<canvas class="cytw-cv" data-rp-cv style="height:170px"></canvas>
<div class="cytw-row"><label>${L('Broken wires counted in zone', 'Fils cassés comptés zone')} ${'ABC'[s.view]} <input type="number" min="0" data-rp-n value="${esc(s.zones[s.view].counted)}"></label><button type="button" data-rp-m="1">📏 ${L('Measure diameter here', 'Mesurer le diamètre ici')}</button><b>${s.zones[s.view].measured ? f(s.zones[s.view].d, 2) + ' mm' : ''}</b></div>
<p class="cylab-note">${L('Job-sheet criteria for this FICTIONAL rope (training values): remove from service if any 6d zone has 5 or more broken wires, or if the diameter is reduced by 7 % or more of nominal (16 mm). Real criteria come from ISO 4309 or the manufacturer and depend on the rope construction.', 'Critères de la fiche pour ce câble FICTIF (valeurs de formation) : dépose si une zone de 6d a 5 fils cassés ou plus, ou si le diamètre a diminué de 7 % ou plus du nominal (16 mm). Les vrais critères viennent de l’ISO 4309 ou du fabricant et dépendent de la construction du câble.')}</p>
${s.zones.every((z) => z.counted !== '' && z.measured) ? `<div class="cytw-row"><b>${L('Decision:', 'Décision :')}</b><button type="button" data-rp-dec="keep">✅ ${L('Keep in service', 'Maintenir en service')}</button><button type="button" data-rp-dec="discard">❌ ${L('Remove from service (discard)', 'Retirer du service (dépose)')}</button></div>` : `<p class="cylab-note">${L('Count and measure all three zones to decide.', 'Comptez et mesurez les trois zones pour décider.')}</p>`}</div>`;
        const cv = el.querySelector('[data-rp-cv]'); requestAnimationFrame(() => ropeDraw(cv, s.zones[s.view], s.view));
        el.querySelectorAll('[data-rp-z]').forEach((b) => b.addEventListener('click', () => { s.view = Number(b.dataset.rpZ); TESTS.rope.draw(el); }));
        el.querySelector('[data-rp-n]').addEventListener('input', (e) => { s.zones[s.view].counted = e.target.value; });
        el.querySelector('[data-rp-m]').addEventListener('click', () => { s.zones[s.view].measured = true; TESTS.rope.draw(el); });
        el.querySelectorAll('[data-rp-dec]').forEach((b) => b.addEventListener('click', () => {
          if (s.done) return; s.done = true;
          const must = s.zones.some((z) => z.bw >= 5 || (16 - z.d) / 16 >= 0.07), discard = b.dataset.rpDec === 'discard';
          const items = s.zones.map((z, i) => [Number(z.counted) === z.bw, [`Zone ${'ABC'[i]}: ${z.bw} broken wire(s) (you counted ${z.counted}); diameter ${f(z.d, 2)} mm = ${f((16 - z.d) / 16 * 100, 1)} % reduction.`, `Zone ${'ABC'[i]} : ${z.bw} fil(s) cassé(s) (vous avez compté ${z.counted}) ; diamètre ${f(z.d, 2)} mm = ${f((16 - z.d) / 16 * 100, 1)} % de réduction.`]]);
          items.push([discard === must, must ? ['At least one zone reaches a discard criterion: the rope must be removed from service and replaced.', 'Au moins une zone atteint un critère de dépose : le câble doit être retiré du service et remplacé.'] : ['No zone reaches a discard criterion: keep in service, record the counts, and monitor at the next inspection.', 'Aucune zone n’atteint un critère : maintien en service, consigner les comptages et surveiller à la prochaine inspection.']]);
          answer('APL', 'decision', discard === must, ['Wire-rope discard decision', 'Décision de dépose d’un câble'], discard ? 'discard' : 'keep', must ? 'discard' : 'keep', items[3][1]);
          debrief(el, 'rope', items);
        }));
      }
    },
    /* ---- APL load test ---- */
    load: {
      init() { return { load: '', zone: false, cert: false, phase: 'setup', brake: Math.random() < 0.4, hook: Math.random() < 0.35 ? +rnd(63.2, 64.5).toFixed(1) : +rnd(60.1, 61.2).toFixed(1), drift: 0, pct: '', log: [] }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>🏋 ${L('Static load test of OHC-12 (SWL 10 t)', 'Épreuve statique d’OHC-12 (CMU 10 t)')} <span class="cytw-badge cytw-warn">${L('training example: 125 % SWL', 'exemple de formation : 125 % CMU')}</span></h3>
<div class="cytw-row"><label>${L('Test load', 'Charge d’essai')} <input type="text" inputmode="decimal" data-ld="load" value="${esc(s.load)}" ${s.phase !== 'setup' ? 'disabled' : ''}> t</label></div>
<div class="cytw-row"><label><input type="checkbox" data-ld="zone" ${s.zone ? 'checked' : ''} ${s.phase !== 'setup' ? 'disabled' : ''}> ${L('Exclusion zone below and around the load', 'Zone d’exclusion sous et autour de la charge')}</label></div>
<div class="cytw-row"><label><input type="checkbox" data-ld="cert" ${s.cert ? 'checked' : ''} ${s.phase !== 'setup' ? 'disabled' : ''}> ${L('Test weights / load cell with valid certificate', 'Masses d’essai / dynamomètre avec certificat valide')}</label></div>
<canvas class="cytw-cv" data-ld-cv></canvas>
<div class="cytw-row">${s.phase === 'setup' ? `<button type="button" class="cysurf-primary" data-ld-go="1">⬆ ${L('Lift 100–200 mm and hold 10 min', 'Lever de 100–200 mm et maintenir 10 min')}</button>` : ''}
${s.phase === 'measure' ? `<label>${L('Hook throat opening after the test (reference 60.0 mm): measured', 'Ouverture du crochet après essai (référence 60,0 mm) : mesurée')} <b>${f(s.hook, 1)} mm</b> → ${L('increase', 'augmentation')} <input type="text" inputmode="decimal" data-ld="pct" value="${esc(s.pct)}"> %</label>` : ''}</div>
${s.phase === 'measure' ? `<div class="cytw-row"><b>${L('Conclusion:', 'Conclusion :')}</b><button type="button" data-ld-dec="pass">✅ ${L('Passed', 'Satisfaisant')}</button><button type="button" data-ld-dec="brake">❌ ${L('Failed: brake does not hold', 'Non satisfaisant : le frein ne retient pas')}</button><button type="button" data-ld-dec="hook">❌ ${L('Failed: hook deformed', 'Non satisfaisant : crochet déformé')}</button><button type="button" data-ld-dec="both">❌ ${L('Failed: brake and hook', 'Non satisfaisant : frein et crochet')}</button></div>` : ''}
<div class="cylab-note">${s.log.map(esc).join('<br>')}</div><p class="cylab-note">${L('Hook removal limit used here (training value): permanent throat opening increase of 5 % or more — real limits come from the hook standard (e.g. ASME B30.10) or the manufacturer; verify.', 'Limite de retrait du crochet utilisée ici (valeur de formation) : augmentation permanente de l’ouverture de 5 % ou plus — les vraies limites viennent de la norme crochet (ex. ASME B30.10) ou du fabricant ; à vérifier.')}</p></div>`;
        const cv = el.querySelector('[data-ld-cv]'); requestAnimationFrame(() => loadDraw(cv, s, 0));
        el.querySelectorAll('[data-ld]').forEach((x) => x.addEventListener(x.type === 'checkbox' ? 'change' : 'input', () => { s[x.dataset.ld] = x.type === 'checkbox' ? x.checked : x.value; }));
        const go = el.querySelector('[data-ld-go]');
        if (go) go.addEventListener('click', () => {
          s.phase = 'hold'; s.log.push(L('Load lifted and held… (10 min shown in 8 s)', 'Charge levée et maintenue… (10 min montrées en 8 s)')); let t = 0;
          const id = setInterval(() => { t++; if (s.brake) s.drift += 2; const c = el.querySelector('[data-ld-cv]'); if (!c) return clearInterval(id); loadDraw(c, s, t / 8); if (t >= 8) { clearInterval(id); s.phase = 'measure'; s.log.push(s.brake ? L('The load has crept down 16 mm during the hold with the brake applied.', 'La charge est descendue de 16 mm pendant le maintien, frein serré.') : L('No movement of the load during the hold.', 'Aucun mouvement de la charge pendant le maintien.')); s.log.push(L('Load lowered. Measure the hook between its reference marks.', 'Charge reposée. Mesurez le crochet entre ses repères.')); TESTS.load.draw(el); } }, 1000);
        });
        el.querySelectorAll('[data-ld-dec]').forEach((b) => b.addEventListener('click', () => {
          const inc = (s.hook - 60) / 60 * 100, hookBad = inc >= 5, right = s.brake && hookBad ? 'both' : s.brake ? 'brake' : hookBad ? 'hook' : 'pass', dec = b.dataset.ldDec;
          const items = [
            [Math.abs(num(s.load) - 12.5) < 0.05, ['Test load = 1.25 × 10 t = 12.5 t (training example; verify the regulation and standard that apply).', 'Charge d’essai = 1,25 × 10 t = 12,5 t (exemple ; vérifiez la réglementation et la norme applicables).']],
            [s.zone, ['Nobody under or near a suspended test load: an overload test is the moment of highest risk.', 'Personne sous ou près d’une charge d’essai suspendue : l’épreuve en surcharge est le moment le plus risqué.']],
            [s.cert, ['The test load must be known: certified weights or a calibrated load cell.', 'La charge d’essai doit être connue : masses certifiées ou dynamomètre étalonné.']],
            [Math.abs(num(s.pct) - inc) <= 0.15, [`Hook opening increase = (${f(s.hook, 1)} − 60.0) ÷ 60.0 = ${f(inc, 1)} %.`, `Augmentation = (${f(s.hook, 1)} − 60,0) ÷ 60,0 = ${f(inc, 1)} %.`]],
            [dec === right, [`Correct conclusion: ${right === 'pass' ? 'passed' : right === 'both' ? 'failed — brake slips and hook permanently opened' : right === 'brake' ? 'failed — brake does not hold (the 2025 log hinted at it)' : 'failed — hook permanently deformed (never straighten or heat a hook: replace it)'}.`, `Conclusion juste : ${right === 'pass' ? 'satisfaisant' : right === 'both' ? 'non satisfaisant — frein qui glisse et crochet ouvert' : right === 'brake' ? 'non satisfaisant — le frein ne retient pas (le registre 2025 l’annonçait)' : 'non satisfaisant — crochet déformé (ne jamais redresser ni chauffer un crochet : le remplacer)'}.`]]
          ];
          answer('APL', 'decision', dec === right, ['Load test conclusion', 'Conclusion d’un essai de charge'], dec, right, items[4][1]);
          s.phase = 'done'; TESTS.load.draw(el); debrief(el, 'load', items);
        }));
      }
    },
    /* ---- APE lockout ---- */
    loto: {
      steps: [['Identify the board, the circuit and its isolating device', 'Identifier l’armoire, le circuit et son organe de séparation'], ['Inform the people concerned and switch off', 'Prévenir les personnes concernées et couper'], ['Lock the isolator OFF and attach your tag', 'Cadenasser l’organe en position ouverte et poser votre étiquette'], ['Check the voltage tester on a known live source', 'Vérifier le VAT sur une source sous tension connue'], ['Verify absence of voltage on all conductors', 'Vérifier l’absence de tension sur tous les conducteurs'], ['Re-check the tester on the known source', 'Revérifier le VAT sur la source connue']],
      init() { return { order: [], shuf: shuffle([0, 1, 2, 3, 4, 5]), done: false }; },
      draw(el) {
        const s = test.s, st = TESTS.loto.steps;
        el.innerHTML = `<div class="cytw-panel"><h3>🔒 ${L('Lockout / tagout of DB-3 before testing', 'Consignation de DB-3 avant les mesures')}</h3><p>${L('Click the actions in the order you would do them.', 'Cliquez les actions dans l’ordre où vous les feriez.')}</p>
<div class="cytw-seq">${s.order.map((k, n) => `<span>${n + 1}. ${esc(T2(st[k]))}</span>`).join('')}</div>
<div class="cytw-grid" style="grid-template-columns:1fr;margin-top:8px">${s.shuf.filter((k) => !s.order.includes(k)).map((k) => `<button type="button" data-lo="${k}" style="text-align:left">${esc(T2(st[k]))}</button>`).join('')}</div>
${s.order.length && !s.done ? `<p><button type="button" data-lo-undo="1">↶ ${L('Undo', 'Annuler')}</button></p>` : ''}</div>`;
        el.querySelectorAll('[data-lo]').forEach((b) => b.addEventListener('click', () => { s.order.push(Number(b.dataset.lo)); if (s.order.length === 6) finish(); else TESTS.loto.draw(el); }));
        const u = el.querySelector('[data-lo-undo]'); if (u) u.addEventListener('click', () => { s.order.pop(); TESTS.loto.draw(el); });
        function finish() {
          s.done = true; TESTS.loto.draw(el);
          const items = st.map((t, i) => [s.order[i] === i, [`${i + 1}. ${t[0]}`, `${i + 1}. ${t[1]}`]]);
          answer('APE', 'procedure', items.every((x) => x[0]), ['Lockout / tagout sequence', 'Séquence de consignation'], null, null, ['Identify → separate → lock → prove the tester → verify → prove the tester again.', 'Identifier → séparer → condamner → prouver le VAT → vérifier → reprouver le VAT.']);
          debrief(el, 'loto', items, `<p class="cylab-note">${L('Proving the tester before and after is what makes "no voltage" trustworthy: a broken tester also shows nothing.', 'Prouver le VAT avant et après rend fiable le « pas de tension » : un VAT en panne n’affiche rien non plus.')}</p>`);
        }
      }
    },
    /* ---- APE insulation ---- */
    ins: {
      init() { const bad = Math.floor(rnd(0, 6)); return { v: '', spd: false, r: [0, 1, 2, 3, 4, 5].map((i) => (i === bad ? +rnd(0.15, 0.8).toFixed(2) : Math.random() < 0.3 ? 999 : Math.round(rnd(40, 600)))), seen: new Set(), mark: {}, done: false, bad }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>Ω ${L('Insulation resistance test (circuits isolated and locked out)', 'Mesure d’isolement (circuits consignés)')}</h3>
<div class="cytw-row"><label>${L('Test voltage', 'Tension d’essai')} <select data-in="v" style="width:auto"><option value="">—</option><option value="250" ${s.v === '250' ? 'selected' : ''}>250 V DC</option><option value="500" ${s.v === '500' ? 'selected' : ''}>500 V DC</option><option value="1000" ${s.v === '1000' ? 'selected' : ''}>1000 V DC</option></select></label>
<label><input type="checkbox" data-in="spd" ${s.spd ? 'checked' : ''}> ${L('Surge protectors and electronic equipment disconnected', 'Parafoudres et équipements électroniques débranchés')}</label></div>
<div class="cytw-grid">${s.r.map((r, i) => `<div class="cytw-part"><b>C${i + 1}</b>${s.seen.has(i) ? `<span style="font-size:1.2rem;font-weight:800">${r >= 999 ? '> 999' : f(r, r < 10 ? 2 : 0)} MΩ</span><div class="cytw-row"><button type="button" data-in-mark="${i}:ok" class="${s.mark[i] === 'ok' ? 'cysurf-primary' : ''}">✅</button><button type="button" data-in-mark="${i}:ko" class="${s.mark[i] === 'ko' ? 'cysurf-primary' : ''}">❌</button></div>` : `<button type="button" data-in-test="${i}" ${s.v ? '' : 'disabled'}>⚡ ${L('Test', 'Mesurer')}</button>`}</div>`).join('')}</div>
<p class="cylab-note">${L('Training minimum: 1 MΩ at 500 V DC for 230/400 V circuits (IEC 60364-6 style — verify the edition and your national rules).', 'Minimum de formation : 1 MΩ sous 500 V continu pour les circuits 230/400 V (type IEC 60364-6 — vérifiez l’édition et vos règles nationales).')}</p>
${Object.keys(s.mark).length === 6 && !s.done ? `<button type="button" class="cysurf-primary" data-in-done="1">✔ ${L('Validate my results', 'Valider mes résultats')}</button>` : ''}</div>`;
        el.querySelectorAll('[data-in]').forEach((x) => x.addEventListener('change', () => { s[x.dataset.in] = x.type === 'checkbox' ? x.checked : x.value; TESTS.ins.draw(el); }));
        el.querySelectorAll('[data-in-test]').forEach((b) => b.addEventListener('click', () => { b.disabled = true; b.textContent = '⏳'; setTimeout(() => { s.seen.add(Number(b.dataset.inTest)); TESTS.ins.draw(el); }, 600); }));
        el.querySelectorAll('[data-in-mark]').forEach((b) => b.addEventListener('click', () => { const [i, m] = b.dataset.inMark.split(':'); s.mark[i] = m; TESTS.ins.draw(el); }));
        const d = el.querySelector('[data-in-done]');
        if (d) d.addEventListener('click', () => {
          s.done = true; d.disabled = true;
          const marksOk = s.r.every((r, i) => (s.mark[i] === 'ok') === (r >= 1));
          const items = [[s.v === '500', ['500 V DC is the usual test voltage for 230/400 V circuits; 250 V is for SELV/PELV, 1000 V for circuits above 500 V (training values).', '500 V continu est la tension usuelle pour les circuits 230/400 V ; 250 V pour la TBTS/TBTP, 1000 V au-delà de 500 V (valeurs de formation).']],
            [s.spd, ['Disconnect surge protectors and electronics first: they would distort the reading or be damaged.', 'Débrancher d’abord parafoudres et électronique : ils faussent la mesure ou seraient endommagés.']],
            [marksOk, [`C${s.bad + 1} = ${f(s.r[s.bad], 2)} MΩ is below 1 MΩ: fail — find the fault (often moisture or damaged insulation), repair, re-test. All others pass.`, `C${s.bad + 1} = ${f(s.r[s.bad], 2)} MΩ est sous 1 MΩ : non conforme — chercher le défaut (souvent humidité ou isolant abîmé), réparer, recontrôler. Les autres sont conformes.`]]];
          answer('APE', 'interp', marksOk, ['Insulation resistance results', 'Résultats de mesure d’isolement'], null, null, items[2][1]);
          debrief(el, 'ins', items);
        });
      }
    },
    /* ---- APE RCD ---- */
    rcd: {
      init() { const slow = Math.floor(rnd(0, 3)), mode = pick(['slow', 'none', 'ok']); return { t: [0, 1, 2].map((i) => (i === slow && mode === 'slow' ? Math.round(rnd(320, 420)) : i === slow && mode === 'none' ? null : Math.round(rnd(14, 45)))), seen: new Set(), mark: {}, done: false }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>⏱ ${L('RCD trip-time test at 1 × IΔn (30 mA)', 'Essai de temps de déclenchement des DDR à 1 × IΔn (30 mA)')}</h3>
<div class="cytw-grid">${s.t.map((t, i) => `<div class="cytw-part"><b>RCD ${i + 1}</b>${s.seen.has(i) ? `<span style="font-size:1.2rem;font-weight:800">${t == null ? L('did not trip', 'pas de déclenchement') : t + ' ms'}</span><div class="cytw-row"><button type="button" data-rc-mark="${i}:ok" class="${s.mark[i] === 'ok' ? 'cysurf-primary' : ''}">✅</button><button type="button" data-rc-mark="${i}:ko" class="${s.mark[i] === 'ko' ? 'cysurf-primary' : ''}">❌</button></div>` : `<button type="button" data-rc-test="${i}">⚡ ${L('Inject 30 mA', 'Injecter 30 mA')}</button>`}</div>`).join('')}</div>
<p class="cylab-note">${L('Training limit: trip within 300 ms at 1 × IΔn for a general-type RCD (verify the product standard and installation rules). Also press the RCD’s own T button: it checks the mechanism, not the trip time.', 'Limite de formation : déclenchement en moins de 300 ms à 1 × IΔn pour un DDR de type général (vérifiez la norme produit et les règles d’installation). Appuyez aussi sur le bouton T du DDR : il vérifie le mécanisme, pas le temps.')}</p>
${Object.keys(s.mark).length === 3 && !s.done ? `<button type="button" class="cysurf-primary" data-rc-done="1">✔ ${L('Validate', 'Valider')}</button>` : ''}</div>`;
        el.querySelectorAll('[data-rc-test]').forEach((b) => b.addEventListener('click', () => { b.disabled = true; b.textContent = '⏳'; setTimeout(() => { s.seen.add(Number(b.dataset.rcTest)); TESTS.rcd.draw(el); }, 700); }));
        el.querySelectorAll('[data-rc-mark]').forEach((b) => b.addEventListener('click', () => { const [i, m] = b.dataset.rcMark.split(':'); s.mark[i] = m; TESTS.rcd.draw(el); }));
        const d = el.querySelector('[data-rc-done]');
        if (d) d.addEventListener('click', () => {
          s.done = true;
          const items = s.t.map((t, i) => { const pass = t != null && t <= 300; return [(s.mark[i] === 'ok') === pass, [`RCD ${i + 1}: ${t == null ? 'no trip — dangerous, replace' : t + ' ms — ' + (pass ? 'pass' : 'too slow, replace')}.`, `DDR ${i + 1} : ${t == null ? 'pas de déclenchement — dangereux, remplacer' : t + ' ms — ' + (pass ? 'conforme' : 'trop lent, remplacer')}.`]]; });
          answer('APE', 'interp', items.every((x) => x[0]), ['RCD trip-time results', 'Résultats d’essai des DDR'], null, null, ['An RCD must trip within the limit at its rated residual current; no trip or too slow = fail.', 'Un DDR doit déclencher dans la limite à son courant assigné ; pas de déclenchement ou trop lent = non conforme.']);
          debrief(el, 'rcd', items);
        });
      }
    },
    /* ---- APE thermography ---- */
    thermo: {
      init() { const hot = 2; /* C3, as the 2025 operator report suggested */ return { hot, dT: Math.round(rnd(18, 38)), click: null, act: '', done: false }; },
      draw(el) {
        const s = test.s;
        el.innerHTML = `<div class="cytw-panel"><h3>🌡 ${L('Infrared survey of DB-3 under normal load (door open, safe distance, PPE)', 'Thermographie de DB-3 en charge normale (porte ouverte, distance de sécurité, EPI)')}</h3><p>${L('Click the terminal that is abnormally hot, then choose the action.', 'Cliquez la borne anormalement chaude, puis choisissez l’action.')}</p>
<canvas class="cytw-cv" data-th-cv style="height:250px;cursor:crosshair"></canvas>
<div class="cytw-row"><label>${L('Action', 'Action')} <select data-th-act style="width:auto"><option value="">—</option><option value="report">${L('Record as an anomaly with ΔT and load; repair after lockout; re-scan after repair', 'Consigner l’anomalie avec ΔT et charge ; réparer après consignation ; rescanner après réparation')}</option><option value="tighten">${L('Tighten it now while live', 'La resserrer tout de suite sous tension')}</option><option value="ignore">${L('Ignore: the board still works', 'Ignorer : l’armoire fonctionne')}</option></select></label><button type="button" class="cysurf-primary" data-th-ok="1" ${s.done ? 'disabled' : ''}>✔ ${L('Validate', 'Valider')}</button></div></div>`;
        const cv = el.querySelector('[data-th-cv]'); requestAnimationFrame(() => thermoDraw(cv, s));
        cv.addEventListener('click', (e) => { const b = cv.getBoundingClientRect(), x = (e.clientX - b.left) / b.width; s.click = Math.max(0, Math.min(5, Math.floor((x - 0.1) / 0.8 * 6))); thermoDraw(cv, s); });
        el.querySelector('[data-th-act]').addEventListener('change', (e) => { s.act = e.target.value; });
        el.querySelector('[data-th-ok]').addEventListener('click', () => {
          if (s.click == null || !s.act || s.done) return; s.done = true;
          const items = [[s.click === s.hot, [`The hot spot is terminal C${s.hot + 1}: +${s.dT} °C compared with similar terminals at the same load.`, `Le point chaud est la borne C${s.hot + 1} : +${s.dT} °C par rapport aux bornes similaires à la même charge.`]],
            [s.act === 'report', ['Record it (image, ΔT, load, location), repair only after lockout, then re-scan under load to confirm. Never work live to fix it. Severity bands depend on the standard used by your company.', 'La consigner (image, ΔT, charge, emplacement), réparer seulement après consignation, puis rescanner en charge. Jamais d’intervention sous tension. Les classes de gravité dépendent de la norme de l’entreprise.']]];
          answer('APE', 'interp', items[0][0] && items[1][0], ['Thermography hot-spot finding', 'Recherche de point chaud en thermographie'], null, null, items[1][1]);
          debrief(el, 'thermo', items);
        });
      }
    }
  };

  /* ---------- drawings ---------- */
  function hydroDraw(cv, s, prog) {
    if (!cv) return; const { g, w, h } = fit(cv);
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    const vx = w * 0.2, vw = w * 0.22, vy = 20, vh = h - 50;
    g.fillStyle = s.vent || s.phase === 'setup' ? '#2b6f9e' : '#2b6f9e'; g.fillRect(vx, vy, vw, vh); g.strokeStyle = '#8fa3c0'; g.strokeRect(vx, vy, vw, vh);
    if (!s.vent && s.phase !== 'setup') { g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(vx + 10 + i * vw / 6, vy + 10 + (i % 2) * 6, 5, 0, 7); g.fill(); } }
    if (s.leak && (s.phase === 'decide' || s.phase === 'done' || (s.phase === 'hold' && prog > 0.3))) { g.fillStyle = '#7fd3ff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(vx + vw / 2 + 4, vy + vh + 8 + i * 6, 2.5, 0, 7); g.fill(); } }
    g.fillStyle = '#8fa3c0'; g.fillRect(vx + vw / 2 - 6, vy + vh, 12, 6);
    gaugeMini(g, w * 0.68, h * 0.5, Math.min(w, h) * 0.32, s.p, Number(s.gauge || 25), s.gauge ? s.gauge + ' bar' : '?');
    if (s.phase === 'hold') { g.fillStyle = '#ffe14d'; g.font = '700 14px system-ui'; g.textAlign = 'left'; g.fillText('⏱ ' + Math.round((prog || 0) * 10) + ' / 10 min', 10, h - 10); }
  }
  function gaugeMini(g, cx, cy, R, v, max, label) {
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = (x) => a0 + (a1 - a0) * Math.min(1.04, Math.max(0, x / max));
    g.fillStyle = '#e8edf3'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#222'; g.font = '10px system-ui'; g.textAlign = 'center';
    for (let i = 0; i <= 10; i++) { const a = ang(max * i / 10); g.fillText(f(max * i / 10, 0), cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14) + 3); }
    const a = ang(v); g.strokeStyle = '#c00'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8)); g.stroke();
    g.fillStyle = '#111'; g.font = '700 13px system-ui'; g.fillText(f(v, 1) + ' bar', cx, cy + R * 0.55); g.font = '10px system-ui'; g.fillText(label, cx, cy - R * 0.35);
  }
  function ropeDraw(cv, z, idx) {
    if (!cv) return; const { g, w, h } = fit(cv), y = h / 2, rr = Math.min(42, h * 0.3);
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    const grad = g.createLinearGradient(0, y - rr, 0, y + rr); grad.addColorStop(0, '#59616b'); grad.addColorStop(0.5, '#c7ccd2'); grad.addColorStop(1, '#4b525b'); g.fillStyle = grad;
    const shrink = (16 - z.d) / 16 * 3; g.fillRect(0, y - rr + shrink, w, 2 * (rr - shrink));
    g.strokeStyle = 'rgba(40,44,50,.75)'; g.lineWidth = 2; for (let x = -40; x < w + 40; x += 14) { g.beginPath(); g.moveTo(x, y - rr + shrink); g.lineTo(x + 28, y + rr - shrink); g.stroke(); }
    // broken wires: short spikes sticking out, deterministic positions per zone
    let seed = (idx + 1) * 9973; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.strokeStyle = '#e8eef5'; g.lineWidth = 2;
    for (let i = 0; i < z.bw; i++) { const x = w * 0.1 + r() * w * 0.8, up = r() < 0.5, yy = up ? y - rr + shrink : y + rr - shrink; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 6 + r() * 6, yy + (up ? -10 - r() * 8 : 10 + r() * 8)); g.stroke(); }
    g.fillStyle = '#ffe14d'; g.font = '12px system-ui'; g.textAlign = 'left'; g.fillText(L('Zone ', 'Zone ') + 'ABC'[idx] + ' — 6 × d = 96 mm', 8, 16);
    g.strokeStyle = '#ffe14d'; g.setLineDash([5, 4]); g.strokeRect(w * 0.08, y - rr - 24, w * 0.84, 2 * rr + 48); g.setLineDash([]);
  }
  function loadDraw(cv, s, prog) {
    if (!cv) return; const { g, w, h } = fit(cv);
    g.fillStyle = '#0b1220'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d7a836'; g.fillRect(20, 18, w - 40, 16); g.fillStyle = '#b33'; g.fillRect(w / 2 - 30, 34, 60, 18);
    const up = s.phase === 'setup' ? 0 : 30, drop = s.drift * 1.2, ly = h - 70 - up + drop;
    g.strokeStyle = '#c7ccd2'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 6, 52); g.lineTo(w / 2 - 6, ly); g.moveTo(w / 2 + 6, 52); g.lineTo(w / 2 + 6, ly); g.stroke();
    g.fillStyle = '#3d7fd6'; g.fillRect(w / 2 - 50, ly, 100, 40); g.fillStyle = '#fff'; g.font = '700 12px system-ui'; g.textAlign = 'center'; g.fillText((s.load || '?') + ' t', w / 2, ly + 25);
    g.fillStyle = '#5d6b80'; g.fillRect(0, h - 28, w, 28);
    if (s.zone) { g.strokeStyle = '#ffe14d'; g.setLineDash([6, 4]); g.strokeRect(w / 2 - 110, ly - 10, 220, h - ly - 18); g.setLineDash([]); }
    if (s.phase === 'hold') { g.fillStyle = '#ffe14d'; g.textAlign = 'left'; g.font = '700 14px system-ui'; g.fillText('⏱ ' + Math.round(prog * 10) + ' / 10 min · ' + L('drift', 'descente') + ' ' + s.drift + ' mm', 10, h - 36); }
  }
  function thermoDraw(cv, s) {
    if (!cv) return; const { g, w, h } = fit(cv);
    const img = g.createImageData(Math.ceil(w), Math.ceil(h)), W = img.width;
    const col = (t) => { t = Math.max(0, Math.min(1, t)); const r = Math.min(255, t * 2.2 * 255), gg = Math.max(0, Math.min(255, (t - 0.35) * 2 * 255)), b = Math.max(0, 140 - t * 260) + (t > 0.9 ? (t - 0.9) * 2000 : 0); return [r, gg, Math.min(255, b)]; };
    for (let y = 0; y < img.height; y++) for (let x = 0; x < W; x++) {
      let t = 0.12 + 0.05 * Math.sin(x * 0.05) * Math.cos(y * 0.07);
      for (let i = 0; i < 6; i++) { const cx = w * (0.1 + 0.8 * (i + 0.5) / 6), cy = h * 0.45, d2 = ((x - cx) ** 2) / 900 + ((y - cy) ** 2) / 2200; t += (i === s.hot ? 0.25 + s.dT / 60 : 0.28) * Math.exp(-d2 * 2.2); }
      const c = col(t), p = (y * W + x) * 4; img.data[p] = c[0]; img.data[p + 1] = c[1]; img.data[p + 2] = c[2]; img.data[p + 3] = 255;
    }
    const r = window.devicePixelRatio || 1; g.setTransform(1, 0, 0, 1, 0, 0); const tmp = document.createElement('canvas'); tmp.width = img.width; tmp.height = img.height; tmp.getContext('2d').putImageData(img, 0, 0); g.drawImage(tmp, 0, 0, w * r, h * r); g.setTransform(r, 0, 0, r, 0, 0);
    g.fillStyle = '#fff'; g.font = '12px system-ui'; g.textAlign = 'center';
    for (let i = 0; i < 6; i++) { const cx = w * (0.1 + 0.8 * (i + 0.5) / 6); g.fillText('C' + (i + 1), cx, h * 0.85); if (s.click === i) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(cx - 26, h * 0.2, 52, h * 0.52); } }
    g.textAlign = 'left'; g.fillText(L('Training image — colour scale: blue cool → white hot', 'Image de formation — échelle : bleu froid → blanc chaud'), 8, 16);
  }

  /* ---------- events ---------- */
  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if (d.twDept) return open(d.twDept);
    if (d.twTab) { tab = d.twTab; test = null; return draw(); }
    if (d.twBack) { test = null; return draw(); }
    if (d.twTest) { test = { k: d.twTest, s: TESTS[d.twTest].init() }; tab = 'inspect'; return draw(); }
    if (d.twAi) { ui.close(); if (window.CY3 && window.CY3.beginner) window.CY3.beginner(L('I am training on a ', 'Je m’entraîne sur un(e) ') + T2(TEST_NAME[d.twAi]) + ' (' + dept + '). ' + L('Explain the purpose, the key safety points, how to read the results and the most common mistakes, for a beginner.', 'Explique le but, les points de sécurité, comment lire les résultats et les erreurs fréquentes, pour un débutant.')); }
  }
  function onInput(e) {
    const k = e.target.dataset && e.target.dataset.op; if (!k) return;
    op[dept][k] = Number(e.target.value);
    const lab = ui.body.querySelector(`[data-op-v="${k}"]`); if (lab) lab.textContent = f(op[dept][k], e.target.step < 1 ? 1 : 0) + ' ' + lab.textContent.split(' ').pop();
    updateOperate();
  }
  window.CYTWIN = { open, TWINS };
  if (window.CYLAB) window.CYLAB.register({ icon: '🏭', available: () => true, open: () => open('APVG'), title: () => L('Digital twins (APVG · APL · APE)', 'Jumeaux numériques (APVG · APL · APE)'), desc: () => L('Air receiver, overhead crane and distribution board: 3D, specs, live operating conditions, 8 hands-on inspections (thickness survey, hydrotest, wire rope, load test, lockout, insulation, RCD, thermography) and history.', 'Réservoir d’air, pont roulant et armoire électrique : 3D, caractéristiques, conditions de fonctionnement, 8 inspections pratiques (épaisseurs, épreuve, câble, essai de charge, consignation, isolement, DDR, thermographie) et historique.') });
}());
