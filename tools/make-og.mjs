/* Per-page Open Graph images.
   Every guide shared the one default.jpg, so 33 different guides looked
   identical in a link preview. This renders one image per guide (and per app
   and page) from the site's OWN stylesheet and fonts, so a share looks like
   the site rather than like a generic card.

   Output is static and committed. OG images are fetched by crawlers, never by
   the page, so this adds nothing to page weight.

   Run from the repo root AFTER `node build.mjs`, because it loads fonts and
   styles out of dist/:
     node tools/make-og.mjs
*/
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, appBySlug } from '../src/content.mjs';
import { articles } from '../src/articles.mjs';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'src/assets/og');
const TYPES = { '.css':'text/css', '.woff2':'font/woff2', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };

// serve dist so the template can use the real styles.css and fonts
const server = createServer(async (req, res) => {
  try {
    const f = join(DIST, decodeURIComponent(req.url.split('?')[0]));
    const body = await readFile(f);
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function template({ eyebrow, title, accent, accentSoft, icon }) {
  return `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="http://localhost:${PORT}/styles.css">
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  .og{position:relative;width:1200px;height:630px;background:${accentSoft};
      display:flex;flex-direction:column;justify-content:space-between;
      padding:62px 66px;box-sizing:border-box;border-bottom:14px solid ${accent}}
  .og-eyebrow{display:inline-flex;align-self:flex-start;align-items:center;gap:10px;
      background:#14122B;color:#fff;border-radius:999px;padding:11px 20px;
      font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:17px;
      letter-spacing:.16em;text-transform:uppercase}
  .og-eyebrow img{width:30px;height:30px;border-radius:8px;display:block}
  .og-title{font-family:'Bricolage Display','Bricolage Grotesque',sans-serif;
      font-variation-settings:'wdth' 80,'wght' 800;font-weight:800;
      text-transform:uppercase;color:#14122B;line-height:1.02;
      font-size:${title.length > 64 ? 60 : title.length > 42 ? 70 : 84}px;
      letter-spacing:.004em;margin:26px 0 0;max-width:1010px}
  .og-foot{display:flex;align-items:center;justify-content:space-between}
  .og-brand{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:26px;
      color:#14122B;display:flex;align-items:center;gap:12px}
  .og-dot{width:17px;height:17px;border-radius:50%;background:${accent};display:block}
  .og-url{font-family:'Manrope',sans-serif;font-weight:700;font-size:19px;color:#14122B;opacity:.62}
</style>
<div class="og">
  <div>
    <span class="og-eyebrow">${icon ? `<img src="http://localhost:${PORT}/icons/${icon}">` : ''}${esc(eyebrow)}</span>
    <h1 class="og-title">${esc(title)}</h1>
  </div>
  <div class="og-foot">
    <span class="og-brand"><span class="og-dot"></span>${esc(site.author)}</span>
    <span class="og-url">appsbysass.com</span>
  </div>
</div>`;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const jobs = [];
for (const a of apps) {
  jobs.push({ name: a.slug, eyebrow: a.name, title: a.tagline, accent: a.accent, accentSoft: a.accentSoft, icon: a.icon });
}
for (const art of articles) {
  const a = appBySlug[art.app];
  if (!a) { console.warn('  skip (unknown app):', art.slug); continue; }
  jobs.push({ name: art.slug, eyebrow: a.name, title: art.title, accent: a.accent, accentSoft: a.accentSoft, icon: a.icon });
}
jobs.push({ name: 'default', eyebrow: 'iOS · Independent', title: 'iPhone apps, made properly.',
            accent: '#5B46F0', accentSoft: '#EEEBFF', icon: null });

let n = 0;
for (const j of jobs) {
  await page.setContent(template(j), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(90);
  await page.screenshot({ path: join(OUT, `${j.name}.jpg`), type: 'jpeg', quality: 86 });
  n++;
}
console.log(`wrote ${n} og images to src/assets/og/`);
await browser.close();
server.close();
