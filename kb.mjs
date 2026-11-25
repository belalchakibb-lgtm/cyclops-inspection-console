// CYCLOPS knowledge base: loads procedure data, approved AQCS documents and code references,
// splits them into labelled passages, and finds the passages relevant to a question.
// Single source of truth: the built-in data is read from the same browser files the UI uses.
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import vm from 'node:vm';

export const METHODS = ['PT', 'MT', 'UT', 'RT', 'VT', 'APL', 'APE', 'APVG', 'OTH'];

// Source types shown to users (blueprint section 6).
export const SOURCE_TYPES = {
  AQCS: { en: 'AQCS procedure', fr: 'Procédure AQCS' },
  AQCS_DRAFT: { en: 'AQCS document (draft, not approved)', fr: 'Document AQCS (projet, non approuvé)' },
  CODE_REF: { en: 'Code / standard reference (scope only, not code text)', fr: 'Référence code / norme (portée uniquement, pas le texte)' },
  CYCLOPS: { en: 'CYCLOPS built-in guidance (general, verify)', fr: 'Guide intégré CYCLOPS (général, à vérifier)' },
  STUDY: { en: 'ASME/API study guide (learning summary, verify the code edition)', fr: 'Guide d’étude ASME/API (résumé pédagogique, édition du code à vérifier)' },
  COURSE: { en: 'CYCLOPS professional course (training summary, status shown)', fr: 'Cours professionnel CYCLOPS (résumé de formation, statut indiqué)' },
  DM: { en: 'Damage mechanism summary after API RP 571, 3rd ed. (training summary, not the standard’s text)', fr: 'Fiche mécanisme d’après l’API RP 571, 3e éd. (résumé de formation, pas le texte de la norme)' }
};
const DM_FILES = ['cyclops-dm-data.js', 'cyclops-dm-data2.js', 'cyclops-dmlab.js'];

// The professional courses (cyclops-procourse*.js), read from the same files the courses use.
const COURSE_FILES = ['cyclops-procourse.js', 'cyclops-procourse-utrt.js', 'cyclops-procourse-equip.js', 'cyclops-procourse-surf.js'];
const COURSE_STATUS = {
  checked: { en: 'cross-checked with public sources, not the paid code text', fr: 'recoupé avec des sources publiques, pas le texte payant du code' },
  verify: { en: 'from training knowledge, to verify in the code', fr: 'issu de connaissances de formation, à vérifier dans le code' }
};

const STOP = new Set('the a an of to in on for and or is are be do does how what which when why with at by from it this that i you my me can should must about les des du de la le un une et ou est sont que qui quoi quel quelle quand comment pourquoi avec pour dans sur au aux ce cette mon ma mes il elle je tu on ne pas plus faut doit dois peut'.split(' '));
const FRD = { ressuage: 'penetrant pt', magnetoscopie: 'magnetic mt', ultrasons: 'ultrasonic ut', ultrason: 'ultrasonic ut', radiographie: 'radiographic rt film', gammagraphie: 'gamma radiographic', visuel: 'visual vt', levage: 'lifting crane', grue: 'crane', elingue: 'sling', elingues: 'sling', crochet: 'hook', cable: 'wire rope', electrique: 'electrical', isolement: 'insulation', terre: 'earth', recipient: 'vessel pressure', pression: 'pressure', epreuve: 'test', soupape: 'safety valve', manometre: 'gauge pressure', epaisseur: 'thickness', etalonnage: 'calibration', critere: 'acceptance criteria', criteres: 'acceptance criteria', acceptation: 'acceptance', defaut: 'defect indication', defauts: 'defect indication', fissure: 'crack', soudure: 'weld', cordon: 'weld', temps: 'time', duree: 'time', nettoyage: 'cleaning', nettoyer: 'cleaning', revelateur: 'developer', eclairage: 'lighting lux', lumiere: 'light lux', securite: 'safety', rapport: 'report', norme: 'code standard', normes: 'codes standards', etape: 'step', etapes: 'steps', champ: 'field', aimantation: 'magnetizing', sonde: 'probe', traducteur: 'probe', sensibilite: 'sensitivity', porosite: 'porosity', soufflure: 'porosity', charge: 'load', essai: 'test', penetration: 'penetration', couplant: 'couplant', amplitude: 'amplitude' };
const MD = { PT: /penetrant|ressuage|dwell|developer|revelateur/, MT: /magnetic|magneto|yoke|particle|aimant/, UT: /ultraso|probe|sonde|couplant|\bdac\b|\btcg\b/, RT: /radiograph|gamma|\bfilm|\biqi\b|gammagraph/, VT: /visual|visuel|\bgauge|jauge/, APL: /crane|grue|sling|elingue|hook|crochet|lifting|levage|wire rope/, APE: /electri|insulation|isolement|\brcd\b|thermograph|loto|megohm/, APVG: /vessel|pressure|hydrotest|valve|soupape|recipient|pression|manometre/ };

export const normalize = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function stem(w) { if (w.length < 4) return w; w = w.replace(/ies$/, 'y').replace(/(es|s|ing|ed)$/, ''); return w.replace(/e$/, ''); }
export function tokens(s) {
  const out = [];
  normalize(s).split(/[^a-z0-9]+/).forEach((w) => {
    if (!w || STOP.has(w)) return;
    (FRD[w] ? FRD[w].split(' ') : [w]).forEach((x) => out.push(stem(x)));
  });
  return out;
}

export function detectMethod(text) {
  const n = normalize(text);
  const words = n.split(/[^a-z0-9]+/);
  for (const k of ['apvg', 'apl', 'ape', 'pt', 'mt', 'ut', 'rt', 'vt']) if (words.includes(k)) return k.toUpperCase();
  for (const k of Object.keys(MD)) if (MD[k].test(n)) return k;
  return null;
}

function loadBrowserData(code, filename) {
  const window = {};
  vm.runInNewContext(code, { window, console: { log() {}, warn() {}, error() {} } }, { filename, timeout: 2000 });
  return window;
}

// Runs the course files one after another in one sandbox, as the browser does, and returns their courses.
async function loadProCourses(read) {
  const window = {};
  const context = vm.createContext({ window, console: { log() {}, warn() {}, error() {} } });
  for (const file of COURSE_FILES) {
    try { vm.runInContext(await read(file), context, { filename: file, timeout: 2000 }); } catch (error) { console.warn(`Course file ${file} not loaded into the knowledge base: ${error.message}`); }
  }
  return (window.CYPRO && window.CYPRO.COURSES) || {};
}

// The damage-mechanism catalogue (API RP 571 summaries) and its assessment notes, read from the lab's own files.
async function loadDamageMechanisms(read) {
  const window = {};
  const context = vm.createContext({ window, console: { log() {}, warn() {}, error() {} } });
  for (const file of DM_FILES) {
    try { vm.runInContext(await read(file), context, { filename: file, timeout: 2000 }); } catch (error) { console.warn(`Damage file ${file} not loaded into the knowledge base: ${error.message}`); }
  }
  return { list: window.CYDM_DATA || [], assess: (window.CYDM && window.CYDM.ASSESS) || {}, meth: (window.CYDM && window.CYDM.METH) || {} };
}

function extractAsmeIndex(code3d) {
  const start = code3d.indexOf('const ASME_INDEX=[');
  if (start < 0) return [];
  const end = code3d.indexOf('\n];', start);
  if (end < 0) return [];
  const literal = code3d.slice(start + 'const ASME_INDEX='.length, end + 2);
  try { return vm.runInNewContext(`(${literal})`, {}, { timeout: 1000 }); } catch { return []; }
}

async function loadDocuments(root) {
  const docsRoot = join(root, 'documents');
  const docs = [];
  let methodDirs = [];
  try { methodDirs = await readdir(docsRoot, { withFileTypes: true }); } catch { return docs; }
  for (const dir of methodDirs) {
    if (!dir.isDirectory()) continue;
    const files = await readdir(join(docsRoot, dir.name)).catch(() => []);
    for (const file of files) {
      if (!file.endsWith('.json') || file.startsWith('_')) continue;
      try {
        const doc = JSON.parse(await readFile(join(docsRoot, dir.name, file), 'utf8'));
        doc.method = String(doc.method || dir.name).toUpperCase();
        docs.push(doc);
      } catch (error) {
        console.warn(`Skipped document ${dir.name}/${file}: ${error.message}`);
      }
    }
  }
  return docs;
}

export async function buildKnowledgeBase(root) {
  const read = (name) => readFile(join(root, name), 'utf8');
  const procs = loadBrowserData(await read('cyclops-procs.js'), 'cyclops-procs.js').CYPROC || {};
  const courses = loadBrowserData(await read('cyclops-courses.js'), 'cyclops-courses.js').CYCOURSES || {};
  const asme = extractAsmeIndex(await read('cyclops3D.js'));
  const study = loadBrowserData(await read('cyclops-study.js'), 'cyclops-study.js').CYSTUDY || { lessons: [] };
  const documents = await loadDocuments(root);
  const proCourses = await loadProCourses(read);
  const damage = await loadDamageMechanisms(read);
  const chunks = [];
  const add = (c) => chunks.push({ ...c, id: `${c.type}:${c.method}:${chunks.length}` });

  for (const method of Object.keys(procs)) {
    const p = procs[method];
    const builtIn = { type: 'CYCLOPS', method, source: `CYCLOPS ${method} summary`, revision: 'built-in' };
    for (const lang of ['en', 'fr']) {
      const d = lang === 'fr' && p.fr ? p.fr : p;
      (d.steps || p.steps || []).forEach((s) => (s[1] || []).forEach((b) => add({ ...builtIn, lang, section: s[0], text: b })));
      (d.acc || p.acc || []).forEach((a) => add({ ...builtIn, lang, section: lang === 'fr' ? 'Critères' : 'Acceptance', text: `${a[0]}: ${a[1]}` }));
      (d.wn || p.wn || []).forEach((w) => add({ ...builtIn, lang, section: lang === 'fr' ? 'Avertissement' : 'Warning', text: w }));
      (p.hse || []).forEach((h) => add({ ...builtIn, lang, section: 'HSE', text: h }));
      (p.equipment || []).forEach((e) => add({ ...builtIn, lang, section: lang === 'fr' ? 'Équipement' : 'Equipment', text: `${e[0]}: ${e[1]}` }));
      (p.codes || []).forEach((c, i) => add({ type: 'CODE_REF', method, lang, source: c[0], revision: 'edition to verify', section: lang === 'fr' ? 'Codes' : 'Codes', text: `${c[0]}: ${lang === 'fr' && p.fr && p.fr.codes && p.fr.codes[i] ? p.fr.codes[i].slice(-1)[0] : c[1]}` }));
    }
  }
  for (const method of Object.keys(courses)) {
    const c = courses[method];
    for (const field of ['purpose', 'principle', 'practice', 'limits']) {
      if (!Array.isArray(c[field])) continue;
      ['en', 'fr'].forEach((lang, i) => c[field][i] && add({ type: 'CYCLOPS', method, lang, source: `CYCLOPS ${method} course`, revision: 'built-in', section: field, text: c[field][i] }));
    }
  }
  for (const ref of asme) {
    for (const method of ref.methods || []) {
      add({ type: 'CODE_REF', method, lang: 'en', source: ref.code, revision: 'edition to verify', section: 'ASME scope', text: `${ref.code}: ${ref.en}` });
      add({ type: 'CODE_REF', method, lang: 'fr', source: ref.code, revision: 'édition à vérifier', section: 'Portée ASME', text: `${ref.code}: ${ref.fr}` });
    }
  }
  // ASME/API study guide used by the AI teacher: one passage per explanation, one for each lesson's key points
  for (const lesson of study.lessons) {
    ['en', 'fr'].forEach((lang, i) => {
      const base = { type: 'STUDY', method: 'OTH', lang, source: study.source, revision: lang === 'fr' ? 'résumé pédagogique' : 'learning summary', section: `${lesson.code} — ${lesson.title[i]}` };
      lesson.say.forEach((p) => add({ ...base, text: p[i] }));
      add({ ...base, text: lesson.points.map((p) => p[i]).join(' ') });
    });
  }
  // Professional courses: one passage per narrated point, and one per code table carrying its own status and source.
  const pick = (v, i) => (Array.isArray(v) ? String(v[i] == null ? v[0] : v[i]) : String(v == null ? '' : v));
  for (const method of Object.keys(proCourses)) {
    const course = proCourses[method];
    (course.slides || []).forEach((slide) => {
      if (slide.exam || !slide.t) return;
      ['en', 'fr'].forEach((lang, i) => {
        const base = { type: 'COURSE', method, lang, source: pick(course.name, i), section: pick(slide.t, i), revision: lang === 'fr' ? 'résumé de formation' : 'training summary' };
        (slide.b || []).forEach((point) => add({ ...base, text: pick(point, i) }));
        const tb = slide.table;
        if (tb && Array.isArray(tb.rows)) {
          const status = COURSE_STATUS[tb.st] || COURSE_STATUS.verify;
          const head = (tb.head || []).map((h) => pick(h, i)).join(' | ');
          const rows = tb.rows.map((r) => r.map((cell) => pick(cell, i)).join(' | ')).join('\n');
          add({ ...base, revision: `${status[lang]} — ${tb.src || ''}`.trim(), text: `${head}\n${rows}` });
        }
      });
    });
  }
  // Damage mechanisms: one passage for how it starts and looks, one for where and materials, one for inspection, one for prevention and assessment.
  const DM_METHOD = { scc: 'OTH', h2: 'OTH', ht: 'APVG', thin: 'APVG', mech: 'APVG', metal: 'APVG' };
  for (const d of damage.list) {
    ['en', 'fr'].forEach((lang, i) => {
      const p = (v) => (Array.isArray(v) ? String(v[i] == null ? v[0] : v[i]) : String(v || ''));
      const base = { type: 'DM', method: DM_METHOD[d.f] || 'APVG', lang, source: `API RP 571 § ${d.s}`, section: p(d.n), revision: lang === 'fr' ? 'résumé de formation' : 'training summary' };
      const methods = String(d.insp || '').split(',').map((x) => x.split(':')).sort((a, b) => b[1] - a[1]).map(([c, v]) => `${p(damage.meth[c] || [c, c])} (${['not effective', 'possible', 'effective'][Number(v)] || v})`).join('; ');
      add({ ...base, text: `${p(d.n)}. ${d.st.map((s) => p(s)).join(' ')} ${lang === 'fr' ? 'Aspect' : 'Appearance'}: ${p(d.look)}` });
      add({ ...base, text: `${p(d.n)} — ${lang === 'fr' ? 'où' : 'where'}: ${p(d.where)}. ${lang === 'fr' ? 'Matériaux' : 'Materials'}: ${p(d.mat)}.` });
      add({ ...base, text: `${p(d.n)} — ${lang === 'fr' ? 'inspection' : 'inspection'}: ${methods}. ${p(d.focus)}` });
      add({ ...base, text: `${p(d.n)} — ${lang === 'fr' ? 'prévention' : 'prevention'}: ${p(d.prev)} ${lang === 'fr' ? 'Évaluation' : 'Assessment'}: ${p((damage.assess[d.a] || [['']])[0])}` });
    });
  }
  for (const doc of documents) {
    const type = String(doc.status || 'approved').toLowerCase() === 'approved' ? 'AQCS' : 'AQCS_DRAFT';
    const base = { type, method: doc.method, lang: doc.lang || 'fr', source: `${doc.id || ''} ${doc.title || ''}`.trim(), revision: [doc.version && `v${doc.version}`, doc.revision && `rev ${doc.revision}`, doc.effectiveDate].filter(Boolean).join(' · ') || 'revision not set' };
    const sections = Array.isArray(doc.sections) && doc.sections.length ? doc.sections : [{ id: '', title: doc.title || '', content: doc.content || '' }];
    for (const s of sections) {
      const paragraphs = String(s.content || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
      paragraphs.forEach((text) => add({ ...base, section: [s.id, s.title].filter(Boolean).join(' '), text: text.slice(0, 1500) }));
    }
  }

  const df = {};
  for (const c of chunks) {
    c.terms = new Set(tokens(`${c.section} ${c.text} ${c.method}`));
    c.secTerms = new Set(tokens(c.section)); // a word that names the topic (e.g. "HTHA", "creep") counts extra
    c.terms.forEach((w) => { df[w] = (df[w] || 0) + 1; });
  }
  const version = createHash('sha256').update(chunks.map((c) => `${c.type}|${c.method}|${c.revision}|${c.text}`).join('\n')).digest('hex').slice(0, 12);
  const equipmentCatalog = Object.keys(procs).flatMap((m) => (procs[m].equipment || []).map((e) => `${m}: ${e[0]} — ${e[1]}`)).join('\n');
  return { chunks, df, N: chunks.length, version, documentCount: documents.length, equipmentCatalog };
}

export function retrieve(kb, question, { method = null, lang = 'en', limit = 6, prefer = null } = {}) {
  const q = new Set(tokens(question));
  if (!q.size) return [];
  const scored = [];
  for (const c of kb.chunks) {
    if (c.lang !== lang && !(c.type === 'AQCS' || c.type === 'AQCS_DRAFT')) continue;
    let score = 0;
    q.forEach((w) => { if (c.terms.has(w)) { const idf = Math.log(1 + kb.N / (kb.df[w] || 1)); score += idf; if (c.secTerms && c.secTerms.has(w)) score += idf * 0.8; } });
    if (!score) continue;
    if (method && method !== 'OTH') score *= c.method === method ? 2 : 0.5;
    if (c.type === 'AQCS') score *= 1.5;
    if (prefer && c.type === prefer) score *= 2;
    scored.push([score, c]);
  }
  const seen = new Set();
  return scored.sort((a, b) => b[0] - a[0]).filter(([s, c]) => {
    const key = `${c.type}|${c.text}`;
    if (s < 2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit).map(([, c]) => c);
}

export function publicSource(chunk, index, lang) {
  return {
    tag: `S${index + 1}`,
    type: chunk.type,
    typeLabel: (SOURCE_TYPES[chunk.type] || {})[lang] || chunk.type,
    method: chunk.method,
    source: chunk.source,
    section: chunk.section,
    revision: chunk.revision,
    excerpt: chunk.text.slice(0, 220)
  };
}
