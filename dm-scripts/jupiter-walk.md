# WALK: comment-to-DM script (Jupiter Walkies)

Landing page: https://www.appsbysass.com/jupiter-walkies/walk-plan/?utm_source=instagram&utm_medium=dm&utm_campaign=walk
ManyChat workspace: "Jupiter Walkies app"

Instagram allows one automatic DM per comment, so message 1 must get a tap. Messages 2 to 4 send only after that tap.

**What is actually set up in ManyChat Free (quick automation):** trigger, public replies, message 1, then one link DM that merges messages 2 and 4. It has two buttons, the walk plan and the App Store link. The size question (message 3) needs the full Flow Builder or a paid plan, so it is left out for now.

---

## Trigger

- **Keyword:** `WALK` (also `walk`, `Walk`, `WALKS`)
- **Posts:** the post(s) where you used the keyword

## Public reply to the comment (rotate these)

- Sent! Check your DMs 🐾
- Just sent it over 🐕
- In your DMs now 🦴

## Message 1: the one allowed private reply

> Hey! Here's how long your dog should walk, by size and age, plus a week of walks to go with it 🐾
> Tap below and I'll send it 👇

**Button:** `Send me the plan`

## Message 2: delivery (sent after the tap)

> Here you go 👉 How long should your dog walk? (LANDING_PAGE_URL)
>
> Find your dog's row, then try day 1 tomorrow 🐕

**Button (link):** `Open the plan` → landing page

## Message 3: one question

> Quick one: how big is your dog?

**Quick replies:** `Small` · `Medium` · `Large` · `Puppy` · `Senior`

Tag each answer (`dog_size:small`, and so on).

## Message 4: personal nudge (after their answer)

**Small / Medium / Large**
> Perfect. Most people guess their dog's minutes and get it wrong. Jupiter Walkies tracks every walk with GPS and shows your week against their number, with streaks to keep it going 👇

**Puppy**
> Puppies are where it matters most: about 5 minutes per month of age, twice a day. Jupiter Walkies times every walk so you don't overdo it 👇

**Senior**
> Shorter and more often is the rule for seniors. Jupiter Walkies tracks each walk so you can see what they're actually managing week to week 👇

**Button (link):** `Get Jupiter Walkies` → https://apps.apple.com/us/app/jupiter-walkies-dog-walks/id6774188640

---

## Rules

- Never more than one follow-up. If they don't answer message 3, stop.
- Don't write "free app" or name a price.
- On slides, the CTA reads: **Comment WALK and I'll send you your dog's walk plan**. Put it in caption line 1 and a pinned comment too.

## Post ideas to pair it with

1. "You're probably walking your dog wrong" (minutes by dog type)
2. "Why a 20 minute sniff walk beats a 40 minute march"
3. "The puppy 5 minute rule"
4. A re-cut of the "10 dog facts" winner, with the last slide changed to the WALK CTA

## What to track (after 2 weeks)

| Step | Where to look |
|---|---|
| Comments per post | Instagram insights |
| Message 1 tap rate | ManyChat flow stats |
| Page visits | Vercel Analytics, `/jupiter-walkies/walk-plan/` with utm_campaign=walk |
| App Store taps from the page | Vercel Analytics on that page |
| Installs | App Store Connect, around the post dates |

ManyChat Free covers 25 contacts. The 26th commenter gets nothing, so watch the counter.
