// ---------------------------------------------------------------------------
// Static site generator. `node build.mjs` writes everything into dist/.
// Pages, internal links, JSON-LD, sitemap and robots.txt all derive from
// src/content.mjs + src/articles.mjs — never hand-edit dist/.
// ---------------------------------------------------------------------------
import { mkdir, writeFile, readFile, readdir, rm, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps, appBySlug } from './src/content.mjs';
import { articles } from './src/articles.mjs';
import { pages } from './src/pages.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
// FLAT=1 emits one directory of relative-linked .html files, for hosts that
// cannot serve /root-relative paths (the Artifact preview). The default build
// keeps the clean /app-name/ URLs that the real deploy and SEO want.
const FLAT = process.env.FLAT === '1';
const NOINDEX = process.env.NOINDEX === '1';
const DIST = join(ROOT, FLAT ? 'dist-flat' : 'dist');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p) => site.origin.replace(/\/$/, '') + p;
const words = (a) => a.blocks.reduce((n, [t, v]) =>
  n + (typeof v === 'string' ? v.split(/\s+/).length
    : Array.isArray(v) ? v.join(' ').split(/\s+/).length
    : (v.rows || []).flat().join(' ').split(/\s+/).length), 0);
const readMins = (a) => Math.max(2, Math.round(words(a) / 220));
const articlesFor = (slug) => articles.filter((a) => a.app === slug);

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

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const OUT   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';

// Puffy cloud, built from primitives so it scales cleanly and weighs nothing.
const CLOUD = '<svg viewBox="0 0 200 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<g fill="currentColor"><ellipse cx="56" cy="56" rx="42" ry="28"/>'
  + '<ellipse cx="102" cy="43" rx="40" ry="33"/><ellipse cx="148" cy="58" rx="36" ry="25"/>'
  + '<rect x="30" y="56" width="140" height="28" rx="14"/></g></svg>';

const sky = (layers) => `<div class="sky" aria-hidden="true">`
  + layers.map((n) => `<div class="cloud c${n}">${CLOUD}</div>`).join('')
  + `<span class="blob b1"></span><span class="blob b2"></span></div>`;
const SKY      = sky([1, 2, 3, 4]);           // inner pages
const SKY_FULL = sky([7, 1, 4, 2, 5, 3, 6]);  // full-screen home hero

// Marquee. Two identical tracks so the loop is seamless.
const tickItems = apps.map((a) => `<span>${esc(a.name)}</span>`).join('') + '<span>More coming</span>';
const TICKER = `<div class="ticker" aria-hidden="true"><div class="ticker-track">${tickItems}</div><div class="ticker-track">${tickItems}</div></div>`;

// Live app screens — CSS/SVG UI that plays off the same --p as the ring, so
// it scrubs forward and backward with the scroll instead of looping on a timer.
const SCREENS = {
  walk: `<div class="scr scr-walk"><span class="map"></span>`
    + `<svg viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">`
    + `<path class="route" d="M18,128 C34,104 22,84 44,72 C66,60 60,40 80,28"/></svg>`
    + `<span class="hd">Distance</span><span class="big">2.4<i>km</i></span>`
    + `<span class="ft"><span>24:10</span><span>186 cal</span></span></div>`,

  macro: `<div class="scr scr-macro"><span class="hd">Today</span>`
    + `<span class="dial"><svg viewBox="0 0 80 80" aria-hidden="true">`
    + `<circle class="trk" cx="40" cy="40" r="36"/><circle class="arc" cx="40" cy="40" r="36"/></svg>`
    + `<span class="mid">1840</span></span>`
    + `<span class="bars"><i></i><i></i><i></i></span>`
    + `<span class="ft"><span>P 128g</span><span>C 190g</span></span></div>`,

  breathe: `<div class="scr scr-breathe"><span class="hd">Craving</span>`
    + `<span class="orb"></span><span class="lbl">Breathe out</span>`
    + `<span class="big">4:12</span>`
    + `<span class="ft"><span>Day 12</span><span>$84 saved</span></span></div>`,

  trip: `<div class="scr scr-trip"><span class="sun"></span><span class="hd">Itinerary</span>`
    + `<span class="day"><b>1</b>Ubud &middot; rice terraces</span>`
    + `<span class="day"><b>2</b>Tibumana waterfall</span>`
    + `<span class="day"><b>3</b>Canggu &middot; surf</span>`
    + `<span class="day"><b>4</b>Uluwatu sunset</span>`
    + `<span class="ft"><span>7 days</span><span>Rp 8.4M</span></span></div>`,
};

// A single hero device running the app's live screen. BaliWise's hero reads as
// a video but is HTML/CSS doing exactly this — it sells the product far better
// than an icon does, and it weighs nothing.
function heroFan(list) {
  return `<div class="hero-device fan" aria-hidden="true">
    ${list.map((a, i) => `<div class="device d${i}" style="--accent:${a.accent}"><span class="notch"></span>${SCREENS[a.screen] || ''}</div>`).join('')}
  </div>`;
}

function heroDevice(app) {
  return `<div class="hero-device" aria-hidden="true">
    <div class="device">
      <span class="notch"></span>
      ${SCREENS[app.screen] || ''}
    </div>
  </div>`;
}

// Scroll stage: a ring of phones whose rotation is bound to scroll position.
// motion.js writes --rot (0..1 -> one full turn) and --p (progress) each frame.
function ringStage({ shots, count, heading, sub, screens = [], every = 3 }) {
  let shotIdx = 0, screenIdx = 0;
  const phones = Array.from({ length: count }, (_, i) => {
    const live = screens.length && i % every === 0;
    const inner = live
      ? SCREENS[screens[screenIdx++ % screens.length]]
      : `<img src="${hAsset('shots/' + shots[shotIdx++ % shots.length])}" alt="" width="240" height="487" loading="lazy" decoding="async" fetchpriority="low">`;
    return `<div class="phone" style="--i:${i}"><span class="notch"></span>${inner}</div>`;
  }).join('');
  return `<section class="stage">
  <div class="stage-in">
    <div class="ring-wrap"><div class="ring" style="--n:${count}">${phones}</div></div>
    <div class="stage-copy">
      <h2>${esc(heading)}</h2>
      <p>${esc(sub)}</p>
      <span class="cue"><i></i>Scroll<i></i></span>
    </div>
    <div class="stage-rail"><i></i></div>
  </div>
</section>`;
}

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%235B46F0'/%3E%3Crect x='20' y='20' width='24' height='24' rx='8' fill='%23fff'/%3E%3C/svg%3E";

// --- App Store link. data-store is what escape.js rewrites on Meta webviews.
const storeLink = (app, label = 'Get it on the App Store', cls = 'btn light') =>
  `<a class="${cls}" href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}">${esc(label)} ${OUT}</a>`;

// ---------------------------------------------------------------------------
// Document shell
// ---------------------------------------------------------------------------
function layout({ title, description, path, accent, accentSoft, accentInk, ogImage, body, jsonld = [], noNav = false }) {
  const canonical = abs(path);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${NOINDEX ? '<meta name="robots" content="noindex,nofollow">' : ''}
<meta name="theme-color" content="${esc(accent || '#5B46F0')}">
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
<link rel="preload" as="font" type="font/woff2" crossorigin href="${hAsset('fonts/BricolageGrotesque-latin.woff2')}">
<link rel="preload" as="font" type="font/woff2" crossorigin href="${hAsset('fonts/Manrope-latin.woff2')}">
<link rel="stylesheet" href="${hAsset('styles.css')}">
${site.analytics?.searchConsole ? `<meta name="google-site-verification" content="${esc(site.analytics.searchConsole)}">` : ''}
${site.verification?.impact ? `<meta name="impact-site-verification" value="${esc(site.verification.impact)}">` : ''}
${site.analytics?.vercel ? `<script defer src="/_vercel/insights/script.js"></script>` : ''}
${site.analytics?.ga4 ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(site.analytics.ga4)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(site.analytics.ga4)}');</script>` : ''}
${accent ? `<style>:root{--accent:${accent};--accent-soft:${accentSoft};--accent-ink:${accentInk || accent}}</style>` : ''}
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
    <a class="logo" href="${hHome()}"><span></span>${esc(site.name)}</a>
    <div class="nav-links">
      ${apps.map((a) => `<a href="${hApp(a.slug)}">${esc(a.name)}</a>`).join('\n      ')}
    </div>
  </div>
</nav>`}

${body}

<footer>
  <div class="wrap">
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
        <ul><li><a href="${esc(site.developerUrl)}">App Store profile</a></li></ul>
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

<script src="${hAsset('escape.js')}" defer></script>
<script src="${hAsset('motion.js')}" defer></script>
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

function inlineCta(app) {
  return `<aside class="mid-cta">
    <span class="ic"><img src="${hAsset('icons/' + app.icon)}" alt="" width="104" height="104" loading="lazy"></span>
    <span class="tx"><b>${esc(app.name)}</b>${esc(app.tagline)}</span>
    <a class="btn accent" href="${esc(app.storeUrl)}" data-store="${esc(app.storeUrl)}">Get it free ${OUT}</a>
  </aside>`;
}

function renderBlocks(blocks, app) {
  return blocks.map(([type, val]) => {
    switch (type) {
      case 'h2':      return `<h2>${val}</h2>`;
      case 'p':       return `<p>${val}</p>`;
      case 'ul':      return `<ul>${val.map((li) => `<li>${li}</li>`).join('')}</ul>`;
      case 'ol':      return `<ol>${val.map((li) => `<li>${li}</li>`).join('')}</ol>`;
      case 'callout': return `<div class="callout">${val}</div>`;
      case 'note':    return `<div class="note">${val}</div>`;
      case 'contact': return `<p class="mailto"><a href="mailto:${esc(site.contactEmail)}">${esc(site.contactEmail)}</a></p>`;
      case 'table':   return `<div class="tbl-wrap"><table><thead><tr>${
        val.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
        val.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')
      }</tbody></table></div>`;
      default:        return '';
    }
  }).map(fixLinks).reduce((out, html, i, arr) => {
    out.push(html);
    // after the second <h2> section, roughly a third in
    if (app && arr.slice(0, i + 1).filter((h) => h.startsWith('<h2')).length === 2
        && arr[i + 1] && arr[i + 1].startsWith('<h2')) out.push(inlineCta(app));
    return out;
  }, []).join('\n');
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
function homePage() {
  const body = `
<header class="band hero" id="hero">
  ${SKY_FULL}
  <div class="wrap">
    <p class="eyebrow on-brand">iOS &middot; Independent</p>
    <div class="hero-split">
      <div class="hero-copy">
        <h1 class="d">iPhone apps,<br>made <span class="sticker">properly</span>.</h1>
        <p class="lede">I build small, focused apps &mdash; a dog-walk tracker, an honest calorie counter, a Bali trip planner, a quit-smoking coach, and more on the way. All free.</p>
        <div class="cta-row">
          <a class="btn light" href="#apps">See the apps ${ARROW}</a>
          <a class="btn ghost" href="#guides">Read the guides ${ARROW}</a>
        </div>
        <ul class="statline">
          <li><b>${articles.length}</b><span>researched guides</span></li>
          <li><b>Free</b><span>every app</span></li>
          <li><b>Independent</b><span>built solo</span></li>
        </ul>
      </div>
      ${heroFan(apps.slice(0, 3))}
    </div>
  </div>
  <span class="scroll-cue" aria-hidden="true"><b></b>Scroll</span>
</header>

${TICKER}

<section id="apps">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="d">The apps</h2>
      <p>Each one started as something I wanted to exist. All free on the App&nbsp;Store.</p>
    </div>
    <div class="grid two">
      ${apps.map((a, i) => `
      <a class="app-card reveal d${(i % 4) + 1}" href="${hApp(a.slug)}" style="--accent:${a.accent}">
        <span class="ico"><img src="${hAsset(`icons/${a.icon}`)}" alt="${esc(a.name)} app icon" width="136" height="136" loading="eager"></span>
        <span class="body">
          <span class="nm">${esc(a.name)}</span>
          <span class="tg">${esc(a.tagline)}</span>
          <span class="mt"><span class="chip">${esc(a.category)}</span><span class="chip free">${esc(a.price)}</span></span>
        </span>
        <span class="go">${ARROW}</span>
      </a>`).join('')}
      <div class="soon reveal">
        <span class="t">More on the way</span>
        <p class="s">New apps ship when they&rsquo;re ready, not on a schedule.</p>
        <span class="dots"><i></i><i></i><i></i></span>
      </div>
    </div>
  </div>
</section>

${ringStage({
  shots: apps.flatMap((a) => a.shots),
  screens: apps.map((a) => a.screen),
  count: apps.length * 3,
  every: 3,
  heading: 'Everything I\u2019ve shipped',
  sub: 'Keep scrolling to spin through them. Scroll back and it winds the other way.',
})}

<section class="tinted" id="guides">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="d">Guides &amp; answers</h2>
      <p>Straight answers to the questions people actually ask &mdash; researched, sourced, and free of the fluff most of these articles are padded with.</p>
    </div>
    ${apps.map((app) => `
    <div class="guide-group" style="--accent:${app.accent};--accent-ink:${app.accentInk}">
      <h3 class="group-head">
        <span class="ico"><img src="${hAsset(`icons/${app.icon}`)}" alt="" width="72" height="72" loading="lazy"></span>
        <a href="${hApp(app.slug)}">${esc(app.name)}</a>
        <span class="count">${articlesFor(app.slug).length} guides</span>
      </h3>
      <div class="grid three">
        ${articlesFor(app.slug).map((a, i) => `
        <a class="post reveal d${(i % 4) + 1}" href="${hArticle(a.app, a.slug)}">
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
    description: `Free iPhone apps by ${site.name} \u2014 ${apps.slice(0, 3).map((a) => a.name).join(', ')} and more \u2014 plus researched guides answering what people actually search.`,
    path: '/',
    accent: '#5B46F0',
    accentSoft: '#EEEBFF',
    accentInk: '#4338CA',
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
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
        })) },
    ],
  });
}

function appPage(app) {
  const posts = articlesFor(app.slug);
  const body = `
<header class="band">
  ${SKY}
  <div class="wrap">
    <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> ${esc(app.name)}</p>
    <div class="hero-split">
      <div class="hero-copy">
        <div class="app-hero">
          <span class="ico"><img src="${hAsset(`icons/${app.icon}`)}" alt="${esc(app.name)} app icon" width="208" height="208"></span>
          <div style="flex:1;min-width:220px">
            <h1 class="d">${esc(app.name)}</h1>
          </div>
        </div>
        <p class="lede">${app.hero}</p>
        <div class="cta-row">
          ${storeLink(app, 'Get it free')}
          ${posts.length ? `<a class="btn ghost" href="#guides">Read the guides ${ARROW}</a>` : ''}
        </div>
        <ul class="statline">
          <li><b>${esc(app.price)}</b><span>on the App&nbsp;Store</span></li>
          <li><b>${esc(app.category)}</b><span>category</span></li>
          <li><b>iOS ${esc(app.minOs)}+</b><span>required</span></li>
          ${posts.length ? `<li><b>${posts.length}</b><span>researched guides</span></li>` : ''}
        </ul>
      </div>
      ${heroDevice(app)}
    </div>
  </div>
</header>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="d">What it does</h2></div>
    <div class="grid two">
      ${app.features.map(([h, p], i) => `<div class="card reveal d${(i % 4) + 1}"><h3 class="d">${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}
    </div>
  </div>
</section>

<section class="tinted">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="d">How it works</h2>
      <p>Three steps, no account needed to try it.</p>
    </div>
    <div class="grid three">
      ${app.steps.map(([h, p], i) => `<div class="step reveal d${i + 1}"><span class="num">${i + 1}</span><h3 class="d">${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}
    </div>
  </div>
</section>

${ringStage({
  shots: app.shots,
  screens: [app.screen],
  every: 4,
  count: 8,
  heading: app.name,
  sub: app.tagline,
})}

<section class="soft">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="d">Questions</h2>
      <p>The things people ask most often before downloading.</p>
    </div>
    <div class="faq">
      ${app.faq.map(([q, a], i) => `<details class="q"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><div class="a"><p>${esc(a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>

${posts.length ? `<section id="guides">
  <div class="wrap">
    <div class="sec-head">
      <h2 class="d">Guides</h2>
      <p>Researched answers to what people search in this space. No download required to read them.</p>
    </div>
    <div class="grid three">
      ${posts.map((a, i) => `<a class="post reveal d${(i % 4) + 1}" href="${hArticle(a.app, a.slug)}"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p class="rd">${readMins(a)} min read</p></a>`).join('')}
    </div>
  </div>
</section>` : ''}

<section class="tinted">
  <div class="wrap">
    <div class="get-app">
      <span class="ico"><img src="${hAsset(`icons/${app.icon}`)}" alt="" width="152" height="152"></span>
      <div class="txt">
        <h2>${esc(app.fullName)}</h2>
        <p>${esc(app.category)} &middot; ${esc(app.price)} &middot; Requires iOS ${esc(app.minOs)}</p>
      </div>
      ${storeLink(app, 'Get it free')}
    </div>
  </div>
</section>
`;
  return layout({
    title: app.title,
    description: app.description,
    path: `/${app.slug}/`,
    accent: app.accent,
    accentSoft: app.accentSoft,
    accentInk: app.accentInk,
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
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock', url: app.storeUrl },
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

function articlePage(a) {
  const app = appBySlug[a.app];
  const related = articlesFor(a.app).filter((x) => x.slug !== a.slug);
  const body = `
<header class="band">
  ${SKY}
  <div class="wrap">
    <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> <a href="${hApp(app.slug)}">${esc(app.name)}</a> <span>/</span> Guide</p>
    <h1 class="d">${esc(a.title)}</h1>
    <p class="lede">${esc(a.description)}</p>
    <p class="byline">
      <span>By <a href="${FLAT ? 'about.html' : '/about/'}">${esc(site.author)}</a></span>
      <span>${a.updated && a.updated !== a.published
        ? `Updated <time datetime="${a.updated}">${niceDate(a.updated)}</time>`
        : `<time datetime="${a.published}">${niceDate(a.published)}</time>`}</span>
      <span>${readMins(a)} min read</span>
    </p>
  </div>
</header>

<section>
  <div class="wrap">
    <article class="prose">
      <div class="answer">
        <p class="lbl">Short answer</p>
        <p>${esc(a.answer)}</p>
      </div>
      ${YMYL.has(a.app) ? `<p class="ymyl"><strong>General information, not medical advice.</strong> Written from published sources, which are listed at the end. It is not a substitute for a doctor, pharmacist or registered dietitian who knows your situation.</p>` : ''}
      ${renderBlocks(a.blocks, app)}
    </article>

    ${a.faqs?.length ? `<section class="art-faq">
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
</section>

<section class="tinted">
  <div class="wrap">
    <div class="get-app">
      <span class="ico"><img src="${hAsset(`icons/${app.icon}`)}" alt="" width="152" height="152"></span>
      <div class="txt">
        <h2>${esc(app.name)}</h2>
        <p>${esc(app.tagline)} ${esc(app.price)} on the App&nbsp;Store.</p>
      </div>
      ${storeLink(app, 'Get it free')}
    </div>
  </div>
</section>

${related.length ? `<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="d">Keep reading</h2></div>
    <div class="grid three">
      ${related.map((r, i) => `<a class="post compact reveal d${(i % 4) + 1}" href="${hArticle(r.app, r.slug)}"><h3>${esc(r.title)}</h3><p class="rd">${readMins(r)} min read</p></a>`).join('')}
    </div>
  </div>
</section>` : ''}
`;
  return layout({
    // Google truncates around 60 chars; keep the suffix only when it fits.
    title: `${a.title} | ${app.name}`.length <= 60 ? `${a.title} | ${app.name}` : a.title,
    description: a.description,
    path: `/${a.app}/${a.slug}/`,
    accent: app.accent,
    accentSoft: app.accentSoft,
    accentInk: app.accentInk,
    ogImage: app.slug,
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
<header class="band">
  ${SKY}
  <div class="wrap">
    <p class="crumb"><a href="${hHome()}">Home</a> <span>/</span> ${esc(pg.title)}</p>
    <h1 class="d">${esc(pg.title)}</h1>
  </div>
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
    accent: '#5B46F0', accentSoft: '#EEEBFF', accentInk: '#4338CA',
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

// A dead end should still offer somewhere to go. Vercel serves this for any
// unmatched path when 404.html sits at the output root.
function notFoundPage() {
  const body = `
<header class="band">
  ${SKY}
  <div class="wrap">
    <p class="eyebrow on-brand">404</p>
    <h1 class="d">That page<br>moved or never <span class="sticker">existed</span>.</h1>
    <p class="lede">No harm done. Everything on this site is one of two things \u2014 an app, or a guide about the subject behind it.</p>
    <div class="cta-row"><a class="btn light" href="${hHome()}">Back to the start ${ARROW}</a></div>
  </div>
</header>

<section>
  <div class="wrap">
    <div class="sec-head"><h2 class="d">The apps</h2></div>
    <div class="grid two">
      ${apps.map((a) => `
      <a class="app-card" href="${hApp(a.slug)}" style="--accent:${a.accent}">
        <span class="ico"><img src="${hAsset(`icons/${a.icon}`)}" alt="" width="136" height="136"></span>
        <span class="body">
          <span class="nm">${esc(a.name)}</span>
          <span class="tg">${esc(a.tagline)}</span>
        </span>
        <span class="go">${ARROW}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="tinted">
  <div class="wrap">
    <div class="sec-head"><h2 class="d">Most read guides</h2></div>
    <div class="grid three">
      ${articles.slice(0, 6).map((a) => `<a class="post" href="${hArticle(a.app, a.slug)}" style="--accent:${appBySlug[a.app].accent}"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p></a>`).join('')}
    </div>
  </div>
</section>
`;
  return layout({
    title: `Page not found | ${site.name}`,
    description: 'That page moved or never existed. Here are the apps and the most read guides instead.',
    path: '/404',
    accent: '#5B46F0', accentSoft: '#EEEBFF', accentInk: '#4338CA',
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
// Not pushed to `written`: a 404 must never appear in the sitemap.
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
await cp(join(ROOT, 'icons'), join(DIST, 'icons'), { recursive: true });
await cp(join(ROOT, 'src/assets/shots'), join(DIST, 'shots'), { recursive: true });
await cp(join(ROOT, 'src/assets/og'), join(DIST, 'og'), { recursive: true });

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
