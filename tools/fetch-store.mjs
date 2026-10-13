// Pulls live facts from the iTunes Lookup API and caches them to
// src/store-data.json, which build.mjs reads.
//
// Only facts that are true and stable are cached: the current version, the
// date Apple last published an update, and the file size. Ratings are
// deliberately NOT used — every app has 0 or 1 of them, and a "5.0 stars"
// badge drawn from a single rating implies a popularity the apps have not
// earned. Price is not used either: the site makes no price claim anywhere.
//
// Run: node tools/fetch-store.mjs
// The build never calls this itself, so a network blip can't break a deploy.

import { writeFile } from 'node:fs/promises';
import { apps } from '../src/content.mjs';

const ids = apps.map((a) => (a.storeUrl.match(/id(\d+)/) || [])[1]).filter(Boolean);
const url = `https://itunes.apple.com/lookup?id=${ids.join(',')}&country=us`;

const res = await fetch(url);
if (!res.ok) { console.error(`lookup failed: ${res.status}`); process.exit(1); }
const { results = [] } = await res.json();

const out = {};
for (const app of apps) {
  const id = (app.storeUrl.match(/id(\d+)/) || [])[1];
  const r = results.find((x) => String(x.trackId) === id);
  if (!r) { console.warn(`! no store result for ${app.slug}`); continue; }
  out[app.slug] = {
    version: r.version,
    updated: (r.currentVersionReleaseDate || '').slice(0, 10),
    released: (r.releaseDate || '').slice(0, 10),
    sizeMb: Math.round(Number(r.fileSizeBytes || 0) / 1048576),
    minOs: r.minimumOsVersion,
  };
  console.log(`${app.slug.padEnd(16)} v${r.version}  updated ${out[app.slug].updated}  ${out[app.slug].sizeMb}MB`);
}

out._fetched = new Date().toISOString().slice(0, 10);
await writeFile(new URL('../src/store-data.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('\nwrote src/store-data.json');
