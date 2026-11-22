// Prints the waitlist as CSV (email,app,lang,country,source,createdAt). Needs BLOB_READ_WRITE_TOKEN
// (run `npx vercel env pull .env.local` first, then: node --env-file=.env.local tools/waitlist-export.mjs > waitlist.csv).
import { list, get } from '@vercel/blob';
const rows = ['email,app,lang,country,source,createdAt'];
let cursor;
do {
  const page = await list({ prefix: 'waitlist/', cursor, limit: 1000 });
  for (const b of page.blobs) {
    const r = await get(b.url, { access: 'private' });
    const text = await new Response(r.stream).text();
    const x = JSON.parse(text);
    rows.push([x.email, x.app, x.lang, x.country, x.source, x.createdAt].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);
console.log(rows.join('\n'));
