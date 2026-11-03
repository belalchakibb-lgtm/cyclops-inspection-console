/* CYCLOPS WebGL renderer (Three.js, vendored in /vendor for offline use).
   Drop-in replacement for the canvas engine R3 in cyclops3D.js: same immediate-mode API
   (begin, G, box, cyl, sph, ln, path, quad, txt, grid, reset, flush, hud) so every existing
   scene renders unchanged, plus:
   - physically based materials (brushed steel, painted metal, rubber, copper, glass, weld bead),
     studio environment reflections, ACES tone mapping, soft shadows, studio floor, MSAA;
   - part tags (r.part(id)) and material hints (r.M(kind)) used by the detailed models;
   - smooth camera (damped orbit / zoom / reset), hover highlight, click-to-inspect with focus,
     exploded view and section view.
   One shared WebGLRenderer draws every viewer (main animation, equipment dialog, course) into
   its own 2D canvas, so opening/closing viewers never leaks WebGL contexts.
   If WebGL is unavailable, window.CYGL.create() returns null and cyclops3D.js keeps its canvas engine. */
import * as THREE from './vendor/three.module.min.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const S = {
  renderer: null, failed: false, env: null, tex: null, geo: new Map(), mats: new Map(), hiMats: new Map(),
  instances: new Set(), frame: 0, quality: 1, slow: 0,
  clip: new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6)   // section plane shared by all equipment materials (floor excluded)
};
const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

/* ---------- shared renderer, environment and procedural textures ---------- */
function shared() {
  if (S.renderer || S.failed) return S.renderer;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 not available');
    const r = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.08;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.setClearColor(0x000000, 0);
    r.setPixelRatio(1);
    r.localClippingEnabled = true;
    S.renderer = r;
    S.env = buildEnvironment(r);
    S.tex = buildTextures();
    if (coarse) S.quality = 0.75;
  } catch (e) {
    S.failed = true;
    console.warn('CYCLOPS: WebGL renderer unavailable, using the canvas renderer.', e);
  }
  return S.renderer;
}

// Studio "HDRI": a lit room with soft-box panels, pre-filtered for reflections (no external file needed).
function buildEnvironment(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 12, 24), new THREE.MeshStandardMaterial({ color: 0x7d8796, side: THREE.BackSide, roughness: 1 }));
  room.position.y = 5; scene.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x4a5059, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.99; scene.add(floor);
  const panel = (w, h, pos, rot, k, color) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color || 0xffffff).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); scene.add(m);
  };
  panel(10, 4, [0, 10.9, 0], [Math.PI / 2, 0, 0], 7);                 // overhead soft box
  panel(5, 7, [-11.9, 5, 3], [0, Math.PI / 2, 0], 4, 0xffe2c4);       // warm key
  panel(5, 7, [11.9, 4, -4], [0, -Math.PI / 2, 0], 2.2, 0xc9dcff);    // cool fill
  panel(14, 2.4, [0, 4, -11.9], [0, 0, 0], 1.6);                      // back strip
  panel(3, 9, [6, 5, 11.9], [0, Math.PI, 0], 1.8);                    // rim strip
  scene.add(new THREE.HemisphereLight(0xc9d8f0, 0x252a31, 1.2));
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(scene, 0.03).texture;
  pm.dispose();
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return tex;
}

function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 4;
  return t;
}
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function buildTextures() {
  const brushed = canvasTex(512, 512, (c, w, h) => {
    const r = rnd(3); c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const y = r() * h, g = 90 + r() * 80; c.strokeStyle = `rgba(${g},${g},${g},${0.15 + r() * 0.35})`; c.lineWidth = 0.5 + r(); c.beginPath(); c.moveTo(r() * w - 60, y); c.lineTo(r() * w + 160, y + (r() - 0.5) * 2); c.stroke(); }
  }, [2, 2]);
  const ripple = canvasTex(128, 512, (c, w, h) => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let y = -20; y < h + 20; y += 9) { const g = c.createLinearGradient(0, y, 0, y + 9); g.addColorStop(0, '#5a5a5a'); g.addColorStop(0.55, '#c8c8c8'); g.addColorStop(1, '#5a5a5a'); c.fillStyle = g; c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(w / 2, y + 12, w, y); c.lineTo(w, y + 9); c.quadraticCurveTo(w / 2, y + 21, 0, y + 9); c.fill(); }
  }, [1, 3]);
  const peel = canvasTex(256, 256, (c, w, h) => {
    const r = rnd(9), img = c.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) { const v = 118 + (r() + r() + r() - 1.5) * 26; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    c.putImageData(img, 0, 0); c.filter = 'blur(1.2px)'; c.drawImage(c.canvas, 0, 0);
  }, [3, 3]);
  const floor = canvasTex(1024, 1024, (c, w, h) => {
    const r = rnd(21); c.fillStyle = '#3b4250'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const g = 40 + r() * 40; c.fillStyle = `rgba(${g},${g + 4},${g + 10},${0.25 + r() * 0.3})`; c.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5); }
    c.strokeStyle = 'rgba(150,175,205,.10)'; c.lineWidth = 2;
    for (let i = 0; i <= w; i += 64) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
  }, [3, 3]);
  floor.colorSpace = THREE.SRGBColorSpace;
  const fade = canvasTex(512, 512, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, '#fff'); g.addColorStop(0.55, '#ddd'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  fade.wrapS = fade.wrapT = THREE.ClampToEdgeWrapping;
  return { brushed, ripple, peel, floor, fade };
}

/* ---------- materials ---------- */
// Kinds: steel, chrome, zinc, cast, copper, brass, weld, heat, paint, plastic, rubber, glass, perspex, screen, glow, ink, ghost
function srgb(c) { return new THREE.Color().setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace); }
function classify(c, a, prim, size) {
  const mx = Math.max(c[0], c[1], c[2]), mn = Math.min(c[0], c[1], c[2]), sat = mx ? (mx - mn) / mx : 0, lum = 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  if (prim === 'line') {
    if (lum < 70) return size >= 0.02 ? 'rubber' : 'ink';                       // thick dark lines are cables
    if (sat < 0.12 && lum < 236 && a >= 0.99 && size >= 0.009) return 'steel';  // grey ropes, rods, hooks
    return 'glow';                                                             // beams, field lines, annotations
  }
  if (prim === 'sph' && size < 0.13) return lum < 60 ? 'ink' : 'glow';
  if (a < 0.97) return sat < 0.2 ? 'ghost' : 'glass';
  if (prim === 'sph') return 'satin';
  if (lum < 52) return sat > 0.35 ? 'paint' : 'rubber';
  if (sat < 0.17) return lum > 205 ? 'plastic' : 'steel';
  return 'paint';
}
function material(kind, c, a) {
  const key = kind + '|' + c.join(',') + '|' + (a < 0.999 ? a.toFixed(2) : 1);
  let m = S.mats.get(key);
  if (m) return m;
  const col = srgb(c), T = S.tex;
  const std = (o) => new THREE.MeshStandardMaterial(o);
  switch (kind) {
    case 'steel': m = std({ color: col.clone().lerp(new THREE.Color(0xd8dde3), 0.3), metalness: 0.78, roughness: 0.42, roughnessMap: T.brushed, bumpMap: T.brushed, bumpScale: 0.25 }); break;
    case 'chrome': m = std({ color: col.clone().lerp(new THREE.Color(0xffffff), 0.4), metalness: 1, roughness: 0.12 }); break;
    case 'zinc': m = std({ color: col.clone().lerp(new THREE.Color(0xc8ccd2), 0.4), metalness: 0.85, roughness: 0.42 }); break;
    case 'cast': m = std({ color: col, metalness: 0.7, roughness: 0.68, bumpMap: T.peel, bumpScale: 1.2 }); break;
    case 'copper': m = std({ color: col, metalness: 1, roughness: 0.3 }); break;
    case 'brass': m = std({ color: col, metalness: 1, roughness: 0.28 }); break;
    case 'weld': m = std({ color: col, metalness: 0.8, roughness: 0.46, bumpMap: T.ripple, bumpScale: 0.9 }); break;
    case 'heat': m = std({ color: col, metalness: 0.6, roughness: 0.45, transparent: true, opacity: a, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); break;
    case 'paint': m = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0.15, roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.25, bumpMap: T.peel, bumpScale: 0.3 }); break;
    case 'plastic': m = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.4 }); break;
    case 'rubber': m = std({ color: col, metalness: 0, roughness: 0.82, bumpMap: T.peel, bumpScale: 0.5 }); break;
    case 'glass': m = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: 0.08, transparent: true, opacity: Math.max(0.2, a), depthWrite: false, clearcoat: 1, envMapIntensity: 1.4 }); break;
    case 'perspex': m = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0, roughness: 0.15, transparent: true, opacity: Math.min(0.8, a), depthWrite: false, clearcoat: 1 }); break;
    case 'ghost': m = new THREE.MeshPhysicalMaterial({ color: col.clone().lerp(new THREE.Color(0xc0c8d2), 0.3), metalness: 0.6, roughness: 0.3, transparent: true, opacity: Math.max(0.18, a), depthWrite: false, clearcoat: 0.6 }); break;
    case 'film': m = std({ color: col, metalness: 0, roughness: 0.35, transparent: true, opacity: a, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); break;
    case 'satin': m = std({ color: col, metalness: 0, roughness: 0.55 }); break;
    case 'screen': m = std({ color: 0x050807, emissive: col, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0 }); break;
    case 'glow': m = new THREE.MeshBasicMaterial({ color: col, transparent: a < 0.999, opacity: a, depthWrite: a >= 0.999, toneMapped: false }); break;
    case 'ink': m = new THREE.MeshBasicMaterial({ color: col, transparent: a < 0.999, opacity: a, depthWrite: a >= 0.999, polygonOffset: true, polygonOffsetFactor: -4 }); break;
    default: m = std({ color: col, roughness: 0.5, metalness: 0.2 });
  }
  if (a < 0.999 && !m.transparent) { m.transparent = true; m.opacity = a; m.depthWrite = false; }
  m.side = THREE.DoubleSide;
  m.shadowSide = THREE.FrontSide;
  m.clippingPlanes = [S.clip];
  m.userData.kind = kind;
  S.mats.set(key, m);
  return m;
}
function highlighted(m, strong) {
  const key = m.uuid + (strong ? 's' : 'h');
  let h = S.hiMats.get(key);
  if (!h) {
    h = m.clone();
    h.clippingPlanes = [S.clip];
    if (h.emissive) { h.emissive = new THREE.Color(strong ? 0x2a8cff : 0x1b5fb0); h.emissiveIntensity = strong ? 0.75 : 0.5; }
    else h.color = h.color.clone().lerp(new THREE.Color(0x7fc4ff), 0.5);
    S.hiMats.set(key, h);
  }
  return h;
}

/* ---------- geometry cache (quantised sizes, LRU) ---------- */
const q2 = (v) => Math.round(v * 100) / 100;
function geo(key, make) {
  let g = S.geo.get(key);
  if (g) { g.userData.f = S.frame; return g; }
  g = make(); g.userData.f = S.frame; g.userData.key = key; S.geo.set(key, g);
  if (S.geo.size > 900) {
    for (const [k, v] of S.geo) { if (S.geo.size <= 700) break; if (v.userData.f < S.frame - 120 && !v.userData.keep) { S.geo.delete(k); v.dispose(); for (const inst of S.instances) inst.dropPool(k); } }
  }
  return g;
}
// Box with rounded edges (bevel scales with the smallest side; very thin plates stay sharp).
function boxGeo(sx, sy, sz) {
  sx = Math.max(q2(sx), 0.005); sy = Math.max(q2(sy), 0.005); sz = Math.max(q2(sz), 0.005);
  return geo('b' + sx + ',' + sy + ',' + sz, () => {
    const m = Math.min(sx, sy, sz), b = Math.min(0.045, m * 0.18);
    if (b < 0.006) return new THREE.BoxGeometry(sx, sy, sz);
    const w = sx / 2 - b, h = sy / 2 - b, rr = b * 0.9, shape = new THREE.Shape();
    shape.moveTo(-w + rr, -h); shape.lineTo(w - rr, -h); shape.quadraticCurveTo(w, -h, w, -h + rr); shape.lineTo(w, h - rr); shape.quadraticCurveTo(w, h, w - rr, h);
    shape.lineTo(-w + rr, h); shape.quadraticCurveTo(-w, h, -w, h - rr); shape.lineTo(-w, -h + rr); shape.quadraticCurveTo(-w, -h, -w + rr, -h);
    const depth = Math.max(0.001, sz - 2 * b);
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 3 });
    g.translate(0, 0, -depth / 2);
    g.computeVertexNormals();
    return g;
  });
}
// Cylinder / cone with softened rims (lathe profile); radial segments scale with size (simple LOD).
function cylGeo(r, h, r2, n) {
  r = Math.max(q2(r), 0.005); h = Math.max(q2(h), 0.005); r2 = q2(r2);
  const seg = n <= 6 ? n : clamp(Math.round(Math.max(r, r2) * 60), 18, 48);
  return geo('c' + r + ',' + h + ',' + r2 + ',' + seg, () => {
    if (n <= 6 || h < 0.03 || Math.min(r, Math.max(r2, 0.001)) < 0.03) {
      const g = new THREE.CylinderGeometry(r2, r, h, seg, 1, false);
      if (n === 6) g.rotateY(Math.PI / 6);
      return g;
    }
    const b = Math.min(0.03, h * 0.15, r * 0.2), pts = [];
    pts.push(new THREE.Vector2(0, -h / 2));
    pts.push(new THREE.Vector2(r - b, -h / 2));
    for (let i = 1; i <= 3; i++) { const a = -Math.PI / 2 + (i / 3) * Math.PI / 2; pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -h / 2 + b + Math.sin(a) * b)); }
    if (r2 > 0.005) {
      const b2 = Math.min(b, r2 * 0.2);
      for (let i = 0; i <= 3; i++) { const a = (i / 3) * Math.PI / 2; pts.push(new THREE.Vector2(r2 - b2 + Math.cos(a) * b2, h / 2 - b2 + Math.sin(a) * b2)); }
      pts.push(new THREE.Vector2(0, h / 2));
    } else pts.push(new THREE.Vector2(0.001, h / 2));
    return new THREE.LatheGeometry(pts, seg);
  });
}
const sphGeo = () => geo('sphere', () => { const g = new THREE.SphereGeometry(1, 28, 18); g.userData.keep = true; return g; });
const lineGeo = () => geo('line', () => { const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); g.userData.keep = true; return g; });

/* ---------- renderer instance (one per viewer canvas) ---------- */
const _v2 = new THREE.Vector2(), _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
const rgbStr = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

class R3GL {
  constructor(cv) {
    this.gl = true; this.cv = cv; this.c = cv.getContext('2d');
    this.yaw = 0.6; this.pit = 0.4; this.dist = 11; this.tg = [0, 0, 0];
    this.view = null; this.g = null; this.gm = new THREE.Matrix4(); this.hud = null;
    this.texts = []; this.used = []; this.hint = null; this.tag = null;
    this.scene = new THREE.Scene(); this.scene.environment = S.env; this.scene.environmentIntensity = 0.95;
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);
    this.pools = new Map(); this.quads = []; this.quadUsed = 0;
    this.explode = 0; this.explodeOn = false; this.section = 0; this.sectionOn = false;
    this.clip = new THREE.Plane(new THREE.Vector3(0, 0, -1), 50);
    this.hover = null; this.sel = null; this.mouse = null; this.down = null; this.focus = null;
    this.partInfo = null; this.floorY = null; this.autoFloor = 0; this.last = 0; this.visible = true;
    this.raycaster = new THREE.Raycaster();
    this.lights();
    this.floor();
    this.listen();
    S.instances.add(this);
    if (typeof IntersectionObserver !== 'undefined') { this.io = new IntersectionObserver((e) => { this.visible = e[0].isIntersecting; }); this.io.observe(cv); }
  }
  lights() {
    const key = new THREE.DirectionalLight(0xfff1e2, 2.6);
    key.castShadow = true;
    const sz = S.quality < 1 ? 1024 : 2048;
    key.shadow.mapSize.set(sz, sz);
    Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 60 });
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.025; key.shadow.radius = 3;
    this.key = key; this.scene.add(key, key.target);
    const fill = new THREE.DirectionalLight(0xbcd6ff, 0.55); fill.position.set(-8, 4, -9); this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6); rim.position.set(2, 6, -12); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x1a1f28, 0.35));
  }
  floor() {
    const T = S.tex, m = new THREE.MeshStandardMaterial({ map: T.floor, roughness: 0.82, metalness: 0.05, alphaMap: T.fade, transparent: true, depthWrite: true });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), m);
    f.rotation.x = -Math.PI / 2; f.receiveShadow = true; f.renderOrder = -10;
    this.floorMesh = f; this.scene.add(f);
  }
  listen() {
    const cv = this.cv, pos = (e) => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    this.onMove = (e) => { this.mouse = pos(e); };
    this.onLeave = () => { this.mouse = null; };
    this.onDown = (e) => { this.down = { p: pos(e), t: performance.now() }; };
    this.onUp = (e) => {
      if (!this.down) return; const p = pos(e), d = Math.hypot(p[0] - this.down.p[0], p[1] - this.down.p[1]);
      if (d < 5 && performance.now() - this.down.t < 450) this.clickAt = p;
      this.down = null;
    };
    cv.addEventListener('pointermove', this.onMove); cv.addEventListener('pointerleave', this.onLeave);
    cv.addEventListener('pointerdown', this.onDown); cv.addEventListener('pointerup', this.onUp);
  }

  /* ----- API used by the scenes ----- */
  reset(c) { this.yaw = c.y; this.pit = c.p; this.dist = c.d; this.tg = c.t.slice(); this.sel = null; this.focus = null; }
  begin() {
    this.g = null; this.hud = null; this.texts.length = 0; this.used.length = 0; this.hint = null; this.tag = null; this.floorY = null; this.minY = Infinity;
    for (const p of this.pools.values()) p.used = 0;
    this.quadUsed = 0;
  }
  G(p, r) {
    if (!p) { this.g = null; return; }
    this.g = { p, r: r || [0, 0, 0] };
    _e.set(this.g.r[0], this.g.r[1], this.g.r[2], 'ZYX'); _q.setFromEuler(_e);
    this.gm.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(1, 1, 1));
  }
  W(q) { if (!this.g) return q; _v.set(q[0], q[1], q[2]).applyMatrix4(this.gm); return [_v.x, _v.y, _v.z]; }
  M(kind) { this.hint = kind || null; }
  part(id) { this.tag = id || null; }
  pool(key, g) {
    let p = this.pools.get(key);
    if (!p) { p = { list: [], used: 0 }; this.pools.set(key, p); }
    if (p.used < p.list.length) return p.list[p.used++];
    const m = new THREE.Mesh(g); m.matrixAutoUpdate = false; this.scene.add(m); p.list.push(m); p.used++; return m;
  }
  dropPool(key) { const p = this.pools.get(key); if (!p) return; p.list.forEach((m) => this.scene.remove(m)); this.pools.delete(key); }
  place(mesh, p, rot, sc, mat, prim, a, b) {
    _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0, 'ZYX'); _q.setFromEuler(_e);
    mesh.matrix.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(sc[0], sc[1], sc[2]));
    if (this.g) mesh.matrix.premultiply(this.gm);
    mesh.matrixWorldNeedsUpdate = true;
    this.finish(mesh, mat, prim, a, b);
  }
  finish(mesh, mat, prim, a, b) {
    mesh.visible = true; mesh.material = mat; mesh.userData.base = mat; mesh.userData.part = this.tag;
    const solid = !mat.transparent && mat.userData.kind !== 'glow' && mat.userData.kind !== 'ink';
    mesh.castShadow = solid && prim !== 'line'; mesh.receiveShadow = !(mat.userData.kind === 'glow');
    mesh.renderOrder = mat.transparent ? 10 + (b || 0) : 0;
    this.used.push(mesh);
  }
  matFor(col, a, prim, size) { a = a == null ? 1 : a; return material(this.hint || classify(col, a, prim, size), col, a); }
  trackY(y) { if (y < this.minY) this.minY = y; }
  box(p, s, col, rot, a, b) {
    const g = boxGeo(s[0], s[1], s[2]), m = this.pool(g.userData.key, g);
    this.place(m, p, rot, [1, 1, 1], this.matFor(col, a, 'box', Math.min(...s)), 'box', a, b);
    if (!this.g) this.trackY(p[1] - Math.abs(s[1]) / 2);
  }
  cyl(p, r, h, col, rot, n, r2, a, b) {
    if (r2 == null) r2 = r;
    const g = cylGeo(r, h, r2, n || 14), m = this.pool(g.userData.key, g);
    this.place(m, p, rot, [1, 1, 1], this.matFor(col, a, 'cyl', Math.min(r, h)), 'cyl', a, b);
    if (!this.g && !rot) this.trackY(p[1] - h / 2);
  }
  quad(p0, p1, p2, p3, col, a, b) {
    let m = this.quads[this.quadUsed];
    if (!m) {
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
      m = new THREE.Mesh(g); m.matrixAutoUpdate = false; m.matrix.identity(); this.scene.add(m); this.quads.push(m);
    }
    this.quadUsed++;
    const arr = m.geometry.attributes.position.array;
    [p0, p1, p2, p3].forEach((q, i) => { const w = this.W(q); arr[i * 3] = w[0]; arr[i * 3 + 1] = w[1]; arr[i * 3 + 2] = w[2]; });
    m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals(); m.geometry.computeBoundingSphere();
    m.matrixWorldNeedsUpdate = true;
    const kind = this.hint || ((a == null ? 1 : a) < 0.97 ? 'film' : 'paint');
    this.finish(m, material(kind, col, a == null ? 1 : a), 'quad', a, b);
    m.castShadow = false;
  }
  sph(p, r, col, a, b) {
    const w = this.W(p), m = this.pool('sphere', sphGeo());
    const saved = this.g; this.g = null;
    this.place(m, w, null, [r, r, r], this.matFor(col, a, 'sph', r), 'sph', a, b);
    this.g = saved;
  }
  ln(p, q, col, w, a, b) {
    const A = this.W(p), B = this.W(q);
    _a.set(A[0], A[1], A[2]); _b.set(B[0], B[1], B[2]);
    const len = _a.distanceTo(_b); if (len < 1e-4) return;
    const rad = (w || 1) * 0.0062, m = this.pool('line', lineGeo());
    _v.subVectors(_b, _a).normalize(); _q.setFromUnitVectors(UP, _v);
    m.matrix.compose(_v.addVectors(_a, _b).multiplyScalar(0.5), _q, _s.set(rad, len, rad));
    m.matrixWorldNeedsUpdate = true;
    this.finish(m, this.matFor(col, a, 'line', rad), 'line', a, b);
  }
  path(pts, col, w, a, b) {
    for (let i = 0; i < pts.length - 1; i++) this.ln(pts[i], pts[i + 1], col, w, a, b);
    if ((w || 1) >= 2.5) for (let i = 1; i < pts.length - 1; i++) { const m = this.pool('sphere', sphGeo()), c = this.W(pts[i]), rad = (w || 1) * 0.0062; m.matrix.compose(_v.set(c[0], c[1], c[2]), _q.identity(), _s.set(rad, rad, rad)); m.matrixWorldNeedsUpdate = true; this.finish(m, this.matFor(col, a, 'line', rad), 'line', a, b); }
  }
  txt(p, s, col) { this.texts.push({ p: this.W(p), s, c: col || [235, 242, 255] }); }
  grid(n, st, y) { this.floorY = y; }

  /* ----- interaction API ----- */
  setExplode(on) { this.explodeOn = on; }
  setSection(on) { this.sectionOn = on; }

  /* ----- frame ----- */
  flush() {
    const cv = this.cv, c = this.c, W = cv.clientWidth, H = cv.clientHeight;
    if (W < 10 || H < 10) return;
    S.frame++;
    for (const inst of S.instances) if (inst !== this && !inst.cv.isConnected) inst.dispose();
    const now = performance.now(), dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1; this.last = now;
    for (const p of this.pools.values()) for (let i = p.used; i < p.list.length; i++) p.list[i].visible = false;
    for (let i = this.quadUsed; i < this.quads.length; i++) this.quads[i].visible = false;
    const d = (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1;
    if (cv.width !== (W * d | 0) || cv.height !== (H * d | 0)) { cv.width = W * d | 0; cv.height = H * d | 0; }
    c.setTransform(d, 0, 0, d, 0, 0);
    // background (same studio gradient as the canvas engine, so the look stays consistent)
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#131e30'); g.addColorStop(0.6, '#1a2638'); g.addColorStop(1, '#0b111c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, Math.max(W, H) * 0.7); glow.addColorStop(0, 'rgba(110,160,205,.18)'); glow.addColorStop(1, 'rgba(3,8,16,.25)'); c.fillStyle = glow; c.fillRect(0, 0, W, H);

    // skip GPU work when the canvas is off-screen or covered by another dialog
    const dlg = [...document.querySelectorAll('dialog[open]')].pop(); // topmost open dialog
    if (!this.visible || (dlg && !dlg.contains(cv)) || document.hidden) { if (this.hud) this.hud(c, W, H); return; }

    this.updateCamera(dt, W, H);
    this.applyFloor(dt);
    this.applyExplode(dt);
    this.applySection(dt);
    this.interact(W, H);

    const R = shared(); if (!R) return;
    const pr = Math.min(d, 2) * S.quality, w = Math.max(1, Math.round(W * pr)), h = Math.max(1, Math.round(H * pr));
    const size = R.getSize(_v2);
    if (size.x < w || size.y < h) R.setSize(Math.max(size.x, w), Math.max(size.y, h), false);
    const bh = R.getSize(_v2).y;
    R.setViewport(0, bh - h, w, h); R.setScissor(0, bh - h, w, h); R.setScissorTest(true);
    S.clip.constant = this.section > 0.001 ? this.clip.constant : 1e6;
    const t0 = performance.now();
    R.render(this.scene, this.camera);
    c.drawImage(R.domElement, 0, 0, w, h, 0, 0, W, H);
    this.adapt(performance.now() - t0);
    this.drawTexts(c, W, H);
    this.drawInspect(c, W, H);
    if (this.hud) this.hud(c, W, H);
  }
  updateCamera(dt, W, H) {
    const k = this.view ? 1 - Math.exp(-dt * 7) : 1;
    const tgt = this.focus ? this.focus.tg : this.tg, dist = this.focus ? this.focus.d : this.dist;
    if (!this.view) this.view = { yaw: this.yaw, pit: this.pit, dist, tg: tgt.slice() };
    const v = this.view;
    let dy = this.yaw - v.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    v.yaw += dy * k; v.pit += (this.pit - v.pit) * k; v.dist += (dist - v.dist) * k;
    for (let i = 0; i < 3; i++) v.tg[i] += (tgt[i] - v.tg[i]) * k;
    const cp = [v.tg[0] + v.dist * Math.cos(v.pit) * Math.sin(v.yaw), v.tg[1] + v.dist * Math.sin(v.pit), v.tg[2] + v.dist * Math.cos(v.pit) * Math.cos(v.yaw)];
    const F = Math.min(W, H * 1.6);
    this.camera.fov = 2 * Math.atan(H / 2 / F) * 180 / Math.PI; this.camera.aspect = W / H;
    this.camera.position.set(cp[0], cp[1], cp[2]); this.camera.lookAt(v.tg[0], v.tg[1], v.tg[2]); this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    // key light follows the target so the shadow frustum always covers the scene
    this.key.position.set(v.tg[0] + 5.5, v.tg[1] + 14, v.tg[2] + 8); this.key.target.position.set(v.tg[0], v.tg[1], v.tg[2]); this.key.target.updateMatrixWorld();
  }
  applyFloor(dt) {
    const y = this.floorY != null ? this.floorY : (isFinite(this.minY) ? this.minY - 0.01 : 0);
    this.autoFloor += (y - this.autoFloor) * (this.fy0 ? 1 - Math.exp(-dt * 3) : 1); this.fy0 = true;
    this.floorMesh.position.set(this.view.tg[0], this.autoFloor, this.view.tg[2]); this.floorMesh.updateMatrix();
  }
  applyExplode(dt) {
    this.explode += ((this.explodeOn ? 1 : 0) - this.explode) * (1 - Math.exp(-dt * 4));
    if (this.explode < 0.002) return;
    const parts = new Map(), all = [0, 0, 0, 0];
    for (const m of this.used) { const id = m.userData.part; if (!id) continue; const e = m.matrix.elements; let p = parts.get(id); if (!p) parts.set(id, p = [0, 0, 0, 0]); p[0] += e[12]; p[1] += e[13]; p[2] += e[14]; p[3]++; }
    if (parts.size < 2) return;
    for (const p of parts.values()) { p[0] /= p[3]; p[1] /= p[3]; p[2] /= p[3]; all[0] += p[0]; all[1] += p[1]; all[2] += p[2]; all[3]++; }
    all[0] /= all[3]; all[1] /= all[3]; all[2] /= all[3];
    const off = new Map();
    for (const [id, p] of parts) { _v.set(p[0] - all[0], (p[1] - all[1]) * 1.4 + 0.4, p[2] - all[2]); const L = _v.length() || 1; _v.multiplyScalar((0.9 + L * 0.6) / L * this.explode); off.set(id, _v.clone()); }
    for (const m of this.used) { const o = m.userData.part && off.get(m.userData.part); if (!o) continue; _m.makeTranslation(o.x, o.y, o.z); m.matrix.premultiply(_m); m.matrixWorldNeedsUpdate = true; }
  }
  applySection(dt) {
    // the cut plane slides in from the viewer side and stops at z = 0 (keeps z <= constant)
    this.section += ((this.sectionOn ? 1 : 0) - this.section) * (1 - Math.exp(-dt * 3));
    this.clip.constant = 0.02 + (1 - this.section) * 30;
  }
  interact(W, H) {
    const hasParts = this.used.some((m) => m.userData.part);
    this.hover = null;
    if (hasParts && this.mouse && !this.down) {
      this.raycaster.setFromCamera(new THREE.Vector2(this.mouse[0] / W * 2 - 1, -(this.mouse[1] / H) * 2 + 1), this.camera);
      this.scene.updateMatrixWorld();
      const hits = this.raycaster.intersectObjects(this.used.filter((m) => m.userData.part), false);
      const hit = hits.find((h) => !this.section || h.point.z <= this.clip.constant + 0.001);
      if (hit) this.hover = hit.object.userData.part;
    }
    if (this.clickAt) {
      const id = this.hover;
      if (id && id === this.sel) { this.sel = null; this.focus = null; }
      else if (id) {
        this.sel = id;
        const box = new THREE.Box3(); this.used.forEach((m) => { if (m.userData.part === id) box.expandByObject(m); });
        const ctr = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3()).length();
        this.focus = { tg: [ctr.x, ctr.y, ctr.z], d: clamp(sz * 1.9 + 1.6, 3, 18) };
      } else { this.sel = null; this.focus = null; }
      this.clickAt = null;
    }
    this.cv.style.cursor = this.hover ? 'pointer' : 'grab';
    for (const m of this.used) {
      const id = m.userData.part, base = m.userData.base, k = base.userData.kind;
      if (id && (id === this.sel || id === this.hover) && k !== 'glow' && k !== 'ink') m.material = highlighted(base, id === this.sel);
    }
  }
  adapt(ms) {
    // dynamic resolution: lower the pixel ratio when frames get slow, never below 0.6
    S.slow = S.slow * 0.95 + (ms > 24 ? 1 : 0) * 0.05;
    if (S.slow > 0.6 && S.quality > 0.6) { S.quality = Math.max(0.6, S.quality - 0.15); S.slow = 0; }
  }
  project(p, W, H) {
    _v.set(p[0], p[1], p[2]).project(this.camera);
    if (_v.z > 1 || _v.z < -1) return null;
    return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H];
  }
  drawTexts(c, W, H) {
    c.textAlign = 'center'; c.font = '600 12px system-ui,sans-serif'; c.lineJoin = 'round';
    for (const t of this.texts) {
      const s = this.project(t.p, W, H); if (!s) continue;
      const w = c.measureText(t.s).width, x = clamp(s[0], w / 2 + 4, W - w / 2 - 4);
      c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.8)'; c.strokeText(t.s, x, s[1]); c.fillStyle = rgbStr(t.c, 1); c.fillText(t.s, x, s[1]);
    }
  }
  drawInspect(c, W, H) {
    const info = (id) => (this.partInfo && this.partInfo(id)) || { name: id, desc: '' };
    if (this.hover && this.mouse && this.hover !== this.sel) {
      const n = info(this.hover).name, x = this.mouse[0] + 14, y = this.mouse[1] + 18;
      c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left';
      const w = c.measureText(n).width + 16, bx = Math.min(x, W - w - 4);
      c.fillStyle = 'rgba(8,16,32,.88)'; c.fillRect(bx, y - 14, w, 22); c.strokeStyle = 'rgba(61,169,255,.8)'; c.strokeRect(bx + 0.5, y - 13.5, w - 1, 21);
      c.fillStyle = '#fff'; c.fillText(n, bx + 8, y + 1);
    }
    if (this.sel) {
      const it = info(this.sel), w = Math.min(300, W - 24), pad = 10;
      c.font = '12px system-ui,sans-serif';
      const words = String(it.desc || '').split(' '), lines = []; let line = '';
      words.forEach((wd) => { const tst = line ? line + ' ' + wd : wd; if (c.measureText(tst).width > w - pad * 2) { lines.push(line); line = wd; } else line = tst; });
      if (line) lines.push(line);
      const h = 40 + lines.length * 16 + 18, x = 12, y = Math.max(8, H - h - 46); // above the phase caption
      c.fillStyle = 'rgba(8,16,32,.92)'; c.fillRect(x, y, w, h); c.fillStyle = '#3da9ff'; c.fillRect(x, y, 3, h);
      c.textAlign = 'left'; c.font = '700 13px system-ui,sans-serif'; c.fillStyle = '#fff'; c.fillText('🔍 ' + it.name, x + pad, y + 22);
      c.font = '12px system-ui,sans-serif'; c.fillStyle = '#d5e2f5'; lines.forEach((l, i) => c.fillText(l, x + pad, y + 42 + i * 16));
      c.fillStyle = '#8fa3c0'; c.font = '11px system-ui,sans-serif'; c.fillText(it.hint || '', x + pad, y + h - 8);
    }
    c.textAlign = 'center';
  }
  dispose() {
    S.instances.delete(this);
    if (this.io) this.io.disconnect();
    const cv = this.cv;
    cv.removeEventListener('pointermove', this.onMove); cv.removeEventListener('pointerleave', this.onLeave);
    cv.removeEventListener('pointerdown', this.onDown); cv.removeEventListener('pointerup', this.onUp);
    this.quads.forEach((m) => m.geometry.dispose());
    this.floorMesh.geometry.dispose(); this.floorMesh.material.dispose();
    if (this.key.shadow.map) this.key.shadow.map.dispose();
    this.scene.clear(); this.pools.clear(); this.used.length = 0;
  }
}

window.CYGL = {
  version: THREE.REVISION,
  create(cv) { return shared() ? new R3GL(cv) : null; },
  get available() { return !!shared(); },
  get instances() { return [...S.instances]; },   // diagnostics (live viewers)
  get quality() { return S.quality; }
};
window.dispatchEvent(new Event('cygl-ready'));
