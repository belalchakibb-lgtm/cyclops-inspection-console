/* CYCLOPS 3D course videos: plays a professional course as a narrated film.
   Each slide becomes a real-time 3D scene (Three.js, loaded on demand) whose story advances with the voice:
   one "beat" per narrated point. The text, tables, badges and sources come from the course itself, so the film
   can never drift from the slides. Scenes are illustrations, not to scale and never inspection results.
   Scene builders live in cyclops-film-scenes.js.
   window.CYFILM = { play(course, slideIndex, { onSlide, onClose }), available(), state(), go(i) } */
(function () {
  'use strict';
  const L = (en, fr) => (typeof lang !== 'undefined' && lang === 'fr') ? fr : en;
  const T2 = (p) => (Array.isArray(p) ? L(p[0], p[1]) : p);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
dialog.cyfilm { width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: #060b18; color: #e8f0ff; }
dialog.cyfilm::backdrop { background: #000; }
.cyf-wrap { display: grid; grid-template-rows: minmax(0, 1fr) auto; grid-template-columns: minmax(0, 1fr); height: 100%; }
.cyf-wrap.has-table { grid-template-columns: minmax(0, 1fr) minmax(280px, 30%); }
.cyf-stage { position: relative; overflow: hidden; min-height: 0; background: radial-gradient(circle at 50% 30%, #16264d, #070c1b 72%); }
.cyf-stage canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.cyf-top { position: absolute; top: 12px; left: 14px; right: 60px; pointer-events: none; text-shadow: 0 1px 6px #000; }
.cyf-top small { display: block; color: #7cc4ff; font-weight: 700; font-size: 12px; } .cyf-top b { font-size: 19px; }
.cyf-close { position: absolute; top: 10px; right: 12px; z-index: 5; width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255,255,255,.3); background: rgba(6,11,24,.7); color: #fff; font-size: 16px; cursor: pointer; }
.cyf-facts { position: absolute; top: 66px; left: 14px; display: grid; gap: 6px; max-width: min(46%, 420px); pointer-events: none; }
.cyf-facts div { background: rgba(9,17,38,.86); border-left: 3px solid #3da9ff; border-radius: 6px; padding: 5px 10px; font-size: 14px; font-weight: 600; animation: cyf-in .4s ease-out; }
.cyf-facts .ok { border-color: #42c991; } .cyf-facts .bad { border-color: #e66b78; } .cyf-facts .warn { border-color: #e2b324; }
.cyf-card { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; padding: 20px; background: rgba(6,11,24,.62); pointer-events: none; opacity: 0; transition: opacity .5s; }
.cyf-card.on { opacity: 1; } .cyf-card small { color: #7cc4ff; font-weight: 700; letter-spacing: .08em; } .cyf-card h2 { margin: 6px 0 0; font-size: clamp(24px, 4.4vw, 44px); }
.cyf-cap { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); width: min(92%, 880px); background: rgba(5,10,24,.84); border-radius: 10px; padding: 9px 14px; font-size: clamp(14px, 1.7vw, 17px); line-height: 1.42; color: #9fb0d6; }
.cyf-cap:empty { display: none; } .cyf-cap b { color: #fff; font-weight: 600; }
.cyf-q { position: absolute; inset: 0; display: none; place-content: center; padding: 16px; background: rgba(6,11,24,.74); z-index: 4; } .cyf-q.on { display: grid; }
.cyf-q > div { width: min(640px, 92vw); background: #101a38; border: 1px solid #2c3d70; border-radius: 12px; padding: 14px 16px; max-height: 90%; overflow: auto; }
.cyf-q button { display: block; width: 100%; text-align: left; margin: 5px 0; padding: 8px 10px; border-radius: 8px; border: 1px solid #2c3d70; background: #17244a; color: #e8f0ff; font: inherit; cursor: pointer; }
.cyf-q .ok { border-color: #42c991; background: rgba(28,106,78,.5); } .cyf-q .ko { border-color: #e66b78; background: rgba(130,47,61,.5); }
.cyf-panel { display: none; overflow: auto; padding: 12px 14px; background: #0c1430; border-left: 1px solid #22305c; } .has-table .cyf-panel { display: block; }
.cyf-panel h3 { margin: 0 0 6px; font-size: 14px; color: #7cc4ff; } .cyf-panel .cypc-table { font-size: 13px; animation: cyf-in .5s ease-out; }
.cyf-hint { font-size: 12px; color: #9fb0d6; margin-top: 8px; }
.cyf-bar { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 7px 12px; background: #0a1128; border-top: 1px solid #22305c; }
.cyf-bar button { height: 34px; min-width: 38px; padding: 0 10px; border-radius: 8px; border: 1px solid #2c3d70; background: #17244a; color: #e8f0ff; font: inherit; cursor: pointer; }
.cyf-bar button.main { background: #2b7fd8; border-color: #2b7fd8; font-weight: 700; }
.cyf-line { flex: 1 1 240px; display: flex; gap: 2px; height: 16px; align-items: center; min-width: 160px; }
.cyf-line button { flex: 1; min-width: 0; height: 8px; padding: 0; border-radius: 2px; border: 0; background: rgba(255,255,255,.18); position: relative; } .cyf-line button:hover { height: 14px; }
.cyf-line button.seen { background: #2b7fd8; } .cyf-line button.on { background: #7cc4ff; height: 14px; }
.cyf-note { font-size: 11px; color: #8796bd; }
@keyframes cyf-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (max-width: 760px) { .cyf-wrap.has-table { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) minmax(0, 26dvh) auto; } .has-table .cyf-panel { border-left: 0; border-top: 1px solid #22305c; } .cyf-facts { max-width: 62%; } .cyf-facts div { font-size: 12px; } .cyf-note { display: none; } }
`;

  /* ---------- Three.js: one renderer, reused between films ---------- */
  let THREE = null, renderer = null, env = null, glFailed = false, loading = null;
  function loadThree() {
    if (!loading) loading = import(new URL('./vendor/three.module.min.js', document.baseURI).href).then((m) => { THREE = m; return initRenderer(); }).catch((e) => { glFailed = true; console.warn('CYCLOPS film: 3D unavailable', e); });
    return loading;
  }
  function initRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const room = new THREE.Scene();
      room.add(new THREE.Mesh(new THREE.BoxGeometry(24, 12, 24), new THREE.MeshBasicMaterial({ color: 0x39435a, side: THREE.BackSide })));
      const panel = (w, h, p, r, k, col) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col || 0xffffff).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...p); m.rotation.set(...r); room.add(m); };
      panel(12, 5, [0, 5.9, 0], [Math.PI / 2, 0, 0], 6); panel(5, 7, [-11.9, 1, 3], [0, Math.PI / 2, 0], 3.5, 0xffe2c4); panel(5, 7, [11.9, 0, -4], [0, -Math.PI / 2, 0], 2.4, 0xbcd4ff);
      const pm = new THREE.PMREMGenerator(renderer); env = pm.fromScene(room, 0.04).texture; pm.dispose();
    } catch (e) { glFailed = true; renderer = null; console.warn('CYCLOPS film: WebGL unavailable', e); }
  }

  /* ---------- scene toolkit given to every builder ---------- */
  function makeKit(beats, addFact) {
    const T = THREE, scene = new T.Scene(), BG = 0x0a1226;
    scene.background = new T.Color(BG); scene.fog = new T.Fog(BG, 26, 60); scene.environment = env; scene.environmentIntensity = 0.75;
    scene.add(new T.HemisphereLight(0xbfd4ff, 0x1a2036, 0.55));
    const sun = new T.DirectionalLight(0xfff2e0, 2.1); sun.position.set(7, 14, 9); sun.castShadow = true; sun.shadow.mapSize.set(1536, 1536);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 44 }); sun.shadow.bias = -0.0006; scene.add(sun);
    const floor = new T.Mesh(new T.CircleGeometry(60, 48), new T.MeshStandardMaterial({ color: 0x10182f, roughness: 0.82, metalness: 0.15 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new T.GridHelper(60, 60, 0x24365f, 0x18243f); grid.position.y = 0.005; grid.material.transparent = true; grid.material.opacity = 0.42; scene.add(grid);
    const root = new T.Group(); scene.add(root);
    const reveals = [], ticks = [], screens = [], lastBeat = Math.max(0, beats - 1);
    const std = (color, roughness, metalness, extra) => new T.MeshStandardMaterial(Object.assign({ color, roughness, metalness }, extra || {}));
    const m = {
      steel: std(0xa3aebb, 0.38, 0.88), dark: std(0x59636f, 0.5, 0.75), iron: std(0x363d48, 0.6, 0.6), blue: std(0x2f6fb5, 0.45, 0.35), yellow: std(0xe2b324, 0.45, 0.2), red: std(0xd33f3f, 0.45, 0.2), green: std(0x35b57d, 0.45, 0.2), orange: std(0xe0792b, 0.48, 0.2),
      weld: std(0xc4b396, 0.62, 0.65), rubber: std(0x191c22, 0.85, 0), copper: std(0xc77b4a, 0.35, 0.9), brass: std(0xc8a24b, 0.35, 0.9), white: std(0xe8edf5, 0.65, 0), paper: std(0xf3efe2, 0.9, 0), black: std(0x07090d, 0.7, 0.1), lead: std(0x6d7480, 0.62, 0.55), wood: std(0x7c5a3a, 0.8, 0),
      ghost: std(0xc2d4ec, 0.3, 0.1, { transparent: true, opacity: 0.5, depthWrite: false }), glass: std(0xc8e2ff, 0.08, 0, { transparent: true, opacity: 0.26, depthWrite: false }), water: std(0x3d9be0, 0.15, 0, { transparent: true, opacity: 0.55, depthWrite: false }), inklight: std(0xf2f4f7, 0.95, 0)
    };
    const glow = (color, opacity) => new T.MeshBasicMaterial(opacity != null ? { color, transparent: true, opacity, depthWrite: false } : { color });
    function on(obj, beat) { obj.visible = false; reveals.push({ obj, beat: Math.min(beat, lastBeat), base: obj.scale.clone(), t0: null }); return obj; }
    function place(mesh, x, y, z, o) {
      o = o || {}; mesh.position.set(x || 0, y || 0, z || 0);
      if (o.rx) mesh.rotation.x = o.rx; if (o.ry) mesh.rotation.y = o.ry; if (o.rz) mesh.rotation.z = o.rz;
      mesh.castShadow = o.shadow !== false; mesh.receiveShadow = true; (o.parent || root).add(mesh);
      if (o.beat != null) on(mesh, o.beat);
      return mesh;
    }
    const box = (w, h, d, mat, x, y, z, o) => place(new T.Mesh(new T.BoxGeometry(w, h, d), mat), x, y, z, o);
    const cyl = (r, h, mat, x, y, z, o) => {
      o = o || {}; const mesh = new T.Mesh(new T.CylinderGeometry(o.r2 != null ? o.r2 : r, r, h, o.seg || 32, 1, !!o.open), mat);
      if (o.axis === 'x') o = Object.assign({}, o, { rz: Math.PI / 2 }); if (o.axis === 'z') o = Object.assign({}, o, { rx: Math.PI / 2 });
      return place(mesh, x, y, z, o);
    };
    const sph = (r, mat, x, y, z, o) => place(new T.Mesh(new T.SphereGeometry(r, 24, 16), mat), x, y, z, o);
    const torus = (R, r, mat, x, y, z, o) => place(new T.Mesh(new T.TorusGeometry(R, r, 14, 48, (o && o.arc) || Math.PI * 2), mat), x, y, z, o);
    const lathe = (pts, mat, x, y, z, o) => place(new T.Mesh(new T.LatheGeometry(pts.map((p) => new T.Vector2(p[0], p[1])), 36), mat), x, y, z, o);
    const prism = (pts, depth, mat, x, y, z, o) => { const s = new T.Shape(pts.map((p) => new T.Vector2(p[0], p[1]))); const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: false }); g.translate(0, 0, -depth / 2); return place(new T.Mesh(g, mat), x, y, z, o); };
    const group = (x, y, z, o) => { const g = new T.Group(); return place(g, x, y, z, o); };
    const v3 = (p) => new T.Vector3(p[0], p[1], p[2]);
    const tube = (pts, r, mat, o) => { const g = new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v3)), Math.max(24, pts.length * 12), r, 10, false); return place(new T.Mesh(g, mat), 0, 0, 0, o); };
    // straight-segment beam that draws itself when its beat arrives
    function beam(pts, color, o) {
      o = o || {}; const path = new T.CurvePath(); for (let i = 1; i < pts.length; i++) path.add(new T.LineCurve3(v3(pts[i - 1]), v3(pts[i])));
      const g = new T.TubeGeometry(path, Math.max(40, pts.length * 28), o.r || 0.045, 8, false), mesh = new T.Mesh(g, glow(color, o.opacity)), total = g.index.count, beatN = Math.min(o.beat || 0, lastBeat), dur = o.dur || 1.6; let t0 = null;
      place(mesh, 0, 0, 0, { shadow: false, parent: o.parent }); g.setDrawRange(0, 0); mesh.visible = false;
      ticks.push((t, b) => { if (b < beatN) return; if (t0 == null) { t0 = t; mesh.visible = true; } g.setDrawRange(0, Math.floor(total * clamp((t - t0) / dur, 0, 1) / 6) * 6); });
      return mesh;
    }
    // small bright dots running along a path (sound, current, rays, field)
    function pulses(pts, color, o) {
      o = o || {}; const n = o.n || 6, r = o.r || 0.09, speed = o.speed || 2.4, beatN = Math.min(o.beat || 0, lastBeat), end = o.until != null ? o.until : Infinity, vs = pts.map(v3), seg = [], geo = new T.SphereGeometry(r, 12, 8), mat = glow(color), dots = []; let len = 0;
      for (let i = 1; i < vs.length; i++) { const d = vs[i].distanceTo(vs[i - 1]); seg.push(d); len += d; }
      for (let i = 0; i < n; i++) { const s = new T.Mesh(geo, mat); s.visible = false; (o.parent || root).add(s); dots.push(s); }
      ticks.push((t, b) => { const show = b >= beatN && b <= end; dots.forEach((s, i) => { s.visible = show; if (!show) return; let d = (t * speed + i * len / n) % len, k = 0; while (k < seg.length - 1 && d > seg[k]) { d -= seg[k]; k++; } s.position.lerpVectors(vs[k], vs[k + 1], clamp(d / seg[k], 0, 1)); }); });
      return dots;
    }
    // particles that fly in and settle on targets
    function swarm(n, target, color, o) {
      o = o || {}; const beatN = Math.min(o.beat || 0, lastBeat), geo = new T.SphereGeometry(o.r || 0.045, 8, 6), mat = glow(color), list = []; let t0 = null;
      for (let i = 0; i < n; i++) { const s = new T.Mesh(geo, mat), to = target(i, n), from = [to[0] + (Math.random() - 0.5) * (o.spread || 3), to[1] + 1 + Math.random() * 2.4, to[2] + (Math.random() - 0.5) * (o.spread || 3)]; s.visible = false; (o.parent || root).add(s); list.push({ s, from: v3(from), to: v3(to), d: Math.random() * 0.9 }); }
      ticks.push((t, b) => { if (b < beatN) return; if (t0 == null) t0 = t; list.forEach((p) => { const k = clamp((t - t0 - p.d) / 1.1, 0, 1), e = 1 - (1 - k) * (1 - k); p.s.visible = k > 0; p.s.position.lerpVectors(p.from, p.to, e); }); });
      return list;
    }
    function text(str, x, y, z, o) {
      o = o || {}; const label = String(T2(str)), size = o.size || 0.42, cv = document.createElement('canvas'), g = cv.getContext('2d'), fs = 46, pad = o.bg === false ? 4 : 20, font = `${o.bold === false ? 500 : 700} ${fs}px "Segoe UI", system-ui, sans-serif`;
      g.font = font; const w = Math.ceil(g.measureText(label).width) + pad * 2, h = fs + 24; cv.width = w; cv.height = h; g.font = font; g.textBaseline = 'middle';
      if (o.bg !== false) { g.fillStyle = o.bg || 'rgba(9,17,38,.86)'; g.beginPath(); if (g.roundRect) g.roundRect(0, 0, w, h, 12); else g.rect(0, 0, w, h); g.fill(); }
      g.fillStyle = o.color || '#f3f7ff'; g.fillText(label, pad, h / 2 + 2);
      const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false })); sp.scale.set(size * w / h, size, 1); sp.renderOrder = 20;
      if (o.align === 'left') sp.center.set(0, 0.5);
      return place(sp, x, y, z, { shadow: false, parent: o.parent, beat: o.beat });
    }
    // a canvas drawn surface (instrument screen, film, gauge...). draw(ctx, W, H, beat, secondsInBeat, t)
    function screen(w, h, x, y, z, draw, o) {
      o = o || {}; const cv = document.createElement('canvas'); cv.width = o.pw || 512; cv.height = o.ph || Math.round(cv.width * h / w);
      const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      const mesh = place(new T.Mesh(new T.PlaneGeometry(w, h), o.lit ? new T.MeshStandardMaterial({ map: tex, roughness: 0.7 }) : new T.MeshBasicMaterial({ map: tex })), x, y, z, Object.assign({}, o, { shadow: false }));
      const ctx = cv.getContext('2d'); let last = -1; const paint = (b, bt, t) => { draw(ctx, cv.width, cv.height, b, bt, t); tex.needsUpdate = true; };
      paint(0, 0, 0); if (!o.still) screens.push((t, b, bt) => { if (t - last < 0.09) return; last = t; paint(b, bt, t); });
      return mesh;
    }
    const fact = (beat, str, tone) => addFact(Math.min(beat, lastBeat), T2(str), tone);
    const update = (t, b, bt, dt) => {
      for (const r of reveals) { if (b < r.beat) continue; if (r.t0 == null) { r.t0 = t; r.obj.visible = true; } const k = clamp((t - r.t0) / 0.6, 0, 1), e = reduced ? 1 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2); r.obj.scale.copy(r.base).multiplyScalar(Math.max(0.001, e)); }
      for (const f of ticks) f(t, b, bt, dt);
      for (const f of screens) f(t, b, bt);
    };
    const dispose = () => { scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; mats.forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); }); }); Object.values(m).forEach((x) => x.dispose()); };
    return { T, scene, root, m, glow, std, box, cyl, sph, torus, lathe, prism, group, tube, beam, pulses, swarm, text, screen, fact, on, tick: (f) => ticks.push(f), update, dispose, beats, cams: [[0, 6, 16, 0, 2, 0]] };
  }

  /* ---------- player ---------- */
  const st = { dlg: null, course: null, slides: [], i: 0, b: 0, sent: 0, playing: false, voice: true, rate: 1, tok: 0, timer: 0, wd: 0, raf: 0, kit: null, cam: null, t: 0, bt: 0, last: 0, opts: null, sceneKey: '', pendingFacts: [], fps: 60, frames: 0, ft: 0, pr: 1.5, resize: null, err: null, finished: false, intro: false };
  const q = (s) => st.dlg.querySelector(s);
  const synth = () => (typeof speechSynthesis !== 'undefined' ? speechSynthesis : null);
  const silence = () => { st.tok++; clearTimeout(st.timer); clearTimeout(st.wd); const s = synth(); if (s) s.cancel(); };

  function sceneFor(course, slide) {
    const S = window.CYFILM_SCENES || {}, map = S.MAP && S.MAP[course];
    const entry = map && map[slide.t[0]];
    return entry ? { key: entry[0], args: entry[1] } : { key: 'fallback', args: null };
  }
  function buildScene() {
    if (!renderer) return; const s = st.slides[st.i], pick = sceneFor(st.course, s);
    if (st.kit) { st.kit.dispose(); st.kit = null; }
    st.pendingFacts = []; q('.cyf-facts').innerHTML = '';
    const kit = makeKit(s.b.length, (beat, str, tone) => st.pendingFacts.push({ beat, str, tone, on: false }));
    const S = window.CYFILM_SCENES || {};
    try { (S[pick.key] || S.fallback)(kit, pick.args || {}, s); st.sceneKey = pick.key; }
    catch (e) { console.error('CYCLOPS film scene', pick.key, e); st.err = pick.key + ': ' + e.message; st.pendingFacts = []; kit.dispose(); const k2 = makeKit(s.b.length, () => {}); S.fallback(k2, {}, s); st.kit = k2; st.sceneKey = 'fallback'; st.cam = null; return; }
    st.kit = kit; st.cam = null;
  }
  function showFacts() {
    const box = q('.cyf-facts'); for (const f of st.pendingFacts) if (!f.on && st.b >= f.beat) { f.on = true; const d = document.createElement('div'); d.textContent = f.str; if (f.tone) d.className = f.tone; box.appendChild(d); }
    while (box.children.length > 5) box.removeChild(box.firstChild);
  }
  const sentences = (t) => t.split(/(?<=[.!?:])\s+(?=[A-ZÀ-Ý0-9])/).filter(Boolean);
  function caption() {
    const s = st.slides[st.i], cap = q('.cyf-cap'); if (st.intro || !s.b[st.b]) { cap.innerHTML = ''; return; }
    const parts = sentences(T2(s.b[st.b])); cap.innerHTML = parts.map((p, k) => (k === st.sent ? `<b>${esc(p)}</b>` : esc(p))).join(' ');
  }
  function drawHud() {
    const s = st.slides[st.i], c = window.CYPRO.COURSES[st.course], wrap = q('.cyf-wrap');
    q('.cyf-top').innerHTML = `<small>${c.icon} ${esc(T2(c.name))} · ${st.i + 1}/${st.slides.length}</small><b>${esc(T2(s.t))}</b>`;
    wrap.classList.toggle('has-table', !!s.table);
    q('.cyf-panel').innerHTML = s.table ? `<h3>📋 ${L('Code values', 'Valeurs du code')}</h3><table class="cypc-table"><tr>${s.table.head.map((h) => `<th>${esc(T2(h))}</th>`).join('')}</tr>${s.table.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(T2(v))}</td>`).join('')}</tr>`).join('')}</table><p class="cypc-src"><span class="cypc-st ${s.table.st}">${s.table.st === 'checked' ? L('cross-checked', 'recoupé') : L('verify', 'à vérifier')}</span>${esc(s.table.src)} — ${L('working summary: check the edition in force.', 'résumé de travail : vérifiez l’édition en vigueur.')}</p>${s.tool ? `<p class="cyf-hint">🧮 ${L('A calculator for this is on the slide: close the video to use it.', 'Un calculateur est sur la diapositive : fermez la vidéo pour l’utiliser.')}</p>` : ''}` : '';
    q('.cyf-line').innerHTML = st.slides.map((x, k) => `<button type="button" data-f-i="${k}" class="${k === st.i ? 'on' : k < st.i ? 'seen' : ''}" title="${esc(T2(x.t))}" aria-label="${k + 1}. ${esc(T2(x.t))}"></button>`).join('');
    drawButtons(); fit();
  }
  function drawButtons() {
    q('[data-f-play]').textContent = st.finished ? '↻ ' + L('Replay', 'Revoir') : st.playing ? '⏸ ' + L('Pause', 'Pause') : '▶ ' + L('Play', 'Lecture');
    q('[data-f-voice]').textContent = st.voice ? '🔊' : '🔇'; q('[data-f-rate]').textContent = st.rate + '×';
  }
  function goto(i, autoplay) {
    silence(); st.i = clamp(i, 0, st.slides.length - 1); st.b = 0; st.sent = 0; st.t = 0; st.bt = 0; st.hold = 3; st.spoke = false; st.intro = false; st.finished = false; q('.cyf-q').classList.remove('on'); q('.cyf-card').style.pointerEvents = '';
    buildScene(); drawHud(); caption(); showFacts();
    if (st.opts.onSlide) st.opts.onSlide(st.slides[st.i].__idx);
    if (autoplay !== false && st.playing) intro(); else q('.cyf-card').classList.remove('on');
  }
  function intro() {
    const s = st.slides[st.i], my = ++st.tok, card = q('.cyf-card'); st.intro = true; st.spoke = true;
    card.innerHTML = `<small>${st.i + 1} / ${st.slides.length}</small><h2>${esc(T2(s.t))}</h2>`; card.classList.add('on'); caption();
    speak(T2(s.t), () => { if (my !== st.tok) return; st.timer = setTimeout(() => { if (my !== st.tok) return; card.classList.remove('on'); st.intro = false; st.sent = 0; caption(); narrate(); }, 300); }, 1.4);
  }
  function speak(text, next, minSec) {
    const S = synth(), my = st.tok, words = text.split(/\s+/).length, voices = S && st.voice ? S.getVoices().filter((x) => x.lang && x.lang.toLowerCase().startsWith(L('en', 'fr'))) : [];
    let fired = false; const go = () => { if (fired || my !== st.tok) return; fired = true; clearTimeout(st.wd); next(); };
    if (voices.length) {
      const u = new SpeechSynthesisUtterance(text); u.lang = L('en-US', 'fr-FR'); u.voice = voices.find((x) => /natural|online|neural|google/i.test(x.name)) || voices[0]; u.rate = st.rate; u.onend = go; u.onerror = go; S.speak(u);
      st.wd = setTimeout(go, (words / (1.2 * st.rate) + 6) * 1000); // some voices never fire onend
    } else st.wd = setTimeout(go, Math.max((minSec || 1.8) * 1000, words / (2.6 * st.rate) * 1000));
  }
  function narrate() {
    if (!st.playing) return; const s = st.slides[st.i], my = st.tok;
    if (st.b >= s.b.length) return endSlide();
    const parts = sentences(T2(s.b[st.b])); st.sent = clamp(st.sent, 0, parts.length - 1); caption(); showFacts();
    speak(parts[st.sent], () => { if (my !== st.tok) return; if (st.sent < parts.length - 1) { st.sent++; narrate(); return; } if (st.b < s.b.length - 1) { st.b++; st.bt = 0; st.sent = 0; narrate(); } else { st.b = s.b.length; narrate(); } });
  }
  function endSlide() {
    const s = st.slides[st.i], my = st.tok; st.b = s.b.length - 1;
    if (s.q && !s.__answered) return askQ(s);
    st.timer = setTimeout(() => { if (my !== st.tok) return; if (st.i < st.slides.length - 1) goto(st.i + 1); else finish(); }, 1500);
  }
  function askQ(s) {
    const box = q('.cyf-q'), order = s.q.o.map((_, k) => k).sort(() => Math.random() - 0.5);
    box.innerHTML = `<div><b>✅ ${esc(T2(s.q.q))}</b>${order.map((k) => `<button type="button" data-f-o="${k}">${esc(T2(s.q.o[k]))}</button>`).join('')}<div data-f-why></div><button type="button" data-f-skip style="margin-top:8px">⏭ ${L('Continue', 'Continuer')}</button></div>`;
    box.classList.add('on'); speak(T2(s.q.q), () => {});
  }
  function answer(k) {
    const s = st.slides[st.i], box = q('.cyf-q'); if (box.dataset.done === String(st.i)) return; box.dataset.done = String(st.i); const ok = k === s.q.a;
    box.querySelectorAll('[data-f-o]').forEach((x) => { const n = Number(x.dataset.fO); if (n === s.q.a) x.classList.add('ok'); else if (n === k) x.classList.add('ko'); });
    box.querySelector('[data-f-why]').innerHTML = `<p>${ok ? '✅' : '❌'} ${esc(T2(s.q.why))}</p>`;
    window.dispatchEvent(new CustomEvent('cy-answer', { detail: { src: 'pro-course', area: st.course, skill: 'codes', ok, q: s.q.q, given: s.q.o[k], right: s.q.o[s.q.a], why: s.q.why } }));
    silence(); speak(T2(s.q.why), () => {});
  }
  function finish() {
    silence(); st.playing = false; st.finished = true; const c = window.CYPRO.COURSES[st.course], card = q('.cyf-card'), hasExam = c.slides.some((x) => x.exam);
    card.innerHTML = `<small>${L('END OF THE VIDEO', 'FIN DE LA VIDÉO')}</small><h2>${esc(T2(c.name))}</h2><p style="pointer-events:auto;margin-top:14px">${hasExam ? `<button type="button" data-f-exam style="padding:10px 18px;border-radius:10px;border:0;background:#2b7fd8;color:#fff;font:inherit;font-weight:700;cursor:pointer">📝 ${L('Take the course exam', 'Passer l’examen du cours')}</button>` : ''}</p>`;
    card.classList.add('on'); card.style.pointerEvents = 'auto'; q('.cyf-cap').innerHTML = ''; drawButtons();
    window.dispatchEvent(new CustomEvent('cy-learn', { detail: { id: 'pro-video:' + st.course } }));
  }
  function togglePlay() {
    if (st.finished) { q('.cyf-card').style.pointerEvents = ''; st.playing = true; goto(0); return; }
    if (st.playing) { st.playing = false; silence(); st.intro = false; q('.cyf-card').classList.remove('on'); caption(); }
    else { st.playing = true; st.b = Math.min(st.b, st.slides[st.i].b.length - 1); if (!st.spoke) intro(); else narrate(); }
    drawButtons();
  }
  function fit() {
    if (!renderer || !st.dlg) return; const stage = q('.cyf-stage'), w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(st.pr); renderer.setSize(w, h, false);
  }
  function frame(now) {
    st.raf = requestAnimationFrame(frame); const dt = Math.min(0.1, (now - st.last) / 1000 || 0); st.last = now;
    if (!st.kit || !renderer) return;
    if (st.playing || st.hold > 0) { st.t += dt; st.bt += dt; st.hold -= dt; } // when paused, let entrances finish, then freeze
    st.kit.update(st.t, st.b, st.bt, dt); showFacts();
    const k = st.kit, cam = k.cams[Math.min(st.b, k.cams.length - 1)], c = camera(), aspect = c.aspect, far = Math.max(1.06, 1.85 / aspect); // narrow stages (table panel, phones): pull back so nothing is cropped
    const tx = cam[3], ty = cam[4], tz = cam[5], px = tx + (cam[0] - tx) * far, py = ty + (cam[1] - ty) * far, pz = tz + (cam[2] - tz) * far;
    if (!st.cam) { st.cam = { p: new THREE.Vector3(px + (px - tx) * 0.22, py + (py - ty) * 0.22, pz + (pz - tz) * 0.22), t: new THREE.Vector3(tx, ty, tz) }; }
    const a = 1 - Math.exp(-dt * 1.5); st.cam.p.lerp(new THREE.Vector3(px, py, pz), a); st.cam.t.lerp(new THREE.Vector3(tx, ty, tz), a);
    const sway = reduced ? 0 : Math.sin(st.t / 3.4) * 0.28; c.position.set(st.cam.p.x + sway, st.cam.p.y + sway * 0.25, st.cam.p.z); c.lookAt(st.cam.t);
    renderer.render(k.scene, c);
    st.frames++; if (now - st.ft > 1500) { st.fps = st.frames / ((now - st.ft) / 1000); st.frames = 0; st.ft = now; if (st.fps < 22 && st.pr > 0.7) { st.pr = Math.max(0.7, st.pr - 0.3); fit(); } }
  }
  let camObj = null;
  function camera() { const r = renderer.domElement; if (!camObj) camObj = new THREE.PerspectiveCamera(42, 1.6, 0.1, 200); const asp = (r.clientWidth || 16) / (r.clientHeight || 9); if (Math.abs(asp - camObj.aspect) > 0.01) { camObj.aspect = asp; camObj.updateProjectionMatrix(); } return camObj; }

  function onClick(e) {
    const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
    if ('fClose' in d) return st.dlg.close();
    if ('fPlay' in d) return togglePlay();
    if (d.fNav) { st.playing = st.playing || false; return goto(st.i + Number(d.fNav)); }
    if (d.fI != null) return goto(Number(d.fI));
    if ('fVoice' in d) { st.voice = !st.voice; if (st.playing) { silence(); st.intro = false; q('.cyf-card').classList.remove('on'); narrate(); } return drawButtons(); }
    if ('fRate' in d) { st.rate = st.rate === 1 ? 1.25 : st.rate === 1.25 ? 1.5 : 1; return drawButtons(); }
    if ('fExam' in d) { st.toExam = true; return st.dlg.close(); }
    if (d.fO != null) return answer(Number(d.fO));
    if ('fSkip' in d) { const s = st.slides[st.i]; s.__answered = true; q('.cyf-q').classList.remove('on'); silence(); if (st.playing) { if (st.i < st.slides.length - 1) goto(st.i + 1); else finish(); } return; }
  }
  function onKey(e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); } else if (e.key === 'ArrowRight') goto(st.i + 1); else if (e.key === 'ArrowLeft') goto(st.i - 1);
  }
  async function play(course, index, opts) {
    const c = window.CYPRO && window.CYPRO.COURSES[course]; if (!c) return;
    if (!document.getElementById('cyfilm-css')) { const s = document.createElement('style'); s.id = 'cyfilm-css'; s.textContent = css; document.head.appendChild(s); }
    silence(); st.course = course; st.opts = opts || {}; st.err = null; st.toExam = false; st.finished = false; st.i = 0; st.b = 0; st.sceneKey = ''; st.playing = false; st.pr = 1.5; camObj = null;
    st.slides = c.slides.map((s, k) => { s.__idx = k; s.__answered = false; return s; }).filter((s) => !s.exam);
    const dlg = document.createElement('dialog'); dlg.className = 'cyfilm'; st.dlg = dlg;
    dlg.innerHTML = `<div class="cyf-wrap"><div class="cyf-stage"><div class="cyf-top"></div><button type="button" class="cyf-close" data-f-close aria-label="${L('Close the video', 'Fermer la vidéo')}">✕</button><div class="cyf-facts"></div><div class="cyf-card"></div><div class="cyf-cap"></div><div class="cyf-q"></div></div><aside class="cyf-panel"></aside>
<div class="cyf-bar"><button type="button" data-f-nav="-1" aria-label="${L('Previous', 'Précédent')}">⏮</button><button type="button" class="main" data-f-play></button><button type="button" data-f-nav="1" aria-label="${L('Next', 'Suivant')}">⏭</button><button type="button" data-f-voice aria-label="${L('Voice', 'Voix')}"></button><button type="button" data-f-rate aria-label="${L('Speed', 'Vitesse')}"></button><div class="cyf-line"></div><span class="cyf-note">${L('Illustrative 3D, not to scale · training content, not a certification', '3D illustrative, pas à l’échelle · contenu de formation, pas une certification')}</span></div></div>`;
    document.body.appendChild(dlg); dlg.showModal();
    dlg.addEventListener('click', onClick); dlg.addEventListener('keydown', onKey);
    dlg.addEventListener('close', () => {
      silence(); cancelAnimationFrame(st.raf); st.raf = 0; if (st.kit) { st.kit.dispose(); st.kit = null; } if (st.resize) st.resize.disconnect();
      const i = st.slides[st.i] ? st.slides[st.i].__idx : 0, exam = st.toExam ? c.slides.findIndex((x) => x.exam) : -1; dlg.remove(); st.dlg = null;
      if (st.opts.onClose) st.opts.onClose(exam >= 0 ? exam : i);
    });
    const card = q('.cyf-card'); card.innerHTML = `<small>🎬 ${L('3D VIDEO', 'VIDÉO 3D')}</small><h2>${esc(T2(c.name))}</h2>`; card.classList.add('on');
    await loadThree(); if (st.dlg !== dlg) return;
    if (renderer) { q('.cyf-stage').prepend(renderer.domElement); st.resize = new ResizeObserver(fit); st.resize.observe(q('.cyf-stage')); }
    else { const n = document.createElement('p'); n.style.cssText = 'position:absolute;top:60px;left:14px;font-size:13px;color:#ffd27a'; n.textContent = L('3D is not available on this device: the narration and the tables still play.', 'La 3D n’est pas disponible sur cet appareil : la narration et les tableaux restent disponibles.'); q('.cyf-stage').appendChild(n); }
    st.playing = true; st.last = performance.now(); st.ft = st.last; st.frames = 0; const si = st.slides.findIndex((s) => s.__idx === index); goto(si >= 0 ? si : 0);
    st.raf = requestAnimationFrame(frame);
  }
  window.CYFILM = {
    play, available: () => !glFailed,
    state: () => ({ open: !!st.dlg, course: st.course, slide: st.i, beat: st.b, playing: st.playing, scene: st.sceneKey, fps: Math.round(st.fps), err: st.err, finished: st.finished, children: st.kit ? st.kit.root.children.length : 0 }),
    go: (i, beat) => { goto(i, false); if (beat != null) st.b = beat; }, setBeat: (b) => { st.b = b; st.hold = 3; }, pause: () => { if (st.playing) togglePlay(); }, sceneFor
  };
}());
