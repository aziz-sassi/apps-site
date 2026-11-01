/* Per-page Open Graph images.
   Every guide shared the one default.jpg, so 33 different guides looked
   identical in a link preview. This renders one image per guide (and per app
   and page) in the site's own fonts and poster colours, so a share looks like
   the site rather than like a generic card.

   Output is static and committed. OG images are fetched by crawlers, never by
   the page, so this adds nothing to page weight.

   Run from the repo root AFTER `node build.mjs`, because it loads fonts and
   icons out of dist/:
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
    // the card is set as content with no origin, so fonts need CORS to load
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function template({ eyebrow, title, panel, head, ink, pill, pillInk, icon }) {
  return `<!doctype html><meta charset="utf-8">
<style>
  @font-face{font-family:'Sofia Sans Condensed';font-weight:700 900;src:url('http://localhost:${PORT}/fonts/SofiaSansCondensed-latin.woff2') format('woff2')}
  @font-face{font-family:'Nunito';font-weight:500 900;src:url('http://localhost:${PORT}/fonts/Nunito-latin.woff2') format('woff2')}
  html,body{margin:0;width:1200px;height:630px;overflow:hidden}
  .og{position:relative;width:1200px;height:630px;background:${panel};color:${ink};
      display:flex;flex-direction:column;justify-content:space-between;
      padding:58px 66px 0;box-sizing:border-box;overflow:hidden}
  .og::before{content:"";position:absolute;right:-160px;top:-220px;width:640px;height:640px;border-radius:50%;background:rgba(255,255,255,.08)}
  .og-eyebrow{position:relative;display:inline-flex;align-self:flex-start;align-items:center;gap:12px;
      font-family:'Nunito',sans-serif;font-weight:900;font-size:24px}
  .og-eyebrow img{width:52px;height:52px;border-radius:14px;display:block}
  .og-title{position:relative;font-family:'Sofia Sans Condensed',sans-serif;font-weight:900;
      text-transform:uppercase;color:${head};line-height:.9;
      font-size:${title.length > 64 ? 78 : title.length > 42 ? 92 : 112}px;
      margin:24px 0 0;max-width:1040px;text-wrap:balance}
  .og-foot{position:relative;display:flex;align-items:center;justify-content:space-between;
      background:#F6F1E4;color:#13261F;margin:0 -66px;padding:22px 66px 26px}
  .og-foot svg{position:absolute;left:0;right:0;top:-29px;width:100%;height:30px;color:#F6F1E4}
  .og-brand{font-family:'Sofia Sans Condensed',sans-serif;font-weight:900;font-size:34px;text-transform:uppercase;display:flex;align-items:center;gap:12px}
  .og-dot{width:22px;height:22px;border-radius:7px;background:#0F3D2E;display:grid;place-items:center;transform:rotate(-8deg)}
  .og-dot::after{content:"";width:10px;height:10px;border-radius:50%;background:#3DDC97}
  .og-url{font-family:'Nunito',sans-serif;font-weight:800;font-size:21px;opacity:.7}
</style>
<div class="og">
  <div>
    <span class="og-eyebrow">${icon ? `<img src="http://localhost:${PORT}/icons/${icon}">` : ''}${esc(eyebrow)}</span>
    <h1 class="og-title">${esc(title)}</h1>
  </div>
  <div class="og-foot">
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path fill="currentColor" d="M0 34C160 6 330 4 520 26s370 40 560 20 280-40 360-30V60H0z"/></svg>
    <span class="og-brand"><span class="og-dot"></span>${esc(site.author)}</span>
    <span class="og-url">appsbysass.com</span>
  </div>
</div>`;
}

const colours = (a) => ({ panel: a.panel, head: a.panelHead, ink: a.panelInk, pill: a.pill, pillInk: a.pillInk });

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

const jobs = [];
for (const a of apps) {
  jobs.push({ name: a.slug, eyebrow: a.name, title: a.tagline, ...colours(a), icon: a.icon });
}
for (const art of articles) {
  const a = appBySlug[art.app];
  if (!a) { console.warn('  skip (unknown app):', art.slug); continue; }
  jobs.push({ name: art.slug, eyebrow: a.name, title: art.title, ...colours(a), icon: a.icon });
}
jobs.push({ name: 'default', eyebrow: 'Independent iPhone apps', title: 'iPhone apps that do one job.',
            panel: '#0F3D2E', head: '#F6F1E4', ink: '#F6F1E4', pill: '#3DDC97', pillInk: '#0F3D2E', icon: null });

let n = 0;
for (const j of jobs) {
  await page.setContent(template(j), { waitUntil: 'load' });
  // fonts.ready resolves at once if nothing has started loading yet, so ask
  // for both faces by name and wait for them
  await page.evaluate(() => Promise.all([
    document.fonts.load('900 80px "Sofia Sans Condensed"', 'A'),
    document.fonts.load('900 24px "Nunito"', 'A'),
  ]).then(() => document.fonts.ready));
  await page.waitForTimeout(90);
  await page.screenshot({ path: join(OUT, `${j.name}.jpg`), type: 'jpeg', quality: 86 });
  n++;
}
console.log(`wrote ${n} og images to src/assets/og/`);
await browser.close();
server.close();
