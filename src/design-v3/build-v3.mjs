/* Emits the Editorial Pop preview at dist/v3/index.html using the real site
   content, so nothing here is placeholder copy. Run after `node build.mjs`.  */
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, otherWork } from '../content.mjs';
import { articles } from '../articles.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'dist/v3');
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const sources = new Set();
articles.forEach((a) => (a.sources || []).forEach((s) => sources.add(s.url || s)));
const minSources = Math.min(...articles.map((a) => (a.sources || []).length).filter(Boolean));

const SHOTS = { 'jupiter-walkies':'jupiter', bo:'bo', 'bali-secret':'bali', hold:'hold' };
const ICON  = { 'jupiter-walkies':'jupiter.jpg', bo:'bo.jpg', 'bali-secret':'bali.jpg', hold:'hold.jpg' };
const TINT  = { 'jupiter-walkies':'#FFF1EB', bo:'#E9F9F1', 'bali-secret':'#E4F7F9', hold:'#EEEBFF' };

const appCard = (a, i) => {
  const k = SHOTS[a.slug];
  return `
      <article class="app rv d${(i % 3) + 1}" style="--tint:${TINT[a.slug]};--accent:${a.accent}">
        <div>
          <img class="app-ico" src="/icons/${ICON[a.slug]}" alt="" width="52" height="52" loading="lazy">
          <h3>${esc(a.name)}</h3>
          <p class="tag">${esc(a.tagline)}</p>
          <div class="meta">
            <span class="chip">${esc(a.category)}</span>
            <span class="chip">iOS ${esc(a.minOs)}+</span>
          </div>
          <a class="btn" href="/${a.slug}/">Open ${esc(a.name)} &rarr;</a>
        </div>
        <div class="app-shot">
          ${[1,2,3].map((n) => `<img src="/shots/${k}-${n}.jpg" alt="${esc(a.name)} screen ${n}" loading="lazy">`).join('')}
        </div>
      </article>`;
};

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(site.author)} — Independent iPhone Apps</title>
<meta name="robots" content="noindex"><!-- preview only; never index a draft design -->
<link rel="stylesheet" href="/v3/fonts.css">
<link rel="stylesheet" href="/v3/styles.css">
</head><body>

<div class="mesh" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="prog" aria-hidden="true"></div>

<nav class="nav">
  <div class="wrap">
    <a class="brand" href="/"><span></span>${esc(site.author)}</a>
    <div class="nav-links">
      ${apps.map((a) => `<a href="/${a.slug}/">${esc(a.name)}</a>`).join('')}
      <a href="/about/">About</a><a href="/disclosure/">Disclosure</a>
    </div>
    <a class="btn ghost" href="#apps">See the apps</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <span class="kicker rv"><b></b>Independent &middot; iOS</span>
    <h1 class="mega rv d1">Apps that do<br><span class="hl">one thing</span>, properly.</h1>
    <p class="lede rv d2">A dog-walk tracker, an honest calorie counter, a Bali trip planner and a
      quit-smoking coach. Designed, built and supported by one person &mdash; the one who answers your email.</p>
    <div class="cta-row rv d3">
      <a class="btn" href="#apps">See the apps &rarr;</a>
      <a class="btn ghost" href="#guides">Read the guides</a>
    </div>
    <div class="trust rv d3">
      <div><b>${articles.length}</b><span>researched guides</span></div>
      <div><b>${sources.size}</b><span>sources cited</span></div>
      <div><b>${minSources}+</b><span>sources per guide</span></div>
      <div><b>1</b><span>person, start to finish</span></div>
    </div>
  </div>
</header>

<div class="rail" aria-hidden="true">
  <div class="rail-in">
    ${apps.map((a) => `<span><i style="background:${a.accent}"></i>${esc(a.name)}</span>`).join('')}
    <span><i style="background:#0E1013"></i>More on the way</span>
  </div>
</div>

<section class="sec" id="apps">
  <div class="wrap">
    <div class="sec-head"><h2>The apps</h2>
      <p>Each one started as something I wanted to exist, then got built until it did.</p></div>
    <div class="apps">${apps.map(appCard).join('')}</div>
  </div>
</section>

<section class="sec" id="guides">
  <div class="wrap">
    <div class="sec-head"><h2>Answers, not filler</h2>
      <p>${articles.length} guides, ${sources.size} sources cited, every one dated. Written because the
         existing answers were thin, not to fill a content calendar.</p></div>
    <div class="gchips rv">
      ${articles.slice(0, 8).map((a) => {
        const app = apps.find((x) => x.slug === a.app);
        return `<a class="gchip" href="/${a.app}/${a.slug}/"><i style="background:${app ? app.accent : '#0E1013'}"></i>${esc(a.title)}</a>`;
      }).join('')}
    </div>
    <div class="cta-row" style="justify-content:flex-start">
      <a class="btn" href="/guides/">All ${articles.length} guides &rarr;</a>
    </div>
  </div>
</section>

<section class="sec" id="who">
  <div class="wrap">
    <div class="sec-head"><h2>One person. No company.</h2>
      <p>I design, build and support every app here myself &mdash; no team, no investors, no outsourced
         support desk. If something breaks, the person reading your email wrote the code.</p></div>
    <div class="facts rv">
      <div><b>Published by</b><span>${esc(site.author)}, verified on the App&nbsp;Store</span></div>
      <div><b>Reachable at</b><span><a href="mailto:${esc(site.email || 'sassiaziz50@gmail.com')}">${esc(site.email || 'sassiaziz50@gmail.com')}</a> &mdash; a real inbox</span></div>
      <div><b>How the apps are funded</b><span><a href="/disclosure/">Read the disclosure</a></span></div>
      <div><b>What this site collects</b><span><a href="/privacy/">No cookies, no ad trackers</a></span></div>
    </div>
    <div class="cta-row" style="justify-content:flex-start;margin-top:22px">
      <a class="btn ghost" href="/about/">About</a>
      <a class="btn ghost" href="/disclosure/">Disclosure</a>
    </div>
  </div>
</section>

<section class="sec" id="other">
  <div class="wrap">
    <div class="sec-head"><h2>Not an iPhone app</h2>
      <p>Software I build that does not live on the App&nbsp;Store.</p></div>
    <div class="apps">
      ${otherWork.map((w, i) => `
      <article class="app rv d${i + 1}" style="--tint:#F3F1EC;--accent:${w.accent}">
        <div>
          <h3>${esc(w.name)}</h3>
          <p class="tag">${esc(w.tagline)}</p>
          <div class="meta"><span class="chip">${esc(w.where)}</span></div>
          <p style="margin-bottom:20px">${esc(w.blurb)}</p>
          <a class="btn" href="${w.url}" target="_blank" rel="noopener">Visit ${esc(w.name)} &rarr;</a>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

<footer class="foot">
  <div class="wrap">
    <h2>Start with the one<br>that fits.</h2>
    <div class="cta-row"><a class="btn" href="#apps">See the apps &rarr;</a></div>
    <p class="small">&copy; ${new Date().getFullYear()} ${esc(site.author)} &middot; appsbysass.com</p>
  </div>
</footer>

<script src="/v3/motion.js" defer></script>
</body></html>`;

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'index.html'), html);
for (const f of ['styles.css', 'fonts.css', 'motion.js']) {
  await copyFile(join(ROOT, 'src/design-v3', f), join(OUT, f));
}
console.log(`dist/v3/index.html  ${(html.length / 1024).toFixed(1)} KB`);
