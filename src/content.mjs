// ---------------------------------------------------------------------------
// Single source of truth for the whole site.
// Add an app or an article here and `node build.mjs` produces the pages,
// the internal links, the JSON-LD and the sitemap entries automatically.
// ---------------------------------------------------------------------------

export const site = {
  name: 'Aziz Sassi',
  tagline: 'Four iPhone apps, built one at a time.',
  // Canonical origin. Used for canonical URLs, the sitemap and Open Graph tags,
  // all of which need absolute URLs. Must match the live domain exactly.
  // Canonical origin. SITE_ORIGIN overrides it for staging so a test deploy
  // never advertises a domain that isn't live yet.
  origin: process.env.SITE_ORIGIN || 'https://www.appsbysass.com',
  developerUrl: 'https://apps.apple.com/us/developer/aziz-sassi/id1876570186',

  // Every profile that links back here strengthens the entity Google builds
  // for "Aziz Sassi" and, through it, for each app name. Add the Instagram and
  // TikTok URLs as soon as those accounts point at this domain.
  profiles: [
    // 'https://www.instagram.com/<handle>/',
    // 'https://www.tiktok.com/@<handle>',
  ],
  author: 'Aziz Sassi',

  // Shown publicly on /contact/. Affiliate networks and ad platforms require a
  // working contact method — change this if you want a different address.
  contactEmail: 'sassiaziz50@gmail.com',

  // Ownership verification tags. Impact uses value= rather than content=,
  // which is unusual but is what their checker looks for.
  verification: {
    impact: 'aa56d4f9-33a9-4b4e-91ab-67c9df56af5f',
  },

  // Paste your IDs here and the tags appear on every page automatically.
  analytics: {
    // Vercel Web Analytics — cookieless, no consent banner needed, no account
    // to configure. Served from /_vercel/insights/ by the host itself.
    vercel: true,
    ga4: '',           // e.g. 'G-XXXXXXXXXX' from Google Analytics 4
    searchConsole: '', // the content value of Google Search Console's HTML-tag verification
  },
};

export const apps = [
  {
    slug: 'jupiter-walkies',
    altNames: ['Jupiter Walkies app', 'Jupiter dog walking app', 'Jupiter Walkies: Dog Walks'],
    screen: 'walk',
    shots: ['jupiter-1.jpg', 'jupiter-2.jpg', 'jupiter-3.jpg'],
    steps: [
      ['Tap start', 'One tap before you leave the door. No setup, no pairing, no account required to record your first walk.'],
      ['Walk your dog', 'Jupiter draws the route live and tracks distance, pace and calories while the phone stays in your pocket.'],
      ['Share the card', 'Every walk becomes a card with your route on it \u2014 built for Stories, not spreadsheets.'],
    ],
    name: 'Jupiter Walkies',
    fullName: 'Jupiter Walkies: Dog Walks',
    tagline: 'Strava, made for dog walks.',
    icon: 'jupiter.jpg',
    accent: '#FF6B35',
    accentInk: '#C2410C',   // text-safe variant (5.8:1 on white)
    accentSoft: '#FFF0EA',
    category: 'Health & Fitness',
    storeUrl: 'https://apps.apple.com/us/app/jupiter-walkies-dog-walks/id6774188640',
    released: '2026-06-11',
    minOs: '17.0',
    title: 'Jupiter Walkies — Dog Walk Tracker with GPS Map & Leaderboard',
    description:
      'Track every dog walk with a live GPS map \u2014 distance, pace and calories. Share-ready walk cards, walking friends nearby, friendly leaderboard.',
    hero:
      'Tap start and Jupiter maps your walk in real time — route, distance, time, pace and calories — then turns it into a card worth sharing.',
    features: [
      ['Live GPS route map', 'Watch the line draw itself as you walk. Distance, duration, pace and calories, all tracked automatically.'],
      ['Share-ready walk cards', 'Every walk becomes a clean card with your route and stats on it. Built for Stories, not spreadsheets.'],
      ['A friendly leaderboard', 'Compare weekly distance with other walkers. Competitive enough to get you out the door, gentle enough to stay fun.'],
      ['Walking friends nearby', 'Find people walking dogs around you. Dog walking is the most social exercise there is — the apps just never treated it that way.'],
    ],
    faq: [
      ['Does Jupiter Walkies track my walk with GPS?',
       'Yes. Tap start and Jupiter records your route on a live map, along with distance, duration, pace and estimated calories. You do not have to enter anything by hand.'],
      ['What do I need to run Jupiter Walkies?',
       'An iPhone running iOS 17 or later. The live map and pace tracking use the same location services as any GPS run tracker.'],
      ['Does it drain my battery on long walks?',
       'Jupiter uses the same location APIs as other fitness trackers and stops recording as soon as you end the walk. For walks over an hour, expect battery use comparable to any GPS run tracker.'],
      ['Can I use it for more than one dog?',
       'Yes. Walks can be logged for whichever dog you took out, so households with more than one dog can keep each dog’s activity separate.'],
      ['Does it work without cell service?',
       'GPS itself does not need cell service, so your route still records on trails and in rural areas. Syncing and the leaderboard update once you are back in range.'],
    ],
  },

  {
    slug: 'bo',
    altNames: ['Bo app', 'Bo calorie tracker', 'Bo calorie counter', 'Calorie Tracker & Macros Bo'],
    screen: 'macro',
    shots: ['bo-1.jpg', 'bo-2.jpg', 'bo-3.jpg'],
    steps: [
      ['Snap the plate', 'Photograph the meal before you eat it, at an angle rather than straight down so depth is visible.'],
      ['Answer one question', 'Dressing? Oil? Side of rice? The one thing a photo cannot show is where most of the error lives.'],
      ['Get an honest number', 'Calories and macros, with Bo saying so when it is not certain rather than inventing confidence.'],
    ],
    name: 'Bo',
    fullName: 'Calorie Tracker & Macros — Bo',
    tagline: 'The honest AI calorie counter.',
    icon: 'bo.jpg',
    accent: '#12B76A',
    accentInk: '#047857',   // text-safe variant (6.0:1 on white)
    accentSoft: '#E9F9F1',
    category: 'Health & Fitness',
    storeUrl: 'https://apps.apple.com/us/app/calorie-tracker-macros-bo/id6767255239',
    released: '2026-05-21',
    minOs: '17.0',
    title: 'Bo — AI Calorie Tracker That Asks the Question Others Skip',
    description:
      'Snap a meal and get a calorie count you can trust. Bo asks the one follow-up question \u2014 dressing? oil? \u2014 that other AI calorie apps skip.',
    hero:
      'Bo does not just count what it can see. It asks the missing piece — ranch or vinaigrette? side of rice? — so the salad you logged is not off by 400 calories.',
    features: [
      ['One follow-up question', 'Six seconds end to end. Bo asks the single thing a photo cannot show, which is usually where the calories are hiding.'],
      ['Photo and voice logging', 'Snap the plate or just say what you ate. Both land in the same log with macros attached.'],
      ['Macros, not just calories', 'Protein, carbs and fat tracked per meal and per day, because the number on its own rarely tells you enough.'],
      ['Honest about uncertainty', 'When Bo is not sure, it says so instead of inventing a confident number. That is the whole point.'],
    ],
    faq: [
      ['How accurate is Bo compared with other AI calorie apps?',
       'Independent testing in 2026 found popular AI food apps underestimated calories and fat by roughly a third on prepared meals, largely because a photo cannot show oil, dressing or hidden ingredients. Bo asks one targeted follow-up question about exactly those things, which is the single highest-leverage fix available. No photo-based estimate is exact — treat any of them as a good estimate, not a lab measurement.'],
      ['What do I need to run Bo?',
       'An iPhone running iOS 17 or later. Photo analysis happens when you snap the meal, so you need a connection at that moment.'],
      ['Can I log food by voice instead of a photo?',
       'Yes. Voice logging is built in, which is usually faster for meals that are awkward to photograph, like a handful of nuts or a drink.'],
      ['Does Bo track macros as well as calories?',
       'Yes. Every logged meal carries protein, carbohydrate and fat, and the day view totals them alongside calories.'],
      ['Why does Bo ask me a question after I take a photo?',
       'Because the largest source of error in photo calorie counting is invisible: cooking oil, dressing, butter, and sides hidden under other food. One question resolves most of that gap, which is why Bo asks it instead of guessing.'],
    ],
  },

  {
    slug: 'bali-secret',
    video: 'bali',
    altNames: ['The Bali Secret app', 'Bali Secret', 'Bali Secret app'],
    screen: 'trip',
    shots: ['bali-1.jpg', 'bali-2.jpg', 'bali-3.jpg'],
    steps: [
      ['Build the days', 'Lay out Ubud, Canggu, Uluwatu and the rest day by day, so the trip actually fits together.'],
      ['Set the budget', 'Track spend in rupiah and your home currency at once \u2014 the part first-timers find hardest.'],
      ['Find the gems', 'Waterfalls, warungs and beaches that do not show up in the first ten search results.'],
    ],
    name: 'The Bali Secret',
    fullName: 'The Bali Secret',
    tagline: 'Plan trips. Find hidden gems.',
    icon: 'bali.jpg',
    accent: '#00A6B8',
    accentInk: '#0E7490',   // text-safe variant (5.9:1 on white)
    accentSoft: '#E4F7F9',
    category: 'Travel',
    storeUrl: 'https://apps.apple.com/us/app/the-bali-secret/id6761162361',
    released: '2026-04-23',
    minOs: '14.0',
    title: 'The Bali Secret \u2014 Bali Trip Planner & Budget Tracker',
    description:
      'Build a day-by-day Bali itinerary, track your budget in rupiah and dollars, and find the spots that are not on every other list.',
    hero:
      'Build a day-by-day itinerary for Ubud, Canggu, Uluwatu and beyond — with a budget that keeps up, and the spots most guides leave out.',
    features: [
      ['Day-by-day itineraries', 'From the rice terraces of Ubud to the surf at Canggu and the temples of Uluwatu, laid out by day so the trip actually fits together.'],
      ['Budget that speaks rupiah', 'Track spending in IDR and your home currency at once, which is the single hardest part of a first Bali trip.'],
      ['Hidden gems, not just the list', 'The waterfalls, warungs and beaches that do not appear in the first ten search results.'],
      ['Works offline once planned', 'Your itinerary stays readable when the signal on the way to a waterfall does not.'],
    ],
    faq: [
      ['When is the best time to visit Bali?',
       'The dry season runs April to October, with May, June and September offering the best balance of weather, crowds and price. July and August have the best weather but peak prices. February is typically the cheapest month, with the trade-off of rainy-season afternoons.'],
      ['How much does a week in Bali cost?',
       'Excluding international flights, roughly $350–$550 per person for budget travel, $700–$1,400 mid-range, and $2,500+ for luxury. Daily spend runs about $25–$40 budget, $70–$130 mid-range, and $300+ luxury.'],
      ['Do I have to pay the Bali tourist levy?',
       'Yes. Since 2024 every foreign visitor pays a one-time levy of IDR 150,000 (about $9.30) per person. Pay it online through the official Love Bali portal before you fly, or at a counter on arrival — paying ahead saves a queue.'],
      ['What do I need to run The Bali Secret?',
       'An iPhone running iOS 14 or later. Your itinerary and budget stay on the device, so they are readable without a signal in Bali.'],
      ['Is the app useful if I have been to Bali before?',
       'That is largely who it is built for. The itinerary and budget tools help on any trip, and the hidden-gems side is aimed at people who have already done Tanah Lot and the Monkey Forest.'],
    ],
  },

  {
    slug: 'hold',
    video: 'hold',
    altNames: ['HOLD app', 'HOLD quit smoking', 'HOLD quit smoking app', 'HOLD quit vaping'],
    screen: 'breathe',
    shots: ['hold-1.jpg', 'hold-2.jpg', 'hold-3.jpg'],
    steps: [
      ['Set your quit date', 'Pick the day and HOLD starts counting what you are getting back \u2014 time, money, skin.'],
      ['Open it when it hits', 'A craving lasts 10\u201315 minutes. HOLD gives you guided breathing and real-time support for exactly that long.'],
      ['Watch it get easier', 'Cravings peak around day 3 and fade over 3\u20134 weeks. Seeing that curve is what keeps people going.'],
    ],
    name: 'HOLD',
    fullName: 'HOLD — Quit Smoking & Vaping',
    tagline: 'Beat nicotine cravings, fast.',
    icon: 'hold.jpg',
    accent: '#5B46F0',
    accentInk: '#4338CA',   // text-safe variant (7.6:1 on white)
    accentSoft: '#EEEBFF',
    category: 'Health & Fitness',
    storeUrl: 'https://apps.apple.com/us/app/hold-quit-smoking-vaping/id6759056448',
    released: '2026-02-25',
    minOs: '15.6',
    title: 'HOLD — AI Quit Coach for Smoking & Vaping Cravings',
    description:
      'An AI quit coach for when a craving hits, not just a counter tallying days. Guided breathing, real-time support and progress tracking.',
    hero:
      'Most quit apps count your days. HOLD is built for the ten minutes that decide whether you keep them — the craving itself.',
    features: [
      ['There when the craving hits', 'A craving peaks and passes in about 10–15 minutes. HOLD gives you something to do for exactly that long.'],
      ['Guided breathing', 'Short, structured breathing you can start one-handed, without reading instructions first.'],
      ['Real-time AI support', 'Talk it through at 2am when no one else is up. No appointment, no waiting room.'],
      ['Progress you can see', 'Time smoke-free, money saved, and skin health insights — because the visible changes are what keep people going.'],
    ],
    faq: [
      ['How long do nicotine cravings last?',
       'An individual craving usually passes in 10 to 15 minutes, whether or not you smoke or vape. Cravings are most frequent in the first few days, peak around day 3, and fade substantially over 3 to 4 weeks. Occasional cravings can still surface months later, which is normal and not a sign of failure.'],
      ['Does HOLD work for vaping as well as cigarettes?',
       'Yes. The dependence is on nicotine either way, and the craving pattern is the same, so the same tools apply to both.'],
      ['What do I need to run HOLD?',
       'An iPhone running iOS 15.6 or later. The breathing exercises and craving timer work without a connection.'],
      ['What are the skin health insights?',
       'Smoking and vaping affect circulation and skin appearance. HOLD tracks the timeline of those changes as you stay nicotine-free, because a visible result is more motivating than an abstract one.'],
      ['Is HOLD a replacement for medical treatment?',
       'No. HOLD is a support tool, not medical care. Nicotine replacement therapy and prescription medication both meaningfully improve quit rates, and combining behavioural support with them works better than either alone. Talk to a doctor or pharmacist about what fits your situation.'],
    ],
  },
];

export const appBySlug = Object.fromEntries(apps.map((a) => [a.slug, a]));
