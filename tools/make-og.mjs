// Renders 1200x630 Open Graph cards with headless Chrome (already on this Mac
// for Lighthouse). Run: node tools/make-og.mjs
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, site } from '../src/content.mjs';

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TMP = join(ROOT, '.og-tmp');
const OUT = join(ROOT, 'src/assets/og');

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

async function card({ file, accent, accentInk, icon, title, sub, kicker }) {
  const iconData = icon
    ? 'data:image/jpeg;base64,' + (await readFile(join(ROOT, 'icons', icon))).toString('base64')
    : null;
  const fontB = (await readFile(join(ROOT, 'src/assets/fonts/BricolageGrotesque-latin.woff2'))).toString('base64');
  const fontM = (await readFile(join(ROOT, 'src/assets/fonts/Manrope-latin.woff2'))).toString('base64');
  const cloud = (x, y, w, o) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;opacity:${o};color:#fff">
    <svg viewBox="0 0 200 92" style="width:100%;display:block"><g fill="currentColor">
    <ellipse cx="56" cy="56" rx="42" ry="28"/><ellipse cx="102" cy="43" rx="40" ry="33"/>
    <ellipse cx="148" cy="58" rx="36" ry="25"/><rect x="30" y="56" width="140" height="28" rx="14"/>
    </g></svg></div>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;src:url(data:font/woff2;base64,${fontB}) format('woff2');font-weight:700 800}
@font-face{font-family:M;src:url(data:font/woff2;base64,${fontM}) format('woff2');font-weight:500 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:${accent};position:relative;font-family:M,sans-serif}
.g{position:absolute;inset:0;background:radial-gradient(60% 70% at 15% 0%,rgba(255,255,255,.26),transparent 62%),linear-gradient(180deg,transparent,rgba(0,0,0,.2))}
.c{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;padding:74px 78px;color:#fff}
.k{font-family:B;font-weight:800;font-size:19px;letter-spacing:.2em;text-transform:uppercase;opacity:.82;margin-bottom:26px}
.t{font-family:B;font-weight:800;font-size:${title.length > 34 ? 68 : 84}px;line-height:1.0;letter-spacing:-.035em;max-width:14ch}
.s{font-size:28px;line-height:1.42;margin-top:24px;max-width:26ch;color:rgba(255,255,255,.93)}
.ic{position:absolute;right:82px;top:50%;transform:translateY(-50%);width:264px;height:264px;border-radius:62px;border:6px solid rgba(0,0,0,.34);overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.4)}
.ic img{width:100%;height:100%;object-fit:cover;display:block}
.b{position:absolute;left:78px;bottom:52px;z-index:3;display:flex;align-items:center;gap:11px;font-family:B;font-weight:800;font-size:20px;letter-spacing:-.02em;color:#fff}
.b i{width:15px;height:15px;border-radius:5px;background:#fff;display:block}
</style></head><body>
<div class="g"></div>
${cloud(-40, 40, 300, .2)}${cloud(720, -30, 420, .14)}${cloud(120, 430, 250, .16)}${cloud(880, 400, 330, .12)}
<div class="c">
  <div class="k">${esc(kicker)}</div>
  <div class="t">${esc(title)}</div>
  ${sub ? `<div class="s">${esc(sub)}</div>` : ''}
</div>
${iconData ? `<div class="ic"><img src="${iconData}"></div>` : ''}
<div class="b"><i></i>${esc(site.name)}</div>
</body></html>`;

  const tmpFile = join(TMP, file + '.html');
  await writeFile(tmpFile, html);
  await run(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1200,630',
    `--screenshot=${join(OUT, file + '.png')}`, 'file://' + tmpFile]);
  console.log('  ' + file + '.png');
}

await rm(TMP, { recursive: true, force: true });
await mkdir(TMP, { recursive: true });
await mkdir(OUT, { recursive: true });

console.log('rendering OG cards:');
await card({ file: 'default', accent: '#5B46F0', icon: null,
  kicker: 'iOS · Independent',
  title: 'iPhone apps, made properly.',
  sub: 'Free apps and researched guides.' });

for (const a of apps) {
  await card({ file: a.slug, accent: a.accent, icon: a.icon,
    kicker: a.category, title: a.name, sub: a.tagline });
}
await rm(TMP, { recursive: true, force: true });
