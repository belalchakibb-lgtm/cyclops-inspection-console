/* CYCLOPS training records: sends each person's course progress, exam results and finished 3D videos to the
   server, and gives supervisors and admins a dashboard of everyone's training (Training lab > Training dashboard).
   Training records only: not a qualification and not a certification. Works offline-first: nothing is lost on the
   device if the server or database is unavailable, and the dashboard simply says so.
   window.CYTRAIN = { open(), send(event) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ORDER = ['UT', 'RT', 'MT', 'PT', 'VT', 'APVG', 'APL', 'APE'];
  const PASS = 80;
  const SENT = 'cyclops-training-sent-v1';
  let me = null;

  function send(ev) {
    // true only once the database really kept it, so earlier progress is sent again after a database is connected
    return fetch('/api/training', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ev) })
      .then((r) => (r.ok ? r.json() : null)).then((d) => Boolean(d && d.saved)).catch(() => false);
  }

  // Course progress lives on the device (cyclops-procourse-v1). Send each course whose progress moved since last time.
  const readJson = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
  async function syncProgress() {
    if (!window.CYPRO) return;
    const seen = readJson('cyclops-procourse-v1'), sent = readJson(SENT);
    for (const m of ORDER) {
      const c = window.CYPRO.COURSES[m]; if (!c || !seen[m]) continue;
      const total = c.slides.length, n = Math.min(seen[m], total);
      if (sent[m] === `${n}/${total}`) continue;
      if (await send({ kind: 'progress', course: m, seen: n, total })) { sent[m] = `${n}/${total}`; try { localStorage.setItem(SENT, JSON.stringify(sent)); } catch { /* storage unavailable */ } }
    }
  }

  window.addEventListener('cy-learn', (e) => {
    const d = e.detail || {}, id = String(d.id || ''), m = id.split(':')[1];
    if (!ORDER.includes(m)) return;
    if (id.startsWith('pro-exam:') && Number.isFinite(Number(d.score))) send({ kind: 'exam', course: m, score: Math.round(Number(d.score)) }).then(syncProgress);
    else if (id.startsWith('pro-video:')) send({ kind: 'video', course: m }).then(syncProgress);
    else if (id.startsWith('pro:')) setTimeout(syncProgress, 1500);
  });
  setInterval(syncProgress, 60_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') syncProgress(); });

  /* ---------- dashboard (supervisors and admins) ---------- */
  const css = `
.cytr-top { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; } .cytr-top input { flex: 1 1 200px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); color: var(--text); padding: 7px 10px; font: inherit; }
.cytr-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin: 8px 0 12px; } .cytr-stats div { border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; } .cytr-stats b { display: block; font-size: 1.4rem; }
.cytr-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; }
.cytr-table { border-collapse: collapse; width: 100%; font-size: 13px; min-width: 760px; } .cytr-table th, .cytr-table td { padding: 6px 8px; border-top: 1px solid var(--line); text-align: left; vertical-align: top; } .cytr-table th { background: rgba(61,169,255,.14); position: sticky; top: 0; }
.cytr-table td.name { font-weight: 700; white-space: nowrap; } .cytr-cell small { display: block; color: var(--muted); }
.cytr-bar { height: 5px; border-radius: 99px; background: rgba(255,255,255,.12); overflow: hidden; margin: 3px 0; } .cytr-bar i { display: block; height: 100%; background: #3da9ff; }
.cytr-pass { color: #7de2b5; font-weight: 700; } .cytr-fail { color: #ffb3b3; font-weight: 700; } .cytr-none { color: var(--muted); }
`;
  const fmtDate = (iso) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString(L('en-GB', 'fr-FR'), { day: '2-digit', month: 'short', year: 'numeric' }); };
  function cell(r) {
    if (!r) return '<td class="cytr-none">—</td>';
    const pct = r.total ? Math.round((r.seen || 0) / r.total * 100) : 0;
    const exam = r.best == null ? `<small class="cytr-none">${L('no exam', 'pas d’examen')}</small>`
      : `<small class="${r.best >= PASS ? 'cytr-pass' : 'cytr-fail'}">${r.best >= PASS ? '✓' : '✗'} ${L('best', 'meilleur')} ${r.best} % · ${r.attempts}×${r.last != null && r.last !== r.best ? ` · ${L('last', 'dernier')} ${r.last} %` : ''}</small>`;
    return `<td class="cytr-cell"><div class="cytr-bar"><i style="width:${pct}%"></i></div><small>${r.total ? `${r.seen}/${r.total} ${L('slides', 'diapos')}` : L('not started', 'non commencé')}${r.video ? ' · 🎬' : ''}</small>${exam}</td>`;
  }
  function csv(rows) {
    const head = ['user', 'course', 'slides_seen', 'slides_total', 'exam_attempts', 'exam_best_pct', 'exam_last_pct', 'passed', 'video_finished', 'last_activity'];
    const q = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    return [head.join(','), ...rows.map((r) => [r.user, r.course, r.seen, r.total, r.attempts, r.best, r.last, r.best != null && r.best >= PASS ? 'yes' : 'no', r.video ? 'yes' : 'no', r.lastAt].map(q).join(','))].join('\n');
  }
  async function open() {
    if (!window.CYLAB) return;
    if (!document.getElementById('cytr-css')) { const s = document.createElement('style'); s.id = 'cytr-css'; s.textContent = css; document.head.appendChild(s); }
    const ui = window.CYLAB.shell({ cls: 'cytr', title: '📊 ' + L('Training dashboard', 'Tableau de bord formation'), sub: L('Course progress and exam results of every user · training records, not certifications', 'Progression et résultats d’examen de chaque utilisateur · dossiers de formation, pas des certifications') });
    ui.body.innerHTML = `<p>${L('Loading…', 'Chargement…')}</p>`;
    syncProgress();
    let data;
    try { const r = await fetch('/api/training/summary', { cache: 'no-store' }); data = await r.json(); if (!r.ok) throw new Error(data.error || r.status); }
    catch (e) { ui.body.innerHTML = `<p>${L('The dashboard could not be loaded:', 'Le tableau de bord n’a pas pu être chargé :')} ${esc(e.message)}</p>`; return; }
    if (!data.enabled) {
      ui.body.innerHTML = `<p><b>${L('The training dashboard is not set up yet.', 'Le tableau de bord de formation n’est pas encore configuré.')}</b></p><p>${data.problem ? esc(data.problem) : L('An administrator must connect a database: add DATABASE_URL in the server settings (Render > Environment), for example from a free Neon Postgres. Until then, each person’s progress stays on their own device.', 'Un administrateur doit connecter une base de données : ajoutez DATABASE_URL dans les réglages du serveur (Render > Environment), par exemple depuis un Postgres Neon gratuit. En attendant, la progression de chacun reste sur son appareil.')}</p>`;
      return;
    }
    const rows = data.rows || [], users = [...new Set(rows.map((r) => r.user))].sort();
    const by = new Map(rows.map((r) => [`${r.user}\u0000${r.course}`, r]));
    const passed = rows.filter((r) => r.best != null && r.best >= PASS).length, exams = rows.reduce((n, r) => n + r.attempts, 0);
    const last = (u) => rows.filter((r) => r.user === u).map((r) => r.lastAt).sort().pop();
    const names = window.CYPRO ? (m) => esc((window.CYPRO.COURSES[m].name || [m])[0].replace(/ — professional$/, '')) : (m) => m;
    ui.body.innerHTML = `<div class="cytr-stats"><div><b>${users.length}</b>${L('people with activity', 'personnes actives')}</div><div><b>${exams}</b>${L('exam attempts', 'tentatives d’examen')}</div><div><b>${passed}</b>${L('course exams passed (≥ 80 %)', 'examens réussis (≥ 80 %)')}</div><div><b>${rows.filter((r) => r.video).length}</b>${L('3D videos finished', 'vidéos 3D terminées')}</div></div>
<div class="cytr-top"><input type="search" data-tr-filter placeholder="${L('Filter by name…', 'Filtrer par nom…')}" aria-label="${L('Filter by name', 'Filtrer par nom')}"><button type="button" data-tr-csv>⬇ ${L('Export CSV', 'Exporter CSV')}</button><button type="button" data-tr-reload>↻ ${L('Refresh', 'Actualiser')}</button></div>
${users.length ? `<div class="cytr-wrap"><table class="cytr-table"><tr><th>${L('Person', 'Personne')}</th>${ORDER.map((m) => `<th title="${names(m)}">${m}</th>`).join('')}<th>${L('Passed', 'Réussis')}</th><th>${L('Last activity', 'Dernière activité')}</th></tr>
${users.map((u) => `<tr data-tr-user="${esc(u.toLowerCase())}"><td class="name">${esc(u)}</td>${ORDER.map((m) => cell(by.get(`${u}\u0000${m}`))).join('')}<td>${ORDER.filter((m) => { const r = by.get(`${u}\u0000${m}`); return r && r.best != null && r.best >= PASS; }).length}/8</td><td>${fmtDate(last(u))}</td></tr>`).join('')}</table></div>`
  : `<p>${L('No training activity recorded yet. It appears here as people open courses, finish videos and take exams.', 'Aucune activité enregistrée pour l’instant. Elle apparaît ici quand les personnes ouvrent les cours, terminent les vidéos et passent les examens.')}</p>`}
<p class="cylab-note">${L('A course exam counts as passed at 80 % or more. These are training records from CYCLOPS, not qualifications or certifications (ISO 9712, employer certification and the code in force decide). 🎬 = 3D video finished.', 'Un examen de cours est réussi à 80 % ou plus. Ce sont des dossiers de formation CYCLOPS, pas des qualifications ni des certifications (l’ISO 9712, la certification de l’employeur et le code en vigueur décident). 🎬 = vidéo 3D terminée.')}</p>`;
    ui.body.addEventListener('input', (e) => { if (!e.target.matches('[data-tr-filter]')) return; const f = e.target.value.trim().toLowerCase(); ui.body.querySelectorAll('[data-tr-user]').forEach((tr) => { tr.hidden = !!f && !tr.dataset.trUser.includes(f); }); });
    ui.body.addEventListener('click', (e) => {
      if (e.target.closest('[data-tr-reload]')) { ui.close(); open(); return; }
      if (e.target.closest('[data-tr-csv]')) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv(rows)], { type: 'text/csv' })); a.download = `cyclops-training-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
    });
  }

  fetch('/api/me', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => { me = d; }).catch(() => {});
  if (window.CYLAB) window.CYLAB.register({ icon: '📊', available: () => !!me && (me.role === 'supervisor' || me.role === 'admin'), open: () => open(), title: () => L('Training dashboard', 'Tableau de bord formation'), desc: () => L('Supervisors: everyone’s course progress, exam scores and finished 3D videos, with CSV export.', 'Superviseurs : progression, résultats d’examen et vidéos 3D terminées de chacun, avec export CSV.') });
  window.CYTRAIN = { open, send, sync: syncProgress };
}());
