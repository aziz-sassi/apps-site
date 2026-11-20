/* Emits the Editorial Pop preview at dist/v3/index.html using the real site
   content, so nothing here is placeholder copy. Run after `node build.mjs`.  */
import { mkdir, writeFile, copyFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, otherWork } from '../content.mjs';
import { articles } from '../articles.mjs';
const store = JSON.parse(await readFile(new URL('../store-data.json', import.meta.url), 'utf8'));
// the code-drawn app screens, inlined so there is no extra request per screen
const screens = {};
for (const k of ['jupiter', 'bo', 'bali', 'hold']) {
  screens[k] = await readFile(new URL(`./motion-screens/${k}.html`, import.meta.url), 'utf8');
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'dist/v3');
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const sources = new Set();
articles.forEach((a) => (a.sources || []).forEach((s) => sources.add(s.url || s)));

const SHOTS = { 'jupiter-walkies':'jupiter', bo:'bo', 'bali-secret':'bali', hold:'hold' };
const ICON  = { 'jupiter-walkies':'jupiter.jpg', bo:'bo.jpg', 'bali-secret':'bali.jpg', hold:'hold.jpg' };
const TINT  = { 'jupiter-walkies':'#FFF1EB', bo:'#E9F9F1', 'bali-secret':'#E4F7F9', hold:'#EEEBFF' };

const appCard = (a, i) => {
  const k = SHOTS[a.slug];
  const spec = store[a.slug] || {};
  const feats = (a.features || []).slice(0, 3);
  return `
      <article class="app rv d${(i % 3) + 1}" style="--tint:${TINT[a.slug]};--accent:${a.accent}">
        <div class="app-body">
          <img class="app-ico" src="/icons/${ICON[a.slug]}" alt="" width="56" height="56" loading="lazy">
          <h3>${esc(a.name)}</h3>
          <p class="tag">${esc(a.tagline)}</p>
          <p class="blurb">${esc(a.description || '')}</p>
          <ul class="feats">
            ${feats.map(([h, p]) => `<li><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join('')}
          </ul>
          <dl class="spec">
            ${spec.version ? `<div><dt>Version</dt><dd>${esc(spec.version)}</dd></div>` : ''}
            ${spec.updated ? `<div><dt>Updated</dt><dd>${new Date(spec.updated).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</dd></div>` : ''}
            ${spec.sizeMb ? `<div><dt>Size</dt><dd>${esc(spec.sizeMb)} MB</dd></div>` : ''}
            <div><dt>Requires</dt><dd>iOS ${esc(a.minOs)}+</dd></div>
          </dl>
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
<link rel="stylesheet" href="/v3/motion-screens/screens.css">
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
    <h1 class="mega rv d1">I needed these.<br>So I <span class="hl">built</span> them.</h1>
    <p class="lede rv d2">Small apps for problems I actually had. No team, no investors,
      nobody to talk me out of the odd ones.</p>
    <div class="cta-row rv d3">
      <a class="btn" href="#apps">What they do &rarr;</a>
      <a class="btn ghost" href="#guides">Read the guides</a>
    </div>
  </div>
</header>

<div class="rail" aria-hidden="true">
  <div class="rail-in">
    ${apps.map((a) => `<span><i style="background:${a.accent}"></i>${esc(a.name)}</span>`).join('')}
    <span><i style="background:#0E1013"></i>More on the way</span>
  </div>
</div>

<section class="showcase" id="showcase" aria-label="What each app does">
  <div class="showcase-pin">
    <div class="showcase-bg"></div>
    <div class="showcase-in">
      <div class="showcase-copy">
        <span class="n" data-sc-n>01 &mdash; ${apps.length.toString().padStart(2,'0')}</span>
        <h3 data-sc-name>${esc(apps[0].name)}</h3>
        <p data-sc-line>${esc(apps[0].description || apps[0].tagline)}</p>
        <div class="showcase-dots">${apps.map((_, i) => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div>
      </div>
      <div class="showcase-phone">
        ${apps.map((a, i) => `<div class="ms-slot${i === 0 ? ' on' : ''}">${screens[SHOTS[a.slug]] || ''}</div>`).join('')}
      </div>
    </div>
  </div>
</section>

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
      <p>Written because the answer I wanted did not exist yet, or existed badly.
         Every one dated, every claim sourced.</p></div>
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

<script>window.__APPS=${JSON.stringify(apps.map((a) => ({
  name: a.name, line: a.description || a.tagline, accent: a.accent,
})))}</script>
<script src="/v3/motion.js" defer></script>
<script src="/v3/motion-screens/screens.js" defer></script>
</body></html>`;

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'index.html'), html);
for (const f of ['styles.css', 'fonts.css', 'motion.js']) {
  await copyFile(join(ROOT, 'src/design-v3', f), join(OUT, f));
}
await mkdir(join(OUT, 'motion-screens'), { recursive: true });
for (const f of ['screens.css', 'screens.js']) {
  await copyFile(join(ROOT, 'src/design-v3/motion-screens', f), join(OUT, 'motion-screens', f));
}
console.log(`dist/v3/index.html  ${(html.length / 1024).toFixed(1)} KB`);
