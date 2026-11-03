/* CYCLOPS field tools: inspection jobs, method checklists, guided indication records,
   notes and photos, AI review of an indication, and a printable report (Save as PDF).
   Everything is stored on this device (IndexedDB) and works offline. */
(function () {
  'use strict';

  const METHODS = ['PT', 'MT', 'UT', 'RT', 'VT', 'APL', 'APE', 'APVG', 'OTH'];
  const $ = (s, el) => (el || document).querySelector(s);
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr' ? fr : en);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const today = () => new Date().toISOString().slice(0, 10);

  // ---------- Storage ----------
  let dbPromise;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open('cyclops-field', 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          d.createObjectStore('jobs', { keyPath: 'id' });
          d.createObjectStore('photos', { keyPath: 'id' }).createIndex('job', 'jobId');
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      Promise.resolve(fn(s)).then((v) => { out = v; });
      t.oncomplete = () => resolve(out);
      t.onerror = () => reject(t.error);
    });
  }
  const reqP = (r) => new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
  const allJobs = () => tx('jobs', 'readonly', (s) => reqP(s.getAll()));
  const getJob = (id) => tx('jobs', 'readonly', (s) => reqP(s.get(id)));
  const putJob = (job) => tx('jobs', 'readwrite', (s) => { job.updatedAt = new Date().toISOString(); s.put(job); });
  const delJob = async (id) => {
    const photos = await jobPhotos(id);
    await tx('photos', 'readwrite', (s) => photos.forEach((p) => s.delete(p.id)));
    await tx('jobs', 'readwrite', (s) => s.delete(id));
  };
  const putPhoto = (p) => tx('photos', 'readwrite', (s) => { s.put(p); });
  const delPhoto = (id) => tx('photos', 'readwrite', (s) => { s.delete(id); });
  const jobPhotos = (jobId) => tx('photos', 'readonly', (s) => reqP(s.index('job').getAll(jobId)));

  function resizeImage(file, max = 1600) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  // ---------- Method data ----------
  const methodName = (m) => {
    const p = window.CYPROC && window.CYPROC[m];
    const fr = typeof lang !== 'undefined' && lang === 'fr';
    return p ? (fr && p.fr ? p.fr.name : p.name) : m;
  };
  function buildChecklist(method) {
    const p = (window.CYPROC || {})[method] || {};
    const d = typeof lang !== 'undefined' && lang === 'fr' && p.fr ? p.fr : p;
    const items = [
      [L('Preparation', 'Préparation'), L('Approved procedure and revision confirmed', 'Procédure approuvée et révision confirmées')],
      [L('Preparation', 'Préparation'), L('Inspector qualification / certification valid for the method', 'Qualification / certification de l’inspecteur valide pour la méthode')],
      [L('Preparation', 'Préparation'), L('Instruments identified and calibration in date', 'Instruments identifiés et étalonnage valide')],
      [L('Preparation', 'Préparation'), L('Governing code, edition and acceptance level identified', 'Code applicable, édition et niveau d’acceptation identifiés')],
      [L('Preparation', 'Préparation'), L('Access, lighting and surface condition acceptable', 'Accès, éclairage et état de surface acceptables')]
    ];
    (p.hse || []).forEach((h) => items.push(['HSE', h]));
    (d.steps || p.steps || []).forEach((s) => (s[1] || []).forEach((b) => items.push([s[0], b])));
    (d.wn || p.wn || []).forEach((w) => items.push([L('Verification', 'Vérification'), w]));
    items.push([L('Closing', 'Clôture'), L('Area left safe and clean; equipment recovered', 'Zone laissée sûre et propre ; matériel récupéré')]);
    return items.map(([group, text]) => ({ id: uid(), group, text, status: '', comment: '' }));
  }

  // Guided indication fields per method: [key, EN label, FR label, unit]
  const FIELDS = {
    UT: [['position', 'Position from datum', 'Position / référence', 'mm'], ['depth', 'Depth', 'Profondeur', 'mm'], ['length', 'Length', 'Longueur', 'mm'], ['amplitude', 'Amplitude vs reference', 'Amplitude / référence', 'dB or %DAC'], ['soundPath', 'Sound path', 'Parcours ultrasonore', 'mm'], ['probe', 'Probe / angle', 'Traducteur / angle', ''], ['side', 'Scanning side', 'Côté de balayage', '']],
    PT: [['type', 'Type (linear / rounded)', 'Type (linéaire / arrondie)', ''], ['length', 'Length', 'Longueur', 'mm'], ['orientation', 'Orientation', 'Orientation', '']],
    MT: [['type', 'Type (linear / rounded)', 'Type (linéaire / arrondie)', ''], ['length', 'Length', 'Longueur', 'mm'], ['orientation', 'Orientation vs field', 'Orientation / champ', '']],
    RT: [['film', 'Film / image no.', 'N° film / image', ''], ['type', 'Type (porosity, slag, crack, LOF, LOP…)', 'Type (porosité, inclusion, fissure, collage, manque de pénétration…)', ''], ['length', 'Length', 'Longueur', 'mm'], ['density', 'Density / IQI seen', 'Densité / IQI visible', '']],
    VT: [['feature', 'Feature (undercut, reinforcement, misalignment…)', 'Caractéristique (caniveau, surépaisseur, désalignement…)', ''], ['measured', 'Measured value', 'Valeur mesurée', 'mm']],
    DEFAULT: [['item', 'Component / item', 'Composant / élément', ''], ['parameter', 'Parameter checked', 'Paramètre contrôlé', ''], ['measured', 'Measured value', 'Valeur mesurée', ''], ['limit', 'Limit from procedure (if known)', 'Limite de la procédure (si connue)', '']]
  };
  const fieldsFor = (m) => FIELDS[m] || FIELDS.DEFAULT;
  const DISPOSITIONS = () => [['pending', L('Pending evaluation', 'En attente d’évaluation')], ['acceptable', L('Acceptable', 'Acceptable')], ['rejectable', L('Rejectable', 'Rejetable')], ['further', L('Further examination', 'Examen complémentaire')]];
  const CONCLUSIONS = () => [['', L('— not set —', '— non défini —')], ['conform', L('Conforming', 'Conforme')], ['nonconform', L('Non-conforming', 'Non conforme')], ['reserve', L('Conforming with reservations', 'Conforme avec réserves')], ['incomplete', L('Inspection incomplete', 'Inspection incomplète')]];
  const INFO = () => [
    ['reference', L('Job / report reference', 'Référence mission / rapport')], ['client', L('Client', 'Client')], ['site', L('Site / location', 'Site / lieu')],
    ['component', L('Component / equipment ID', 'Composant / n° équipement')], ['procedure', L('Procedure ref. and revision', 'Réf. procédure et révision')],
    ['code', L('Governing code and edition', 'Code applicable et édition')], ['acceptance', L('Acceptance level / class', 'Niveau / classe d’acceptation')],
    ['material', L('Material', 'Matériau')], ['thickness', L('Thickness (mm)', 'Épaisseur (mm)')], ['instrument', L('Instrument, serial no., calibration due', 'Appareil, n° série, échéance étalonnage')],
    ['inspector', L('Inspector', 'Inspecteur')], ['date', L('Date', 'Date')]
  ];

  // ---------- State ----------
  const view = () => document.getElementById('tools-view');
  let current = null; // job being edited
  let tab = 'info';
  let saveTimer = null;
  let me = null;
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => current && putJob(current).then(flashSaved), 350); };
  function flashSaved() { const s = $('#ft-saved'); if (s) { s.textContent = L('Saved on this device', 'Enregistré sur cet appareil'); setTimeout(() => { if (s) s.textContent = ''; }, 1500); } }

  function show(on) {
    ['prd', 'ptab', 'photo-dropzone', 'photo-result', 'quiz-view'].forEach((id) => { const el = document.getElementById(id); if (el && on) el.hidden = true; });
    if (!on) { ['prd', 'ptab', 'photo-dropzone'].forEach((id) => { const el = document.getElementById(id); if (el) el.hidden = false; }); }
    view().hidden = !on;
  }

  async function open() {
    if (window.CYQUIZ && !document.getElementById('quiz-view').hidden && window.CYQUIZ.back) document.getElementById('quiz-view').hidden = true;
    show(true);
    if (!me) { try { me = await (await fetch('/api/me', { cache: 'no-store' })).json(); } catch { me = {}; } }
    current = null;
    renderList();
    window.scrollTo({ top: 0 });
  }
  function close() { current = null; show(false); }
  function back() { if (current) { current = null; renderList(); } else close(); }

  // ---------- List ----------
  async function renderList() {
    const jobs = (await allJobs()).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    view().innerHTML = '<div class="ft-page"><div class="ft-top"><h2>' + L('Field inspections', 'Inspections terrain') + '</h2><div class="ft-actions">' +
      '<button type="button" class="ft-primary" data-ft="new">+ ' + L('New inspection', 'Nouvelle inspection') + '</button>' +
      '<button type="button" data-ft="import">' + L('Import', 'Importer') + '</button><button type="button" data-ft="close">' + L('Close', 'Fermer') + '</button></div></div>' +
      '<p class="mut">' + L('Inspections are saved on this device and work without network. Export a job to back it up or move it to another device.', 'Les inspections sont enregistrées sur cet appareil et fonctionnent sans réseau. Exportez une mission pour la sauvegarder ou la transférer.') + '</p>' +
      '<div class="ft-new" hidden><label>' + L('Method', 'Méthode') + ' <select id="ft-new-method">' + METHODS.map((m) => '<option value="' + m + '">' + esc(methodName(m)) + '</option>').join('') + '</select></label><button type="button" class="ft-primary" data-ft="create">' + L('Create', 'Créer') + '</button></div>' +
      (jobs.length ? '<div class="ft-list">' + jobs.map((j) => '<button type="button" class="ft-job" data-open="' + esc(j.id) + '"><strong>' + esc(j.info.reference || L('(no reference)', '(sans référence)')) + '</strong><span>' + esc([j.method, j.info.client, j.info.component, j.info.date].filter(Boolean).join(' · ')) + '</span><span class="ft-badge" data-c="' + esc(j.conclusion || '') + '">' + esc((CONCLUSIONS().find((c) => c[0] === (j.conclusion || '')) || [])[1]) + '</span></button>').join('') + '</div>'
        : '<p class="ft-empty">' + L('No inspection yet.', 'Aucune inspection pour le moment.') + '</p>') +
      '<input type="file" id="ft-import" accept="application/json,.json" hidden></div>';
  }

  async function createJob(method) {
    const job = {
      id: uid(), method, createdAt: new Date().toISOString(),
      info: { date: today(), inspector: me && me.user && me.user !== 'local' ? me.user : '' },
      checklist: buildChecklist(method), indications: [], notes: '', conclusion: '', summary: '', signedBy: ''
    };
    await putJob(job);
    current = job; tab = 'info'; renderJob();
  }

  // ---------- Job editor ----------
  function tabs() {
    return [['info', L('Information', 'Informations')], ['checklist', L('Checklist', 'Checklist')], ['indications', L('Indications', 'Indications')], ['notes', L('Notes & photos', 'Notes et photos')], ['report', L('Report', 'Rapport')]];
  }
  async function renderJob() {
    const j = current;
    const done = j.checklist.filter((c) => c.status).length;
    let html = '<div class="ft-page"><div class="ft-top"><div><h2>' + esc(j.info.reference || L('New inspection', 'Nouvelle inspection')) + '</h2><span class="mut">' + esc(methodName(j.method)) + ' · ' + L('Checklist', 'Checklist') + ' <span id="ft-count">' + done + '/' + j.checklist.length + '</span></span> <span id="ft-saved" class="ft-saved"></span></div>' +
      '<div class="ft-actions"><button type="button" data-ft="list">← ' + L('All inspections', 'Toutes les inspections') + '</button></div></div>' +
      '<nav class="ft-tabs">' + tabs().map((t) => '<button type="button" data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>').join('') + '</nav><div class="ft-body">';
    if (tab === 'info') {
      html += '<div class="ft-grid">' + INFO().map(([k, label]) => '<label>' + esc(label) + '<input data-info="' + k + '" value="' + esc(j.info[k] || '') + '"' + (k === 'date' ? ' type="date"' : '') + '></label>').join('') + '</div>';
    } else if (tab === 'checklist') {
      let group = '';
      html += '<div class="ft-check">' + j.checklist.map((c) => {
        const head = c.group !== group ? '<h3>' + esc((group = c.group)) + '</h3>' : '';
        return head + '<div class="ft-ci" data-ci="' + c.id + '"><p>' + esc(c.text) + '</p><div class="ft-seg">' +
          [['ok', 'OK'], ['nok', L('Not OK', 'Non OK')], ['na', 'N/A']].map(([v, t]) => '<button type="button" data-status="' + v + '" class="' + (c.status === v ? 'on s-' + v : '') + '">' + t + '</button>').join('') +
          '</div><input data-comment placeholder="' + L('Comment', 'Commentaire') + '" value="' + esc(c.comment) + '"></div>';
      }).join('') + '</div>';
    } else if (tab === 'indications') {
      html += '<button type="button" class="ft-primary" data-ft="add-ind">+ ' + L('Record an indication', 'Enregistrer une indication') + '</button>';
      html += j.indications.length ? '' : '<p class="ft-empty">' + L('No indication recorded.', 'Aucune indication enregistrée.') + '</p>';
      const photos = await jobPhotos(j.id);
      html += j.indications.map((ind, n) => indicationHtml(ind, n, photos.filter((p) => p.indId === ind.id))).join('');
    } else if (tab === 'notes') {
      const photos = (await jobPhotos(j.id)).filter((p) => !p.indId);
      html += '<label class="ft-wide">' + L('Notes and observations', 'Notes et observations') + '<textarea data-job="notes" rows="8">' + esc(j.notes) + '</textarea></label>' +
        '<div class="ft-photos">' + photos.map(photoHtml).join('') + '</div><button type="button" data-photo="">📷 ' + L('Add photo', 'Ajouter une photo') + '</button>';
    } else if (tab === 'report') {
      const nok = j.checklist.filter((c) => c.status === 'nok').length;
      const open = j.checklist.filter((c) => !c.status).length;
      const pending = j.indications.filter((i) => (i.disposition || 'pending') === 'pending').length;
      html += '<div class="ft-summary"><span>' + L('Checklist items not answered', 'Points de checklist sans réponse') + ': <b>' + open + '</b></span><span>' + L('Items not OK', 'Points non OK') + ': <b>' + nok + '</b></span><span>' + L('Indications', 'Indications') + ': <b>' + j.indications.length + '</b> (' + L('pending', 'en attente') + ': ' + pending + ')</span></div>' +
        '<label class="ft-wide">' + L('Overall conclusion (inspector decision)', 'Conclusion générale (décision de l’inspecteur)') + '<select data-job="conclusion">' + CONCLUSIONS().map((c) => '<option value="' + c[0] + '"' + (j.conclusion === c[0] ? ' selected' : '') + '>' + c[1] + '</option>').join('') + '</select></label>' +
        '<label class="ft-wide">' + L('Summary', 'Synthèse') + '<textarea data-job="summary" rows="5">' + esc(j.summary) + '</textarea></label>' +
        '<label class="ft-wide">' + L('Signed by (name, level)', 'Signé par (nom, niveau)') + '<input data-job="signedBy" value="' + esc(j.signedBy) + '"></label>' +
        '<div class="ft-actions"><button type="button" class="ft-primary" data-ft="report">🖨 ' + L('Open report (print / save as PDF)', 'Ouvrir le rapport (imprimer / PDF)') + '</button><button type="button" data-ft="export">' + L('Export job file', 'Exporter la mission') + '</button><button type="button" class="ft-danger" data-ft="delete">' + L('Delete inspection', 'Supprimer l’inspection') + '</button></div>';
    }
    html += '</div><input type="file" id="ft-photo-input" accept="image/*" capture="environment" hidden></div>';
    view().innerHTML = html;
  }

  function photoHtml(p) {
    return '<figure class="ft-photo" data-pid="' + esc(p.id) + '"><img src="' + p.dataUrl + '" alt=""><input data-caption placeholder="' + L('Caption', 'Légende') + '" value="' + esc(p.caption || '') + '"><button type="button" data-delphoto="' + esc(p.id) + '" title="' + L('Remove photo', 'Supprimer la photo') + '">✕</button></figure>';
  }

  function indicationHtml(ind, n, photos) {
    const f = fieldsFor(current.method);
    return '<article class="ft-ind" data-ind="' + ind.id + '"><div class="ft-ind-head"><h3>' + L('Indication', 'Indication') + ' ' + (n + 1) + '</h3><button type="button" class="ft-danger" data-delind>' + L('Remove', 'Supprimer') + '</button></div>' +
      '<div class="ft-grid">' + f.map(([k, en, fr, unit]) => '<label>' + esc(L(en, fr)) + (unit ? ' <small>(' + esc(unit) + ')</small>' : '') + '<input data-f="' + k + '" value="' + esc(ind.f[k] || '') + '"></label>').join('') +
      '<label>' + L('Location / description', 'Localisation / description') + '<input data-f="description" value="' + esc(ind.f.description || '') + '"></label>' +
      '<label>' + L('Disposition (inspector)', 'Décision (inspecteur)') + '<select data-disp>' + DISPOSITIONS().map((d) => '<option value="' + d[0] + '"' + ((ind.disposition || 'pending') === d[0] ? ' selected' : '') + '>' + d[1] + '</option>').join('') + '</select></label></div>' +
      '<div class="ft-photos">' + photos.map(photoHtml).join('') + '</div>' +
      '<div class="ft-actions"><button type="button" data-photo="' + ind.id + '">📷 ' + L('Add photo', 'Ajouter une photo') + '</button><button type="button" data-review>🤖 ' + L('Ask the assistant to review', 'Demander l’avis de l’assistant') + '</button></div>' +
      (ind.ai ? '<div class="ft-ai"><b>' + L('AI interpretation — not a disposition', 'Interprétation IA — pas une décision') + '</b><div>' + esc(ind.ai).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') + '</div></div>' : '') + '</article>';
  }

  async function reviewIndication(ind, button) {
    if (!window.CY3 || typeof window.CY3.ask !== 'function') return;
    const j = current;
    const f = fieldsFor(j.method);
    const lines = f.map(([k, en, fr, unit]) => '- ' + L(en, fr) + ': ' + (ind.f[k] || L('not given', 'non renseigné')) + (unit && ind.f[k] ? ' ' + unit : ''));
    const context = INFO().filter(([k]) => ['code', 'acceptance', 'procedure', 'material', 'thickness'].includes(k)).map(([k, label]) => '- ' + label + ': ' + (j.info[k] || L('not given', 'non renseigné')));
    const q = L('Review this recorded ' + j.method + ' indication. Do not give an accept/reject decision. Say what can be determined from these data, which data are missing for an evaluation against the governing code, and what to check next.',
      'Analysez cette indication ' + j.method + ' enregistrée. Ne donnez pas de décision d’acceptation ou de rejet. Indiquez ce qui peut être déterminé avec ces données, les données manquantes pour une évaluation selon le code applicable, et les vérifications suivantes.') +
      '\n' + L('Job context', 'Contexte') + ':\n' + context.join('\n') + '\n' + L('Indication', 'Indication') + ':\n' + lines.join('\n') + '\n- ' + L('Location / description', 'Localisation / description') + ': ' + (ind.f.description || '-');
    button.disabled = true;
    button.textContent = L('Asking…', 'Demande en cours…');
    try {
      const reply = await window.CY3.ask(q, { kw: j.method + ' ' + L('acceptance criteria evaluation', 'critères d’acceptation évaluation') });
      const sources = (reply.sources || []).map((s) => '[' + s.tag + '] ' + s.typeLabel + ' — ' + s.source).join('\n');
      ind.ai = (reply.t || '') + (sources ? '\n\n' + L('Sources', 'Sources') + ':\n' + sources : '') + (reply.ai ? '' : '\n\n' + L('(Offline answer from built-in procedures — AI not reachable.)', '(Réponse hors ligne issue des procédures intégrées — IA non joignable.)'));
      await putJob(j);
    } finally {
      renderJob();
    }
  }

  // ---------- Report ----------
  async function openReport() {
    const j = current;
    const photos = await jobPhotos(j.id);
    const disp = Object.fromEntries(DISPOSITIONS());
    const concl = Object.fromEntries(CONCLUSIONS());
    const statusText = { ok: 'OK', nok: L('Not OK', 'Non OK'), na: 'N/A', '': '—' };
    const f = fieldsFor(j.method);
    const photoBlock = (list) => list.length ? '<div class="ph">' + list.map((p) => '<figure><img src="' + p.dataUrl + '"><figcaption>' + esc(p.caption || '') + '</figcaption></figure>').join('') + '</div>' : '';
    const html = '<!doctype html><html lang="' + (L('en', 'fr')) + '"><head><meta charset="utf-8"><title>' + esc(j.info.reference || 'CYCLOPS report') + '</title><style>' +
      'body{font:12px/1.45 system-ui,Arial,sans-serif;color:#111;margin:24px}h1{font-size:20px;margin:0}h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #1d3a7a;padding-bottom:3px;color:#1d3a7a}' +
      'table{width:100%;border-collapse:collapse;margin:4px 0}td,th{border:1px solid #bbb;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eef2fb}.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #1d3a7a;padding-bottom:8px}' +
      '.ph{display:flex;flex-wrap:wrap;gap:8px}.ph figure{margin:0;width:200px}.ph img{width:200px;height:150px;object-fit:cover;border:1px solid #ccc}.ph figcaption{font-size:10px}.ai{background:#f6f6f6;border-left:3px solid #888;padding:6px;white-space:pre-wrap;font-size:11px}' +
      '.nok{color:#b00020;font-weight:700}.sig{display:flex;gap:40px;margin-top:30px}.sig div{flex:1;border-top:1px solid #333;padding-top:4px}.note{font-size:10px;color:#555;margin-top:16px}.bar{margin-bottom:12px}@media print{.bar{display:none}body{margin:10mm}h2{break-after:avoid}tr,figure{break-inside:avoid}}' +
      '</style></head><body><div class="bar"><button onclick="print()">' + L('Print / Save as PDF', 'Imprimer / Enregistrer en PDF') + '</button></div>' +
      '<div class="hdr"><div><h1>AQCS — ' + L('Inspection report', 'Rapport d’inspection') + '</h1><div>' + esc(methodName(j.method)) + '</div></div><div><b>' + esc(j.info.reference || '') + '</b><br>' + esc(j.info.date || '') + '</div></div>' +
      '<h2>' + L('Information', 'Informations') + '</h2><table>' + INFO().map(([k, label]) => '<tr><th style="width:35%">' + esc(label) + '</th><td>' + esc(j.info[k] || '') + '</td></tr>').join('') + '</table>' +
      '<h2>' + L('Checklist', 'Checklist') + '</h2><table><tr><th>' + L('Item', 'Point') + '</th><th style="width:70px">' + L('Result', 'Résultat') + '</th><th>' + L('Comment', 'Commentaire') + '</th></tr>' +
      j.checklist.map((c) => '<tr><td><small>' + esc(c.group) + '</small><br>' + esc(c.text) + '</td><td class="' + (c.status === 'nok' ? 'nok' : '') + '">' + statusText[c.status || ''] + '</td><td>' + esc(c.comment) + '</td></tr>').join('') + '</table>' +
      '<h2>' + L('Indications', 'Indications') + '</h2>' + (j.indications.length ? j.indications.map((ind, n) => '<h3 style="font-size:12px;margin:10px 0 4px">' + L('Indication', 'Indication') + ' ' + (n + 1) + ' — ' + esc(disp[ind.disposition || 'pending']) + '</h3><table>' +
        f.concat([['description', 'Location / description', 'Localisation / description', '']]).map(([k, en, fr, unit]) => '<tr><th style="width:35%">' + esc(L(en, fr)) + (unit ? ' (' + esc(unit) + ')' : '') + '</th><td>' + esc(ind.f[k] || '') + '</td></tr>').join('') + '</table>' +
        photoBlock(photos.filter((p) => p.indId === ind.id)) + (ind.ai ? '<div class="ai"><b>' + L('AI interpretation (for information only, not a disposition)', 'Interprétation IA (information uniquement, pas une décision)') + ':</b>\n' + esc(ind.ai.replace(/\*\*(.+?)\*\*/g, '$1')) + '</div>' : '')).join('') : '<p>' + L('No indication recorded.', 'Aucune indication enregistrée.') + '</p>') +
      '<h2>' + L('Notes and photos', 'Notes et photos') + '</h2><p style="white-space:pre-wrap">' + esc(j.notes || '—') + '</p>' + photoBlock(photos.filter((p) => !p.indId)) +
      '<h2>' + L('Conclusion', 'Conclusion') + '</h2><p><b>' + esc(concl[j.conclusion || '']) + '</b></p><p style="white-space:pre-wrap">' + esc(j.summary || '') + '</p>' +
      '<div class="sig"><div>' + L('Inspector', 'Inspecteur') + ': ' + esc(j.signedBy || j.info.inspector || '') + '</div><div>' + L('Reviewed by', 'Vérifié par') + ':</div><div>' + L('Client', 'Client') + ':</div></div>' +
      '<p class="note">' + L('Generated with CYCLOPS. Acceptance decisions are made by the qualified inspector against the governing code and approved procedure; AI notes are informative only.', 'Généré avec CYCLOPS. Les décisions d’acceptation relèvent de l’inspecteur qualifié selon le code applicable et la procédure approuvée ; les notes IA sont informatives.') + '</p></body></html>';
    const w = window.open('', '_blank');
    if (!w) { alertBox(L('Allow pop-ups for this site to open the report.', 'Autorisez les fenêtres pop-up pour ouvrir le rapport.')); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }
  function alertBox(msg) { const s = $('#ft-saved'); if (s) s.textContent = msg; }

  async function exportJob(job) {
    const photos = await jobPhotos(job.id);
    const blob = new Blob([JSON.stringify({ format: 'cyclops-job-1', job, photos }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (job.info.reference || 'cyclops-job').replace(/[^\w.-]+/g, '_') + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function importJob(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data.format !== 'cyclops-job-1' || !data.job || !data.job.id) throw new Error('format');
      await putJob(data.job);
      for (const p of data.photos || []) if (p && p.id && typeof p.dataUrl === 'string' && p.dataUrl.startsWith('data:image/')) await putPhoto(p);
      renderList();
    } catch {
      view().insertAdjacentHTML('afterbegin', '<p class="quiz-error">' + L('This file is not a CYCLOPS job export.', 'Ce fichier n’est pas une exportation de mission CYCLOPS.') + '</p>');
    }
  }

  // ---------- Events ----------
  let photoTarget = null;
  function bind() {
    const v = view();
    v.addEventListener('click', async (e) => {
      const t = e.target.closest('button,[data-open]');
      if (!t) return;
      const act = t.dataset.ft;
      if (act === 'close') return close();
      if (act === 'new') { const n = $('.ft-new', v); n.hidden = !n.hidden; return; }
      if (act === 'create') return createJob($('#ft-new-method', v).value);
      if (act === 'import') return $('#ft-import', v).click();
      if (act === 'list') { current = null; return renderList(); }
      if (act === 'report') return openReport();
      if (act === 'export') return exportJob(current);
      if (act === 'delete') {
        if (t.dataset.confirm !== '1') { t.dataset.confirm = '1'; t.textContent = L('Click again to delete permanently', 'Cliquez encore pour supprimer définitivement'); return; }
        await delJob(current.id); current = null; return renderList();
      }
      if (act === 'add-ind') { current.indications.push({ id: uid(), f: {}, disposition: 'pending' }); await putJob(current); return renderJob(); }
      if (t.dataset.open) { current = await getJob(t.dataset.open); tab = 'info'; return renderJob(); }
      if (t.dataset.tab) { tab = t.dataset.tab; return renderJob(); }
      if (t.dataset.status) {
        const ci = current.checklist.find((c) => c.id === t.closest('[data-ci]').dataset.ci);
        ci.status = ci.status === t.dataset.status ? '' : t.dataset.status;
        save();
        t.parentElement.querySelectorAll('button').forEach((b) => { b.className = b.dataset.status === ci.status ? 'on s-' + ci.status : ''; });
        const count = $('#ft-count'); if (count) count.textContent = current.checklist.filter((c) => c.status).length + '/' + current.checklist.length;
        return;
      }
      if (t.hasAttribute('data-delind')) {
        const id = t.closest('[data-ind]').dataset.ind;
        if (t.dataset.confirm !== '1') { t.dataset.confirm = '1'; t.textContent = L('Confirm remove', 'Confirmer'); return; }
        current.indications = current.indications.filter((i) => i.id !== id);
        for (const p of (await jobPhotos(current.id)).filter((p) => p.indId === id)) await delPhoto(p.id);
        await putJob(current); return renderJob();
      }
      if (t.hasAttribute('data-review')) return reviewIndication(current.indications.find((i) => i.id === t.closest('[data-ind]').dataset.ind), t);
      if (t.hasAttribute('data-photo')) { photoTarget = t.dataset.photo; return $('#ft-photo-input', v).click(); }
      if (t.dataset.delphoto) { await delPhoto(t.dataset.delphoto); return renderJob(); }
    });
    v.addEventListener('input', async (e) => {
      const el = e.target;
      if (!current) return;
      if (el.dataset.info) { current.info[el.dataset.info] = el.value; if (el.dataset.info === 'reference') { const h = $('.ft-top h2', v); if (h) h.textContent = el.value || L('New inspection', 'Nouvelle inspection'); } save(); }
      else if (el.dataset.job) { current[el.dataset.job] = el.value; save(); }
      else if (el.hasAttribute('data-comment')) { current.checklist.find((c) => c.id === el.closest('[data-ci]').dataset.ci).comment = el.value; save(); }
      else if (el.dataset.f) { current.indications.find((i) => i.id === el.closest('[data-ind]').dataset.ind).f[el.dataset.f] = el.value; save(); }
      else if (el.hasAttribute('data-disp')) { current.indications.find((i) => i.id === el.closest('[data-ind]').dataset.ind).disposition = el.value; save(); }
      else if (el.hasAttribute('data-caption')) {
        const id = el.closest('[data-pid]').dataset.pid;
        const p = (await jobPhotos(current.id)).find((x) => x.id === id);
        if (p) { p.caption = el.value; putPhoto(p); }
      }
    });
    v.addEventListener('change', async (e) => {
      const el = e.target;
      if (el.id === 'ft-import' && el.files[0]) { importJob(el.files[0]); el.value = ''; }
      if (el.id === 'ft-photo-input' && el.files[0] && current) {
        const dataUrl = await resizeImage(el.files[0]);
        el.value = '';
        if (!dataUrl) return alertBox(L('This image could not be opened.', 'Impossible d’ouvrir cette image.'));
        await putPhoto({ id: uid(), jobId: current.id, indId: photoTarget || null, dataUrl, caption: '', name: el.files[0] ? el.files[0].name : '' });
        renderJob();
      }
      if (el.matches('select[data-job],select[data-disp]')) el.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function init() {
    if (!view()) return;
    if (!('indexedDB' in window)) { view().innerHTML = '<p>' + L('This browser cannot store inspections offline.', 'Ce navigateur ne peut pas enregistrer les inspections hors ligne.') + '</p>'; return; }
    bind();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.CYTOOLS = {
    open, close, back,
    isOpen: () => view() && !view().hidden,
    langChanged: () => { if (view() && !view().hidden) { current ? renderJob() : renderList(); } }
  };
}());
