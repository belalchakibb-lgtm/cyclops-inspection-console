// Captures the real CYCLOPS screens used by the video guide (cyclops-guide.js).
// Run again whenever the interface changes:  node tools/capture-guide.mjs [sceneId ...]
// It starts its own server and a hidden browser with a temporary profile (no real data is touched), drives the app,
// saves /guide/<lang>/<scene>.jpg and the position of the highlighted control in /guide/manifest.json.
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const PORT = 4199, DEBUG = 9339, W = 1280, H = 720;
const only = process.argv.slice(2);
const BROWSERS = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* In-page recipes. Each runs in order and returns through "target": a selector or JS expression for the highlight. */
const R = (id, run, target, wait = 500, keep = false) => ({ id, run, target, wait, keep });
const SCENES = [
  R('welcome', '', 'h1.brand'),
  R('header', '', '.cyhm-top ~ * , .head-actions', 300),
  R('drawer', `document.getElementById('menu-open').click();`, '.cyhm-drawer', 600),
  R('grid', `document.querySelector('.cyhm-menu').scrollIntoView();`, '.cyhm-grid', 500),
  R('tabs', `await g.proc('UT'); scrollTo(0,0);`, '#ptab', 800),
  R('anim', `await g.proc('UT'); g.see('.cy3 .cy3w');`, '.cy3 .cy3w', 4000),
  R('anim-bar', `await g.proc('UT'); g.see('.cy3'); document.querySelector('.cy3 [data-a="exp"]').click();`, '.cy3 .cy3bar', 4000),
  R('equip', `await g.proc('UT'); g.see('.equipment-grid');`, '.equipment-grid', 600),
  R('equip3d', `await g.proc('UT'); CY3.openEquipment('UT', 0);`, '.cy-equipment-info', 3500),
  R('steps', `await g.proc('UT'); const ds=[...document.querySelectorAll('#pbody > details')]; const c=ds[ds.length-1]; c.open=true; ds.filter(d=>!d.classList.contains('cy3')&&!d.className).slice(1,3).forEach(d=>d.open=true); g.see(ds.filter(d=>!d.className)[1]||c);`, `[...document.querySelectorAll('#pbody > details')].filter(d=>!d.className)[1]`, 600),
  R('search', `await g.proc('UT'); scrollTo(0,0);`, '#photo-dropzone', 500),
  R('course', `await g.proc('UT'); CY3.openCourse('UT');`, '.cy-course-layout', 3500),
  R('pro', `CYPRO.open('UT'); await g.wait(200); document.querySelector('.cypc [data-pc-i="1"]').click();`, '.cypc-table', 600),
  R('ut-lib', `await g.sim('UT','.cyut','library'); document.querySelector('.cyut [data-type="crack"]').click(); g.see('.cyut-ascan');`, '.cyut-ascan', 900),
  R('ut-ctrl', `await g.sim('UT','.cyut','library'); g.see('.cyut-ctrl');`, '.cyut-ctrl', 800),
  R('ut-ex', `await g.sim('UT','.cyut','exercise'); g.see('.cyut-ex');`, '.cyut-ex', 900),
  R('ut-dac', `await g.sim('UT','.cyut','dac'); g.see('.cyut-step');`, '.cyut-step', 900),
  R('ut-explore', `await g.sim('UT','.cyut','explore'); g.see('.cyut-ex');`, '.cyut-ex', 900),
  R('rt-steps', `await g.sim('RT','.cyrt','steps'); g.see('.cyrt canvas');`, '.cyrt canvas', 1500),
  R('rt-atlas', `await g.sim('RT','.cyrt','atlas'); g.see([...document.querySelectorAll('.cyrt canvas')].find((c) => c.offsetWidth > 200));`, `[...document.querySelectorAll('.cyrt canvas')].find((c) => c.offsetWidth > 200)`, 1200),
  R('mt-sim', `await g.proc('MT'); g.see('.cymt canvas');`, '.cymt canvas', 1500),
  R('pt-sim', `await g.proc('PT'); g.see('.cypt canvas');`, '.cypt canvas', 1500),
  R('ac-path', `CYACADEMY.open('path');`, '.cyac-level', 600),
  R('ac-basics', `CYACADEMY.open('basics');`, '.cyac-grid', 600),
  R('ac-cnd', `CYACADEMY.open('cnd');`, '.cyac-cnd', 1200),
  R('ac-dict', `CYACADEMY.open('dict'); document.querySelector('.cyac [data-term="crack"], .cyac [data-term]').click();`, '.cyac-term', 800),
  R('ac-lab', `CYACADEMY.open('lab');`, '.cyac-grid', 700),
  R('ac-progress', `CYACADEMY.open('progress');`, '.cyac-dash', 900),
  R('chal', `CYACADEMY.open('chal');`, '.cych-home', 700),
  R('scen-list', `CYACADEMY.open('scen');`, '.cysc-mission', 700),
  R('scen-step', `CYACADEMY.open('scen'); await g.wait(200); document.querySelector('.cyac-scen [data-start="ut-pipe"]').click(); await g.wait(100); document.querySelector('.cyac-scen [data-opt="0"]').click();`, '.cysc-opts', 500),
  R('scen-debrief', `CYACADEMY.open('scen'); await g.wait(200); const q=()=>document.querySelector('.cyac-scen'); q().querySelector('[data-quit]')?.click(); await g.wait(60); q().querySelector('[data-start="pt-flange"]').click(); await g.wait(60); let n=0; while(q().querySelector('[data-validate]') && n++<12){ const o=[...q().querySelectorAll('[data-opt]')]; if(o.length){ (n%3?q().querySelector('[data-opt="0"]'):q().querySelector('[data-opt="1"]')).click(); await g.wait(20);} const ord=q().querySelectorAll('[data-ord]'); if(ord.length){ for(let k=0;k<8;k++){ q().querySelector('[data-ord="'+k+'"]')?.click(); await g.wait(5);} } q().querySelector('[data-validate]').click(); await g.wait(20); q().querySelector('[data-next]').click(); await g.wait(20);} `, '.cysc-debrief, .cysurf-score', 500),
  R('coach', `CYACADEMY.open('coach'); await g.wait(300); g.see('.cyin-mis');`, '.cyin-mis', 700),
  R('quiz', `document.getElementById('home-view').hidden=true; document.getElementById('quiz-open').click();`, '#quiz-view', 600),
  R('ai', `CY3.open();`, '.cyf', 2500),
  R('ai-answer', `CY3.open(); await g.wait(300); const n=document.querySelector('[data-cx="new"]'); if(n) n.click(); CY3.send(lang==='fr'?'C’est quoi une courbe DAC ? Réponds en trois phrases simples.':'What is a DAC curve? Answer in three simple sentences.'); for(let i=0;i<90 && !document.querySelector('.cy-src');i++) await g.wait(500);`, '.cyc', 500),
  R('teacher', `CYSTUDY.open(0);`, '.cyst-wrap', 3500),
  R('lab-hub', `CYLAB.open();`, '.cylab-hub', 600),
  R('work', `CYWORK.open('ut-path'); await g.wait(200); g.see('.cyws-layout');`, '.cyws-layout', 500),
  R('twin', `CYTWIN.open('APVG');`, '.cytw-two', 4000),
  R('twin-op', `CYTWIN.open('APVG'); await g.wait(200); document.querySelector('.cytw [data-tw-tab="operate"]').click(); await g.wait(100); const s=document.querySelector('.cytw [data-op="p"]'); s.value='9.6'; s.dispatchEvent(new Event('input',{bubbles:true})); await g.wait(100); g.see('.cytw [data-op-out]');`, '.cytw [data-op-out]', 500),
  R('twin-test', `CYTWIN.open('APVG'); await g.wait(200); document.querySelector('.cytw [data-tw-tab="inspect"]').click(); await g.wait(60); document.querySelector('.cytw [data-tw-test="thick"]').click(); await g.wait(60); for(let i=0;i<5;i++){ document.querySelector('.cytw [data-cml="'+i+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); await g.wait(30);} g.see('.cytw .cytw-two');`, '.cytw .cytw-two', 500),
  R('defects', `CYDEF.open('lof'); await g.wait(500); document.querySelector('.cydf [data-df-m="UT"]').click();`, '.cydf-layout', 4000),
  R('ft-list', `document.getElementById('home-view').hidden=true; await CYTOOLS.open(); for (let i = 0; i < 40 && !document.querySelector('[data-ft="new"],[data-ft="list"]'); i++) await g.wait(200); document.querySelector('[data-ft="list"]')?.click(); for (let i = 0; i < 40 && !document.querySelector('[data-ft="new"]'); i++) await g.wait(200); document.querySelector('[data-ft="new"]').click();`, '.ft-new', 400),
  R('ft-check', `document.querySelector('#ft-new-method').value='UT'; document.querySelector('[data-ft="create"]').click(); await g.wait(300); const r=document.querySelector('[data-info="reference"]'); if(r){r.value='UT-0147'; r.dispatchEvent(new Event('input',{bubbles:true}));} await g.wait(450); document.querySelector('.ft-tabs [data-tab="checklist"]').click(); await g.wait(250); [...document.querySelectorAll('.ft-ci')].slice(0,4).forEach((c,i)=>c.querySelector(i===2?'[data-status="na"]':'[data-status="ok"]').click()); await g.wait(250); scrollTo(0,0);`, '.ft-check', 400, true),
  R('ft-ind', `document.querySelector('.ft-tabs [data-tab="indications"]').click(); await g.wait(250); document.querySelector('[data-ft="add-ind"]').click(); await g.wait(300); scrollTo(0,0);`, '.ft-body', 400, true),
  R('ft-report', `document.querySelector('.ft-tabs [data-tab="report"]').click(); await g.wait(300); g.see('.ft-body');`, '.ft-body', 400, true),
  R('route', `document.querySelector('.cyhm-menu').scrollIntoView();`, '[data-hm="basics"]', 500)
];

const PRELUDE = `window.g = {
  wait: (ms) => new Promise((r) => setTimeout(r, ms)),
  see: (s) => { const e = typeof s === 'string' ? document.querySelector(s) : s; if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); },
  reset: async () => { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); if (document.fullscreenElement) await document.exitFullscreen(); if (window.CYHOME) CYHOME.show(); scrollTo({ top: 0, behavior: 'instant' }); await g.wait(120); },
  proc: async (m) => { CYHOME.procedures(m); await g.wait(800); },
  sim: async (m, sel, mode) => { CYHOME.procedures(m, sel, mode); await g.wait(900); const b = document.querySelector(sel + ' [data-mode="' + mode + '"]'); if (b) b.click(); await g.wait(200); }
};
document.documentElement.style.scrollBehavior = 'auto';`;

// plausible demo progress so the coach and analytics screens have content (temporary profile only)
const SEED = `(async () => {
  const now = Date.now(), d = 864e5, A = ['UT','UT','UT','RT','RT','MT','PT','VT','APVG','APVG','APL','APE','CODES'];
  const log = []; for (let i = 0; i < 90; i++) { const a = A[i % A.length], ok = i % 3 !== 0 || i > 62; log.push({ t: now - (90 - i) * d * 0.45, src: 'challenge', area: a, skill: ['calc','interp','knowledge','decision'][i % 4], ok, q: lang_q(a), given: ok ? 46 : 92, right: 46, unit: 'mm', why: ['Pulse-echo sound travels there and back, so depth = V × t ÷ 2.', 'Le son fait l’aller-retour : profondeur = V × t ÷ 2.'] }); }
  function lang_q() { return ['A 0° probe in steel receives an echo 15.5 µs after the pulse. How deep is the reflector?', 'Un traducteur 0° dans l’acier reçoit un écho 15,5 µs après l’émission. À quelle profondeur est le réflecteur ?']; }
  const time = {}; for (let i = 0; i < 14; i++) time[new Date(now - i * d).toISOString().slice(0, 10)] = 300 + (i * 397) % 1900;
  localStorage.setItem('cyclops-insight-v1', JSON.stringify({ log, act: [{ t: now - d, id: 'ut-dac' }, { t: now - 2 * d, id: 'mt-sim' }, { t: now - 3 * d, id: 'quiz:beginner', score: 80 }], time }));
  const ev = {}; ['basic:b1','basic:b2','basic:b3','dict:crack','dict:weld','lab:UT:0','mod:UT:what','mod:UT:how','ut-explore'].forEach((k) => { ev[k] = { n: 1, ok: 1, first: '2026-10-20', last: '2026-11-02' }; }); ev['quiz:beginner'] = { n: 2, ok: 2, first: '2026-10-25', last: '2026-11-02', best: 80 };
  const days = []; for (let i = 0; i < 6; i++) days.push(new Date(now - i * d).toISOString().slice(0, 10));
  localStorage.setItem('cyclops-academy-v1', JSON.stringify({ ev, days, name: '' }));
})();`;

/* ---------- minimal DevTools protocol client (built-in WebSocket) ---------- */
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } }); }
  raw(method, params) { return new Promise((resolve, reject) => { const id = ++this.id; this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); }); }
  // during a navigation the page is briefly detached: wait and try again
  async send(method, params = {}) { for (let i = 0; ; i++) { try { return await this.raw(method, params); } catch (e) { if (i >= 40 || !/not attached|active page|context/i.test(e.message)) throw e; await sleep(500); } } }
  async ev(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text); return r.result.value; }
}
async function retry(fn, n = 60) { for (let i = 0; i < n; i++) { try { return await fn(); } catch { await sleep(300); } } throw new Error('timed out: ' + fn); }

const browserPath = BROWSERS.find((p) => existsSync(p)); if (!browserPath) throw new Error('No Chrome or Edge found.');
const env = { ...process.env, PORT: String(PORT), HOST: '127.0.0.1', AUDIT_LOG: 'off' }; delete env.CYCLOPS_USERS; delete env.SESSION_SECRET; delete env.NVIDIA_MODEL; delete env.NODE_ENV;
const server = spawn(process.execPath, ['server.mjs'], { cwd: root, env, stdio: 'ignore' });
const profile = await mkdtemp(join(tmpdir(), 'cyclops-guide-'));
const browser = spawn(browserPath, ['--headless=new', `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`, `--window-size=${W},${H}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio', '--no-first-run', '--disable-extensions', 'about:blank'], { stdio: 'ignore' });
let failed = 0;
try {
  const url = `http://127.0.0.1:${PORT}/`;
  await retry(async () => { const r = await fetch(url + 'api/health'); if (!r.ok) throw new Error(); });
  const targets = await retry(async () => (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json());
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  const c = new CDP(ws);
  await c.send('Page.enable'); await c.send('Runtime.enable');
  await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await c.send('Page.navigate', { url }); await sleep(2500);
  await c.ev(SEED); await c.send('Page.reload'); await sleep(3000);
  const manifestPath = join(root, 'guide', 'manifest.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};
  for (const lang of ['en', 'fr']) {
    await mkdir(join(root, 'guide', lang), { recursive: true });
    manifest[lang] = manifest[lang] || {};
    await c.send('Page.reload'); await sleep(3000);
    await c.ev(PRELUDE);
    await c.ev(`(() => { const s = document.getElementById('lang'); s.checked = ${lang === 'en'}; s.dispatchEvent(new Event('change')); })()`); await sleep(500);
    for (const s of SCENES) {
      if (only.length && !only.includes(s.id) && !s.keep && !only.some((x) => x.startsWith('ft-') && s.id === 'ft-list')) continue;
      if (only.length && s.keep && !only.some((x) => x.startsWith('ft-'))) continue;
      try {
        if (!s.keep) await c.ev('g.reset()');
        await c.ev(`(async () => { ${s.run} })()`);
        await sleep(s.wait);
        const target = s.target.startsWith('[...') ? s.target : `document.querySelector(${JSON.stringify(s.target)})`;
        const rect = await c.ev(`(() => { const e = ${target}; if (!e) return null; const b = e.getBoundingClientRect(); const x = Math.max(0, b.left), y = Math.max(0, b.top), r = Math.min(innerWidth, b.right), t = Math.min(innerHeight, b.bottom); if (r - x < 4 || t - y < 4) return null; return [x / innerWidth, y / innerHeight, (r - x) / innerWidth, (t - y) / innerHeight].map((v) => +v.toFixed(4)); })()`);
        if (!rect) { console.log(`MISSING target ${lang}/${s.id}: ${s.target}`); failed++; }
        manifest[lang][s.id] = rect;
        const shot = await c.send('Page.captureScreenshot', { format: 'jpeg', quality: 74 });
        await writeFile(join(root, 'guide', lang, s.id + '.jpg'), Buffer.from(shot.data, 'base64'));
        console.log(`${lang}/${s.id} ok ${rect ? rect.join(',') : ''}`);
      } catch (e) { failed++; console.log(`FAILED ${lang}/${s.id}: ${String(e.message).slice(0, 200)}`); }
    }
  }
  await writeFile(manifestPath, JSON.stringify(manifest));
  ws.close();
} finally {
  browser.kill(); server.kill();
  await sleep(800); await rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(() => {});
}
console.log(failed ? `Done with ${failed} problem(s).` : 'Done: all scenes captured.');
