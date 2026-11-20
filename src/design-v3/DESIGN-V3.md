# Editorial Pop — design v3 for appsbysass.com

Preview: `node build.mjs && node src/design-v3/build-v3.mjs` → `dist/v3/index.html`

Built in the site's real stack: plain CSS + ~2.7 KB of vanilla JS. No React, no
Tailwind, no animation library.

---

## Where each reference actually landed

| reference | status | what it contributed |
|---|---|---|
| **Supahero** | ✅ supahero.io | It's a *gallery* of ~200 hero sections (Linear, Stripe, Resend, Raycast), not a layout to copy. Took the pattern that recurs across them: centred mega-type → one-line sub → dual CTA → trust strip. |
| **Fontshare** | ✅ fontshare.com | 100 free fonts, 59 pairings. Verified 12 families live on their API. Picked **Clash Display** (headlines) + **Satoshi** (everything else). |
| **21st.dev** | ⚠️ exists, can't be used directly | It's a React + Tailwind + shadcn registry — components are copied into a repo that has those. This site is a static generator with hand-written CSS, so I took the *section patterns* and wrote the CSS myself. |
| **Originkit** | ✅ originkit.dev | 810 components: 134 Animations, 103 Backgrounds, 91 Text, 30 Buttons, 24 Cursors. Re-implemented three ideas in plain CSS — see below. |
| **Kawaii Text Animation** | ❌ **does not exist** | `kawaii-text-animation.com` does not resolve. I wrote the playful text motion directly instead. |
| **MotionSites** | ✅ motionsites.dev | It's an **AI website-prompt library** (AI 网站提示词), not a motion showcase — which is why the brief asks for "prompt examples" from it. Prompts below. |

---

## 1. Layout structure

| # | section | purpose | notes |
|---|---|---|---|
| 0 | Mesh background + scroll progress | atmosphere, orientation | fixed, `z-index:-1`, transform-only |
| 1 | Nav | wayfinding | sticky, blurred, centre-out underline |
| 2 | **Hero** | the one claim | kicker → mega headline w/ swipe highlight → lede → dual CTA → trust strip |
| 3 | Marquee rail | breadth at a glance | app names, pauses on hover |
| 3b | **Motion showcase** | what each app is, one at a time | 420vh section, sticky phone, accent floods per app, screens cross-fade — scroll-driven, no scroll-jacking |
| 4 | **The apps** | the products | one tinted card per app: icon, name, tagline, chips, CTA, 3 real screens |
| 5 | **Answers, not filler** | why the guides exist | 8 guide chips in app accents + "all 33" CTA |
| 6 | **One person. No company.** | trust | 4-row fact list: publisher, inbox, funding, what's collected |
| 7 | **Not an iPhone app** | range | LOYA + LOYA Tunisia, linked out, no pricing language |
| 8 | Footer CTA | last chance | "Start with the one that fits." |

## 2. Copy

The first pass wrote an umbrella headline ("Apps that do one thing, properly")
and a metric strip ("2+ sources per guide"). Both were invented and said
nothing. They are gone. The site already had concrete copy in `content.mjs`
and the page now uses it.

**Hero** — restrained on purpose; the apps carry the detail.
- Kicker: `Independent · iOS`
- H1: `I needed these. So I [built] them.`
- Lede: "Small apps for problems I actually had. No team, no investors, nobody to talk me out of the odd ones."
- CTAs: `What they do →` / `Read the guides`
- **No metric strip.**

**Each app** now states what it actually does, pulled from `content.mjs`:
- Jupiter Walkies — "Track every dog walk with a live GPS map — distance, pace and calories. Share-ready walk cards, walking friends nearby, friendly leaderboard."
- Bo — "Snap a meal and get a calorie count you can trust. Bo asks the one follow-up question — dressing? oil? — that other AI calorie apps skip."
- The Bali Secret — "Build a day-by-day Bali itinerary, track your budget in rupiah and dollars, and find the spots that are not on every other list."
- HOLD — "An AI quit coach for when a craving hits, not just a counter tallying days. Guided breathing, real-time support and progress tracking."

Plus three real feature lines each ("Talk it through at 2am when no one else is
up"), and the **real App Store facts** — version, last updated, size, minimum
iOS — read from `store-data.json`. Checkable, not invented.

## 3. Components (in `styles.css`)

| component | selector | technique |
|---|---|---|
| Mesh background | `.mesh i` | 3 blurred radials, `transform` keyframes only |
| Scroll progress | `.prog` | `--p` set from rAF, 4-stop accent gradient |
| Nav underline | `.nav-links a::after` | width 0→100% from centre |
| Magnetic button | `.btn` + motion.js | pointer offset × capped 9px, springs back; pointer-fine only |
| Button sheen | `.btn::before` | translateX sweep, transform not repaint |
| Swipe highlight | `h1.mega .hl::after` | `scaleX(0→1)`, `isolation:isolate` keeps it behind glyphs |
| Tinted app card | `.app` | `--tint` + `--accent` per app, lift + hard shadow on hover |
| Reveal | `.rv` / `.rv.in` | IntersectionObserver, one-way, staggered `d1/d2/d3` |
| Fact list | `.facts` | bordered rows, label/value split |
| Guide chips | `.gchip` | accent dot per app |

## 4. Animation prompts

**For Originkit-style components** (paste into their search, or into an AI tool to rebuild):

> Animated mesh gradient background: three large blurred colour blobs in peach, mint and lilac, each drifting on its own slow loop between 24 and 30 seconds, multiply blend, transform-only so it never repaints. Fixed behind all content at 50% opacity.

> Magnetic pill button: on pointer move the button translates toward the cursor by a capped fraction of the offset, max 9px, and springs back on leave. A light sheen sweeps left to right on hover. Disabled entirely on touch and under prefers-reduced-motion.

> Centre-out nav underline: a 2px rule grows from the centre of the link to full width on hover over 300ms on an ease-out-expo curve.

**For MotionSites-style scroll prompts:**

> Scroll progress bar pinned to the top of the viewport, 3px, filled with a four-stop gradient in the brand accents, width driven by scroll position through requestAnimationFrame, never a scroll listener that writes layout.

> One-way reveal: elements rise 26px and fade in as they cross 12% visibility, staggered 60ms apart within a group, and never animate again once revealed.

> Headline highlight: a solid bar scales from 0 to full width behind the lower third of a phrase, 850ms after load, ease-out-expo, sitting behind the glyphs rather than under them.

**Text motion** (replacing the reference that does not exist):

> Playful letter entrance: each glyph springs up from 26px below with a slight overshoot, 40ms apart, damping 12. Pure function of elapsed time so it renders identically every run.

---

## Before this ships

- **Self-host the fonts.** It currently pulls Clash Display and Satoshi from `api.fontshare.com`. The site self-hosts every other font; a third-party font CDN adds a DNS lookup and a connection on the critical path. Download the woff2 files into `src/assets/fonts/` and swap `fonts.css` for local `@font-face` rules.
- **The preview is `noindex`.** Remove that when it becomes the real homepage.
- **`/shots/hold-1.jpg` still shows "Best of the App Store."** Unearned (HOLD has 1 rating) and still live on the current site too.
