# ManyChat setup: every comment-to-DM flow

One page per keyword, one ManyChat workspace per Instagram account. The full
copy for ITINERARY and WALK lives in `bali-itinerary.md` and `jupiter-walk.md`.
This file maps every keyword to its link and holds the copy for the flows that
send people to an existing guide.

## Link rules

- Every site link carries `?utm_source=instagram&utm_medium=dm&utm_campaign=<keyword in lowercase>`.
  On TikTok, swap `utm_source=tiktok`.
- App Store links stay plain. A `ct=` campaign token only shows up in App Store
  Connect when it comes with the account's `pt=` provider token (App Analytics →
  Campaigns → generate link). Add both together or neither.
- Never write "free" or a price in a DM, a public reply or a button.

## Keyword map

| Keyword | Account / workspace | Sends to | Status |
|---|---|---|---|
ManyChat (1 Nov 2026) has two workspaces on the Free plan: "Jupiter Walkies app"
(@jupiterwalkies) and "The Bali Secret App" (@thebalisecretapp). Free allows
**4 live automations per workspace**, and both are now full. A fifth one shows
"you've hit the Free plan's limit" and stays a draft.

### Live on @thebalisecretapp

| Keyword | Post | Sends to |
|---|---|---|
| `ITINERARY`, `PLAN` | "Here's how I'd plan my first week in Bali" | [/bali-secret/first-week/](https://www.appsbysass.com/bali-secret/first-week/?utm_source=instagram&utm_medium=dm&utm_campaign=itinerary) (plan page) |
| `ARRIVAL`, `VISA` | "4 things Bali checks before your holiday starts" | [/bali-secret/bali-visa-on-arrival/](https://www.appsbysass.com/bali-secret/bali-visa-on-arrival/?utm_source=instagram&utm_medium=dm&utm_campaign=arrival) |
| `LEVY` | "5 things nobody tells you before Bali" | [/bali-secret/bali-tourist-levy/](https://www.appsbysass.com/bali-secret/bali-tourist-levy/?utm_source=instagram&utm_medium=dm&utm_campaign=levy) |
| `RAIN` | "Rain won't waste your Bali trip if you plan around 3pm" | [/bali-secret/best-time-to-visit-bali/](https://www.appsbysass.com/bali-secret/best-time-to-visit-bali/?utm_source=instagram&utm_medium=dm&utm_campaign=rain) |

### GUIDE (journal posts, every day)

The daily Bali journal carousels and reels (spec:
`~/Desktop/App Carousels/_strategy/2026-11-01-bali-journal-format.md`) end with
"comment GUIDE (or ITINERARY / AREA) and we'll DM you our free bali guide".

- **Keyword:** `GUIDE` (also `guide`, `Guide`, `BALI`)
- **Sends to:** [/bali-secret/first-week/](https://www.appsbysass.com/bali-secret/first-week/?utm_source=instagram&utm_medium=dm&utm_campaign=guide)
- **Posts:** every post, including new ones. That needs ManyChat's "any post or
  reel" trigger, which Free doesn't have. On Free, GUIDE could only run on one
  fixed post, and the account is already at its 4-automation limit.
- **Public replies:** Sent! Check your DMs 🌴 · Just sent it over 👀 · In your DMs now ✈️
- **Opening DM:**
  > Hey! Here's our free Bali guide: a 7 day first trip plan, Canggu, Ubud and Uluwatu in the right order, with real drive times 🌴
  > Tap below and we'll send it 👇

  **Button:** `Send me the guide`
- **Link DM:**
  > Here you go 👉 Your first week in Bali, day by day. Save it for when you land 📌
  >
  > Want it built around your own dates? The app on the page does that, with every stop's tip and cost 👇

  **Button:** `Open the guide` → GUIDE link (the page carries the App Store button)
- `ITINERARY` and `AREA` stay as they are. When the plan allows "any post",
  ITINERARY should switch to any post too.

**What the daily format needs from ManyChat, according to its own upgrade popup:**
Essential (paid, 14 day trial) unlocks unlimited automations, follow-up DMs, a
welcome DM for new followers, "any post or reel" triggers and 250 active
contacts instead of 25. Free can't run a daily keyword flow, a welcome DM for new
followers, or more than 4 automations per account.

**App Store links:** Aziz chose (1 Nov 2026) to keep the direct App Store
button as the second button in the live DMs, and future posts may send people
straight to the app. The first button always goes to a site page, whose App
Store button carries `data-store`.

**Plan decision (1 Nov 2026): staying on Free.** GUIDE can run on one fixed post
at a time. To arm it, swap out one of the 4 live Bali automations (LEVY is the
least central) and point GUIDE at that day's best journal post. Posts that say
"comment GUIDE" without an armed automation get no DM, so only the armed post
should carry the GUIDE ask. The others can keep the App Store CTA.

**Approved, waiting on a post (1 Nov 2026):** Aziz approved swapping LEVY for
GUIDE on the first journal post that goes up. No journal post was live yet when
this was approved. Once one is: stop LEVY, build GUIDE on that post with the copy
above, and go live. The Bali account also has an unsaved RABIES/SAFE draft in
the quick-automation builder. Building GUIDE replaces it, and its copy is kept
in this file.

Draft, blocked by the limit: `RABIES`, `SAFE` on "Would you know what to do if a
monkey scratched you in Bali?" (its caption already says "Comment RABIES") →
[/bali-secret/is-bali-safe/](https://www.appsbysass.com/bali-secret/is-bali-safe/?utm_source=instagram&utm_medium=dm&utm_campaign=safe).

### Original keyword plan

| Keyword | Account / workspace | Sends to | Status |
|---|---|---|---|
| `ITINERARY` | @thebalisecretapp | [/bali-secret/first-week/](https://www.appsbysass.com/bali-secret/first-week/?utm_source=instagram&utm_medium=dm&utm_campaign=itinerary) (plan page) | Ready |
| `AREA` | @thebalisecretapp | [/bali-secret/where-to-stay-in-bali/](https://www.appsbysass.com/bali-secret/where-to-stay-in-bali/?utm_source=instagram&utm_medium=dm&utm_campaign=area) (guide) | Ready |
| `ARRIVAL` | @thebalisecretapp | [/bali-secret/bali-visa-on-arrival/](https://www.appsbysass.com/bali-secret/bali-visa-on-arrival/?utm_source=instagram&utm_medium=dm&utm_campaign=arrival) (guide) | Ready |
| `BELLY` | @thebalisecretapp | no page yet | Needs a page |
| `WALK` | "Jupiter Walkies app", post "7 dog breeds the Kennel Club says need just 30 minutes a day" | [/jupiter-walkies/walk-plan/](https://www.appsbysass.com/jupiter-walkies/walk-plan/?utm_source=instagram&utm_medium=dm&utm_campaign=walk) (plan page, button "Open the walk plan") | **Live** |
| `SNIFF` | "Jupiter Walkies app", post "Your dog's walk isn't just exercise" | [/jupiter-walkies/decompression-walks/](https://www.appsbysass.com/jupiter-walkies/decompression-walks/?utm_source=instagram&utm_medium=dm&utm_campaign=sniff) (guide) | **Live** |
| `STUCK` | "Jupiter Walkies app", post "My dog just stops and won't walk" | [/jupiter-walkies/why-does-my-dog-stop-walking/](https://www.appsbysass.com/jupiter-walkies/why-does-my-dog-stop-walking/?utm_source=instagram&utm_medium=dm&utm_campaign=stuck) (guide) | **Live** |
| `BURN` | "Jupiter Walkies app", post "7 research-backed facts about what dog walking does to YOU" | [/jupiter-walkies/how-many-calories-does-walking-the-dog-burn/](https://www.appsbysass.com/jupiter-walkies/how-many-calories-does-walking-the-dog-burn/?utm_source=instagram&utm_medium=dm&utm_campaign=burn) (guide) | **Live** |
| `HOT` | "Jupiter Walkies app" | [/jupiter-walkies/dog-walking-in-hot-weather/](https://www.appsbysass.com/jupiter-walkies/dog-walking-in-hot-weather/?utm_source=instagram&utm_medium=dm&utm_campaign=hot) (guide) | Copy ready. No matching post yet |
| `PULL` | "Jupiter Walkies app" | [/jupiter-walkies/why-does-my-dog-pull-on-the-leash/](https://www.appsbysass.com/jupiter-walkies/why-does-my-dog-pull-on-the-leash/?utm_source=instagram&utm_medium=dm&utm_campaign=pull) (guide) | Copy ready. No matching post yet |

The four live Jupiter flows all use the same public replies (Sent! Check your DMs 🐾 ·
Just sent it over 🐕 · In your DMs now 🦴), an opening DM with a `Send me the guide`
button, and a link DM with `Open the guide` plus `Get Jupiter Walkies`. Their
captions don't mention the keyword yet, so pin a comment on each post such as
"Comment SNIFF and I'll DM you the guide 🐾".

Jupiter posts with no matching page yet: dry nose / sick dog, eating grass (two
posts), UK dog laws and the legal checklist, body language, toxic Halloween
foods, dog facts, autumn and conker hazards (two posts), swimming safety.
| `30DAYS` | "Jupiter Walkies app" | no page yet | Needs a page |
| `TIMELINE`, `72`, `SAVED`, `TRIGGERS` | HOLD | no Instagram account yet | Waits for an account |
| `PROTEIN`, `HIDDEN` | Bo (TikTok only) | ManyChat's Instagram automations don't cover TikTok | Waits for an Instagram account |

App Store links:

- The Bali Secret: https://apps.apple.com/us/app/the-bali-secret/id6761162361
- Jupiter Walkies: https://apps.apple.com/us/app/jupiter-walkies-dog-walks/id6774188640

## How each flow is built in ManyChat (Free plan)

Automation → New Automation → "Auto-DM links from comments" (quick automation):

1. **Post or reel:** on Free, only "a specific post or reel" works. "Any post" and
   "next post" need an upgrade. Pick the post that carries this keyword's CTA. A
   new post of the same type means editing the automation and picking that post.
2. **Keyword:** the keyword plus its variants (below). One keyword per automation.
3. **Public reply:** on, with the rotating replies.
4. **Opening DM:** message 1 with the `Send me …` button. This is Instagram's one allowed private reply.
5. **Link DM:** after the tap, the delivery text with two link buttons: the page, then the App Store.
6. Leave "follow before you get the link" off. It costs taps.
7. Name the automation `KEYWORD · page slug`, then **Set live** (Aziz approves each one).

The one-question step (message 3) needs the Flow Builder or a paid plan, so the
quick automations merge messages 2 and 4 into the link DM, like WALK does.

ManyChat Free covers 25 contacts per workspace, shared by every flow in it.
The 26th commenter gets nothing, so watch the counter.

---

## AREA (The Bali Secret)

- **Keyword:** `AREA` (also `area`, `Area`, `STAY`)
- **Public replies:** Sent! Check your DMs 🌴 · Just sent it over 👀 · In your DMs now 🌺
- **Message 1:**
  > Hey! Here's how to pick where to stay in Bali: Ubud, Canggu, Seminyak and Uluwatu side by side 🌴
  > Tap below and I'll send it 👇

  **Button:** `Send me the guide`
- **Link DM:**
  > Here you go 👉 Where to stay in Bali
  >
  > Still torn? The Bali Secret matches you to the right area in about 30 seconds, then builds your days around it 👇

  **Buttons:** `Open the guide` → AREA link · `Get The Bali Secret` → App Store
- **Slide CTA:** Comment AREA and I'll tell you where to stay

## ARRIVAL (The Bali Secret)

- **Keyword:** `ARRIVAL` (also `arrival`, `Arrival`, `VISA`)
- **Public replies:** Sent! Check your DMs ✈️ · Just sent it over 👀 · In your DMs now 🌴
- **Message 1:**
  > Hey! Here's what to sort before you land in Bali: the visa, what to have ready and what catches people out ✈️
  > Tap below and I'll send it 👇

  **Button:** `Send me the list`
- **Link DM:**
  > Here you go 👉 Bali visa on arrival
  >
  > The Bali Secret keeps your arrival day planned too, from the airport to your first dinner 👇

  **Buttons:** `Open the guide` → ARRIVAL link · `Get The Bali Secret` → App Store
- **Slide CTA:** Comment ARRIVAL and I'll send you what to sort before you land

## HOT (Jupiter Walkies)

- **Keyword:** `HOT` (also `hot`, `Hot`, `HEAT`)
- **Public replies:** Sent! Check your DMs 🐾 · Just sent it over 🐕 · In your DMs now ☀️
- **Message 1:**
  > Hey! Here's the 7 second pavement test, plus the safest times to walk when it's hot ☀️
  > Tap below and I'll send it 👇

  **Button:** `Send me the guide`
- **Link DM:**
  > Here you go 👉 Walking your dog in hot weather
  >
  > Jupiter Walkies tracks every walk with GPS, so you can keep the hot days short and still see their week add up 👇

  **Buttons:** `Open the guide` → HOT link · `Get Jupiter Walkies` → App Store
- **Slide CTA:** Comment HOT and I'll send you the pavement test

## PULL (Jupiter Walkies)

- **Keyword:** `PULL` (also `pull`, `Pull`, `LEASH`)
- **Public replies:** Sent! Check your DMs 🐾 · Just sent it over 🐕 · In your DMs now 🦴
- **Message 1:**
  > Hey! Here's why your dog pulls on the leash, and what actually stops it 🐕
  > Tap below and I'll send it 👇

  **Button:** `Send me the guide`
- **Link DM:**
  > Here you go 👉 Why does my dog pull on the leash?
  >
  > Log each training walk in Jupiter Walkies and you'll see the progress week by week 👇

  **Buttons:** `Open the guide` → PULL link · `Get Jupiter Walkies` → App Store
- **Slide CTA:** Comment PULL and I'll send you how to stop leash pulling
