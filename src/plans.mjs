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
    bases: [
      ['Days 1–2', 'Canggu', 'Cafes, surf, sunsets'],
      ['Days 3–5', 'Ubud', 'Temples, terraces, waterfalls'],
      ['Days 6–7', 'Uluwatu', 'Cliffs, coves, kecak'],
    ],
    moves: [
      ['Airport → Canggu', '1–1.5 hrs'],
      ['Canggu → Ubud', '1.5–2 hrs'],
      ['Ubud → Uluwatu', '2–2.5 hrs'],
      ['Uluwatu → Airport', '45 min–1.5 hrs'],
    ],
    days: [
      { area: 'Canggu', title: 'Settle in by the sea', stops: [
        ['Morning', 'Breakfast at Crate', '$5–12', 'Order the big breakfast and watch Canggu wake up around you.'],
        ['Afternoon', 'Watch the surfers at Echo Beach', '$3–8', 'Grab a sunbed and watch the locals. The waves here are for experienced surfers.'],
        ['Evening', 'Sunset at Old Man’s', '$10–25', 'Sit on the lawn facing the sea and you’ll meet half of Canggu by dark.'],
      ]},
      { area: 'Canggu', title: 'A surf lesson and Tanah Lot', stops: [
        ['Morning', 'First surf lesson at Batu Bolong'],
        ['Afternoon', 'Lunch at Shady Shack'],
        ['Evening', 'Sunset at Tanah Lot'],
      ]},
      { area: 'Ubud', title: 'Into the jungle', stops: [
        ['Morning', 'Sacred Monkey Forest'],
        ['Afternoon', 'Ubud Art Market'],
        ['Evening', 'Crispy duck at Bebek Bengil'],
      ]},
      { area: 'Ubud', title: 'Rice terraces and holy water', stops: [
        ['Morning', 'Tegallalang Rice Terrace'],
        ['Afternoon', 'Tirta Empul water temple'],
        ['Evening', 'Gianyar Night Market'],
      ]},
      { area: 'Ubud', title: 'Ridge, waterfall, slow evening', stops: [
        ['Morning', 'Campuhan Ridge Walk at sunrise'],
        ['Afternoon', 'Swim at Tegenungan Waterfall'],
        ['Evening', 'Dinner at Clear Cafe'],
      ]},
      { area: 'Uluwatu', title: 'Cliffs, coves and kecak', stops: [
        ['Morning', 'Padang Padang Beach'],
        ['Afternoon', 'Bingin Beach'],
        ['Evening', 'Kecak dance at Uluwatu Temple'],
      ]},
      { area: 'Uluwatu', title: 'Last swim, last sunset', stops: [
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
];
