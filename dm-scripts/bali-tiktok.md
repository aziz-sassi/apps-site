# The Bali Secret on TikTok: DM keyword flows

ManyChat workspace: "The Bali Secret" (TikTok, fb5878303), Free plan.

## What TikTok allows (1 Nov 2026)

- **No comment triggers.** ManyChat shows "Comments on TikToks: Coming soon", so on TikTok the CTA is **"DM us ITINERARY"**, not "comment ITINERARY".
- **Links in TikTok DMs can't be tapped.** Each reply gives a short address to copy, plus "or tap the link in our bio". Keep `appsbysass.com/bali-secret/first-week` in the bio.
- **Free allows 3 live automations here**, not the 4 the Instagram workspaces get. It also covers 25 contacts.

## Flows

All of them use "message contains", which isn't case-sensitive. Each sends the guide message, then types for 3 seconds, then sends the app nudge and `apps.apple.com/app/id6761162361`.

| Automation | Keywords | Page | Status |
|---|---|---|---|
| ITINERARY DM | ITINERARY, PLAN, GUIDE, ITINERY | appsbysass.com/bali-secret/first-week | **Live** |
| AREA DM | AREA, STAY, AREAS, HOTEL | appsbysass.com/bali-secret/where-to-stay-in-bali | **Live** |
| ARRIVAL DM | ARRIVAL, VISA, ARRIVE, LANDING | appsbysass.com/bali-secret/bali-visa-on-arrival | **Live** |
| BUDGET DM | BUDGET, COST, PRICE, MONEY | appsbysass.com/bali-secret/bali-trip-cost | Built and published, trigger off. Needs a paid plan, or swap it with one of the three |

"Message contains" matches any DM with that word in it, so someone asking "what does a villa cost?" gets the BUDGET reply once it's on. Keep keywords to words that clearly mean one topic.

## Caption and slide CTAs

- DM us ITINERARY for our 7 day Bali plan
- DM us AREA and we'll tell you where to stay
- DM us ARRIVAL for what to sort before you land
