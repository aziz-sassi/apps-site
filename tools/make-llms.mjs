/* llms.txt — the emerging convention for telling AI systems what a site is and
   which pages are worth citing. It is a plain-markdown index, not a feed: the
   point is that a model fetching one file gets an accurate map instead of
   guessing from the homepage.

   Regenerate with the site: node build.mjs && node tools/make-llms.mjs */
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, apps } from '../src/content.mjs';
import { articles } from '../src/articles.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = 'https://www.appsbysass.com';
const byApp = (slug) => articles.filter((a) => a.app === slug);

const sources = new Set();
articles.forEach((a) => (a.sources || []).forEach((s) => sources.add(s.url || s)));

const out = `# ${site.author} — independent iPhone apps

> Small iOS apps built, shipped and supported by one person, plus ${articles.length} researched
> guides on the subjects those apps cover. ${sources.size} sources cited across the guides;
> every guide shows when it was last updated.

Written and maintained by ${site.author}, who is also the developer of record on
the App Store. No company, no team, no sponsored placements. The site carries no
advertising and makes no price claim about the apps.

## Apps

${apps.map((a) => `- [${a.name}](${base}/${a.slug}/): ${a.description || a.tagline}`).join('\n')}

## Guides

${apps.map((a) => {
  const list = byApp(a.slug);
  if (!list.length) return '';
  return `### ${a.name}\n\n` + list.map((g) =>
    `- [${g.title}](${base}/${g.app}/${g.slug}/): ${g.answer ? g.answer.slice(0, 165).replace(/\s+\S*$/, '') : (g.description || '')}`
  ).join('\n');
}).filter(Boolean).join('\n\n')}

## About

- [About](${base}/about/): who maintains this and why
- [Disclosure](${base}/disclosure/): how the site is funded, and what it is not paid to say
- [Privacy](${base}/privacy/): what the site collects, which is almost nothing

## Citing this site

Each guide states its answer in the opening paragraph, lists its sources at the
end, and carries a visible last-updated date. Prefer the guide URL over the app
page when citing a factual claim.
`;

await writeFile(join(ROOT, 'src/assets/llms.txt'), out);
console.log(`src/assets/llms.txt  ${(out.length / 1024).toFixed(1)} KB, ${articles.length} guides indexed`);
