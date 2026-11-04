/* CYCLOPS home page: an animated explainer video (what CYCLOPS contains and how to use it) shown first,
   a menu grid of every feature under it, and a slide-out ☰ menu available from every page.
   - The video is drawn live on a canvas (motion graphics, 10 chapters), with captions, optional EN/FR voice-over
     (browser speech synthesis), chapter buttons, play/pause, fullscreen, and a "Go there" button per chapter.
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

  /* ======================= the explainer video ======================= */
  const CH = [
    { k: 'intro', go: null, t: ['Welcome to CYCLOPS', 'Bienvenue dans CYCLOPS'], s: ['The AI-powered industrial inspection school and field console of AQCS', 'L’école d’inspection industrielle et la console terrain d’AQCS, avec IA'],
      v: ['Welcome to CYCLOPS, the industrial inspection school and field console of AQCS. In one minute, here is everything inside, and how to use it.', 'Bienvenue dans CYCLOPS, l’école d’inspection industrielle et la console terrain d’AQCS. En une minute, voici tout ce qu’elle contient, et comment l’utiliser.'] },
    { k: 'depts', go: null, t: ['Four departments', 'Quatre départements'], s: ['NDT (PT · MT · UT · RT · VT), pressure equipment, lifting and electrical', 'CND (PT · MT · UT · RT · VT), appareils à pression, levage et électrique'],
      v: ['CYCLOPS covers the four AQCS departments: non-destructive testing with penetrant, magnetic particles, ultrasound, radiography and visual testing; pressure equipment; lifting equipment; and electrical installations.', 'CYCLOPS couvre les quatre départements d’AQCS : le contrôle non destructif par ressuage, magnétoscopie, ultrasons, radiographie et contrôle visuel ; les appareils à pression ; le levage ; et les installations électriques.'] },
    { k: 'procs', go: () => procedures('UT'), t: ['Procedures in 3D', 'Procédures en 3D'], s: ['Equipment, steps, safety, codes — and a live 3D animation of every method', 'Équipements, étapes, sécurité, codes — et une animation 3D de chaque méthode'],
      v: ['For every method you get the equipment, the steps, the safety rules and the codes to check, with a live 3D animation you can rotate, explode and cut open.', 'Pour chaque méthode : les équipements, les étapes, les règles de sécurité et les codes à vérifier, avec une animation 3D en direct que l’on peut tourner, éclater et couper.'] },
    { k: 'sims', go: () => procedures('UT', '.cyut'), t: ['Realistic simulators', 'Des simulateurs réalistes'], s: ['UT flaw detector, RT film, MT yoke and PT process — they explain WHY', 'Détecteur UT, film RT, yoke MT et ressuage — ils expliquent POURQUOI'],
      v: ['Train on simulators: an ultrasonic flaw detector with DAC and hidden flaws, radiographic film interpretation, a magnetic yoke and the full penetrant process. Each one explains why the result looks the way it does.', 'Entraînez-vous sur des simulateurs : détecteur ultrasonore avec DAC et défauts cachés, interprétation de films radiographiques, yoke magnétique et ressuage complet. Chacun explique pourquoi le résultat a cet aspect.'] },
    { k: 'academy', go: ACTIONS.academy, t: ['The Academy', 'L’Académie'], s: ['Five levels from absolute beginner to professional, with XP and achievements', 'Cinq niveaux du débutant absolu au professionnel, avec XP et succès'],
      v: ['The Academy takes you from absolute beginner to professional in five levels: short lessons, animated modules, a visual dictionary, challenges, and certificates of completion. These are training, not official qualifications.', 'L’Académie vous emmène du débutant absolu au professionnel en cinq niveaux : leçons courtes, modules animés, dictionnaire visuel, défis et attestations de suivi. C’est de la formation, pas une qualification officielle.'] },
    { k: 'ai', go: ACTIONS.ai, t: ['Your AI teacher', 'Votre formateur IA'], s: ['Ask by text, voice or photo — it adapts to your level and cites its sources', 'Questions par écrit, à la voix ou en photo — il s’adapte à votre niveau et cite ses sources'],
      v: ['Ask the AI assistant anything, by text, by voice or with a photo. It knows the lesson you are studying and your weak points, explains like a teacher, cites its sources, and never invents code requirements.', 'Posez vos questions à l’assistant IA, par écrit, à la voix ou avec une photo. Il connaît la leçon en cours et vos points faibles, explique comme un formateur, cite ses sources et n’invente jamais d’exigence de code.'] },
    { k: 'lab', go: ACTIONS.labhub, t: ['The training lab', 'Le laboratoire'], s: ['Calculators, digital twins of real equipment, and 3D defects', 'Calculateurs, jumeaux numériques d’équipements, et défauts en 3D'],
      v: ['In the training lab: an engineering workspace with step-by-step calculations, digital twins of a pressure vessel, a crane and an electrical board to inspect hands-on, and a 3D defect lab.', 'Dans le laboratoire : un atelier de calcul pas à pas, des jumeaux numériques d’un réservoir, d’un pont roulant et d’une armoire électrique à inspecter en pratique, et un labo 3D des défauts.'] },
    { k: 'coach', go: ACTIONS.scen, t: ['Missions & coach', 'Missions et coach'], s: ['Random missions target your weak points; every mistake is analysed', 'Des missions aléatoires ciblent vos points faibles ; chaque erreur est analysée'],
      v: ['Adaptive missions give you a new job every time, aimed at your weak points. Your coach analyses every mistake, finds its likely cause, and gives you a new exercise until you master it.', 'Les missions adaptatives vous donnent un nouveau travail à chaque fois, ciblé sur vos points faibles. Votre coach analyse chaque erreur, trouve sa cause probable et vous donne un nouvel exercice jusqu’à maîtrise.'] },
    { k: 'field', go: ACTIONS.tools, t: ['Field inspections', 'Inspections terrain'], s: ['Checklists, photos, indications and reports — even offline', 'Listes de contrôle, photos, indications et rapports — même hors ligne'],
      v: ['On site, use field inspections: guided checklists, photos, recorded indications and a printable report. It keeps working without a network.', 'Sur le terrain, utilisez les inspections terrain : listes guidées, photos, indications enregistrées et rapport imprimable. Cela fonctionne même sans réseau.'] },
    { k: 'outro', go: () => { const m = $('.cyhm-menu'); if (m) m.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }, t: ['Where do you start?', 'Par où commencer ?'], s: ['Choose from the menu below — or ☰ Menu at the top, from any page', 'Choisissez dans le menu ci-dessous — ou ☰ Menu en haut, depuis n’importe quelle page'],
      v: ['Choose where to start in the menu below, or open the menu at the top from any page. Beginners: start with the Academy. Good training!', 'Choisissez par où commencer dans le menu ci-dessous, ou ouvrez le menu en haut depuis n’importe quelle page. Débutants : commencez par l’Académie. Bonne formation !'] }
  ];
  const DUR = 7.5;
  const video = (() => {
    let cv, ctx, W = 0, H = 0, t = 0, last = 0, playing = !reduced, on = true, voice = false, lastCh = -1, raf = 0, wrap;
    const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x));
    const total = () => CH.length * DUR;
    function mount(el) {
      wrap = el; cv = el.querySelector('canvas'); ctx = cv.getContext('2d');
      new ResizeObserver(resize).observe(cv); resize();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
    }
    function resize() { const r = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * r); cv.height = Math.round(H * r); ctx.setTransform(r, 0, 0, r, 0, 0); }
    function frame(ts) {
      if (!cv.isConnected) return;
      const dt = Math.min(0.05, ((ts - last) / 1000) || 0); last = ts;
      if (playing && on && document.visibilityState === 'visible') t = (t + dt) % total();
      if (on) draw();
      raf = requestAnimationFrame(frame);
    }
    function chapter() { return Math.min(CH.length - 1, Math.floor(t / DUR)); }
    function draw() {
      const i = chapter(), u = (t - i * DUR) / DUR, c = CH[i];
      if (i !== lastCh) { lastCh = i; ui(i); if (voice) speak(i); }
      // background: deep blue studio with slow light sweep
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0a1430'); g.addColorStop(1, '#170f38'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sx = (t * 40) % (W + 400) - 200; const sw = ctx.createRadialGradient(sx, H * 0.3, 0, sx, H * 0.3, H); sw.addColorStop(0, 'rgba(61,169,255,.13)'); sw.addColorStop(1, 'rgba(61,169,255,0)'); ctx.fillStyle = sw; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(120,150,255,.07)'; ctx.lineWidth = 1; for (let x = (t * 8) % 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const fade = Math.min(ease(u * 6), ease((1 - u) * 8));
      ctx.save(); ctx.globalAlpha = fade; SCENES[c.k](u, Math.min(W, H * 1.7)); ctx.restore();
      // caption
      const fs = Math.max(15, Math.min(30, W / 26));
      ctx.textAlign = 'center'; ctx.globalAlpha = ease(u * 5) * ease((1 - u) * 10);
      ctx.fillStyle = 'rgba(3,7,20,.55)'; ctx.fillRect(0, H - fs * 3.3, W, fs * 3.3);
      ctx.fillStyle = '#fff'; ctx.font = `800 ${fs}px system-ui,sans-serif`; ctx.fillText(T2(c.t), W / 2, H - fs * 1.9);
      const ss = Math.max(11, fs * 0.55); ctx.fillStyle = '#b9c8f0'; ctx.font = `500 ${ss}px system-ui,sans-serif`; wrapText(T2(c.s), W / 2, H - fs * 0.85, W * 0.94, ss * 1.15);
      ctx.globalAlpha = 1;
      // progress bar
      ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(0, H - 4, W, 4); const pg = ctx.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, '#3da9ff'); pg.addColorStop(1, '#9d65ff'); ctx.fillStyle = pg; ctx.fillRect(0, H - 4, W * t / total(), 4);
      if (!playing) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(W / 2, H * 0.42, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(W / 2 - 10, H * 0.42 - 16); ctx.lineTo(W / 2 + 18, H * 0.42); ctx.lineTo(W / 2 - 10, H * 0.42 + 16); ctx.fill(); }
    }
    function wrapText(s, x, y, maxW, lh) { const words = s.split(' '); let line = '', lines = []; words.forEach((w) => { const tt = line ? line + ' ' + w : w; if (ctx.measureText(tt).width > maxW) { lines.push(line); line = w; } else line = tt; }); lines.push(line); lines.slice(0, 2).forEach((l, k) => ctx.fillText(l, x, y + (k - (lines.length > 1 ? 0.5 : 0)) * lh)); }
    function ui(i) {
      if (!wrap) return;
      wrap.querySelectorAll('[data-hv-ch]').forEach((b) => b.classList.toggle('on', Number(b.dataset.hvCh) === i));
      const go = wrap.querySelector('[data-hv-go]'); if (go) { go.hidden = !CH[i].go; go.textContent = '➜ ' + L('Go there: ', 'Y aller : ') + T2(CH[i].t); }
    }
    function speak(i) {
      if (typeof speechSynthesis === 'undefined') return;
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(T2(CH[i].v)); u.lang = L('en-US', 'fr-FR'); u.rate = 1.02;
      const v = speechSynthesis.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith(L('en', 'fr'))); if (v) u.voice = v;
      speechSynthesis.speak(u);
    }
    const api = {
      mount, chapter,
      play(p) { playing = p == null ? !playing : p; if (!playing && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); const b = wrap && wrap.querySelector('[data-hv="play"]'); if (b) b.textContent = playing ? '⏸' : '▶'; },
      seek(i) { t = i * DUR + 0.01; lastCh = -1; },
      voice(v) { voice = v == null ? !voice : v; if (voice) { lastCh = -1; this.play(true); } else if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); return voice; },
      visible(v) { on = v; if (!v && typeof speechSynthesis !== 'undefined' && voice) speechSynthesis.cancel(); },
      go() { const c = CH[chapter()]; if (c.go) { this.play(false); c.go(); } },
      refresh() { lastCh = -1; }
    };

    /* ---------- drawing helpers ---------- */
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function card(x, y, w, h, col, a) { ctx.save(); ctx.globalAlpha *= a == null ? 1 : a; ctx.shadowColor = col; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(18,29,59,.92)'; rr(x, y, w, h, 12); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
    function txt(s, x, y, size, col, weight, align) { ctx.fillStyle = col || '#fff'; ctx.font = `${weight || 700} ${size}px system-ui,sans-serif`; ctx.textAlign = align || 'center'; ctx.fillText(s, x, y); }
    function icon(e, x, y, size) { ctx.font = `${size}px system-ui,"Segoe UI Emoji","Apple Color Emoji",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); ctx.textBaseline = 'alphabetic'; }
    function eye(x, y, r, look) {
      ctx.save(); ctx.shadowColor = '#3da9ff'; ctx.shadowBlur = 30; ctx.strokeStyle = '#3da9ff'; ctx.lineWidth = r * 0.12;
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, -0.3, 0, 7); ctx.stroke(); ctx.restore();
      const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(157,101,255,.5)'); gr.addColorStop(1, 'rgba(61,169,255,.08)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(x, y, r * 0.94, r * 0.56, -0.3, 0, 7); ctx.fill();
      const px = x + Math.cos(look) * r * 0.32, py = y + Math.sin(look) * r * 0.16;
      ctx.fillStyle = '#d9f5ff'; ctx.shadowColor = '#9d65ff'; ctx.shadowBlur = 20; ctx.beginPath(); ctx.arc(px, py, r * 0.22, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a1430'; ctx.beginPath(); ctx.arc(px, py, r * 0.09, 0, 7); ctx.fill();
    }
    const top = () => H * 0.06, area = () => H * 0.62; // drawing zone above the caption
    const SCENES = {
      intro(u, S) {
        const cx = W / 2, cy = top() + area() * 0.45, r = S * 0.12 * (0.8 + 0.2 * ease(u * 3));
        for (let i = 0; i < 40; i++) { const a = i * 2.4 + t * 0.3, d = r * 1.6 + (i * 13 % 90) * (S / 600); ctx.fillStyle = `rgba(${i % 2 ? '61,169,255' : '157,101,255'},${0.5 * ease(u * 4)})`; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, 2, 0, 7); ctx.fill(); }
        eye(cx, cy, r, t * 1.3);
        const word = 'CYCLOPS', n = Math.floor(ease((u - 0.15) * 2.5) * word.length);
        txt(word.slice(0, n), cx, cy + r * 1.35, S * 0.075, '#fff', 900);
        ctx.globalAlpha *= ease((u - 0.4) * 3); txt('AQCS · Algeria', cx, cy + r * 1.35 + S * 0.05, S * 0.03, '#8fb6ff', 600);
      },
      depts(u, S) {
        const items = [['🔍', 'CND / NDT', ['PT', 'MT', 'UT', 'RT', 'VT'], '#3da9ff'], ['🛢', 'APVG', [L('Pressure', 'Pression')], '#e0a526'], ['🏗', 'APL', [L('Lifting', 'Levage')], '#42c991'], ['⚡', 'APE', [L('Electrical', 'Électrique')], '#e66b78']];
        const w = Math.min(W * 0.21, S * 0.3), h = area() * 0.62, gap = (W - w * 4) / 5, y0 = top() + area() * 0.15;
        items.forEach(([ic, name, tags, col], i) => {
          const k = ease((u - i * 0.1) * 3.5), x = gap + i * (w + gap), y = y0 + (1 - k) * 60;
          card(x, y, w, h, col, k); ctx.globalAlpha = k;
          icon(ic, x + w / 2, y + h * 0.3, Math.min(w, h) * 0.32); txt(name, x + w / 2, y + h * 0.62, Math.min(26, w * 0.15), '#fff', 800);
          tags.forEach((tg, j) => { const tw = Math.min(w * 0.18, 34), tx = x + w / 2 + (j - (tags.length - 1) / 2) * (tags.length > 1 ? tw + 4 : 0); txt(tg, tx, y + h * 0.8, Math.min(13, w * 0.09), col, 800); });
          ctx.globalAlpha = 1;
        });
      },
      procs(u, S) {
        const cx = W * 0.32, cy = top() + area() * 0.5, R = S * 0.12, rot = t * 0.8;
        // wireframe pressure vessel rotating
        ctx.strokeStyle = 'rgba(61,169,255,.85)'; ctx.lineWidth = 1.5;
        for (let k = -3; k <= 3; k++) { const x = cx + k * R * 0.45; ctx.beginPath(); ctx.ellipse(x, cy, R * 0.3 * Math.abs(Math.cos(rot)) + 2, R, 0, 0, 7); ctx.stroke(); }
        for (let a = 0; a < 6.28; a += 0.52) { const y = cy + Math.sin(a + rot) * R; ctx.globalAlpha = 0.4 + 0.6 * (Math.cos(a + rot) > 0 ? 1 : 0.3); ctx.beginPath(); ctx.moveTo(cx - R * 1.35, y); ctx.lineTo(cx + R * 1.35, y); ctx.stroke(); }
        ctx.globalAlpha = 1; ctx.strokeStyle = '#9d65ff'; ctx.beginPath(); ctx.ellipse(cx - R * 1.4, cy, R * 0.25, R, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx + R * 1.4, cy, R * 0.25, R, 0, 0, 7); ctx.stroke();
        const list = [['🧰', L('Equipment', 'Équipements')], ['🪜', L('Step-by-step procedure', 'Procédure pas à pas')], ['🦺', L('Health & safety', 'Santé et sécurité')], ['📜', L('Codes to check', 'Codes à vérifier')], ['🎬', L('3D: rotate · explode · cut', '3D : tourner · éclater · couper')]];
        list.forEach(([ic, s], i) => { const k = ease((u - 0.1 - i * 0.09) * 4), x = W * 0.58, y = top() + area() * (0.14 + i * 0.17); ctx.globalAlpha = k; icon(ic, x, y, S * 0.04); txt(s, x + S * 0.04, y + S * 0.012, Math.min(20, S * 0.032), '#e8eeff', 600, 'left'); ctx.globalAlpha = 1; });
      },
      sims(u, S) {
        const x = W * 0.06, y = top() + area() * 0.08, w = W * 0.5, h = area() * 0.84;
        card(x, y, w, h, '#42c991'); ctx.fillStyle = '#03140d'; rr(x + 8, y + 8, w - 16, h - 16, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(120,255,170,.12)'; for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(x + 8 + (w - 16) * i / 10, y + 8); ctx.lineTo(x + 8 + (w - 16) * i / 10, y + h - 8); ctx.stroke(); }
        const pos = 0.3 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.2)), amp = 0.4 + 0.5 * Math.exp(-Math.pow((Math.sin(t * 1.2)) * 2, 2));
        ctx.strokeStyle = '#a6ff6e'; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 200; i++) { const f = i / 200, base = 0.04 * Math.random() * 0.3; let v = base + (f < 0.04 ? 0.9 * (1 - f / 0.04) : 0) + amp * Math.exp(-Math.pow((f - pos) / 0.012, 2)) + 0.75 * Math.exp(-Math.pow((f - 0.86) / 0.012, 2)); const px = x + 8 + (w - 16) * f, py = y + h - 12 - v * (h - 30); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke(); txt('A-SCAN · UT', x + 18, y + 28, 13, '#a6ff6e', 700, 'left');
        const fx = W * 0.62, fy = y, fw = W * 0.32, fh = h * 0.42;
        card(fx, fy, fw, fh, '#9d65ff'); const fg = ctx.createLinearGradient(fx, 0, fx + fw, 0); fg.addColorStop(0, '#2a2a2e'); fg.addColorStop(0.5, '#55565c'); fg.addColorStop(1, '#2a2a2e'); ctx.fillStyle = fg; rr(fx + 8, fy + 8, fw - 16, fh - 16, 6); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.75)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(fx + fw * (0.2 + i * 0.12), fy + fh / 2 + Math.sin(i * 3) * 5, 3 + (i % 3), 0, 7); ctx.fill(); } txt('RT', fx + 20, fy + 24, 12, '#ddd', 800, 'left');
        const my = fy + fh + h * 0.08, mh = h * 0.5; card(fx, my, fw, mh, '#e66b78'); ctx.fillStyle = '#e8e6df'; rr(fx + 8, my + 8, fw - 16, mh - 16, 6); ctx.fill();
        const gather = ease((t % 4) / 3);
        for (let i = 0; i < 60; i++) { const sx2 = fx + 14 + (i * 37 % (fw - 28)), sy2 = my + 14 + (i * 53 % (mh - 28)), tx2 = fx + fw * 0.2 + (i / 60) * fw * 0.6, ty2 = my + mh / 2 + Math.sin(i * 0.7) * 3; ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(sx2 + (tx2 - sx2) * gather, sy2 + (ty2 - sy2) * gather, 1.6, 0, 7); ctx.fill(); }
        txt('MT', fx + 20, my + 24, 12, '#b33', 800, 'left');
      },
      academy(u, S) {
        const n = 5, bw = W * 0.13, bh = area() * 0.12, x0 = W / 2 - bw * 2.5, y0 = top() + area() * 0.92;
        for (let i = 0; i < n; i++) { const k = ease((u - i * 0.08) * 4), x = x0 + i * bw, h = bh * (i + 1); ctx.globalAlpha = k; const gg = ctx.createLinearGradient(0, y0 - h, 0, y0); gg.addColorStop(0, '#9d65ff'); gg.addColorStop(1, '#3d4fd6'); ctx.fillStyle = gg; rr(x + 3, y0 - h, bw - 6, h, 6); ctx.fill(); txt(String(i + 1), x + bw / 2, y0 - h + 26, Math.min(22, bw * 0.25), '#fff', 900); ctx.globalAlpha = 1; }
        const lv = Math.min(4, Math.floor(ease(u * 1.3) * 5)), hx = x0 + lv * bw + bw / 2, hy = y0 - bh * (lv + 1) - 26 - Math.abs(Math.sin(t * 6)) * 8;
        icon('🧑‍🎓', hx, hy, Math.min(40, bw * 0.45));
        const xp = Math.floor(ease(u * 1.2) * 1250); txt('⭐ ' + xp + ' XP', W * 0.82, top() + area() * 0.2, Math.min(26, S * 0.04), '#ffe14d', 900);
        ['🏅', '🎯', '📈', '🎞'].forEach((b, i) => { const k = ease((u - 0.35 - i * 0.1) * 4); ctx.globalAlpha = k; icon(b, W * 0.12 + i * Math.min(54, W * 0.06), top() + area() * 0.2, Math.min(36, S * 0.05) * (0.6 + 0.4 * k)); ctx.globalAlpha = 1; });
      },
      ai(u, S) {
        const msgs = [[0, L('What is a DAC curve?', 'C’est quoi une courbe DAC ?')], [1, L('A DAC shows how echo height drops with distance. Simple version: the further the reflector, the smaller the echo… [S2]', 'Une DAC montre comment la hauteur d’écho baisse avec la distance. Version simple : plus le réflecteur est loin, plus l’écho est petit… [S2]')], [0, '🎤 ' + L('"Explain like I’m a beginner"', '« Explique-moi comme à un débutant »')]];
        const x = W * 0.08, w = W * 0.55; let y = top() + area() * 0.08;
        ctx.font = `500 ${Math.min(16, S * 0.026)}px system-ui,sans-serif`;
        msgs.forEach(([who, s], i) => { const k = ease((u - i * 0.22) * 4); if (k <= 0) return; const shown = s.slice(0, Math.floor(s.length * Math.min(1, (u - i * 0.22) * 3))); const bw2 = Math.min(w, ctx.measureText(s).width + 30), bx = who ? x : x + w - bw2, hh = Math.min(16, S * 0.026) * (ctx.measureText(s).width > w - 30 ? 3.4 : 2.2); ctx.globalAlpha = k; ctx.fillStyle = who ? 'rgba(61,169,255,.18)' : 'rgba(118,87,232,.6)'; rr(bx, y, bw2, hh, 12); ctx.fill(); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; const words = shown.split(' '); let line = '', ly = y + Math.min(16, S * 0.026) * 1.45; words.forEach((wd) => { const tt = line ? line + ' ' + wd : wd; if (ctx.measureText(tt).width > bw2 - 26) { ctx.fillText(line, bx + 13, ly); ly += Math.min(16, S * 0.026) * 1.3; line = wd; } else line = tt; }); ctx.fillText(line, bx + 13, ly); ctx.globalAlpha = 1; y += hh + 12; });
        const px = W * 0.72, py = top() + area() * 0.12, pw = W * 0.22, ph = area() * 0.7; card(px, py, pw, ph, '#3da9ff'); icon('📷', px + pw / 2, py + ph * 0.38, Math.min(pw, ph) * 0.35);
        const scan = py + 10 + ((t * 0.6) % 1) * (ph - 20); ctx.fillStyle = 'rgba(61,169,255,.6)'; ctx.fillRect(px + 8, scan, pw - 16, 2);
        txt(L('Photo analysis', 'Analyse de photo'), px + pw / 2, py + ph * 0.82, Math.min(15, pw * 0.09), '#cfe3ff', 700);
      },
      lab(u, S) {
        const cols = [['🧮', L('Workspace', 'Atelier'), '#3da9ff'], ['🏭', L('Digital twins', 'Jumeaux'), '#e0a526'], ['🔬', L('3D defects', 'Défauts 3D'), '#e66b78']];
        const w = W * 0.27, h = area() * 0.8, gap = (W - 3 * w) / 4, y = top() + area() * 0.1;
        cols.forEach(([ic, name, col], i) => {
          const k = ease((u - i * 0.12) * 3.5), x = gap + i * (w + gap); card(x, y + (1 - k) * 50, w, h, col, k); ctx.globalAlpha = k;
          const cx = x + w / 2, cy = y + h * 0.42 + (1 - k) * 50, s = Math.min(w, h);
          if (i === 0) { txt('d = S · cos θ', cx, cy - s * 0.05, Math.min(20, w * 0.09), '#9ed0ff', 700); const r = 'S = 30 mm → d = 15.0 mm'; txt(r.slice(0, Math.floor(r.length * ease((u - 0.3) * 2))), cx, cy + s * 0.12, Math.min(14, w * 0.065), '#7de2b5', 700); }
          if (i === 1) { ctx.strokeStyle = '#26324a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, Math.PI * 0.8, Math.PI * 2.2); ctx.stroke(); ctx.strokeStyle = '#e0a526'; ctx.beginPath(); ctx.arc(cx, cy, s * 0.22, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * (0.5 + 0.4 * Math.sin(t)))); ctx.stroke(); const a = Math.PI * (0.8 + 1.4 * (0.5 + 0.4 * Math.sin(t))); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * s * 0.2, cy + Math.sin(a) * s * 0.2); ctx.stroke(); }
          if (i === 2) { const rot = t * 0.9, q = s * 0.16; const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [cx + (a * Math.cos(rot) - b * Math.sin(rot)) * q, cy + (a * Math.sin(rot) + b * Math.cos(rot)) * q * 0.5]); ctx.fillStyle = '#5d6b80'; ctx.beginPath(); P.forEach((p, j) => (j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#4b566a'; ctx.beginPath(); P.slice(0).forEach((p, j) => (j ? ctx.lineTo(p[0], p[1] + q * 0.6) : ctx.moveTo(p[0], p[1] + q * 0.6))); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - q * 0.5, cy - 3); for (let j = 1; j <= 6; j++) ctx.lineTo(cx - q * 0.5 + j * q / 6, cy - 3 + (j % 2 ? 4 : -3)); ctx.stroke(); }
          icon(ic, cx, y + h * 0.13 + (1 - k) * 50, Math.min(34, w * 0.15)); txt(name, cx, y + h * 0.88 + (1 - k) * 50, Math.min(18, w * 0.08), '#fff', 800); ctx.globalAlpha = 1;
        });
      },
      coach(u, S) {
        const x0 = W * 0.08, y0 = top() + area() * 0.95, bw = W * 0.06, names = ['UT', 'RT', 'MT', 'PT', 'VT', 'APVG'];
        names.forEach((n, i) => { const v = (0.35 + (i * 0.11) % 0.4) + ease((u - 0.2) * 1.5) * (i === 0 ? 0.45 : 0.15), h = area() * 0.75 * Math.min(0.97, v); ctx.fillStyle = v >= 0.8 ? '#42c991' : v >= 0.6 ? '#e0a526' : '#e66b78'; rr(x0 + i * bw * 1.35, y0 - h, bw, h, 5); ctx.fill(); txt(n, x0 + i * bw * 1.35 + bw / 2, y0 + 16, Math.min(12, bw * 0.3), '#aebbe3', 700); });
        const cx = W * 0.74, cy = top() + area() * 0.45, R = Math.min(area() * 0.35, W * 0.13);
        ['#e66b78', '#fff', '#e66b78', '#fff'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, R * (1 - i * 0.25), 0, 7); ctx.fill(); });
        const k = ease((u - 0.25) * 3), dx = cx + (1 - k) * W * 0.3, dy = cy - (1 - k) * 40; ctx.strokeStyle = '#3da9ff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 40, dy - 20); ctx.stroke(); icon('🎲', cx + R * 1.2, cy + R * 0.9, Math.min(40, R * 0.5));
      },
      field(u, S) {
        const x = W * 0.3, y = top() + area() * 0.04, w = W * 0.4, h = area() * 0.92; card(x, y, w, h, '#3da9ff');
        const rows = [L('Surface condition', 'État de surface'), L('Lighting ≥ 1000 lux', 'Éclairage ≥ 1000 lux'), L('Calibration checked', 'Étalonnage vérifié'), L('Indication recorded + photo', 'Indication + photo'), L('Report signed', 'Rapport signé')];
        rows.forEach((r, i) => { const k = ease((u - 0.1 - i * 0.12) * 5), ry = y + h * (0.14 + i * 0.16); ctx.strokeStyle = '#8fa3c0'; ctx.lineWidth = 2; ctx.strokeRect(x + w * 0.08, ry - 10, 18, 18); if (k > 0) { ctx.strokeStyle = '#42c991'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w * 0.08 + 3, ry); ctx.lineTo(x + w * 0.08 + 8, ry + 5 * k); ctx.lineTo(x + w * 0.08 + 8 + 9 * k, ry - 7 * k); ctx.stroke(); } txt(r, x + w * 0.08 + 30, ry + 5, Math.min(16, w * 0.05), '#e8eeff', 600, 'left'); });
        ctx.globalAlpha *= ease((u - 0.6) * 4); icon('📄', W * 0.82, top() + area() * 0.4, Math.min(60, W * 0.07)); txt('PDF', W * 0.82, top() + area() * 0.62, 14, '#fff', 800); icon('📶', W * 0.14, top() + area() * 0.4, Math.min(44, W * 0.05)); txt(L('offline OK', 'hors ligne OK'), W * 0.14, top() + area() * 0.58, 13, '#7de2b5', 700);
      },
      outro(u, S) {
        eye(W / 2, top() + area() * 0.32, S * 0.08, t);
        const k = ease((u - 0.2) * 3), y = top() + area() * 0.7 + Math.sin(t * 4) * 6; ctx.globalAlpha *= k;
        txt('☰ ' + L('MENU', 'MENU'), W / 2, y, Math.min(30, S * 0.05), '#fff', 900); txt('▼', W / 2, y + Math.min(34, S * 0.06), Math.min(30, S * 0.05), '#3da9ff', 900);
        txt(L('Training content — not an official qualification', 'Contenu de formation — pas une qualification officielle'), W / 2, top() + area() * 0.98, Math.min(13, S * 0.022), '#8fa3c0', 600);
      }
    };
    return api;
  })();

  /* ======================= markup ======================= */
  const css = `
.cy-on-home #back { display: none; }
#academy-open, #lab-open, #study-open, #tools-open, #quiz-open { display: none !important; }
.cyhm-top { display: inline-flex; gap: 8px; }
.cyhm-hero { margin: 4px 0 22px; }
.cyhv { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 22px 60px rgba(3, 7, 24, .55); background: #0a1430; }
.cyhv canvas { display: block; width: 100%; aspect-ratio: 16 / 9; cursor: pointer; }
.cyhv:fullscreen { border-radius: 0; display: grid; align-content: center; } .cyhv:fullscreen canvas { aspect-ratio: auto; height: calc(100vh - 110px); }
.cyhv-bar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px 10px; background: rgba(8, 17, 38, .92); border-top: 1px solid var(--line); }
.cyhv-bar .sp { flex: 1; }
.cyhv-ch { display: flex; gap: 5px; flex-wrap: wrap; } .cyhv-ch button { padding: 4px 9px; font-size: 12px; } .cyhv-ch button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cyhv-go { background: linear-gradient(135deg, var(--blue), var(--violet)) !important; border: 0 !important; color: #fff !important; font-weight: 700; }
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
@media (max-width: 640px) { .cyhv-ch { display: none; } .cyhm-grid { grid-template-columns: minmax(0, 1fr); } }
`;
  function menuHtml() {
    return MENU.map((g) => `<h2>${esc(T2(g.t))}</h2><div class="cyhm-grid">${g.items.map(([k, ic, t, d]) => `<button type="button" data-hm="${k}"><i>${ic}</i><b>${esc(T2(t))}</b><span>${esc(T2(d))}</span></button>`).join('')}</div>`).join('') +
      `<h2>${L('Procedures & 3D by department', 'Procédures et 3D par département')}</h2><div class="cyhm-methods">${METHODS.map(([m, n]) => `<button type="button" data-hm-proc="${m}"><b>${m}</b><span>${esc(T2(n))}</span></button>`).join('')}</div>`;
  }
  function render() {
    if (!home) return;
    const playing = home.querySelector('[data-hv="play"]') ? home.querySelector('[data-hv="play"]').textContent : (reduced ? '▶' : '⏸');
    home.innerHTML = `<div class="cyhm-hero"><div class="cyhv"><canvas aria-label="${L('Animated presentation of CYCLOPS', 'Présentation animée de CYCLOPS')}" role="img"></canvas>
<div class="cyhv-bar"><button type="button" data-hv="play" aria-label="${L('Play or pause', 'Lecture ou pause')}">${playing}</button><button type="button" data-hv="voice">${voiceOn ? '🔊 ' + L('Voice on', 'Voix activée') : '🔈 ' + L('Play with voice', 'Lire avec la voix')}</button>
<div class="cyhv-ch">${CH.map((c, i) => `<button type="button" data-hv-ch="${i}" title="${esc(T2(c.t))}">${i + 1}</button>`).join('')}</div><span class="sp"></span>
<button type="button" class="cyhv-go" data-hv-go="1" hidden></button><button type="button" data-hv="full" aria-label="${L('Full screen', 'Plein écran')}">⛶</button></div></div></div>
<div class="cyhm-menu">${menuHtml()}</div>`;
    video.mount(home.querySelector('.cyhv')); video.refresh();
  }
  let voiceOn = false;
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

  // menu clicks (home grid and drawer)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hm],[data-hm-proc],[data-hv],[data-hv-ch],[data-hv-go]'); if (!b) return;
    const d = b.dataset;
    if (d.hm && ACTIONS[d.hm]) { video.play(false); return ACTIONS[d.hm](); }
    if (d.hmProc) { video.play(false); return procedures(d.hmProc); }
    if (d.hvCh != null) { video.seek(Number(d.hvCh)); video.play(true); return; }
    if (d.hvGo) return video.go();
    if (d.hv === 'play') return video.play();
    if (d.hv === 'voice') { voiceOn = video.voice(); b.textContent = voiceOn ? '🔊 ' + L('Voice on', 'Voix activée') : '🔈 ' + L('Play with voice', 'Lire avec la voix'); return; }
    if (d.hv === 'full') { const v = $('.cyhv'); if (!document.fullscreenElement && v && v.requestFullscreen) v.requestFullscreen().catch(() => {}); else if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); }
  });
  document.addEventListener('click', (e) => { if (e.target.matches && e.target.matches('.cyhv canvas')) video.play(); });
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
    if (sw) sw.addEventListener('change', () => { label(); if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); render(); if (drawer) { closeMenu(); } });
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
