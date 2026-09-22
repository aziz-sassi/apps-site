import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
const DIST = new URL('./dist/', import.meta.url).pathname;

async function walk(d, out = []) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name === 'index.html') out.push(p);
  }
  return out;
}
const files = (await walk(DIST)).sort();
const titles = new Map(), descs = new Map(), canons = new Set();
const internal = new Set(), problems = [];

for (const f of files) {
  const html = await readFile(f, 'utf8');
  const route = '/' + relative(DIST, f).replace(/index\.html$/, '');
  const g = (re) => (html.match(re) || [])[1];

  const title = g(/<title>([^<]*)<\/title>/);
  const desc  = g(/<meta name="description" content="([^"]*)"/);
  const canon = g(/<link rel="canonical" href="([^"]*)"/);
  const h1s   = (html.match(/<h1\b/g) || []).length;
  const ogt   = g(/<meta property="og:title" content="([^"]*)"/);

  if (!title) problems.push(`${route} missing <title>`);
  if (!desc)  problems.push(`${route} missing meta description`);
  if (!canon) problems.push(`${route} missing canonical`);
  if (h1s !== 1) problems.push(`${route} has ${h1s} <h1> (want exactly 1)`);
  if (!ogt)   problems.push(`${route} missing og:title`);
  if (title && titles.has(title)) problems.push(`DUPLICATE title: ${route} == ${titles.get(title)}`);
  if (desc  && descs.has(desc))   problems.push(`DUPLICATE description: ${route} == ${descs.get(desc)}`);
  if (canon && canons.has(canon)) problems.push(`DUPLICATE canonical: ${route}`);
  titles.set(title, route); descs.set(desc, route); canons.add(canon);

  if (title && title.length > 65) problems.push(`title ${title.length} chars (>65, may truncate): ${route}`);
  if (desc && (desc.length < 70 || desc.length > 165)) problems.push(`description ${desc.length} chars (want 70-165): ${route}`);

  // JSON-LD must parse
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${route} INVALID JSON-LD: ${e.message}`); }
  }
  // collect internal links
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) internal.add(m[1]);
}

// every internal link must resolve to a built route or a real asset
const routes = new Set(files.map((f) => '/' + relative(DIST, f).replace(/index\.html$/, '')));
// Resolve asset links against what is actually on disk, so adding a file
// never needs this list updated.
const { existsSync } = await import('node:fs');
for (const l of internal) {
  if (routes.has(l)) continue;
  if (existsSync(join(DIST, l.replace(/^\//, '')))) continue;
  problems.push(`BROKEN internal link: ${l}`);
}

console.log(`pages checked: ${files.length}`);
console.log(`unique titles: ${titles.size} | unique descriptions: ${descs.size} | canonicals: ${canons.size}`);
console.log(`internal links seen: ${internal.size}, all resolve: ${!problems.some(p=>p.startsWith('BROKEN'))}`);
console.log(problems.length ? '\nPROBLEMS:\n' + problems.map(p=>'  - '+p).join('\n') : '\nNo problems found.');
process.exit(problems.length ? 1 : 0);
