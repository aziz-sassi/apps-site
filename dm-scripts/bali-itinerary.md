# ITINERARY: comment-to-DM script (The Bali Secret)

Landing page: https://www.appsbysass.com/bali-secret/first-week/?utm_source=instagram&utm_medium=dm&utm_campaign=itinerary
Account: @thebalisecretapp (Instagram) · @thebalisecret (TikTok, where you reply by hand or pin the link)

Paste these into ManyChat, Inrō or the Instagram plugin. Each block is one message.
Instagram allows one automatic DM per comment, so message 1 must get a tap. Messages 2 to 4 send only after that tap.

---

## Trigger

- **Keyword:** `ITINERARY` (also match `itinerary`, `Itinerary`, `PLAN`)
- **Posts:** the post(s) where you used the keyword

## Public reply to the comment (rotate these)

- Sent! Check your DMs 🌴
- Just sent it over 👀
- In your DMs now ✈️
- Done, check your requests folder if you don't see it 🌺

## Message 1: the one allowed private reply

> Hey! Here's the 7 day Bali plan you asked for 🌴
> Canggu, Ubud and Uluwatu in the right order, with real drive times.
> Tap below and I'll send it 👇

**Button:** `Send me the plan`

## Message 2: delivery (sent after the tap)

> Here you go 👉 [Your first week in Bali](LANDING_PAGE_URL)
>
> Save it, you'll want it when you land 📌

**Button (link):** `Open the plan` → landing page

## Message 3: one question (send right after, about 3 seconds later)

> Quick one so I can point you the right way: have you booked where you're staying?

**Quick replies:** `Canggu` · `Ubud` · `Uluwatu` · `Somewhere else` · `Not yet`

Tag each answer (`bali_area:canggu`, `bali_area:not_yet`, and so on).

## Message 4: personal nudge (after their answer)

**Not yet / Somewhere else**
> That's the decision that makes or breaks a first trip, honestly. The Bali Secret matches you to the right area in about 30 seconds, then builds the week around your dates 👇

**Canggu / Ubud / Uluwatu**
> Nice, {area} is a great base. The app builds your days around it, with every stop's tip and cost, and lets you swap anything for cheaper, quieter or closer 👇

**Button (link):** `Get The Bali Secret` → https://apps.apple.com/us/app/the-bali-secret/id6761162361

---

## Rules

- Never more than one follow-up. If they don't answer message 3, stop.
- Don't write "free app" or name a price. The site rule is no price claims at all.
- On slides, the CTA reads: **Comment ITINERARY and I'll send you my 7 day plan**. Put it in caption line 1 and a pinned comment too.

## Post ideas to pair it with

1. "7 days in Bali without losing 2 of them in traffic" (drive-times carousel)
2. "The order to do Bali in, and why" (Canggu → Ubud → Uluwatu)
3. A re-cut of a top performer, with the last slide changed to the ITINERARY CTA

## What to track (after 2 weeks)

| Step | Where to look |
|---|---|
| Comments per post | Instagram insights |
| Message 1 tap rate | ManyChat or Inrō flow stats |
| Page visits | Vercel Analytics, `/bali-secret/first-week/` with utm_campaign=itinerary |
| App Store taps from the page | Vercel Analytics outbound clicks on that page |
| Installs | App Store Connect, around the post dates |
