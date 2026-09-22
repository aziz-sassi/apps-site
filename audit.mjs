import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
const DIST = new URL('./dist/', import.meta.url).pathname;
async function walk(d, o=[]) { for (const e of await readdir(d,{withFileTypes:true})) {
  const p=join(d,e.name); if(e.isDirectory()) await walk(p,o); else if(e.name==='index.html') o.push(p);} return o; }

const files=(await walk(DIST)).sort();
const pages=new Map(), inbound=new Map();
for (const f of files) {
  const html=await readFile(f,'utf8');
  const route='/'+relative(DIST,f).replace(/index\.html$/,'');
  // Count the ARTICLE BODY only. Counting the whole page includes nav, hero,
  // FAQ, footer and CTAs, which inflates the number by roughly 400 words and
  // hides thin content.
  const prose=(html.match(/<article class="prose">([\s\S]*?)<\/article>/)||[])[1]
    || html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'');
  const words=prose.replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/g,' ')
                   .split(/\s+/).filter(w=>w.length>1).length;
  const links=[...html.matchAll(/href="(\/[^"#?]*)"/g)].map(m=>m[1]).filter(l=>l.endsWith('/'));
  const stores=(html.match(/data-store=/g)||[]).length;
  const hasOg=/property="og:image"/.test(html);
  pages.set(route,{words,out:new Set(links.filter(l=>l!==route)),stores,hasOg});
  for(const l of links) if(l!==route) inbound.set(l,(inbound.get(l)||0)+1);
}

const art=[...pages].filter(([r])=>r.split('/').filter(Boolean).length===2);
const app=[...pages].filter(([r])=>r.split('/').filter(Boolean).length===1);

console.log('=== CONTENT DEPTH ===');
const w=art.map(([,v])=>v.words).sort((a,b)=>a-b);
console.log(`  articles: ${art.length} | words min ${w[0]} / median ${w[(w.length/2)|0]} / max ${w[w.length-1]}`);
console.log(`  thin (<700 body words): ${art.filter(([,v])=>v.words<700).length}`);
console.log(`  app pages: ${app.length} | median words ${app.map(([,v])=>v.words).sort((a,b)=>a-b)[(app.length/2)|0]}`);

console.log('\n=== INTERNAL LINKING ===');
const orphans=[...pages.keys()].filter(r=>r!=='/'&&!(inbound.get(r)>0));
console.log(`  orphan pages (0 inbound links): ${orphans.length}${orphans.length?' -> '+orphans.join(', '):''}`);
const low=[...pages.keys()].filter(r=>r!=='/'&&(inbound.get(r)||0)<3);
console.log(`  pages with <3 inbound links: ${low.length}`);
console.log(`  inbound range: ${Math.min(...[...inbound.values()])}–${Math.max(...[...inbound.values()])}`);
const inProse=art.filter(([,v])=>v.out.size>6).length;
console.log(`  articles linking out to >6 pages: ${inProse}/${art.length}`);

console.log('\n=== CONVERSION PATH ===');
console.log(`  App Store CTAs per app page: ${app.map(([,v])=>v.stores).join(', ')}`);
console.log(`  App Store CTAs per article: ${[...new Set(art.map(([,v])=>v.stores))].join(', ')}`);
const noCta=art.filter(([,v])=>v.stores===0).length;
console.log(`  articles with NO store CTA: ${noCta}`);

console.log('\n=== SOCIAL / SHARING ===');
console.log(`  pages with og:image: ${[...pages.values()].filter(v=>v.hasOg).length}/${pages.size}  ${[...pages.values()].some(v=>v.hasOg)?'':'<-- MISSING everywhere'}`);
