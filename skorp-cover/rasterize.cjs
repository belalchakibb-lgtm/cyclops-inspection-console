// Rasterize the SVG carving masks to grayscale PNGs with headless Chromium.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const dir = process.argv[2];
  const names = process.argv.slice(3);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 3600 }, deviceScaleFactor: 1 });
  for (const n of names) {
    const svg = fs.readFileSync(path.join(dir, `mask_${n}.svg`), 'utf8');
    await page.setContent(`<html><body style="margin:0;background:#000">${svg}</body></html>`);
    await page.screenshot({ path: path.join(dir, `mask_${n}.png`), clip: { x: 0, y: 0, width: 2400, height: 3600 } });
  }
  await browser.close();
})();
