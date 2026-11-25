/* CYCLOPS search: one search bar for everything in the app — menu pages, Training-lab tools, the 3D labs,
   the 67 API RP 571 damage mechanisms, weld defects, professional courses (every slide and each 3D video),
   CND Academy modules, beginner lessons, dictionary words, ASME/API lessons, scenarios, calculators, digital
   twins and the procedures of each department. Type in English or French (accents optional); Enter opens the
   first result; the last line always offers to ask the AI. Opens from 🔍 in the header, Ctrl+K or "/".
   Everything is built from the modules' own data, so new content is found without extra work.
   window.CYSEARCH = { open(query), index(), find(query) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const both = (p) => (Array.isArray(p) ? `${p[0]} ${p[1]}` : String(p || ''));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'`]/g, ' ');
  const closeAll = () => document.querySelectorAll('dialog[open]').forEach((d) => { if (!d.classList.contains('cysr')) d.close(); });
  const W = window;

  // Each entry: { g: group, i: icon, t: [en, fr] title, s: [en, fr] subtitle, k: extra keywords, go: action }
  function index() {
    const out = [], add = (g, i, t, s, k, go) => out.push({ g, i, t, s, k: k || '', go });
    const G = { page: ['Pages & menus', 'Pages et menus'], lab: ['Training lab', 'Laboratoire'], dm: ['Damage mechanisms (API RP 571)', 'Mécanismes de dégradation (API RP 571)'], def: ['3D weld defects', 'Défauts de soudure 3D'], pro: ['Professional courses', 'Cours professionnels'], slide: ['Course slides', 'Diapositives des cours'], acad: ['Academy', 'Académie'], word: ['Dictionary', 'Dictionnaire'], calc: ['Calculators', 'Calculateurs'], proc: ['Procedures & departments', 'Procédures et départements'] };
    // menu pages
    if (W.CYHOME && W.CYHOME.MENU) for (const grp of W.CYHOME.MENU) for (const [key, ic, t, d] of grp.items) add(G.page, ic, t, d, both(grp.t) + ' ' + key, () => W.CYHOME.go(key));
    add(G.page, '🏠', ['Home & presentation video', 'Accueil et vidéo de présentation'], ['The guide that shows everything in CYCLOPS', 'Le guide qui montre tout CYCLOPS'], 'home accueil video guide', () => W.CYHOME && W.CYHOME.go('home'));
    // Training-lab cards (each module registers its own)
    if (W.CYLAB && W.CYLAB.cards) for (const c of W.CYLAB.cards()) add(G.lab, c.icon, [c.title(), c.title()], [c.desc(), c.desc()], 'lab labo 3d', () => { closeAll(); c.open(); });
    // damage mechanisms
    for (const d of W.CYDM_DATA || []) add(G.dm, '🛢', d.n, [`§ ${d.s} · ${d.mat[0]}`, `§ ${d.s} · ${d.mat[1]}`], `${d.s} rp571 api571 ${both(d.where)} ${both(d.look)} ${d.k}`, () => { closeAll(); W.CYDM.open(d.k); });
    // weld and plate defects
    if (W.CYDEF && W.CYDEF.DEF) for (const [k, d] of Object.entries(W.CYDEF.DEF)) add(G.def, '🔬', d.n, d.d, both(d.c) + ' weld soudure defect defaut', () => { closeAll(); W.CYDEF.open(k); });
    // professional courses: the course, its 3D video, and every slide
    if (W.CYPRO) for (const [m, c] of Object.entries(W.CYPRO.COURSES)) {
      add(G.pro, c.icon, c.name, [c.codes, c.codes], m + ' course cours', () => { closeAll(); W.CYPRO.open(m); });
      if (W.CYFILM) add(G.pro, '🎬', [`3D video: ${c.name[0]}`, `Vidéo 3D : ${c.name[1]}`], [`${c.slides.filter((s) => !s.exam).length} animated scenes, narrated`, `${c.slides.filter((s) => !s.exam).length} scènes animées, commentées`], m + ' video film 3d animation', () => { closeAll(); W.CYPRO.openFilm(m); });
      c.slides.forEach((s, i) => add(G.slide, c.icon, s.t, [`${m} · ${c.name[0]} · ${i + 1}/${c.slides.length}`, `${m} · ${c.name[1]} · ${i + 1}/${c.slides.length}`], m + ' ' + (s.b || []).map(both).join(' ').slice(0, 600) + (s.table ? ' ' + JSON.stringify(s.table.rows).slice(0, 400) : '') + (s.exam ? ' exam examen' : ''), () => { closeAll(); W.CYPRO.open(m, i); }));
    }
    // Academy: CND modules, beginner lessons, scenarios, dictionary
    if (W.CYNDT && W.CYNDT.MODS) for (const [m, mods] of Object.entries(W.CYNDT.MODS)) for (const md of mods) add(G.acad, '🎓', md.t, [`CND Academy · ${m}`, `Académie CND · ${m}`], m + ' module cnd ndt', () => { closeAll(); W.CYNDT.open(m, md.id); W.CYACADEMY.open('cnd'); });
    if (W.CYACADEMY && W.CYACADEMY.BASICS) for (const b of W.CYACADEMY.BASICS) add(G.acad, b.icon || '🌱', b.t, ['Beginner lesson', 'Leçon débutant'], 'beginner debutant basics', () => { closeAll(); W.CYACADEMY.open('basics'); });
    if (W.CYSCEN && W.CYSCEN.SCEN) for (const s of (Array.isArray(W.CYSCEN.SCEN) ? W.CYSCEN.SCEN : Object.values(W.CYSCEN.SCEN))) add(G.acad, '🎲', s.title, [`Scenario · ${s.area}`, `Scénario · ${s.area}`], s.area + ' scenario mission', () => { closeAll(); W.CYACADEMY.open('scen'); });
    if (W.CYSTUDY && W.CYSTUDY.lessons) W.CYSTUDY.lessons.forEach((l, i) => add(G.acad, '📚', l.title, [`ASME/API lesson · ${l.code}`, `Leçon ASME/API · ${l.code}`], l.code + ' asme api teacher formateur', () => { closeAll(); W.CYSTUDY.open(i); }));
    if (W.CYACADEMY && W.CYACADEMY.DICT) for (const w of (Array.isArray(W.CYACADEMY.DICT) ? W.CYACADEMY.DICT : Object.values(W.CYACADEMY.DICT))) add(G.word, '📖', [w.en, w.fr], w.simple || ['', ''], `${w.en} ${w.fr} ${both(w.simple)} dictionary dictionnaire`, () => { closeAll(); W.CYACADEMY.open('dict'); setTimeout(() => { const q = document.querySelector('.cyac-search'); if (q) { q.value = w.en; q.dispatchEvent(new Event('input', { bubbles: true })); } }, 120); });
    // calculators and digital twins
    if (W.CYWORK && W.CYWORK.CALCS) for (const c of Object.values(W.CYWORK.CALCS)) add(G.calc, c.icon || '🧮', c.t, c.intro || ['', ''], (c.area || '') + ' calcul calculator formula formule', () => { closeAll(); W.CYWORK.open(c.id); });
    if (W.CYTWIN && W.CYTWIN.TWINS) for (const [k, t] of Object.entries(W.CYTWIN.TWINS)) add(G.lab, t.icon || '🏭', t.name, [`Digital twin · ${k}`, `Jumeau numérique · ${k}`], k + ' twin jumeau inspection', () => { closeAll(); W.CYTWIN.open(k); });
    // procedures by department
    const DEPT = { PT: ['Penetrant testing', 'Ressuage'], MT: ['Magnetic particle testing', 'Magnétoscopie'], UT: ['Ultrasonic testing', 'Contrôle par ultrasons'], RT: ['Radiography', 'Radiographie'], VT: ['Visual testing', 'Contrôle visuel'], APVG: ['Pressure equipment', 'Appareils à pression'], APL: ['Lifting equipment', 'Appareils de levage'], APE: ['Electrical installations', 'Installations électriques'], OTH: ['Other / general', 'Autres / général'] };
    if (W.CYPROC) for (const m of Object.keys(W.CYPROC)) { const p = W.CYPROC[m]; add(G.proc, '📋', [`${m} — ${DEPT[m] ? DEPT[m][0] : m}: procedure, 3D and simulator`, `${m} — ${DEPT[m] ? DEPT[m][1] : m} : procédure, 3D et simulateur`], [both(p.name).slice(0, 90), both(p.name).slice(0, 90)], m + ' ' + (p.steps || []).map((s) => s[0]).join(' ') + ' procedure', () => { closeAll(); W.CYHOME && W.CYHOME.procedures(m); }); }
    return out.map((e) => ({ ...e, h: norm(`${both(e.t)} ${both(e.s)} ${e.k} ${both(e.g)}`), ht: norm(both(e.t)) }));
  }

  // all query words must appear; title matches and word starts rank first
  function find(q, idx) {
    const words = norm(q).split(/[^a-z0-9.§]+/).filter((w) => w.length > 0); if (!words.length) return [];
    const res = [];
    for (const e of idx) {
      let score = 0, ok = true;
      for (const w of words) {
        if (!e.h.includes(w)) { ok = false; break; }
        score += e.ht.includes(w) ? (new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(e.ht) ? 10 : 6) : 1;
      }
      if (!ok) continue;
      if (e.ht.startsWith(words[0])) score += 4;
      if (e.g[0] === 'Course slides') score -= 1; // the course itself before its slides
      res.push([score, e]);
    }
    return res.sort((a, b) => b[0] - a[0]).slice(0, 60).map((r) => r[1]);
  }

  const css = `
dialog.cysr { width: min(720px, 96vw); max-height: 86dvh; margin: 6dvh auto auto; padding: 0; border: 1px solid var(--line); border-radius: 14px; background: var(--bg); color: var(--text); overflow: hidden; }
dialog.cysr::backdrop { background: rgba(3, 7, 20, .55); }
.cysr-top { display: flex; gap: 8px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--line); background: var(--panel); }
.cysr-top input { flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 10px; background: var(--bg); color: var(--text); padding: 11px 12px; font: inherit; font-size: 16px; }
.cysr-list { overflow: auto; max-height: calc(86dvh - 110px); padding: 6px 8px 10px; }
.cysr-list h4 { margin: 10px 6px 4px; font-size: .74rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.cysr-item { display: grid; grid-template-columns: 30px 1fr; gap: 0 8px; width: 100%; text-align: left; padding: 8px 10px; margin: 1px 0; border-color: transparent; background: transparent; border-radius: 10px; }
.cysr-item i { font-style: normal; font-size: 1.2rem; grid-row: span 2; align-self: center; text-align: center; } .cysr-item b { color: var(--text); font-weight: 650; } .cysr-item span { color: var(--muted); font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cysr-item.on, .cysr-item:hover { background: rgba(61, 169, 255, .16); border-color: var(--blue); }
.cysr-item mark { background: rgba(255, 210, 122, .35); color: inherit; border-radius: 3px; }
.cysr-foot { padding: 6px 12px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); display: flex; gap: 12px; flex-wrap: wrap; }
.cysr-hint { color: var(--muted); padding: 10px 8px; }
#search-open { min-width: 40px; }
@media (max-width: 640px) { dialog.cysr { margin-top: 0; width: 100vw; max-height: 100dvh; border-radius: 0; } .cysr-list { max-height: calc(100dvh - 110px); } }
`;
  let dlg = null, idx = null, results = [], cur = 0;
  const hi = (text, q) => { let s = esc(text); for (const w of norm(q).split(/\s+/).filter((x) => x.length > 1)) s = s.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); return s; };
  function draw(q) {
    const list = dlg.querySelector('.cysr-list');
    if (!q.trim()) { list.innerHTML = `<p class="cysr-hint">${L('Search everything in CYCLOPS: courses and their slides, 3D labs, the 67 API RP 571 damage mechanisms, weld defects, Academy, dictionary, calculators, digital twins, procedures… Try “HTHA”, “CUI”, “DAC”, “sling”, “ressuage”.', 'Cherchez tout dans CYCLOPS : cours et diapositives, labos 3D, les 67 mécanismes de l’API RP 571, défauts de soudure, Académie, dictionnaire, calculateurs, jumeaux numériques, procédures… Essayez « HTHA », « CUI », « DAC », « élingue », « ressuage ».')}</p>`; results = []; return; }
    results = find(q, idx); cur = 0;
    const groups = []; for (const r of results) { const g = T2(r.g); let x = groups.find((y) => y[0] === g); if (!x) groups.push(x = [g, []]); x[1].push(r); }
    let n = 0;
    list.innerHTML = groups.map(([g, rs]) => `<h4>${esc(g)} · ${rs.length}</h4>` + rs.map((r) => { const k = n++; return `<button type="button" class="cysr-item${k === 0 ? ' on' : ''}" data-sr="${k}"><i>${r.i || '•'}</i><b>${hi(T2(r.t), q)}</b><span>${esc(T2(r.s) || '')}</span></button>`; }).join('')).join('') +
      `<h4>${L('Ask the AI', 'Demander à l’IA')}</h4><button type="button" class="cysr-item${results.length ? '' : ' on'}" data-sr-ai><i>🤖</i><b>${L('Ask the AI assistant', 'Demander à l’assistant IA')}: “${esc(q)}”</b><span>${L('Answer with sources from the knowledge base', 'Réponse avec sources de la base de connaissances')}</span></button>`;
    if (!results.length) cur = -1;
  }
  function choose(k) {
    const q = dlg.querySelector('input').value.trim();
    if (k === -1 || k == null) { dlg.close(); if (W.CY3 && W.CY3.send) { closeAll(); W.CY3.open(); W.CY3.send(q); } return; }
    const r = results[k]; if (!r) return; dlg.close(); try { r.go(); } catch (e) { console.error('CYCLOPS search', e); }
  }
  function move(d) {
    const items = [...dlg.querySelectorAll('.cysr-item')]; if (!items.length) return;
    let i = items.findIndex((x) => x.classList.contains('on')); i = Math.max(0, Math.min(items.length - 1, i + d));
    items.forEach((x, j) => x.classList.toggle('on', j === i)); items[i].scrollIntoView({ block: 'nearest' }); cur = items[i].dataset.srAi != null ? -1 : Number(items[i].dataset.sr);
  }
  function open(q) {
    if (!document.getElementById('cysr-css')) { const s = document.createElement('style'); s.id = 'cysr-css'; s.textContent = css; document.head.appendChild(s); }
    if (dlg) { dlg.querySelector('input').focus(); return; }
    idx = index();
    dlg = document.createElement('dialog'); dlg.className = 'cysr';
    dlg.innerHTML = `<div class="cysr-top"><span aria-hidden="true">🔍</span><input type="search" autocomplete="off" spellcheck="false" aria-label="${L('Search CYCLOPS', 'Rechercher dans CYCLOPS')}" placeholder="${L('Search everything…', 'Tout rechercher…')}"><button type="button" data-sr-close aria-label="${L('Close', 'Fermer')}">✕</button></div><div class="cysr-list" role="listbox"></div><div class="cysr-foot"><span>↑ ↓ ${L('choose', 'choisir')}</span><span>Enter ${L('open', 'ouvrir')}</span><span>Esc ${L('close', 'fermer')}</span><span>${idx.length} ${L('items indexed', 'éléments indexés')}</span></div>`;
    document.body.appendChild(dlg);
    const input = dlg.querySelector('input');
    input.addEventListener('input', () => draw(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); move(1); } else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); } else if (e.key === 'Enter') { e.preventDefault(); choose(cur); } });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-sr-close]')) return dlg.close(); const b = e.target.closest('.cysr-item'); if (!b) return; choose(b.dataset.srAi != null ? -1 : Number(b.dataset.sr)); });
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; });
    dlg.showModal(); input.value = q || ''; draw(input.value); input.focus();
  }

  // header button and keyboard shortcuts
  function headerButton() {
    const actions = document.querySelector('.head-actions'); if (!actions || document.getElementById('search-open')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'search-open';
    const label = () => { b.textContent = '🔍 ' + L('Search', 'Rechercher'); b.title = L('Search everything (Ctrl+K)', 'Tout rechercher (Ctrl+K)'); };
    label(); b.addEventListener('click', () => open());
    const menu = document.getElementById('menu-open'); if (menu && menu.parentElement) menu.parentElement.after(b); else actions.insertBefore(b, actions.firstChild);
    const sw = document.getElementById('lang'); if (sw) sw.addEventListener('change', label);
  }
  document.addEventListener('keydown', (e) => {
    const typing = e.target && (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); }
    else if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); open(); }
  });
  const init = () => setTimeout(headerButton, 50); // after the home module adds the Menu button
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.CYSEARCH = { open, index: () => (idx = index()), find: (q) => find(q, idx || (idx = index())) };
}());
