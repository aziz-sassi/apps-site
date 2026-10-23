/* Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver).
   Ownership is proven by /<key>.txt being served from the same host, so this
   needs no account and no login. Run after a deploy is live, never before —
   the key file has to be reachable or the whole batch is rejected. */
import { site } from '../src/content.mjs';

const KEY = site.analytics?.indexNowKey;
if (!KEY) { console.error('no indexNowKey in content.mjs'); process.exit(1); }
const HOST = 'www.appsbysass.com';

const keyUrl = `https://${HOST}/${KEY}.txt`;
const keyRes = await fetch(keyUrl);
const keyBody = (await keyRes.text()).trim();
if (!keyRes.ok || keyBody !== KEY) {
  console.error(`key file not live yet: ${keyUrl} -> ${keyRes.status} "${keyBody.slice(0,20)}"`);
  console.error('deploy first, then re-run.');
  process.exit(1);
}
console.log(`key verified at ${keyUrl}`);

const sm = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`submitting ${urlList.length} urls`);

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: keyUrl, urlList }),
});
console.log(`IndexNow responded ${res.status} ${res.statusText}`);
console.log(res.status === 200 || res.status === 202
  ? 'accepted — crawling is queued, indexing still takes days'
  : 'not accepted: ' + (await res.text()).slice(0, 200));
