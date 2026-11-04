/* CYCLOPS Training lab: one header button opening a hub (engineering workspace, digital twins, 3D defect lab,
   adaptive missions) and a shared dialog shell so every lab module looks and behaves the same
   (header, close button, Escape, scroll area, fade-in, phone layout).
   window.CYLAB = { open(), shell({ cls, title, sub }) → { dlg, body, close }, register(card) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const css = `
.cylab { width: min(1180px, 97vw); height: min(92vh, 900px); padding: 0; border: 1px solid var(--line); border-radius: 12px; background: var(--bg); color: var(--text); }
.cylab[open] { animation: cylab-in .22s ease-out; } @keyframes cylab-in { from { opacity: 0; transform: translateY(10px) scale(.985); } to { opacity: 1; transform: none; } }
.cylab::backdrop { background: rgba(3, 7, 20, .72); }
.cylab-wrap { display: grid; grid-template-rows: auto 1fr; height: 100%; }
.cylab-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 16px; background: var(--panel); border-bottom: 1px solid var(--line); }
.cylab-head strong { font-size: 1.1rem; } .cylab-head span { display: block; color: var(--muted); font-size: 12px; }
.cylab-head .cylab-acts { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.cylab-body { overflow: auto; padding: 14px 16px 24px; }
.cylab-body > * { animation: cylab-fade .25s ease-out; } @keyframes cylab-fade { from { opacity: 0; } to { opacity: 1; } }
.cylab-hub { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; }
.cylab-hub button { text-align: left; padding: 16px; display: grid; gap: 6px; border-radius: 12px; min-height: 130px; align-content: start; transition: transform .15s ease, border-color .15s ease; }
.cylab-hub button:hover { transform: translateY(-2px); border-color: var(--blue); }
.cylab-hub b { font-size: 1.05rem; } .cylab-hub span { color: var(--muted); font-size: 13px; line-height: 1.45; } .cylab-hub i { font-style: normal; font-size: 1.8rem; }
.cylab-note { color: var(--muted); font-size: 12px; }
.cylab-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; } .cylab-tabs button.on { background: var(--accent); border-color: var(--accent); color: #fff; }
.cylab-sim { border: 1px solid #e0a526; color: #ffd27a; border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 700; letter-spacing: .04em; white-space: nowrap; }
@media (max-width: 640px) { .cylab { width: 100vw; height: 100dvh; max-height: none; border-radius: 0; } .cylab-head { padding: 10px 12px; } .cylab-body { padding: 12px; } }
@media (prefers-reduced-motion: reduce) { .cylab[open], .cylab-body > * { animation: none; } .cylab-hub button { transition: none; } }
`;
  const style = () => { if (!document.getElementById('cylab-css')) { const s = document.createElement('style'); s.id = 'cylab-css'; s.textContent = css; document.head.appendChild(s); } };

  // shared dialog: every lab module calls shell() and fills body
  function shell({ cls, title, sub, actions }) {
    style();
    document.querySelectorAll('dialog.cylab').forEach((d) => d.close());
    const dlg = document.createElement('dialog'); dlg.className = 'cylab ' + (cls || '');
    dlg.innerHTML = `<div class="cylab-wrap"><div class="cylab-head"><div><strong>${title}</strong><span>${esc(sub || '')}</span></div><div class="cylab-acts">${actions || ''}<span class="cylab-sim">${L('TRAINING SIMULATION', 'SIMULATION DE FORMATION')}</span><button type="button" data-lab-close aria-label="${L('Close', 'Fermer')}">✕</button></div></div><div class="cylab-body"></div></div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-lab-close]')) dlg.close(); });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();
    return { dlg, body: dlg.querySelector('.cylab-body'), close: () => dlg.close() };
  }

  const cards = [];
  function register(card) { cards.push(card); }
  function open() {
    const { body } = shell({ cls: 'cylab-hubdlg', title: '🧪 ' + L('Training lab', 'Laboratoire de formation'), sub: L('Hands-on tools and simulators for all departments · training only', 'Outils et simulateurs pratiques pour tous les départements · formation uniquement') });
    const list = cards.filter((c) => c.available());
    body.innerHTML = `<div class="cylab-hub">${list.map((c, i) => `<button type="button" data-hub="${i}"><i>${c.icon}</i><b>${esc(c.title())}</b><span>${esc(c.desc())}</span></button>`).join('')}</div>
<p class="cylab-note">${L('Every tool here is an educational simulation: values, equipment and histories are fictional or typical, never results of a real inspection, and nothing here is a qualification or certification.', 'Chaque outil ici est une simulation pédagogique : valeurs, équipements et historiques sont fictifs ou typiques, jamais des résultats d’inspection réelle, et rien ici n’est une qualification ou une certification.')}</p>`;
    body.addEventListener('click', (e) => { const b = e.target.closest('[data-hub]'); if (b) list[Number(b.dataset.hub)].open(); });
  }

  function headerButton() {
    const actions = document.querySelector('.head-actions'); if (!actions || document.getElementById('lab-open')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'lab-open';
    const label = () => { b.textContent = '🧪 ' + L('Training lab', 'Labo'); b.title = L('Engineering workspace, digital twins, 3D defects, missions', 'Atelier de calcul, jumeaux numériques, défauts 3D, missions'); };
    label(); b.addEventListener('click', open);
    const ac = document.getElementById('academy-open'); actions.insertBefore(b, ac ? ac.nextSibling : actions.firstChild);
    const sw = document.getElementById('lang'); if (sw) sw.addEventListener('change', label);
  }
  window.CYLAB = { open, shell, register, esc };
  // Academy features that belong in the lab too (they open the Academy on the right tab)
  const toAcademy = (t) => () => { document.querySelectorAll('dialog.cylab').forEach((d) => d.close()); if (window.CYACADEMY) window.CYACADEMY.open(t); };
  register({ icon: '🎲', available: () => !!window.CYACADEMY, open: toAcademy('scen'), title: () => L('Adaptive missions', 'Missions adaptatives'), desc: () => L('Random fictional jobs in all 8 areas, 3 difficulty levels; adaptive mode targets your weak points.', 'Travaux fictifs aléatoires dans les 8 domaines, 3 niveaux ; le mode adaptatif cible vos points faibles.') });
  register({ icon: '🧠', available: () => !!window.CYINSIGHT, open: toAcademy('coach'), title: () => L('My coach: mistake analysis', 'Mon coach : analyse des erreurs'), desc: () => L('Your weak points, every mistake with its likely cause, targeted exercises and AI analysis.', 'Vos points faibles, chaque erreur avec sa cause probable, exercices ciblés et analyse IA.') });
  // after the Academy button exists
  const init = () => setTimeout(headerButton, 0);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
