// ---------------------------------------------------------------------------
// Static site generator. `node build.mjs` writes everything into dist/.
// Pages, internal links, JSON-LD, sitemap and robots.txt all derive from
// src/content.mjs + src/articles.mjs — never hand-edit dist/.
// ---------------------------------------------------------------------------
import { mkdir, writeFile, readFile, readdir, rm, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, otherWork, appBySlug } from './src/content.mjs';
import { articles } from './src/articles.mjs';
import { pages } from './src/pages.mjs';
import { plans } from './src/plans.mjs';
import { planMedia } from './src/plan-media.mjs';
import { readFileSync } from 'node:fs';

const ROOT = dirname(fileURLToPath(import.meta.url));
// FLAT=1 emits one directory of relative-linked .html files, for hosts that
// cannot serve /root-relative paths (the Artifact preview). The default build
// keeps the clean /app-name/ URLs that the real deploy and SEO want.
const FLAT = process.env.FLAT === '1';
const NOINDEX = process.env.NOINDEX === '1';
const DIST = join(ROOT, FLAT ? 'dist-flat' : 'dist');

// Live App Store facts (version, update date, size), refreshed by
// `node tools/fetch-store.mjs`. Read from the cached file rather than fetched
// here, so a network problem can never break a build or a deploy. If the file
// is missing the spec rows simply do not render.
let storeData = {};
try {
  storeData = JSON.parse(readFileSync(join(ROOT, 'src', 'store-data.json'), 'utf8'));
} catch {
  console.warn('! src/store-data.json missing — run node tools/fetch-store.mjs');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.origin.replace(/\/$/, '') + p;
const words = (a) => a.blocks.reduce((n, [t, v]) =>
  n + (typeof v === 'string' ? v.split(/\s+/).length
    : Array.isArray(v) ? v.join(' ').split(/\s+/).length
    : (v.rows || []).flat().join(' ').split(/\s+/).length), 0);
const readMins = (a) => Math.max(2, Math.round(words(a) / 220));
const articlesFor = (slug) => articles.filter((a) => a.app === slug);

// Trust figures shown on the home page. Computed, never typed by hand, so they
// cannot drift away from what the site actually contains.
const totalSources = articles.reduce((n, a) => n + (a.sources?.length || 0), 0);
const minSources = articles.length
  ? Math.min(...articles.map((a) => a.sources?.length || 0))
  : 0;

// Health and nutrition are \"Your Money or Your Life\" topics. Google's quality
// guidelines expect a clear, visible disclaimer rather than one buried at the
// bottom, so these two apps get it directly under the short answer.
const YMYL = new Set(['hold', 'bo']);

const niceDate = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
});

const hHome    = ()       => (FLAT ? 'index.html' : '/');
const hApp     = (s2)     => (FLAT ? `${s2}.html` : `/${s2}/`);
const hArticle = (ap, s2) => (FLAT ? `${ap}--${s2}.html` : `/${ap}/${s2}/`);
const hAsset   = (f)      => (FLAT ? f : `/${f}`);
const hPage    = (s2)     => (FLAT ? `${s2}.html` : `/${s2}/`);

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const OUT   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

// A soft wave edge between two grounds, the shape the app puts under its
// hero photos. currentColor is the ground below, so one path serves every page.
const WAVE = (cls = 'wave-bottom') => `<svg class="wave ${cls}" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 34C160 6 330 4 520 26s370 40 560 20 280-40 360-30V60H0z"/></svg>`;

// Per-app poster colours as CSS custom properties, for a card or a whole page.
const panelVars = (a) => `--panel:${a.panel};--panel-head:${a.panelHead};--panel-ink:${a.panelInk};--pill:${a.pill};--pill-ink:${a.pillInk}`;

// Marquee. Two identical tracks so the loop is seamless.
const tickItems = apps.map((a) => `<span>${esc(a.name)}</span>`).join('') + '<span>More coming</span>';
const MARQUEE = `<div class="marquee" aria-hidden="true"><div class="marquee-track">${tickItems}</div><div class="marquee-track">${tickItems}</div></div>`;

// Ambient background video. data-src rather than src: motion.js only attaches
// the source when the section is near the viewport, so nothing downloads on load
// and reduced-motion users never fetch it at all. The poster carries the look
// until then, and remains the whole experience if the video never loads.
function ambientVideo(name, cls = 'ambient', poster = false) {
  return `<video class="${cls}" muted loop playsinline preload="none"${poster ? ` poster="${hAsset(`video/${name}-poster.jpg`)}"` : ''}
    data-webm="${hAsset(`video/${name}.webm`)}"
    data-mp4="${hAsset(`video/${name}.mp4`)}" aria-hidden="true"></video>`;
}

// A real screenshot in a phone frame. eager=true only above the fold.
function phone(app, shot, { eager = false, tag = '', tagCls = '', width = 240 } = {}) {
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" fetchpriority="low"';
  return `<figure class="phone">
      <img src="${hAsset('shots/' + shot)}" alt="" width="${width}" height="${Math.round(width * 518 / 240)}" ${load} decoding="async">${
      tag ? `<span class="tag ${tagCls}">${esc(tag)}</span>` : ''}
    </figure>`;
}

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='18' fill='%230F3D2E'/%3E%3Ccircle cx='32' cy='32' r='13' fill='%233DDC97'/%3E%3C/svg%3E";

// --- App Store link. data-store is what escape.js rewrites on Meta webviews.
const storeLink = (app, label = 'Get it on the App Store', cls = 'btn') =>
  `<a class="${cls}" href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}">${esc(label)} ${OUT}</a>`;

// ---------------------------------------------------------------------------
// Document shell
// ---------------------------------------------------------------------------
function layout({ title, description, path, app, ogImage, body, jsonld = [], noNav = false, noindex = false, current = '' }) {
  const canonical = abs(path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${NOINDEX ? '<meta name="robots" content="noindex,nofollow">' : noindex ? '<meta name="robots" content="noindex,follow">' : ''}
<meta name="theme-color" content="#0F3D2E">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(abs('/og/' + (ogImage || 'default') + '.jpg'))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(abs('/og/' + (ogImage || 'default') + '.jpg'))}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="${FAVICON}">
<link rel="apple-touch-icon" href="${hAsset('icons/jupiter.jpg')}">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${hAsset('fonts/SofiaSansCondensed-latin.woff2')}">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${hAsset('fonts/Nunito-latin.woff2')}">
<link rel="stylesheet" href="${hAsset('styles.css')}">
${site.analytics?.searchConsole ? `<meta name="google-site-verification" content="${esc(site.analytics.searchConsole)}">` : ''}
${site.verification?.impact ? `<meta name="impact-site-verification" value="${esc(site.verification.impact)}">` : ''}
${site.analytics?.vercel ? `<script defer src="/_vercel/insights/script.js"></script>` : ''}
${site.analytics?.ga4 ? `<script>window.__ga4Id=${JSON.stringify(site.analytics.ga4)}</script>` : ''}
${app ? `<style>:root{${panelVars(app)};--accent:${app.accent};--accent-ink:${app.accentInk}}</style>` : ''}
${jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body>

<div class="notice" id="notice" role="status">
  <div class="wrap notice-in">
    <div class="notice-txt" id="notice-txt"></div>
    <a class="notice-cta" id="notice-cta" href="#">Open ${OUT}</a>
  </div>
</div>

${noNav ? '' : `<nav class="nav">
  <div class="wrap nav-in">
    <a class="logo" href="${hHome()}"><i aria-hidden="true"></i>${esc(site.name)}</a>
    <div class="nav-links">
      ${apps.map((a) => `<a href="${hApp(a.slug)}"${current === a.slug ? ' aria-current="page"' : ''}>${esc(a.name)}</a>`).join('\n      ')}
      <span class="nav-sep" aria-hidden="true"></span>
      <a class="nav-meta" href="${hPage('about')}">About</a>
      <a class="nav-meta" href="${hPage('disclosure')}">Disclosure</a>
    </div>
  </div>
</nav>`}

${body}

<footer>
  ${WAVE('wave-top')}
  <div class="wrap">
    <p class="foot-big" aria-hidden="true">Built one<br><span>at a time.</span></p>
    <div class="foot-grid">
      <div>
        <p class="foot-h">Apps</p>
        <ul>${apps.map((a) => `<li><a href="${hApp(a.slug)}">${esc(a.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="foot-h">Guides</p>
        <ul>${articles.slice(0, 6).map((a) => `<li><a href="${hArticle(a.app, a.slug)}">${esc(a.title.length > 34 ? a.title.slice(0, 34) + '…' : a.title)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="foot-h">Site</p>
        <ul>${pages.map((pg) => `<li><a href="${FLAT ? pg.slug + '.html' : '/' + pg.slug + '/'}">${esc(pg.title)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <p class="foot-h">Elsewhere</p>
        <ul><li><a href="${esc(site.developerUrl)}" data-store="${esc(site.developerUrl)}">App Store profile</a></li></ul>
      </div>
    </div>
    <div class="foot-end">
      <span>&copy; ${new Date().getFullYear()} ${esc(site.name)}. Independent iPhone apps.</span>
    </div>
  </div>
</footer>

<div class="sheet" id="sheet" role="dialog" aria-labelledby="sheet-h">
  <div class="wrap sheet-in">
    <h2 id="sheet-h">One more tap</h2>
    <p>Instagram&rsquo;s built-in browser won&rsquo;t hand off to the App&nbsp;Store.</p>
    <p>Tap <span class="kbd">&#8943;</span> at the top-right, then <span class="kbd">Open in browser</span>.</p>
    <button class="sheet-x" id="sheet-x" type="button">Got it</button>
  </div>
</div>

${site.analytics?.ga4 ? `
<div class="consent" id="consent" role="dialog" aria-modal="false" aria-labelledby="consent-t" hidden>
  <div class="consent-in">
    <p class="eyebrow" id="consent-t">Analytics</p>
    <p class="consent-copy">This site uses Google Analytics to see which guides people find useful.
      It sets cookies. Nothing is sold or shared with advertisers, and declining costs you nothing &mdash;
      the site works identically either way. <a href="${hPage('privacy')}">What is collected</a>.</p>
    <div class="consent-row">
      <button class="consent-btn" type="button" data-consent="granted">Allow analytics</button>
      <button class="consent-btn alt" type="button" data-consent="denied">Decline</button>
    </div>
  </div>
</div>` : ''}
<script src="${hAsset('escape.js')}" defer></script>
<script src="${hAsset('motion.js')}" defer></script>
${site.analytics?.ga4 ? `<script src="${hAsset('consent.js')}" defer></script>` : ''}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Block renderer for article bodies
// ---------------------------------------------------------------------------
// Article bodies may contain in-prose links written as /app/slug/. In FLAT
// mode those must become flat filenames, since that host serves no /root paths.
function fixLinks(html) {
  if (!FLAT) return html;
  return html.replace(/href="\/([a-z0-9-]+)\/([a-z0-9-]+)\/"/g, 'href="$1--$2.html"')
             .replace(/href="\/([a-z0-9-]+)\/"/g, 'href="$1.html"');
}

const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ');
const slugify = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
const headings = (blocks) => {
  const seen = new Set();
  return blocks.filter(([t]) => t === 'h2').map(([, v]) => {
    let id = slugify(v) || 'section', n = 2;
    while (seen.has(id)) id = `${slugify(v)}-${n++}`;
    seen.add(id);
    return { id, text: v };
  });
};

// The app feature closest to what a guide is about, so the mid-article CTA
// talks about the thing the reader is reading about rather than the app in
// general. Plain word overlap is enough at this size, and it keeps working
// when a guide or a feature is added without anyone wiring them together.
const STOP = new Set('the a an and or of to in on for is are be it you your with at by from that this not do does how what when why can as more than just own'.split(' '));
const bag = (s) => new Set(plain(s).toLowerCase().split(/[^a-z0-9]+/)
  .filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/(ing|ed|s)$/, '')));
const topicOf = (a) => bag([a.title, a.answer, ...a.blocks.filter(([t]) => t === 'h2').map(([, v]) => v)].join(' '));
function featureFor(a, app) {
  if (a.feature) {
    const f = app.features.find(([t]) => t === a.feature);
    if (!f) throw new Error(`${a.slug}: feature "${a.feature}" is not one of ${app.name}'s features`);
    return f;
  }
  // Words every guide for this app shares ("dog", "walk") say nothing about
  // this one, so each word counts by how rare it is among the app's guides.
  const peers = articlesFor(app.slug).map(topicOf);
  const weight = (w) => 1 - peers.filter((t) => t.has(w)).length / (peers.length + 1);
  const topic = topicOf(a);
  let best = app.features[0], top = 0;
  for (const f of app.features) {
    const score = [...bag(f[0] + ' ' + f[1])].filter((w) => topic.has(w)).reduce((n, w) => n + weight(w), 0);
    if (score > top) { best = f; top = score; }
  }
  return best;
}

// Mid-article CTA: what this guide's topic looks like inside the app, with a
// real screenshot beside it so the claim has something to point at. A
// feature's optional third entry in content.mjs names the shot that shows it.
function inlineCta(app, feature = app.features[0]) {
  const shot = feature[2] || app.shots[1] || app.shots[0];
  return `<aside class="mid-cta" aria-label="${esc(app.name)} on the App Store" style="${panelVars(app)}">
    <figure class="mc-shot" aria-hidden="true"><img src="${hAsset('shots/' + shot)}" alt="" width="240" height="518" loading="lazy" decoding="async"></figure>
    <div class="mc-body">
      <p class="mc-kicker"><span class="ic"><img src="${hAsset('icons/' + app.icon)}" alt="" width="104" height="104" loading="lazy"></span>In ${esc(app.name)}</p>
      <p class="mc-h">${esc(feature[0])}</p>
      <p class="mc-tx">${esc(feature[1])}</p>
      <a class="btn cream small" href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}">Get it on the App&nbsp;Store ${OUT}</a>
    </div>
  </aside>`;
}

function renderBlocks(blocks, app, feature) {
  const ids = headings(blocks).map((h) => h.id);
  let h2i = 0;
  return blocks.map(([type, val]) => {
    switch (type) {
      case 'h2':      return `<h2 id="${ids[h2i++]}">${val}</h2>`;
      case 'p':       return `<p>${val}</p>`;
      case 'ul':      return `<ul>${val.map((li) => `<li>${li}</li>`).join('')}</ul>`;
      case 'ol':      return `<ol>${val.map((li) => `<li>${li}</li>`).join('')}</ol>`;
      case 'callout': return `<div class="callout">${val}</div>`;
      case 'note':    return `<div class="note">${val}</div>`;
      case 'contact': return `<p class="mailto"><a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>`;
      // Three-plus columns cannot fit a phone, so those tables carry each
      // header as data-label and the CSS restacks every row into a card.
      case 'table':   return `<div class="tbl-wrap${val.head.length > 2 ? ' stack' : ''}"><table><thead><tr>${
        val.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
        val.rows.map((r) => `<tr>${r.map((c, i) => `<td data-label="${esc(val.head[i] || '')}">${c}</td>`).join('')}</tr>`).join('')
      }</tbody></table></div>`;
      default:        return '';
    }
  }).map(fixLinks).reduce((out, html, i, arr) => {
    out.push(html);
    // after the second <h2> section, roughly a third in
    if (app && arr.slice(0, i + 1).filter((h) => h.startsWith('<h2')).length === 2
        && arr[i + 1] && arr[i + 1].startsWith('<h2')) out.push(inlineCta(app, feature));
    return out;
  }, []).join('\n');
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function homePage() {
  const heroApps = [appBySlug['bali-secret'], appBySlug['jupiter-walkies'], appBySlug.hold].filter(Boolean);
  const body = `
<header class="hero on-dark" id="hero">
  <div class="wrap">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Independent iPhone apps</p>
        <h1 class="poster">iPhone apps<br><span class="l2">that do one job.</span></h1>
        <p class="pill">Built by one person, start to finish</p>
        <p class="lede">A dog-walk tracker, an honest calorie counter, a Bali trip planner, a quit-smoking coach, and more on the way. Each one does one job, and does it well.</p>
        <div class="cta-row">
          <a class="btn" href="#apps">See the apps ${ARROW}</a>
          <a class="btn ghost" href="#guides">Read the guides</a>
        </div>
        <ul class="hero-stats">
          <li><b>${articles.length}</b>researched guides</li>
          <li><b>${totalSources}</b>sources cited</li>
          <li><b>0</b>ads in any app</li>
        </ul>
      </div>
      <div class="hero-phones" aria-hidden="true">
        ${heroApps.map((a, i) => phone(a, a.shots[0], { eager: true, tag: a.sticker, tagCls: ['', 'coral', 'mint'][i] })).join('')}
        <span class="stamp"><span>Made solo &middot; ${new Date().getFullYear()}</span></span>
      </div>
    </div>
  </div>
  ${WAVE()}
</header>

${MARQUEE}

<section id="apps">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">The apps</p>
      <h2 class="poster">Pick <em>one.</em></h2>
      <p>Each one started as something I wanted to exist, then got built until it did.</p>
    </div>
    <div class="posters">
      ${apps.map((a, i) => `
      <a class="app-poster reveal d${(i % 2) + 1}" href="${hApp(a.slug)}" style="${panelVars(a)}">
        <span class="ap-top">
          <span class="ap-ico"><img src="${hAsset(`icons/${a.icon}`)}" alt="${esc(a.name)} app icon" width="104" height="104" loading="lazy" decoding="async"></span>
          <span><span class="ap-nm">${esc(a.name)}</span><br><span class="ap-cat">${esc(a.category)} &middot; iOS ${esc(a.minOs)}+</span></span>
        </span>
        <span class="ap-go" aria-hidden="true">${ARROW}</span>
        <span class="poster">${esc(a.tagline)}</span>
        <span class="ap-phones" aria-hidden="true">
          ${phone(a, a.shots[1] || a.shots[0])}
          ${phone(a, a.shots[2] || a.shots[0])}
          <span class="tag">${esc(a.sticker)}</span>
        </span>
      </a>`).join('')}
      <div class="soon-poster reveal">
        <span class="poster">More on the way</span>
        <p>New apps ship when they&rsquo;re ready, not on a schedule.</p>
      </div>
    </div>
  </div>
</section>

${demoStage()}

<section class="on-dark" id="screens" style="position:relative">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Real screens</p>
      <h2 class="poster">What they <em>actually</em> look like</h2>
      <p>Straight from the builds on the App&nbsp;Store right now. Not mockups, not renders.</p>
    </div>
    <div class="rail">
      ${apps.flatMap((a) => a.shots.map((s, i) => `<figure class="shot">
        ${phone(a, s)}
        ${i === 0 ? `<figcaption><img src="${hAsset(`icons/${a.icon}`)}" alt="" width="52" height="52" loading="lazy">${esc(a.name)}</figcaption>` : '<figcaption aria-hidden="true">&nbsp;</figcaption>'}
      </figure>`)).join('')}
    </div>
  </div>
  ${WAVE()}
</section>

<section id="who">
  <div class="wrap">
    <div class="maker reveal">
      <div>
        <p class="eyebrow">Who builds these</p>
        <h2 class="poster">One person.<br><em>No company.</em></h2>
        <p class="lede">I&rsquo;m ${esc(site.author)}. I design, build and support every app on this site myself: no team, no investors, no outsourced support desk. If something breaks, the person reading your email is the person who wrote the code.</p>
        <div class="cta-row">
          <a class="btn ink" href="${esc(site.developerUrl)}" data-store="${esc(site.developerUrl)}" rel="noopener">All of them on the App Store ${OUT}</a>
          <a class="btn ghost" href="${hPage('about')}">More about me</a>
        </div>
      </div>
      <ul class="facts">
        <li><b>Published by</b><span><a href="${esc(site.developerUrl)}" data-store="${esc(site.developerUrl)}" rel="noopener">${esc(site.author)}</a>, verified on the App&nbsp;Store</span></li>
        <li><b>Reachable at</b><span><a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a>, a real inbox</span></li>
        <li><b>How the apps are funded</b><span><a href="${hPage('disclosure')}">Read the disclosure</a></span></li>
        <li><b>What this site collects</b><span><a href="${hPage('privacy')}">${site.analytics?.ga4 ? 'Analytics only, your choice' : 'No cookies, no ad trackers'}</a></span></li>
      </ul>
    </div>
  </div>
</section>

<section id="other" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Beyond the App Store</p>
      <h2 class="poster">Not an <em>iPhone</em> app</h2>
      <p>Software I build that does not live on the App&nbsp;Store. Different work, same one person.</p>
    </div>
    <div class="work">
      ${otherWork.map((w, i) => `
      <a class="work-card reveal d${i + 1}" href="${w.url}" target="_blank" rel="noopener">
        <span class="work-top">
          <span class="work-nm">${esc(w.name)}</span>
          <span class="work-where">${esc(w.where)}</span>
        </span>
        <span class="work-tag">${esc(w.tagline)}</span>
        <span class="work-blurb">${esc(w.blurb)}</span>
        <span class="work-go">Visit ${esc(w.name)} ${ARROW}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section id="guides" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Guides &amp; answers</p>
      <h2 class="poster">Straight <em>answers</em></h2>
      <p>To the questions people actually ask. Researched, sourced, and free of the fluff most of these articles are padded with.</p>
    </div>
    <ul class="method reveal">
      <li><span class="num">1</span><span><b>Sourced</b>Every guide cites at least ${minSources} independent sources, linked at the bottom so you can check them yourself.</span></li>
      <li><span class="num">2</span><span><b>Dated</b>Each one shows when it was last updated. Nothing is quietly edited and passed off as current.</span></li>
      <li><span class="num">3</span><span><b>Careful where it counts</b>Guides about quitting smoking or eating carry a plain note that they are information, not medical advice.</span></li>
    </ul>
    ${apps.map((app) => `
    <div class="guide-group" style="${panelVars(app)}">
      <h3 class="group-head">
        <img src="${hAsset(`icons/${app.icon}`)}" alt="" width="80" height="80" loading="lazy">
        <a href="${hApp(app.slug)}">${esc(app.name)}</a>
        <span class="count">${articlesFor(app.slug).length} guides</span>
      </h3>
      <div class="cards">
        ${articlesFor(app.slug).map((a, i) => `
        <a class="post reveal d${(i % 3) + 1}" href="${hArticle(a.app, a.slug)}">
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.description)}</p>
          <p class="rd">${readMins(a)} min read</p>
        </a>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>
`;
  return layout({
    title: `${site.name} — Independent iPhone Apps`,
    description: `iPhone apps by ${site.name} \u2014 ${apps.slice(0, 3).map((a) => a.name).join(', ')} and more \u2014 plus researched guides answering what people actually search.`,
    path: '/',
    body,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebSite', '@id': abs('/#website'),
        name: site.name, url: abs('/'),
        publisher: { '@id': abs('/#person') } },
      { '@context': 'https://schema.org', '@type': 'Person', '@id': abs('/#person'),
        name: site.author, url: abs('/'),
        jobTitle: 'Independent iOS developer',
        sameAs: [site.developerUrl, ...(site.profiles || [])] },
      { '@context': 'https://schema.org', '@type': 'ItemList',
        name: `Apps by ${site.name}`,
        itemListElement: apps.map((a, i) => ({
          '@type': 'ListItem', position: i + 1,
          item: {
            '@type': 'SoftwareApplication',
            '@id': abs(`/${a.slug}/#app`),
            name: a.name,
            alternateName: a.altNames || [],
            url: abs(`/${a.slug}/`),
            sameAs: [a.storeUrl],
            applicationCategory: 'MobileApplication',
            operatingSystem: `iOS ${a.minOs}+`,
          },
        })) },
    ],
  });
}

// The Bali Secret's 30-second demo, cut from the app's own launch video.
// Plays inside a phone frame once it is near the screen (motion.js).
const DEMO = { app: 'bali-secret', name: 'bali-demo' };
const demoPhone = () => `<figure class="phone phone-video">
      ${ambientVideo(DEMO.name, 'ambient demo', true)}
    </figure>`;

// Scroll stage: a tall section whose sticky inner pins the demo phone while
// the headlines beside it change with scroll progress. With reduced motion or
// no JS every line simply shows, stacked.
function demoStage() {
  const app = appBySlug[DEMO.app];
  if (!app) return '';
  const beats = [
    ['Right now', 'What fits this hour, nearby'],
    ['Swap any stop', 'Cheaper, quieter, closer'],
    ['Your trip', 'Day by day, on a map'],
    ['Ready-made plans', 'From real travellers'],
  ];
  return `<section class="demo-stage" style="${panelVars(app)}" aria-label="${esc(app.name)} in motion">
  ${WAVE('wave-top')}
  <div class="demo-pin">
    <div class="wrap demo-in">
      <div class="demo-copy">
        <p class="eyebrow">See one move &middot; ${esc(app.name)}</p>
        <ol class="beats">${beats.map(([h, s], i) => `<li style="--i:${i}"><span class="poster">${esc(h)}</span><span class="pill">${esc(s)}</span></li>`).join('')}</ol>
        <div class="cta-row">${storeLink(app, 'Get ' + app.name)}<a class="btn ghost" href="${hApp(app.slug)}">How it works</a></div>
      </div>
      <div class="demo-phone">${demoPhone()}<span class="tag coral">Sunset in 20 min</span><span class="tag mint">1 to 60 days</span></div>
    </div>
    <div class="stage-rail" aria-hidden="true"><i></i></div>
  </div>
</section>`;
}

function appPage(app) {
  const posts = articlesFor(app.slug);
  const isDemo = app.slug === DEMO.app;
  const d = storeData[app.slug];
  const body = `
<header class="app-hero panel" id="top">
  <div class="wrap">
    <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> ${esc(app.name)}</p>
    <div class="app-hero-grid">
      <div>
        <p class="app-id"><img src="${hAsset(`icons/${app.icon}`)}" alt="${esc(app.name)} app icon" width="128" height="128">${esc(app.category)} &middot; iOS ${esc(app.minOs)}+</p>
        <h1 class="poster">${esc(app.name)}</h1>
        <p class="pill">${esc(app.tagline)}</p>
        <p class="lede">${app.hero}</p>
        <div class="cta-row">
          ${storeLink(app, 'Get the app', 'btn cream')}
          ${posts.length ? `<a class="btn ghost" href="#guides">Read the guides</a>` : ''}
        </div>
      </div>
      <div class="app-hero-phone" aria-hidden="true">
        ${isDemo ? demoPhone() : phone(app, app.shots[0], { eager: true })}
        <span class="tag">${esc(app.sticker)}</span>
        <span class="stamp"><span>${esc(app.category)}</span></span>
      </div>
    </div>
  </div>
  ${WAVE()}
</header>

${d ? `<section class="spec-strip">
  <div class="wrap">
    <ul class="spec">
      <li><b>Version</b><span>${esc(d.version)}</span></li>
      <li><b>Updated</b><span><time datetime="${d.updated}">${niceDate(d.updated)}</time></span></li>
      <li><b>Size</b><span>${d.sizeMb} MB</span></li>
      <li><b>Requires</b><span>iOS ${esc(d.minOs || app.minOs)}+</span></li>
      <li><b>Seller</b><span><a href="${esc(site.developerUrl)}" data-store="${esc(site.developerUrl)}" rel="noopener">${esc(site.author)}</a></span></li>
    </ul>
    <p class="spec-note">Straight from the App&nbsp;Store listing${storeData._fetched ? `, checked ${niceDate(storeData._fetched)}` : ''}. <a href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}" rel="noopener">Verify it yourself</a></p>
  </div>
</section>` : ''}

<section class="features">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">What it does</p>
      <h2 class="poster">Built for <em>one job</em></h2>
    </div>
    <div class="feat-grid">
      <div class="feat-phone" aria-hidden="true">
        <div class="feat-phone-in">
          <figure class="phone">${app.features.map((f, i) => `<img src="${hAsset('shots/' + (f[2] || app.shots[i % app.shots.length]))}" alt="" width="240" height="518" loading="lazy" decoding="async" data-feat="${i}"${i ? '' : ' class="on"'}>`).join('')}</figure>
        </div>
      </div>
      <ol class="feat-list">
        ${app.features.map(([h, p], i) => `<li class="feat reveal" data-feat="${i}">
          <span class="feat-n">${String(i + 1).padStart(2, '0')}</span>
          <h3>${esc(h)}</h3>
          <p>${esc(p)}</p>
          <figure class="phone feat-inline" aria-hidden="true"><img src="${hAsset('shots/' + (app.features[i][2] || app.shots[i % app.shots.length]))}" alt="" width="240" height="518" loading="lazy" decoding="async"></figure>
        </li>`).join('')}
      </ol>
    </div>
  </div>
</section>

${app.video ? `<section class="film-band" aria-hidden="true">
  <div class="film-frame">
    ${ambientVideo(app.video, 'ambient', true)}
    <p class="poster">${esc(app.tagline)}</p>
  </div>
</section>` : ''}

<section class="steps-sec">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">How it works</p>
      <h2 class="poster">Three <em>steps</em></h2>
      <p>No account needed to try it.</p>
    </div>
    <ol class="steps">
      ${app.steps.map(([h, p], i) => `<li class="step reveal d${i + 1}"><span class="stamp"><span>Step ${i + 1}</span></span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="screens-sec on-dark" style="position:relative">
  ${WAVE('wave-top')}
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Real screens</p>
      <h2 class="poster">${esc(app.name)}, <em>as it is</em></h2>
    </div>
    <div class="rail">${app.shots.map((s) => `<figure class="shot">${phone(app, s)}</figure>`).join('')}</div>
  </div>
  ${WAVE()}
</section>

<section>
  <div class="wrap narrow">
    <div class="sec-head reveal">
      <p class="eyebrow">Before you download</p>
      <h2 class="poster">Questions</h2>
    </div>
    <div class="faq">
      ${app.faq.map(([q, a], i) => `<details class="q"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>

${posts.length ? `<section id="guides" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Guides</p>
      <h2 class="poster">Read <em>first</em></h2>
      <p>Researched answers to what people search in this space. No download needed to read them.</p>
    </div>
    <div class="cards">
      ${posts.map((a, i) => `<a class="post reveal d${(i % 3) + 1}" href="${hArticle(a.app, a.slug)}"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p class="rd">${readMins(a)} min read</p></a>`).join('')}
    </div>
  </div>
</section>` : ''}

<section style="padding-top:0">
  <div class="wrap">${endPoster(app, 'h2')}</div>
</section>
`;
  return layout({
    title: app.title,
    description: app.description,
    path: `/${app.slug}/`,
    app,
    current: app.slug,
    ogImage: app.slug,
    body,
    jsonld: [
      {
        '@context': 'https://schema.org', '@type': 'SoftwareApplication',
        '@id': abs(`/${app.slug}/#app`),
        name: app.name,
        alternateName: [...new Set([app.fullName, ...(app.altNames || [])])].filter((n) => n !== app.name),
        // sameAs is what tells Google this page and the App Store listing are
        // the same thing, which is how a branded search resolves to the site.
        sameAs: [app.storeUrl],
        operatingSystem: `iOS ${app.minOs}+`,
        applicationCategory: 'MobileApplication',
        applicationSubCategory: app.category,
        description: app.description,
        url: abs(`/${app.slug}/`),
        downloadUrl: app.storeUrl,
        installUrl: app.storeUrl,
        datePublished: app.released,
        screenshot: app.shots.map((f) => abs(`/shots/${f}`)),
        image: abs(`/og/${app.slug}.jpg`),
        author: { '@type': 'Person', '@id': abs('/#person'), name: site.author },
        publisher: { '@type': 'Person', '@id': abs('/#person'), name: site.author },
      },
      {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: app.faq.map(([q, a]) => ({
          '@type': 'Question', name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: app.name, item: abs(`/${app.slug}/`) },
        ],
      },
    ],
  });
}

// The app's own poster, used to close app pages, guides and plans: the panel
// colour, the tagline in caps, two real screens and the App Store button.
function endPoster(app, tag = 'h2', { title = app.tagline, list = app.features.slice(0, 3).map(([t]) => t), cta = 'Get it on the App Store', more = true } = {}) {
  return `<div class="end-poster reveal" style="${panelVars(app)}">
      <div class="ep-copy">
        <p class="ep-id"><img src="${hAsset(`icons/${app.icon}`)}" alt="" width="104" height="104" loading="lazy">${esc(app.fullName || app.name)}</p>
        <${tag} class="poster">${esc(title)}</${tag}>
        <ul class="ep-list">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="cta-row">
          ${storeLink(app, cta, 'btn cream')}
          ${more ? `<a class="btn ghost" href="${hApp(app.slug)}">How ${esc(app.name)} works</a>` : ''}
        </div>
      </div>
      <div class="ep-phones" aria-hidden="true">
        ${phone(app, app.shots[0])}
        ${phone(app, app.shots[1] || app.shots[0])}
        <span class="tag">${esc(app.sticker)}</span>
      </div>
    </div>`;
}

function articlePage(a) {
  const app = appBySlug[a.app];
  const related = articlesFor(a.app).filter((x) => x.slug !== a.slug);
  const toc = headings(a.blocks);
  const feature = featureFor(a, app);
  const tocList = `<ol class="toc-list">${toc.map((h) =>
    `<li><a href="#${h.id}">${plain(h.text)}</a></li>`).join('')}${
    a.faqs?.length ? '<li><a href="#common-questions">Common questions</a></li>' : ''}</ol>`;
  const body = `
<div class="read-progress" aria-hidden="true"><i></i></div>

<header class="g-hero panel">
  <div class="wrap">
    <div class="g-hero-in">
      <div class="g-hero-copy">
        <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> <a href="${hApp(app.slug)}">${esc(app.name)}</a> <span>/</span> Guide</p>
        <p class="g-chip"><img src="${hAsset('icons/' + app.icon)}" alt="" width="56" height="56">${esc(app.name)} guide</p>
        <h1 class="poster">${esc(a.title)}</h1>
        <p class="lede">${esc(a.description)}</p>
        <p class="byline">
          <span>By&nbsp;<a href="${FLAT ? 'about.html' : '/about/'}">${esc(site.author)}</a></span>
          <span>${a.updated && a.updated !== a.published
            ? `Updated&nbsp;<time datetime="${a.updated}">${niceDate(a.updated)}</time>`
            : `<time datetime="${a.published}">${niceDate(a.published)}</time>`}</span>
          <span>${readMins(a)} min read</span>
          ${a.sources?.length ? `<span>${a.sources.length} sources</span>` : ''}
        </p>
      </div>
      <div class="g-hero-shot" aria-hidden="true">
        ${phone(app, app.shots[0])}
        <span class="tag">${esc(app.sticker)}</span>
      </div>
    </div>
  </div>
  ${WAVE()}
</header>

<section class="g-body">
  <div class="wrap g-grid">
    <div class="g-main">
    <article class="prose">
      <div class="answer">
        <p class="lbl"><span class="stamp"><span>Short answer</span></span></p>
        <p>${esc(a.answer)}</p>
      </div>
      ${YMYL.has(a.app) ? `<p class="ymyl"><strong>General information, not medical advice.</strong> Written from published sources, which are listed at the end. It is not a substitute for a doctor, pharmacist or registered dietitian who knows your situation.</p>` : ''}
      ${toc.length > 2 ? `<details class="toc toc-m">
        <summary><span>In this guide</span><em>${toc.length} sections &middot; ${readMins(a)} min</em></summary>
        ${tocList}
      </details>` : ''}
      ${renderBlocks(a.blocks, app, feature)}
    </article>

    ${a.faqs?.length ? `<section class="art-faq" id="common-questions">
      <h2>Common questions</h2>
      <div class="faq">
        ${a.faqs.map(([q, ans], i) => `<details class="q"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="a"><p>${ans}</p></div></details>`).join('')}
      </div>
    </section>` : ''}

    ${a.sources?.length ? `<div class="sources">
      <h2>Sources</h2>
      <ul>${a.sources.map(([t, u]) => `<li><a href="${esc(u)}" rel="nofollow noopener" target="_blank">${esc(t)}</a></li>`).join('')}</ul>
    </div>` : ''}
    </div>

    <aside class="g-side" aria-label="Guide contents">
      <div class="g-side-in">
        ${toc.length > 2 ? `<nav class="toc toc-d" aria-label="In this guide">
          <p class="toc-h">In this guide</p>
          ${tocList}
        </nav>` : ''}
        <div class="side-app" style="${panelVars(app)}">
          <img src="${hAsset('icons/' + app.icon)}" alt="" width="104" height="104" loading="lazy">
          <p class="sa-nm">${esc(app.name)}</p>
          <p class="sa-tx">${esc(app.tagline)}</p>
          ${storeLink(app, 'Get the app', 'btn cream small')}
        </div>
      </div>
    </aside>
  </div>
</section>

<section class="g-end" style="padding-top:0">
  <div class="wrap">${endPoster(app, 'h2')}</div>
</section>

<div class="dl-bar" id="dl-bar" style="${panelVars(app)}">
  <img src="${hAsset('icons/' + app.icon)}" alt="" width="104" height="104" loading="lazy">
  <span class="dl-tx"><b>${esc(app.name)}</b><span>${esc(app.tagline)}</span></span>
  <a class="btn cream small" href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}">Get ${OUT}</a>
</div>

${related.length ? `<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">More from ${esc(app.name)}</p><h2 class="poster">Keep <em>reading</em></h2></div>
    <div class="cards" style="${panelVars(app)}">
      ${related.map((r, i) => `<a class="post compact reveal d${(i % 3) + 1}" href="${hArticle(r.app, r.slug)}"><h3>${esc(r.title)}</h3><p class="rd">${readMins(r)} min read</p></a>`).join('')}
    </div>
  </div>
</section>` : ''}
`;
  return layout({
    // Google truncates around 60 chars; keep the suffix only when it fits.
    title: `${a.title} | ${app.name}`.length <= 60 ? `${a.title} | ${app.name}` : a.title,
    description: a.description,
    path: `/${a.app}/${a.slug}/`,
    app,
    current: app.slug,
    // each guide gets its own card; sharing the app's image made 9 HOLD guides
    // look identical in a link preview
    ogImage: a.slug,
    body,
    jsonld: [
      {
        '@context': 'https://schema.org', '@type': 'Article',
        headline: a.title, description: a.description,
        datePublished: a.published, dateModified: a.updated || a.published,
        author: { '@type': 'Person', name: site.author, url: abs('/') },
        publisher: { '@type': 'Person', name: site.author },
        mainEntityOfPage: { '@type': 'WebPage', '@id': abs(`/${a.app}/${a.slug}/`) },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: app.name, item: abs(`/${app.slug}/`) },
          { '@type': 'ListItem', position: 3, name: a.title, item: abs(`/${a.app}/${a.slug}/`) },
        ],
      },
      ...((a.title.includes('?') || a.faqs?.length) ? [{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          ...(a.title.includes('?') ? [{
            '@type': 'Question',
            name: a.title.split('?')[0] + '?',
            acceptedAnswer: { '@type': 'Answer', text: a.answer },
          }] : []),
          ...(a.faqs || []).map(([q, ans]) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: ans.replace(/<[^>]+>/g, '') },
          })),
        ],
      }] : []),
    ],
  });
}

function staticPage(pg) {
  const body = `
<header class="page-hero on-dark">
  <div class="wrap">
    <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> ${esc(pg.title)}</p>
    <h1 class="poster">${esc(pg.title)}</h1>
  </div>
  ${WAVE()}
</header>

<section>
  <div class="wrap">
    <article class="prose">${renderBlocks(pg.blocks)}</article>
  </div>
</section>
`;
  return layout({
    title: `${pg.title} | ${site.name}`,
    description: pg.description,
    path: `/${pg.slug}/`,
    body,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'WebPage',
        name: pg.title, description: pg.description, url: abs(`/${pg.slug}/`),
        isPartOf: { '@id': abs('/#website') },
        publisher: { '@id': abs('/#person') } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: abs('/') },
          { '@type': 'ListItem', position: 2, name: pg.title, item: abs(`/${pg.slug}/`) },
        ] },
    ],
  });
}

// The page a comment-to-DM link lands on. Built for a phone in Instagram's
// webview: the plan first, the app second, no nav to wander off through.
// Reads both plan shapes: the first one (bases/moves, day.area) and the
// general one (table/callout/more/unlockTitle, day.tag), so plans written
// either way render the same.
function planPage(p) {
  const app = appBySlug[p.app];
  const guide = articles.find((a) => a.slug === p.guide && a.app === p.app);
  const media = planMedia[p.slug] || {};
  const photo = (name) => hAsset(`photos/${name}.jpg`);
  const table = p.table || { head: ['Days', 'Base', 'For'], rows: p.bases || [] };
  const callout = p.callout || (p.moves ? `Plan around real drive times, not the map&rsquo;s: ${p.moves.map(([r, t]) => `<strong>${esc(r)}</strong> ${esc(t)}`).join(' &middot; ')}. Move between bases in the morning, before the traffic builds.` : '');
  const more = p.more || 'Tips, costs and timings for these stops are in the app';
  const unlockTitle = p.unlockTitle || `This is the plan for everyone. ${app.name} builds yours.`;

  const day = (d, i) => {
    const open = i < p.open;
    const img = media.days?.[i];
    return `<li class="pday${open ? ' open' : ''} reveal">
      <figure class="pday-photo"${img ? '' : ' data-empty'}>
        ${img ? `<img src="${photo(img.src)}" alt="${esc(img.alt)}" width="480" height="600" loading="lazy" decoding="async">` : ''}
        <span class="stamp"><span>Day ${i + 1} &middot; ${esc(d.tag || d.area)}</span></span>
        ${open ? '' : `<span class="tag cream">In the app</span>`}
      </figure>
      <div class="pday-body">
        <h3 class="poster">${esc(d.title)}</h3>
        <ul class="pday-stops">${d.stops.map(([slot, name, cost, tip]) => `
          <li><span class="slot">${esc(slot)}</span><span class="what"><b>${esc(name)}</b>${
            open && tip ? `<span class="tip">${esc(tip)}</span>` : ''}</span>${
            open && cost ? `<span class="cost">${esc(cost)}</span>` : ''}</li>`).join('')}
        </ul>
        ${open ? '' : `<p class="pday-more">${esc(more)}</p>`}
      </div>
    </li>`;
  };
  const body = `
<header class="plan-hero">
  ${media.hero ? `<picture class="plan-hero-bg">
    <source media="(max-width:700px)" srcset="${photo(media.hero.src + '-m')}">
    <img src="${photo(media.hero.src)}" alt="${esc(media.hero.alt)}" width="1200" height="750" fetchpriority="high" decoding="async">
  </picture>` : ''}
  ${media.video ? ambientVideo(media.video, 'ambient plan-hero-video') : ''}
  <div class="plan-hero-scrim" aria-hidden="true"></div>
  <div class="wrap">
    <p class="crumb"><a href="${hApp(app.slug)}">${esc(app.name)}</a> <span>/</span> The plan you asked for</p>
    <span class="stamp"><span>The plan you asked for</span></span>
    <h1 class="poster">${esc(p.title.split(':')[0])}</h1>
    <p class="pill">${p.days.length} days${table.head[1] === 'Base' ? ` &middot; ${table.rows.length} bases` : ''}</p>
    <p class="lede">${esc(p.intro)}</p>
    <div class="cta-row">${storeLink(app, 'Open it in the app', 'btn')}</div>
  </div>
  ${WAVE()}
</header>

<section class="plan-sec" style="${panelVars(app)}">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">At a glance</p><h2 class="poster">${esc(p.tableTitle || 'Three bases, two moves')}</h2></div>
    <ol class="glance">
      ${table.rows.map((r, i) => `<li class="reveal d${(i % 3) + 1}">
        <span class="g-k">${esc(r[0])}</span>
        <span class="g-v poster">${esc(r[1])}</span>
        ${r.slice(2).map((c) => `<span class="g-t">${esc(c)}</span>`).join('')}
      </li>`).join('')}
    </ol>
    ${callout ? `<div class="plan-callout reveal"><span class="tag">Good to know</span><p>${callout}</p></div>` : ''}
  </div>
</section>

<section class="plan-sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head reveal"><p class="eyebrow">${p.days.length} days</p><h2 class="poster">Day by <em>day</em></h2></div>
    <ol class="pdays">${p.days.map(day).join('')}</ol>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    ${endPoster(app, 'h2', { title: unlockTitle, list: p.unlock, cta: 'Get the full plan', more: false })}
    ${guide ? `<p class="plan-guide">Want the reasoning, costs and what to skip? Read <a href="${hArticle(guide.app, guide.slug)}">${esc(guide.title)}</a>.</p>` : ''}
    ${media.credit ? `<p class="plan-credit">${esc(media.credit)}</p>` : ''}
  </div>
</section>
`;
  return layout({
    title: p.title,
    description: p.description,
    path: `/${p.app}/${p.slug}/`,
    app,
    ogImage: app.slug,
    body,
    noNav: true,
    noindex: true,
  });
}

// A dead end should still offer somewhere to go. Vercel serves this for any
// unmatched path when 404.html sits at the output root.
function notFoundPage() {
  const body = `
<header class="page-hero on-dark">
  <div class="wrap">
    <span class="stamp"><span>Error 404</span></span>
    <h1 class="poster">That page <em>wandered off.</em></h1>
    <p class="lede">No harm done. Everything on this site is one of two things: an app, or a guide about the subject behind it.</p>
    <div class="cta-row"><a class="btn" href="${hHome()}">Back to the start ${ARROW}</a></div>
  </div>
  ${WAVE()}
</header>

<section>
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">The apps</p><h2 class="poster">Pick <em>one</em></h2></div>
    <div class="mini-apps">
      ${apps.map((a) => `
      <a class="mini-app" href="${hApp(a.slug)}" style="${panelVars(a)}">
        <img src="${hAsset(`icons/${a.icon}`)}" alt="" width="104" height="104">
        <span><b>${esc(a.name)}</b><span>${esc(a.tagline)}</span></span>
        <span class="go" aria-hidden="true">${ARROW}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><p class="eyebrow">Most read</p><h2 class="poster">Guides</h2></div>
    <div class="cards">
      ${articles.slice(0, 6).map((a) => `<a class="post" href="${hArticle(a.app, a.slug)}" style="${panelVars(appBySlug[a.app])}"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></a>`).join('')}
    </div>
  </div>
</section>
`;
  return layout({
    title: `Page not found | ${site.name}`,
    description: 'That page moved or never existed. Here are the apps and the most read guides instead.',
    path: '/404',
    body,
  });
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
async function emit(path, html) {
  const flatName = path === '/' ? 'index.html'
    : path.split('/').filter(Boolean).join('--') + '.html';
  const file = FLAT ? join(DIST, flatName)
    : path === '/' ? join(DIST, 'index.html') : join(DIST, path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
  return path;
}

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

const written = [];
written.push(await emit('/', homePage()));
for (const app of apps) written.push(await emit(`/${app.slug}`, appPage(app)));
for (const a of articles) written.push(await emit(`/${a.app}/${a.slug}`, articlePage(a)));
for (const pg of pages) written.push(await emit(`/${pg.slug}`, staticPage(pg)));
// Not pushed to `written`: plan pages and the 404 stay out of the sitemap.
for (const p of plans) await emit(`/${p.app}/${p.slug}`, planPage(p));
await writeFile(join(DIST, FLAT ? '404.html' : '404.html'), notFoundPage());

// assets
// One stylesheet: @font-face rules first, then the design system. The
// fonts/ urls inside fonts.css are relative to styles.css, which sits at root.
const fontCss = await readFile(join(ROOT, 'src/assets/fonts.css'), 'utf8');
const mainCss = await readFile(join(ROOT, 'src/assets/styles.css'), 'utf8');
await writeFile(join(DIST, 'styles.css'), fontCss + '\n' + mainCss);
await cp(join(ROOT, 'src/assets/fonts'), join(DIST, 'fonts'), { recursive: true });
await cp(join(ROOT, 'src/assets/escape.js'), join(DIST, 'escape.js'));
await cp(join(ROOT, 'src/assets/motion.js'), join(DIST, 'motion.js'));
await cp(join(ROOT, 'src/assets/consent.js'), join(DIST, 'consent.js'));
if (site.analytics?.indexNowKey) {
  await cp(join(ROOT, 'src/assets/indexnow'), DIST, { recursive: true });
}
await cp(join(ROOT, 'icons'), join(DIST, 'icons'), { recursive: true });
await cp(join(ROOT, 'src/assets/shots'), join(DIST, 'shots'), { recursive: true });
await cp(join(ROOT, 'src/assets/og'), join(DIST, 'og'), { recursive: true });
await cp(join(ROOT, 'src/assets/video'), join(DIST, 'video'), { recursive: true });
await cp(join(ROOT, 'src/assets/photos'), join(DIST, 'photos'), { recursive: true, filter: (f) => !f.endsWith('.json') });

// sitemap + robots: real build only (a flat preview has no canonical host)
if (!FLAT) {
// sitemap — app pages above articles, home highest
const urls = written.map((p) => {
  const loc = abs(p.endsWith('/') ? p : p + '/');
  const depth = p.split('/').filter(Boolean).length;
  const priority = depth === 0 ? '1.0' : depth === 1 ? '0.9' : '0.7';
  const art = articles.find((a) => p === `/${a.app}/${a.slug}`);
  return `  <url><loc>${loc}</loc><lastmod>${art?.updated || new Date().toISOString().slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
await writeFile(join(DIST, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

await writeFile(join(DIST, 'robots.txt'), NOINDEX
? `# staging build - not for indexing
User-agent: *
Disallow: /
`
: `User-agent: *
Allow: /

Sitemap: ${abs('/sitemap.xml')}
`);
}

console.log(`built ${written.length} pages:`);
written.forEach((p) => console.log('  ' + (p === '/' ? '/' : p + '/')));
console.log('+ styles.css, escape.js, icons/, sitemap.xml, robots.txt');
