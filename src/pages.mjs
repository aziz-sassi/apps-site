// ---------------------------------------------------------------------------
// Standalone pages. Affiliate networks and ad platforms screen for these before
// a human ever sees the application — a site without About, Contact, Privacy
// and a disclosure usually fails an automated check regardless of its traffic.
// Keep them accurate: a privacy policy that describes tracking the site does
// not do is worse than none at all.
// ---------------------------------------------------------------------------

export const pages = [
  {
    slug: 'about',
    title: 'About',
    description:
      'Who builds these apps and why the guides exist. An independent iOS developer making small, focused apps and writing honestly about the subjects behind them.',
    blocks: [
      ['p', 'I am Aziz Sassi, an independent iOS developer. I build small, focused iPhone apps on my own — no team, no investors, no growth department deciding what gets shipped.'],
      ['h2', 'What I build'],
      ['p', 'Every app here started as something I wanted to exist and could not find. A dog-walk tracker that treats walking as social rather than a chore. A calorie counter that admits what a photo cannot show. A Bali planner built around how the island actually works. A quit-smoking coach built for the ten minutes a craving lasts rather than the day counter.'],
      ['p', 'All of them are free on the App Store. More are in progress.'],
      ['h2', 'Why there are guides here'],
      ['p', 'Each app sits in a subject where most of the writing online is thin, padded, or quietly selling something. The guides are my attempt at the opposite: the direct answer in the first paragraph, real sources cited, and honesty about the limits.'],
      ['p', 'That last part matters most. The guide on AI calorie counting says plainly that photo-based apps underestimate meals by around a third — including, inevitably, mine. Writing that down is the point. An app that tells you when it is uncertain is more useful than one that sounds confident and is wrong.'],
      ['h2', 'How the guides are written'],
      ['ul', [
        'Every factual claim is checked against at least two independent sources, which are linked at the bottom of each guide.',
        'Health topics — nicotine, nutrition — carry an explicit note that they are general information, not medical advice. They are not a substitute for a doctor.',
        'Nothing is padded to hit a word count. If a question has a short answer, it gets a short guide.',
        'Facts that age — prices, fees, entry rules — carry the date they were last checked.',
      ]],
      ['h2', 'Corrections'],
      ['p', 'If something here is wrong, I would genuinely like to know. The <a href="/contact/">contact page</a> has the address.'],
    ],
  },

  {
    slug: 'contact',
    title: 'Contact',
    description:
      'How to reach Aziz Sassi about the apps, report a problem, correct something in a guide, or ask about working together.',
    blocks: [
      ['p', 'The fastest way to reach me is email. I read everything, and I answer most things within a few days.'],
      ['contact', null],
      ['h2', 'App support'],
      ['p', 'If something is broken in one of the apps, email is the right route and the quickest. Please include which app, your iOS version, and what you were doing when it went wrong — it saves a round trip and usually lets me reproduce it the same day.'],
      ['h2', 'Corrections'],
      ['p', 'If a guide has something factually wrong, tell me. Include the page and what is incorrect, and I will fix it and update the page date. I would rather be corrected than be wrong in public.'],
      ['h2', 'Press and partnerships'],
      ['p', 'Same address. If you are writing about one of the apps and need screenshots, icons or detail, ask and I will send whatever is useful.'],
    ],
  },

  {
    slug: 'privacy',
    title: 'Privacy',
    description:
      'What this website collects, which is almost nothing. No advertising, no cross-site tracking, no data sold or shared. Plain English, no boilerplate.',
    blocks: [
      ['p', 'This page covers <strong>this website</strong>. The apps have their own privacy policies on their App Store listings, which is where Apple requires them.'],
      ['h2', 'The short version'],
      ['p', 'This site is a set of static pages. There are no accounts, no logins, no comment forms, and nothing for you to fill in. It does not sell or share personal information, and it carries no advertising.'],
      ['h2', 'What is collected'],
      ['ul', [
        '<strong>Server logs.</strong> The site is hosted on Vercel, which records standard request data — IP address, browser, page requested — as any web server does. This is operational and is handled under Vercel’s own privacy policy.',
        '<strong>Analytics.</strong> Vercel Web Analytics records page views and which App&nbsp;Store links are tapped, so I can tell which guides are actually useful. It is <strong>cookieless</strong> — it stores nothing on your device, does not follow you between sites, and does not build a profile of you. That is also why this site shows no cookie banner: there is nothing to consent to.',
      ]],
      ['p', 'If Google Analytics or anything cookie-based is ever added, this page will say so <em>before</em> it is switched on, not after.'],
      ['h2', 'What is not collected'],
      ['ul', [
        'No account or profile data — there are no accounts.',
        'No email addresses, unless you choose to email me, in which case I have your email because you sent it.',
        'No advertising or cross-site tracking networks.',
        'No cookies. The site sets none at all.',
        'Nothing is sold, rented, or shared with data brokers.',
      ]],
      ['h2', 'Links to other sites'],
      ['p', 'Guides link to outside sources, and app pages link to the Apple App Store. Once you follow a link you are on someone else’s site under their policy, not this one.'],
      ['h2', 'Your rights'],
      ['p', 'Under GDPR, UK GDPR and similar laws you can ask what data relates to you and ask for it to be deleted. Given how little this site holds, that is usually a short conversation — email the address on the <a href="/contact/">contact page</a>.'],
      ['h2', 'Changes'],
      ['p', 'If this site starts collecting anything it does not collect today — affiliate tracking, for instance — this page gets updated before that happens, not after.'],
    ],
  },

  {
    slug: 'disclosure',
    title: 'Disclosure',
    description:
      'How this site makes money, stated plainly: free apps, and any affiliate links will be labelled. Nothing is recommended because it pays.',
    blocks: [
      ['p', 'Plain statement of how this site is funded and what that does, and does not, influence.'],
      ['h2', 'The apps'],
      ['p', 'All four apps are free to download. Where an app offers a paid upgrade, that is how the work is funded. The guides exist partly because they are useful and partly because people who find them may try an app — that is not hidden, it is the business model.'],
      ['h2', 'Affiliate links'],
      ['p', '<strong>This site currently contains no affiliate links.</strong>'],
      ['p', 'That may change for the travel guides, where recommending an eSIM, travel insurance or a tour is genuinely useful. If it does, three things will be true:'],
      ['ol', [
        'Any page containing affiliate links will say so <strong>at the top of that page</strong>, not in a footer nobody reads.',
        'Affiliate links will be marked <code>rel="sponsored"</code> so search engines can identify them.',
        'Nothing will be recommended because it pays. If a cheaper or better option exists that pays nothing, it gets the recommendation and the affiliate one does not get mentioned.',
      ]],
      ['h2', 'What is never for sale'],
      ['ul', [
        'No sponsored guides, paid placements, or paid links.',
        'No recommendation is altered because of a commercial relationship.',
        'Health guidance — the nicotine and nutrition guides — will carry no affiliate links at all. Monetising advice someone reads during a craving is not a line worth crossing.',
      ]],
      ['h2', 'Why say this at all'],
      ['p', 'Because the guides are only worth reading if you can tell whether they are advice or advertising. Saying which, in advance and in public, is the cheapest way to make that clear.'],
    ],
  },
];
