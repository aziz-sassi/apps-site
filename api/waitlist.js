// POST /api/waitlist — saves one email per app to the private "lensnote-waitlist" Vercel Blob store.
// Body (JSON or form): { email, app = "lensnote", consent: true, lang?, company? (honeypot) }
// One blob per (app, email): waitlist/<app>/<sha256(email)>.json, so a repeat signup just updates it.
// Export the list with: node tools/waitlist-export.mjs > waitlist.csv
import { put } from '@vercel/blob';
import { createHash } from 'node:crypto';

const APPS = new Set(['lensnote']);
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return Object.fromEntries(new URLSearchParams(req.body)); }
  }
  return {};
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  const b = readBody(req);
  // Bots fill every field; people never see this one.
  if (b.company) return res.status(200).json({ ok: true });
  const email = String(b.email || '').trim().toLowerCase();
  const app = APPS.has(String(b.app || 'lensnote')) ? String(b.app || 'lensnote') : null;
  if (!app) return res.status(400).json({ ok: false, error: 'app' });
  if (!EMAIL.test(email) || email.length > 254) return res.status(400).json({ ok: false, error: 'email' });
  if (!(b.consent === true || b.consent === 'true' || b.consent === 'on')) return res.status(400).json({ ok: false, error: 'consent' });
  const record = {
    email, app,
    consent: 'launch-and-news',
    lang: String(b.lang || '').slice(0, 12),
    source: String(b.source || 'site').slice(0, 40),
    createdAt: new Date().toISOString(),
    country: req.headers['x-vercel-ip-country'] || '',
  };
  const key = createHash('sha256').update(email).digest('hex');
  try {
    await put(`waitlist/${app}/${key}.json`, JSON.stringify(record), {
      access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
    });
  } catch (e) {
    console.error('waitlist put failed', e?.message);
    return res.status(500).json({ ok: false, error: 'store' });
  }
  return res.status(200).json({ ok: true });
}
