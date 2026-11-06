/* CYCLOPS home page: the complete video guide (cyclops-guide.js) shown first, a menu grid of every feature
   under it, and a slide-out ☰ menu available from every page.
   - The older header buttons (Academy, Lab, ASME/API teacher, Field inspections, Quiz) stay in the page for the
     modules that click them, but are hidden: everything is reached from the menu.
   window.CYHOME = { show(), procedures(method, selector?), menu() } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s) => document.querySelector(s);
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ======================= navigation ======================= */
  const MAIN = ['photo-dropzone', 'photo-result', 'ptab', 'prd', 'quiz-view', 'tools-view'];
  let home = null;
  function show() {
    if (!home) return;
    MAIN.forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = true; });
    home.hidden = false; window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    document.body.classList.add('cy-on-home'); video.visible(true);
  }
  function leave() { if (home && !home.hidden) { home.hidden = true; document.body.classList.remove('cy-on-home'); video.visible(false); } }
  // open the procedures page of a method (and optionally scroll to a simulator block on it)
  function procedures(method, selector, mode) {
    leave(); closeMenu();
    ['quiz-view', 'tools-view', 'photo-result'].forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = true; });
    ['photo-dropzone', 'ptab', 'prd'].forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = false; });
    const b = [...document.querySelectorAll('#ptab button')].find((x) => x.dataset.pm === method); if (b) b.click();
    setTimeout(() => {
      const target = selector && document.querySelector(selector);
      if (target && mode) { const m = target.querySelector('[data-mode="' + mode + '"]'); if (m) m.click(); }
      (target || document.getElementById('ptab')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }, 450);
  }
  const academy = (tab) => () => { closeMenu(); if (window.CYACADEMY) window.CYACADEMY.open(tab); };
  const ACTIONS = {
    academy: academy('path'), basics: academy('basics'), cnd: academy('cnd'), chal: academy('chal'), scen: academy('scen'), coach: academy('coach'), lab3d: academy('lab'), dict: academy('dict'), progress: academy('progress'),
    pro: () => { closeMenu(); if (window.CYPRO) window.CYPRO.open(); },
    teacher: () => { closeMenu(); if (window.CYSTUDY) window.CYSTUDY.open(); },
    quiz: () => { leave(); closeMenu(); const q = document.getElementById('quiz-open'); if (q) q.click(); },
    tools: () => { leave(); closeMenu(); if (window.CYTOOLS) window.CYTOOLS.open(); },
    ai: () => { closeMenu(); if (window.CY3) window.CY3.open(); },
    photo: () => { closeMenu(); if (window.CY3) { window.CY3.open(); setTimeout(() => { const i = document.getElementById('cyai-image-input'); if (i) i.click(); }, 150); } },
    labhub: () => { closeMenu(); if (window.CYLAB) window.CYLAB.open(); },
    work: () => { closeMenu(); if (window.CYWORK) window.CYWORK.open('ut-path'); },
    twin: () => { closeMenu(); if (window.CYTWIN) window.CYTWIN.open('APVG'); },
    defects: () => { closeMenu(); if (window.CYDEF) window.CYDEF.open('crack'); },
    ut: () => procedures('UT', '.cyut'), rt: () => procedures('RT', '.cyrt'), mt: () => procedures('MT', '.cymt'), pt: () => procedures('PT', '.cypt'),
    home: () => { closeMenu(); show(); }
  };
  const METHODS = [['PT', ['Penetrant', 'Ressuage']], ['MT', ['Magnetic particles', 'Magnétoscopie']], ['UT', ['Ultrasound', 'Ultrasons']], ['RT', ['Radiography', 'Radiographie']], ['VT', ['Visual', 'Visuel']], ['APVG', ['Pressure equipment', 'Appareils à pression']], ['APL', ['Lifting equipment', 'Levage']], ['APE', ['Electrical', 'Électrique']], ['OTH', ['Other / general', 'Autres / général']]];
  const MENU = [
    { t: ['Learn', 'Apprendre'], items: [
      ['academy', '🏫', ['CYCLOPS Academy', 'Académie CYCLOPS'], ['5 levels from absolute beginner to professional', '5 niveaux, du débutant absolu au professionnel']],
      ['basics', '🌱', ['Beginner lessons', 'Leçons débutant'], ['Start here if you know nothing about inspection', 'Commencez ici si vous ne connaissez rien à l’inspection']],
      ['cnd', '🎓', ['CND Academy modules', 'Modules Académie CND'], ['30 animated topics: UT, RT, MT, PT, VT', '30 thèmes animés : UT, RT, MT, PT, VT']],
      ['pro', '🎖', ['Professional courses', 'Cours professionnels'], ['Narrated: code requirements, blocks, acceptance criteria', 'Commentés : exigences des codes, blocs, critères d’acceptation']],
      ['teacher', '📚', ['ASME/API AI teacher', 'Formateur IA ASME/API'], ['Lessons, calculators and a final exam on the codes', 'Leçons, calculateurs et examen final sur les codes']],
      ['quiz', '❓', ['Quiz', 'Quiz'], ['Test yourself by method and level', 'Testez-vous par méthode et par niveau']],
      ['dict', '📖', ['Visual dictionary', 'Dictionnaire visuel'], ['Every technical word explained simply', 'Chaque mot technique expliqué simplement']]] },
    { t: ['Practise', 'S’entraîner'], items: [
      ['ut', '📟', ['UT flaw detector simulator', 'Simulateur de détecteur UT'], ['Indications, DAC, hidden flaws, material/frequency explorer', 'Indications, DAC, défauts cachés, explorateur matériau/fréquence']],
      ['rt', '🎞', ['RT film interpretation', 'Interprétation de film RT'], ['Step by step and film atlas', 'Pas à pas et atlas de films']],
      ['mt', '🧲', ['MT simulator', 'Simulateur MT'], ['Move the yoke, find the cracks', 'Déplacez le yoke, trouvez les fissures']],
      ['pt', '🧪', ['PT simulator', 'Simulateur PT'], ['Every step of penetrant testing', 'Chaque étape du ressuage']],
      ['chal', '⚡', ['Challenges', 'Défis'], ['Daily challenge and adaptive practice', 'Défi du jour et entraînement adaptatif']],
      ['scen', '🎲', ['Scenarios & missions', 'Scénarios et missions'], ['Complete jobs, adaptive random missions', 'Travaux complets, missions aléatoires adaptatives']],
      ['coach', '🧠', ['My coach', 'Mon coach'], ['Your weak points and mistake analysis', 'Vos points faibles et l’analyse de vos erreurs']]] },
    { t: ['Training lab', 'Laboratoire'], items: [
      ['work', '🧮', ['Engineering workspace', 'Atelier de calcul'], ['11 calculators with formulas and units', '11 calculateurs avec formules et unités']],
      ['twin', '🏭', ['Digital twins', 'Jumeaux numériques'], ['Vessel, crane, electrical board: hands-on inspections', 'Réservoir, pont roulant, armoire : inspections pratiques']],
      ['defects', '🔬', ['3D defect lab', 'Labo 3D des défauts'], ['Rotate, cut and compare weld defects', 'Tourner, couper et comparer les défauts']],
      ['lab3d', '🧊', ['3D equipment lab', 'Labo 3D des équipements'], ['Every inspection tool in 3D', 'Chaque outil d’inspection en 3D']]] },
    { t: ['Field work', 'Terrain'], items: [
      ['tools', '📋', ['Field inspections', 'Inspections terrain'], ['Checklists, photos, indications, reports — works offline', 'Listes, photos, indications, rapports — hors ligne']],
      ['ai', '🤖', ['AI assistant', 'Assistant IA'], ['Ask anything, by text or voice, with sources', 'Posez vos questions, à l’écrit ou à la voix, avec sources']],
      ['photo', '📷', ['Photo analysis', 'Analyse de photo'], ['Send a photo of equipment or a defect to the AI', 'Envoyez une photo d’équipement ou de défaut à l’IA']],
      ['progress', '🏆', ['My progress', 'Ma progression'], ['Analytics, achievements, certificates of completion', 'Statistiques, succès, attestations de suivi']]] }
  ];

  /* ======================= the video guide (cyclops-guide.js) ======================= */
  const video = {
    visible(v) { if (window.CYGUIDE) window.CYGUIDE.visible(v); },
    pause() { if (window.CYGUIDE) window.CYGUIDE.pause(); }
  };

  /* ======================= markup ======================= */
  const css = `
.cy-on-home #back { display: none; }
#academy-open, #lab-open, #study-open, #tools-open, #quiz-open { display: none !important; }
.cyhm-top { display: inline-flex; gap: 8px; }
.cyhm-hero { margin: 4px 0 22px; }
.cyhm-menu h2 { margin: 18px 0 8px; font-size: 1.05rem; color: var(--muted); letter-spacing: .06em; text-transform: uppercase; }
.cyhm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.cyhm-grid button { text-align: left; display: grid; grid-template-columns: 40px 1fr; gap: 2px 10px; align-items: center; padding: 12px; border-radius: 12px; background: linear-gradient(145deg, rgba(18, 29, 59, .94), rgba(13, 20, 47, .9)); transition: transform .15s ease, border-color .15s ease; }
.cyhm-grid button:hover { transform: translateY(-2px); border-color: var(--blue); background: linear-gradient(145deg, rgba(28, 44, 90, .95), rgba(20, 30, 70, .9)); }
.cyhm-grid i { font-style: normal; font-size: 1.7rem; grid-row: span 2; text-align: center; } .cyhm-grid b { color: #fff; } .cyhm-grid span { color: var(--muted); font-size: 12.5px; line-height: 1.35; }
.cyhm-methods { display: flex; flex-wrap: wrap; gap: 8px; } .cyhm-methods button { display: grid; text-align: left; padding: 8px 12px; border-radius: 10px; } .cyhm-methods b { color: #fff; } .cyhm-methods span { color: var(--muted); font-size: 12px; }
.cyhm-drawer { margin: 0; height: 100dvh; max-height: none; width: min(380px, 92vw); padding: 0; border: 0; border-right: 1px solid var(--line); background: var(--bg); color: var(--text); }
.cyhm-drawer[open] { animation: cyhm-slide .22s ease-out; } @keyframes cyhm-slide { from { transform: translateX(-100%); } to { transform: none; } }
.cyhm-drawer::backdrop { background: rgba(3, 7, 20, .6); }
.cyhm-dhead { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--panel); position: sticky; top: 0; }
.cyhm-dbody { padding: 6px 14px 24px; overflow: auto; } .cyhm-dbody h3 { margin: 14px 0 6px; font-size: .8rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.cyhm-dbody button { display: flex; width: 100%; gap: 10px; align-items: center; text-align: left; margin: 3px 0; padding: 9px 10px; border-color: transparent; background: transparent; }
.cyhm-dbody button:hover { background: rgba(61, 169, 255, .14); border-color: var(--line); color: inherit; }
.cyhm-dbody .m { display: flex; flex-wrap: wrap; gap: 5px; } .cyhm-dbody .m button { width: auto; border-color: var(--line); padding: 5px 10px; }
html.field .cyhm-grid button { background: #fff; } html.field .cyhm-grid b { color: #111; }
@media (prefers-reduced-motion: reduce) { .cyhm-drawer[open] { animation: none; } .cyhm-grid button { transition: none; } }
@media (max-width: 640px) { .cyhm-grid { grid-template-columns: minmax(0, 1fr); } }
`;
  function menuHtml() {
    return MENU.map((g) => `<h2>${esc(T2(g.t))}</h2><div class="cyhm-grid">${g.items.map(([k, ic, t, d]) => `<button type="button" data-hm="${k}"><i>${ic}</i><b>${esc(T2(t))}</b><span>${esc(T2(d))}</span></button>`).join('')}</div>`).join('') +
      `<h2>${L('Procedures & 3D by department', 'Procédures et 3D par département')}</h2><div class="cyhm-methods">${METHODS.map(([m, n]) => `<button type="button" data-hm-proc="${m}"><b>${m}</b><span>${esc(T2(n))}</span></button>`).join('')}</div>`;
  }
  function render() {
    if (!home) return;
    home.innerHTML = '<div class="cyhm-hero"></div><div class="cyhm-menu">' + menuHtml() + '</div>';
    if (window.CYGUIDE) window.CYGUIDE.mount(home.querySelector('.cyhm-hero'), { action: (k) => { if (ACTIONS[k]) ACTIONS[k](); } });
  }
  // slide-out menu
  let drawer = null;
  function openMenu() {
    if (drawer) { drawer.close(); return; }
    drawer = document.createElement('dialog'); drawer.className = 'cyhm-drawer';
    drawer.innerHTML = `<div class="cyhm-dhead"><b>☰ ${L('Menu', 'Menu')}</b><button type="button" data-hm-close aria-label="${L('Close', 'Fermer')}">✕</button></div><div class="cyhm-dbody">
<button type="button" data-hm="home">🏠 <span>${L('Home & presentation video', 'Accueil et vidéo de présentation')}</span></button>
${MENU.map((g) => `<h3>${esc(T2(g.t))}</h3>${g.items.map(([k, ic, t]) => `<button type="button" data-hm="${k}">${ic} <span>${esc(T2(t))}</span></button>`).join('')}`).join('')}
<h3>${L('Procedures & 3D', 'Procédures et 3D')}</h3><div class="m">${METHODS.map(([m]) => `<button type="button" data-hm-proc="${m}">${m}</button>`).join('')}</div></div>`;
    document.body.appendChild(drawer);
    drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('[data-hm-close]')) closeMenu(); });
    drawer.addEventListener('close', () => { drawer.remove(); drawer = null; });
    drawer.showModal();
  }
  function closeMenu() { if (drawer) drawer.close(); }

  // menu clicks (home grid and drawer): opening anything pauses the guide
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hm],[data-hm-proc]'); if (!b) return;
    const d = b.dataset; video.pause();
    if (d.hm && ACTIONS[d.hm]) return ACTIONS[d.hm]();
    if (d.hmProc) return procedures(d.hmProc);
  });
  // any click on a method tab (from the Academy, simulators links…) leaves the home page
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('#ptab [data-pm]') && home && !home.hidden) { leave(); ['photo-dropzone', 'ptab', 'prd'].forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = false; }); } }, true);

  function headerButtons() {
    const actions = document.querySelector('.head-actions'); if (!actions || document.getElementById('home-open')) return;
    const wrap = document.createElement('span'); wrap.className = 'cyhm-top';
    wrap.innerHTML = '<button type="button" id="home-open"></button><button type="button" id="menu-open" class="cysurf-primary"></button>';
    actions.insertBefore(wrap, actions.firstChild);
    const label = () => { const h = document.getElementById('home-open'), m = document.getElementById('menu-open'); h.textContent = '🏠 ' + L('Home', 'Accueil'); m.textContent = '☰ ' + L('Menu', 'Menu'); m.style.cssText = 'background:var(--accent);border-color:var(--accent);color:#fff'; };
    label();
    document.getElementById('home-open').addEventListener('click', () => { closeMenu(); show(); });
    document.getElementById('menu-open').addEventListener('click', openMenu);
    const sw = document.getElementById('lang');
    if (sw) sw.addEventListener('change', () => { label(); render(); if (drawer) { closeMenu(); } });
  }
  function init() {
    if (!window.CYPROC) return; // the "not running" message stays visible
    if (!document.getElementById('cyhm-css')) { const s = document.createElement('style'); s.id = 'cyhm-css'; s.textContent = css; document.head.appendChild(s); }
    home = document.createElement('section'); home.id = 'home-view';
    const header = document.querySelector('main > header'); header.after(home);
    headerButtons(); render(); show();
  }
  window.CYHOME = { show, procedures, menu: openMenu };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
}());
