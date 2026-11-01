# Aziz Sassi — apps site

A 37-page static site: a home index, one page per app at `/app-name/`, and
eight researched guides under each app. Generated from data — no framework,
no dependencies, no build tooling beyond Node.

```
src/content.mjs      the four apps: copy, features, FAQs, App Store URLs
src/articles.mjs     the twelve guides
src/assets/          styles.css, motion.js, escape.js, fonts, shots, photos, video
src/plan-media.mjs   photos and video for the plan pages
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

### Internal linking

Every guide carries at least one **in-prose** contextual link (41 across 32
articles). This matters more than the related-posts grid: Google weighs a link
inside the prose with descriptive anchor text far more heavily than a card in a
footer list.

The rule when adding links: the anchor must be text that was already there and
already meant what the target page answers. Do not append "read more about X"
sentences — they read as SEO filler and Google treats them that way. Cross-app
links are fine where the overlap is real (the calorie-deficit guide links to the
AI-accuracy piece because underestimated intake is the same failure in both).

In FLAT builds these are rewritten to flat filenames automatically by
`fixLinks()` in `build.mjs`.

### Adding a guide

Append to `src/articles.mjs` and rebuild. Routing, internal links, the sitemap,
schema and the related-posts blocks all update themselves.

Block types: `h2` `p` `ul` `ol` `callout` `note` `table`.

Each guide's mid-article App Store card names the app feature closest to the
guide's topic, picked by word overlap with the app's `features` in
`content.mjs`. Where the pick is wrong, set `feature: '<exact feature title>'`
on the article; a title that matches no feature fails the build.

## Design: Jungle Pop

The look is taken from The Bali Secret 2.0 (the app's `DesignSystem` package:
`Palette.swift`, `Typography.swift`, `Stamps.swift`, `Waves.swift`) so the site
and the apps read as one family.

- **Canvas and colour.** Cream `#F6F1E4`, jungle `#0F3D2E`, mint `#3DDC97`,
  coral `#FF5A36` for the one thing to tap, sun `#FFC23D` for sticker tags.
- **Type.** Sofia Sans Condensed Black in caps for headlines (`.poster`), Nunito
  for everything else, both self-hosted as latin + latin-ext variable woff2.
- **Per-app posters.** Each app in `content.mjs` has `panel`, `panelHead`,
  `panelInk`, `pill`, `pillInk` and a short `sticker`. `panelVars(app)` turns
  them into CSS custom properties for a card or a whole page. `panelInk` must
  pass 4.5:1 on `panel`; `panelHead` only needs 3:1 because it is only used for
  large caps.
- **Motifs.** Mint pill under a headline (`.pill`), tilted sticker (`.tag`),
  perforated postage stamp (`.stamp`, pure CSS radial-gradient), wavy edge
  between grounds (`WAVE()` in `build.mjs`).

### Motion

`motion.js` derives every value from scroll position, so scrolling back
rewinds exactly, and does nothing at all under `prefers-reduced-motion` (every
element sits in its final state and no video is fetched).

| Where | What moves |
|---|---|
| Home, demo stage | The phone pins while the headlines change, one per quarter of the 340vh track (`--p`, `.beats li.on`) |
| App page, features | On wide screens the phone pins and swaps to the screenshot for the feature in view |
| App page, film band | The ambient clip grows from a card to nearly full width as it arrives (`--fp`) |
| Plan hero | The photo zooms gently as you scroll off it (`--hp`) |
| Plan days | Each day photo drifts as it crosses the screen (`--vp`) |

### Video

All video is `preload="none"` with no `src`; `motion.js` attaches one source
(WebM if supported, else MP4) when the section is about a screen away, and
pauses anything off screen.

| File | What | Weight |
|---|---|---|
| `bali-demo` | The Bali Secret's own 30 s demo (`BaliWise/docs/media/demo-en.mp4`), 360×640, no audio | ~0.5 MB |
| `bali` | Rice terraces, behind the film band on The Bali Secret's page | ~0.6 MB |
| `hold` | HOLD's film band | ~0.6 MB |
| `bali-beach` | Coverr clip of Bingin Beach behind the first-week plan hero | ~0.3 MB |

### Plan photos

Plan pages get a hero photo and one 4:5 photo per day from `src/plan-media.mjs`
(kept apart from `plans.mjs` so words and pictures change independently). The
files live in `src/assets/photos/`; `CREDITS.json` there records the Unsplash
source of each. Alt text describes the photo, never the named stop, because a
stock photo is not "Crate Cafe". A plan with no media still renders, with
app-coloured tiles.

To add photos for a plan: crop 480×600 for days and 1200×750 (+ a 600×750
`-m` crop for phones) for the hero, keep each under ~100 KB, and add an entry
keyed by the plan's slug.

## App pages are landing pages

Each `/app-name/` is built to receive traffic from that app's own Instagram
account, so it stands alone:

poster hero in the app's colour with icon + CTA → App Store facts → what it does
(pinned phone that swaps screens) → film band (if the app has a clip) → how it
works (3 steps) → real screens → FAQ with `FAQPage` schema → guides → closing
poster.

Two CTAs above the fold and one at the bottom, all carrying `data-store` so the
Instagram escape applies. Every colour on the page comes from the app's poster
colours.

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

### On video

Video is used, but never as something the page waits for: every clip is
`preload="none"` with no `src` until it is about a screen away, small (0.3–0.6
MB, 360p for the phone demo, 540p for bands), silent, and skipped entirely for
reduced-motion users, who get the poster. iOS Low Power Mode blocks autoplay, so
each clip must still make sense as its poster frame. See *Design: Jungle Pop*
for the list.

### Worth doing next

- **Add an `og:image`** per page (1200×630). Bio links show no preview, but DMs
  and Story stickers do.
- **Campaign tokens** on store URLs (`?pt=…&ct=instagram_bio&mt=8`) so App Store
  Connect attributes installs to the site.
- **Internal links inside article bodies**, not just the related-posts grid.
  Currently the guides don't link to each other mid-paragraph.
- **Refresh dated facts.** The Bali levy amount and the 2026 calorie-app study
  will age. Update `updated:` when you revise — it feeds `dateModified`.
