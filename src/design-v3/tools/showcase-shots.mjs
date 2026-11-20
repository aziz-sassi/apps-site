/* The /shots/ images are 240px marketing composites: a caption band on top of
   a device mockup. Fine as thumbnails, wrong for the full-bleed showcase —
   the baked-in caption collides with the real headline, and some of those
   captions make rating/award claims the App Store API contradicts.

   This pulls the retina originals (1284x2778) straight from the App Store and
   crops each to its device screen, which drops the caption band entirely.
   Crop bounds are per-app because each app uses a different screenshot
   template. Re-run if the listings change. */
import { mkdir, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const run = promisify(execFile);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const OUT = join(ROOT, 'src/assets/showcase');
const TMP = join(ROOT, '.showcase-tmp');

// id, which screenshot index to use, and the device-screen bounds as fractions
const APPS = [
  { key:'jupiter', id:'6774188640', pick:1, x0:0.125, x1:0.885, y0:0.310, y1:0.985 },
  // yB stops above Bo's "FEATURED BY APPLE" footer, which sits inside the frame
  { key:'bo',      id:'6767255239', pick:2, x0:0.152, x1:0.848, y0:0.336, y1:0.937 },
  // Bali's 2.0 template uses a bigger device, set lower in the frame
  { key:'bali',    id:'6761162361', pick:1, x0:0.070, x1:0.958, y0:0.362, y1:0.990 },
  { key:'hold',    id:'6759056448', pick:2, x0:0.115, x1:0.885, y0:0.285, y1:0.985 },
];

await mkdir(OUT, { recursive: true });
await mkdir(TMP, { recursive: true });

for (const a of APPS) {
  const r = await fetch(`https://itunes.apple.com/lookup?id=${a.id}&country=us`).then((x) => x.json());
  const shots = r.results?.[0]?.screenshotUrls || [];
  if (!shots.length) { console.warn(`  ${a.key}: no screenshots returned`); continue; }
  const src = shots[Math.min(a.pick, shots.length - 1)]
    .replace(/\/\d+x\d+[a-z]*\.(png|jpg)$/, '/1284x2778bb.png');
  const raw = join(TMP, `${a.key}.png`);
  await writeFile(raw, Buffer.from(await fetch(src).then((x) => x.arrayBuffer())));

  const { stdout } = await run('magick', ['identify', '-format', '%w %h', raw]);
  const [W, H] = stdout.trim().split(' ').map(Number);
  const x = Math.round(W * a.x0), w = Math.round(W * (a.x1 - a.x0));
  const y = Math.round(H * a.y0), h = Math.round(H * (a.y1 - a.y0));
  // Crops keep their natural aspect. The frame uses object-fit:contain so no
  // UI edge is ever trimmed; the black fill reads as bezel.
  const out = join(OUT, `${a.key}.jpg`);
  await run('magick', [raw, '-crop', `${w}x${h}+${x}+${y}`, '+repage',
                       '-resize', '620x', '-quality', '88', out]);
  const { stdout: dim } = await run('magick', ['identify', '-format', '%wx%h', out]);
  console.log(`  ${a.key.padEnd(8)} ${dim}  from ${W}x${H}`);
}
await run('rm', ['-rf', TMP]);
console.log(`wrote ${APPS.length} showcase screens to src/assets/showcase/`);
