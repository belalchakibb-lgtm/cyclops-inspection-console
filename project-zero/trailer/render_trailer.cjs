// Drives render3d.html in headless Chromium and saves one JPEG per 3D frame.
// Usage: node render_trailer.cjs SERVE_URL timeline.json OUT_DIR
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [url, tlPath, out] = process.argv.slice(2);
  const frames = JSON.parse(fs.readFileSync(tlPath, 'utf8')); // [{i, shot, u, t}]
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto(url);
  await p.waitForFunction('window.ready === true', null, { timeout: 180000 });
  let n = 0;
  for (const f of frames) {
    const file = path.join(out, `f${String(f.i).padStart(5, '0')}.jpg`);
    if (fs.existsSync(file)) continue;
    const d = await p.evaluate(([s, u, t]) => window.renderFrame(s, u, t), [f.shot, f.u, f.t]);
    fs.writeFileSync(file, Buffer.from(d.split(',')[1], 'base64'));
    if (++n % 50 === 0) console.log('rendered', n, '/', frames.length);
  }
  await b.close();
  console.log('done');
})();
