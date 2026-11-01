// ---------------------------------------------------------------------------
// Photos and video for the plan pages, keyed by plan slug. Kept apart from
// plans.mjs so the words of a plan and the pictures on it can change without
// touching each other. A plan with no entry here still renders, with app-
// coloured tiles where the photos would be.
//
// Every photo is from Unsplash (Unsplash License) and every clip from Coverr
// (Coverr License); src/assets/photos/CREDITS.json records where each came from.
// `days[i]` is the photo for day i + 1, with its alt text. Alt text describes
// the picture, not the place a stop names, because a stock photo is never
// "Crate Cafe" itself.
// ---------------------------------------------------------------------------

export const planMedia = {
  'first-week': {
    hero: { src: 'first-week-hero', alt: 'Green cliffs dropping into turquoise sea on Bali’s south coast' },
    video: 'bali-beach',
    days: [
      { src: 'first-week-1', alt: 'A surfer on a golden evening wave' },
      { src: 'first-week-2', alt: 'A temple on a rock island at the edge of the sea' },
      { src: 'first-week-3', alt: 'A long-tailed macaque sitting on a wooden rail' },
      { src: 'first-week-4', alt: 'People bathing under stone spouts in a temple pool' },
      { src: 'first-week-5', alt: 'A tall jungle waterfall with a person on the rocks below' },
      { src: 'first-week-6', alt: 'Pink flowers on a cliff top above the ocean' },
      { src: 'first-week-7', alt: 'A beach club at sunset, sunbeds under woven lamps' },
    ],
    credit: 'Photos: Unsplash. Video: Coverr.',
  },
  'walk-plan': {
    hero: { src: 'walk-plan-hero', alt: 'A person and their dog walking a country path at golden hour' },
    days: [
      { src: 'walk-plan-1', alt: 'A beagle with its nose down in the grass' },
      { src: 'walk-plan-2', alt: 'A small dog on a wooden boardwalk through woodland' },
      { src: 'walk-plan-3', alt: 'A man walking a small dog on a loose lead down a street' },
      { src: 'walk-plan-4', alt: 'A happy corgi puppy on a grey chair' },
      { src: 'walk-plan-5', alt: 'Two dogs playing in long grass' },
      { src: 'walk-plan-6', alt: 'A hiker and a black dog looking out at mountains' },
      { src: 'walk-plan-7', alt: 'A quiet path through tall green woodland' },
    ],
    credit: 'Photos: Unsplash.',
  },
};
