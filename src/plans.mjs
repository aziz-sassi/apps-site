// ---------------------------------------------------------------------------
// Plan pages: the landing pages behind comment-to-DM posts ("comment ITINERARY
// and I'll send you the plan"). Each one is a real plan from the app's own
// library, shown as a usable outline, with the full version one tap away.
//
// They are noindex and stay out of the sitemap: the indexable answer to "Bali
// itinerary 7 days" is the guide, and these exist for people arriving from a DM.
//
// `open` is how many days show every stop's tip and cost. The rest show the
// stops by name, which is enough to follow, and the app adds the detail.
// ---------------------------------------------------------------------------

export const plans = [
  {
    slug: 'first-week',
    app: 'bali-secret',
    keyword: 'ITINERARY',
    title: 'Your First Week in Bali: The Day-by-Day Plan',
    description:
      'A 7-day first-timer Bali plan, day by day: Canggu, Ubud and Uluwatu in the right order, with realistic drive times between each base.',
    intro:
      'For first-timers who want a bit of everything: surf-town cafes, Ubud’s temples and rice fields, then Uluwatu’s cliffs and sunsets. Three bases, two moves, no day lost to crossing the island.',
    guide: 'bali-itinerary-7-days',
    open: 1,
    tableTitle: 'Three bases, two moves',
    table: { head: ['Days', 'Base', 'For'], rows: [
      ['Days 1–2', 'Canggu', 'Cafes, surf, sunsets'],
      ['Days 3–5', 'Ubud', 'Temples, terraces, waterfalls'],
      ['Days 6–7', 'Uluwatu', 'Cliffs, coves, kecak'],
    ]},
    callout:
      'Plan around real drive times, not the map’s: <strong>Airport → Canggu</strong> 1–1.5 hrs · <strong>Canggu → Ubud</strong> 1.5–2 hrs · <strong>Ubud → Uluwatu</strong> 2–2.5 hrs · <strong>Uluwatu → Airport</strong> 45 min–1.5 hrs. Move between bases in the morning, before the traffic builds.',
    more: 'Tips, costs and timings for these stops are in the app',
    unlockTitle: 'This is the plan for everyone. The Bali Secret builds yours.',
    days: [
      { tag: 'Canggu', title: 'Settle in by the sea', stops: [
        ['Morning', 'Breakfast at Crate', '$5–12', 'Order the big breakfast and watch Canggu wake up around you.'],
        ['Afternoon', 'Watch the surfers at Echo Beach', '$3–8', 'Grab a sunbed and watch the locals. The waves here are for experienced surfers.'],
        ['Evening', 'Sunset at Old Man’s', '$10–25', 'Sit on the lawn facing the sea and you’ll meet half of Canggu by dark.'],
      ]},
      { tag: 'Canggu', title: 'A surf lesson and Tanah Lot', stops: [
        ['Morning', 'First surf lesson at Batu Bolong'],
        ['Afternoon', 'Lunch at Shady Shack'],
        ['Evening', 'Sunset at Tanah Lot'],
      ]},
      { tag: 'Ubud', title: 'Into the jungle', stops: [
        ['Morning', 'Sacred Monkey Forest'],
        ['Afternoon', 'Ubud Art Market'],
        ['Evening', 'Crispy duck at Bebek Bengil'],
      ]},
      { tag: 'Ubud', title: 'Rice terraces and holy water', stops: [
        ['Morning', 'Tegallalang Rice Terrace'],
        ['Afternoon', 'Tirta Empul water temple'],
        ['Evening', 'Gianyar Night Market'],
      ]},
      { tag: 'Ubud', title: 'Ridge, waterfall, slow evening', stops: [
        ['Morning', 'Campuhan Ridge Walk at sunrise'],
        ['Afternoon', 'Swim at Tegenungan Waterfall'],
        ['Evening', 'Dinner at Clear Cafe'],
      ]},
      { tag: 'Uluwatu', title: 'Cliffs, coves and kecak', stops: [
        ['Morning', 'Padang Padang Beach'],
        ['Afternoon', 'Bingin Beach'],
        ['Evening', 'Kecak dance at Uluwatu Temple'],
      ]},
      { tag: 'Uluwatu', title: 'Last swim, last sunset', stops: [
        ['Morning', 'Smoothie bowls at Nalu'],
        ['Afternoon', 'Melasti Beach'],
        ['Evening', 'Sunset at Single Fin'],
      ]},
    ],
    unlock: [
      'Every stop’s insider tip, cost and how long to give it',
      'Your own dates, from a weekend to 60 days',
      'Swap any stop for something cheaper, quieter or closer',
      'All of it on a map, readable offline',
    ],
  },

  {
    slug: 'walk-plan',
    app: 'jupiter-walkies',
    keyword: 'WALK',
    title: 'How Long Should Your Dog Walk? A Week of Walks',
    description:
      'How long your dog should walk by size, breed and age, plus a week of walks that mixes sniffing, training and one long adventure.',
    intro:
      'Most healthy adult dogs need 30 to 60 minutes a day, usually split into two walks. Find your dog’s number below, then use the week to spend those minutes well.',
    guide: 'how-long-should-i-walk-my-dog',
    open: 1,
    tableTitle: 'Your dog’s daily number',
    table: { head: ['Dog type', 'Daily walking', 'Notes'], rows: [
      ['Small breeds', '~30 min', 'Two 15 minute walks suits most'],
      ['Flat-faced (pug, bulldog)', '20–30 min', 'Keep it short and cool'],
      ['Medium breeds', '40–80 min', 'Usually two walks'],
      ['Large or athletic', '60–120 min+', 'Needs mental work too, not just distance'],
      ['Senior dogs', '~20 min × 2', 'Shorter and more often'],
    ]},
    callout:
      '<strong>Puppies:</strong> about 5 minutes of structured walking per month of age, twice a day. <strong>Building up?</strong> Add no more than about 10% a week, and watch the morning after: stiffness means it was too much.',
    days: [
      { tag: 'Sniff day', title: 'Two walks, one of them slow', stops: [
        ['Morning', 'Sniff walk', '20 min', 'Let them choose the pace and stop at every smell. Sniffing is the part that tires the brain.'],
        ['Evening', 'Brisk loop', '25 min', 'Your usual route at a steady pace, for the body.'],
      ]},
      { tag: 'New route', title: 'Somewhere they have never smelled', stops: [
        ['Morning', 'New route walk'],
        ['Evening', 'Short toilet walk'],
      ]},
      { tag: 'Training', title: 'Loose-leash practice', stops: [
        ['Morning', 'Training walk, stop when they pull'],
        ['Evening', '10 min scent game at home'],
      ]},
      { tag: 'Easy', title: 'Short walks, brain games', stops: [
        ['Morning', 'Short walk'],
        ['Evening', 'Find the treats, indoors'],
      ]},
      { tag: 'Social', title: 'Walk with a friend', stops: [
        ['Morning', 'Walk with another dog'],
        ['Evening', 'Brisk loop'],
      ]},
      { tag: 'Adventure', title: 'The long one', stops: [
        ['Morning', 'Park or trail walk'],
        ['Evening', 'Rest and a chew'],
      ]},
      { tag: 'Recovery', title: 'Slow and sniffy', stops: [
        ['Morning', 'Decompression walk on a long line'],
        ['Evening', 'Short toilet walk'],
      ]},
    ],
    more: 'Track this day against their number in the app',
    unlockTitle: 'This is the week for every dog. Jupiter Walkies tracks yours.',
    unlock: [
      'GPS tracking for every walk: distance, time and pace',
      'Weekly stats, so you see whether you hit their number',
      'Streaks that keep the habit going',
      'Parks and trails near you for the long walk',
    ],
  },
];
