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
  STUDY: { en: 'ASME/API study guide (learning summary, verify the code edition)', fr: 'Guide d’étude ASME/API (résumé pédagogique, édition du code à vérifier)' }
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
    q.forEach((w) => { if (c.terms.has(w)) score += Math.log(1 + kb.N / (kb.df[w] || 1)); });
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
