# Aziz Sassi — apps site

A 37-page static site: a home index, one page per app at `/app-name/`, and
eight researched guides under each app. Generated from data — no framework,
no dependencies, no build tooling beyond Node.

```
src/content.mjs      the four apps: copy, features, FAQs, App Store URLs
src/articles.mjs     the twelve guides
src/assets/          styles.css + escape.js (copied verbatim into the build)
build.mjs            the generator
seo-check.mjs        validates every built page
icons/               app icons pulled from the App Store
dist/                BUILD OUTPUT — deploy this. Never edit by hand.
dist-flat/           same site with flat filenames, for hosts that can't
artifact/            serve /root-relative paths (the Claude preview)
```

## Build

```bash
node build.mjs && node seo-check.mjs
```

`seo-check.mjs` fails the build if any page has a duplicate or missing title,
description or canonical, more than one `<h1>`, invalid JSON-LD, a broken
internal link, or a title/description outside the length Google will render.

## Live

**https://www.appsbysass.com** — Vercel, auto-deploying from `main`.

Push to deploy:

```bash
git add -A && git commit -m "..." && git push
```

`site.origin` in `src/content.mjs` is `https://www.appsbysass.com`, matching
Vercel's primary domain. The apex 308-redirects to `www`, so canonicals point
at `www` — if you ever make the apex primary in the Vercel dashboard, change
`site.origin` in the same commit or you advertise a URL that redirects.

### Staging a change without indexing it

```bash
NOINDEX=1 SITE_ORIGIN=https://example.vercel.app npm run build
```

`NOINDEX=1` adds `robots: noindex,nofollow` to every page and flips robots.txt
to `Disallow: /`. Use it for any preview that should not compete with the live
domain in search results.

---

## The Instagram problem this site solves

Instagram renders links in its own `WKWebView`, which **declines the OS-level
handoff** an `apps.apple.com` link needs — silently. No error, just a dead page.
Users read it as a broken app.

`src/assets/escape.js` fixes it. Every App Store link carries its URL in
`data-store`, and on a Meta webview the script swaps each `href` for an escape
URL:

| Environment | Escape used |
|---|---|
| iOS + Instagram | `instagram://extbrowser/?url=…` |
| iOS + Threads | `barcelona://extbrowser/?url=…` |
| iOS + TikTok, Snapchat, X, LinkedIn, Pinterest, Reddit, Telegram | `x-safari-https://…` |
| Android + any in-app browser | `intent://…;package=com.android.chrome;S.browser_fallback_url=…;end` |
| iOS + Facebook | none exists — page shows `⋯ → Open in browser` instead |
| Normal browser | untouched `apps.apple.com` link |

**TikTok blocks App Store links just like Instagram does** — same silent
dead-end. The difference is that TikTok never blocked `x-safari-https://`, the
scheme Meta killed around mid-2025, so that still gets people out of TikTok.
Using the right scheme per app matters: firing Meta's scheme inside TikTok (or
vice versa) does nothing at all.

**The detail that matters:** the escape URL sits in the `href` of the anchor the
user taps. Meta's webview drops *scripted* navigation to a custom scheme but
honours a genuine tap. Never fire it from JavaScript.

Already dead, don't retry: `itms-apps://`, short links, `x-safari-https://`
(Meta blocked it ~mid-2025), and auto-redirect on page load.

`instagram://extbrowser` is undocumented with no compatibility guarantee. If
Instagram-sourced installs fall off a cliff, test this first.

---

## The SEO approach

Your apps are new with 0–1 ratings. Competing for "best calorie tracker app"
against funded incumbents is not winnable. So none of this content tries.

Instead every guide targets a **long-tail informational query you can genuinely
answer better than the listicle farms**, and converts the reader afterwards:

| App | Guides target |
|---|---|
| HOLD | cravings length · withdrawal timeline · how to quit vaping · smoking recovery timeline · vaping and skin · post-quit weight gain · withdrawal anxiety · nicotine pouches |
| Jupiter Walkies | walk length by breed · puppy 5-minute rule · hot-weather walking · calories burned · leash pulling · refusing to walk · tiring a dog indoors · decompression walks |
| Bo | AI calorie accuracy · daily calorie needs · photographing food · deficit plateaus · tracking macros · is 1,200 too low · daily protein · maintenance calories |
| The Bali Secret | best time to visit · trip cost · tourist levy · 7-day itinerary · renting a scooter · where to stay · visa on arrival · is Bali safe |

Each page carries:

- A **short-answer box** in the first screen — what gets pulled into a featured
  snippet. The answer comes before the article, not after 800 words of preamble.
- **`FAQPage` JSON-LD** on app pages, which is what wins "People also ask".
- `SoftwareApplication`, `Article` and `BreadcrumbList` schema where they apply.
- Real sources, linked and `rel="nofollow"`.
- Honest limits. The Bo article says AI calorie apps are off by a third — that
  credibility is why the page is worth linking to, and it's also Bo's actual
  differentiator.

### Adding a guide

Append to `src/articles.mjs` and rebuild. Routing, internal links, the sitemap,
schema and the related-posts blocks all update themselves.

Block types: `h2` `p` `ul` `ol` `callout` `note` `table`.

## The scroll stage

### The hero

`.band.hero` is `100svh`, so the sky is the first thing and it is whole. Seven
cloud layers, each with a `DEPTH` weight in `motion.js`. As you scroll, nearer
layers move further, grow more and fade sooner, and alternate layers push left
and right — which is what reads as descending *through* the clouds rather than
panning past a picture.

The cloud wrapper takes the scroll transform while the drift animation lives on
the `<svg>` inside it. That split matters: both need a transform, and on one
element the second would overwrite the first.

### The ring

`.stage` is a 300vh section with a `position: sticky` inner panel. `motion.js`
maps scroll progress through it to `--rot` (0 → 1 → one full turn), `--a` (the
first 16%, which rises the phones into place) and `--p` (everything else).
Because the values are *derived from scroll position* rather than played on a
timer, scrolling back rewinds exactly — that reversibility is the whole point.

### Live screens, not just screenshots

Every third phone runs real app UI built from CSS and SVG, keyed off the same
`--p`, so it scrubs with the scroll like everything else:

| Screen | App | What moves |
|---|---|---|
| `scr-walk` | Jupiter | A GPS route draws itself via `stroke-dashoffset` over a map grid |
| `scr-macro` | Bo | A calorie ring fills, with macro bars scaling underneath |
| `scr-trip` | The Bali Secret | Itinerary days slide in one after another |
| `scr-breathe` | HOLD | A breathing orb, on its own loop since breathing should not depend on scrolling |

Add one by putting markup in `SCREENS` in `build.mjs` and a `screen:` key on the
app in `content.mjs`. `every: 3` on the home ring and `every: 4` on app pages
controls the live-to-screenshot ratio.

The phones are CSS 3D: each is `rotateY(i * 360deg/n) translateZ(--rad)` inside
a `preserve-3d` parent, with `backface-visibility: hidden` so the far half drops
out and the near arc stays legible.

**Why not a Remotion-rendered sequence.** Remotion renders React to video, so
it could only produce a file to scrub. `<video>` scrubbing is unreliable on iOS
Safari, and a frame sequence at this length runs 700 KB–2 MB — on an audience
that is mostly cellular inside Instagram's webview. The CSS version is sharp at
any DPI, weighs nothing beyond the 12 screenshots (~15 KB each, lazy-loaded),
and scrubs perfectly on every device.

Remotion *is* the right tool for rendering promo videos for the Instagram
accounts themselves. That's a separate deliverable, not a page element.

Tuning: `--pw` (phone width), `--rad` (ring radius), `.stage { height }` (how
much scroll one rotation costs). All in `styles.css` under SCROLL STAGE.

## App pages are landing pages

Each `/app-name/` is built to receive traffic from that app's own Instagram
account, so it stands alone:

hero with icon + CTA → what it does → how it works (3 steps) → scroll ring →
FAQ with `FAQPage` schema → guides → final CTA.

Two CTAs above the fold and one at the bottom, all carrying `data-store` so the
Instagram escape applies. Per-app accent colour, and the ring shows only that
app's screenshots.

## SEO tooling — how to wire up each one

### Already done, in the build

| Tool | Status |
|---|---|
| **Lighthouse** (the engine behind PageSpeed Insights) | Runs locally, all four categories at 100. Command below. |
| **Yoast / Rank Math** | Not applicable — those are WordPress plugins. What they generate (title/meta control, canonicals, schema, sitemap, breadcrumbs) is produced by `build.mjs` and enforced by `seo-check.mjs`. |
| **Screaming Frog** | Not needed under 500 URLs — `seo-check.mjs` already checks duplicate/missing titles and descriptions, canonicals, heading structure, broken internal links and JSON-LD validity on every build. Run Frog against the live site after deploy if you want crawl-depth and redirect analysis. |

Run the audit yourself:

```bash
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npx lighthouse http://localhost:4173/ --preset=desktop --view
```

### Needs your account — paste one ID each

Open `src/content.mjs` → `site.analytics`:

```js
analytics: {
  ga4: 'G-XXXXXXXXXX',        // Google Analytics 4 → Admin → Data streams
  searchConsole: 'abc123...',  // Search Console → HTML tag method → the content= value
}
```

Rebuild and both tags appear on all 17 pages. Nothing is loaded when the fields
are empty, so the site stays script-free until you opt in.

Then:

1. **Search Console** — verify, submit `https://yourdomain.com/sitemap.xml`,
   and watch Coverage for indexing errors. This is where you learn which of the
   twelve guides Google actually picked up.
2. **GA4** — set the App Store link as a conversion. Every store link already
   carries `data-store`, so it is trivial to select on.
3. **PageSpeed Insights** — run `https://yourdomain.com/` once live. Local
   Lighthouse cannot measure real-world CrUX field data; PSI can.
4. **Ahrefs Webmaster Tools** — free after verifying the domain in Search
   Console. Use it for backlinks and to spot which guides earn links.
5. **Google Keyword Planner / Ubersuggest / AnswerThePublic** — use these to
   pick the *next* guides. The existing twelve came from qualitative SERP
   research, not volume data, so validating them against real volume is the
   highest-value next step.

## Performance

Measured with Lighthouse, mobile preset, after self-hosting the fonts:

| | Before | After |
|---|---|---|
| Performance | 65 | 99–100 |
| First Contentful Paint | 3.2 s | 0.3 s |
| Largest Contentful Paint | 3.2 s | 0.5 s |
| Render-blocking requests | 1 (2,893 ms) | 0 |

Accessibility, Best Practices and SEO are 100 on every page type.

**The fix that mattered:** Google Fonts was blocking render for 2.9 seconds —
two extra origins, a blocking stylesheet, then a 75 KB font the `<h1>` waited
on. The fonts are now self-hosted in `src/assets/fonts/` as deduplicated
variable files (one per family+subset, ~101 KB for a latin page), concatenated
into `styles.css` so they cost no extra request, with the two latin faces
preloaded.

Keep it that way. Every 100 ms here is paid by someone on cellular inside
Instagram's webview, which is the entire audience.

### On video backgrounds

Deliberately not used. A 1080p hero loop is 1–3 MB even compressed — roughly
20× the current *entire page* — and iOS Low Power Mode blocks autoplay, so a
meaningful share of visitors get a static poster frame anyway. Remotion is a
video **rendering** tool (React → MP4); it has no runtime role in a page like
this and would add a React + ffmpeg pipeline to a project that currently has
zero dependencies.

The motion here is CSS/SVG instead — drifting clouds, scroll parallax, staggered
reveals, a marquee — which weighs about 2 KB, always plays, and costs 0 ms of
blocking time (measured TBT is 0).

If you still want a video hero, the cheap version is a 3–4 second silent loop
at 720p, under 400 KB, `preload="none"` with a poster image, on the home page
only. Say the word and I'll add it.

### Worth doing next

- **Add an `og:image`** per page (1200×630). Bio links show no preview, but DMs
  and Story stickers do.
- **Campaign tokens** on store URLs (`?pt=…&ct=instagram_bio&mt=8`) so App Store
  Connect attributes installs to the site.
- **Internal links inside article bodies**, not just the related-posts grid.
  Currently the guides don't link to each other mid-paragraph.
- **Refresh dated facts.** The Bali levy amount and the 2026 calorie-app study
  will age. Update `updated:` when you revise — it feeds `dateModified`.
