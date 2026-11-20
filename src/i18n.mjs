// ---------------------------------------------------------------------------
// Locales. Chosen from evidence, not guesswork:
//   ja  Japan already sends 180 impressions at position 5.6 — the strongest
//       non-English signal the site has, and the apps ship in Japanese.
//   de  Germany, 42 impressions at position 5.7. Apps ship in German.
//   fr  Apps ship in French; France and Canada are large Bali-travel markets.
//   id  Indonesia produced 2 of the site's 3 total clicks, and half the guides
//       are about Indonesia. The lowest-competition fit on the whole site.
// English stays at the root so no existing URL moves and nothing is redirected.
// ---------------------------------------------------------------------------
export const LOCALES = [
  { code: 'en', hreflang: 'en', label: 'English',          dir: 'ltr', isDefault: true },
  { code: 'de', hreflang: 'de', label: 'Deutsch',          dir: 'ltr' },
  { code: 'fr', hreflang: 'fr', label: 'Français',         dir: 'ltr' },
  { code: 'ja', hreflang: 'ja', label: '日本語',            dir: 'ltr' },
  { code: 'id', hreflang: 'id', label: 'Bahasa Indonesia', dir: 'ltr' },
];

export const DEFAULT_LOCALE = 'en';
export const localeByCode = Object.fromEntries(LOCALES.map((l) => [l.code, l]));

/** Prefix a root-relative path with a locale. English is unprefixed. */
export function localePath(path, code) {
  const p = path.startsWith('/') ? path : '/' + path;
  if (code === DEFAULT_LOCALE) return p;
  return p === '/' ? `/${code}/` : `/${code}${p}`;
}

/** Language variants of one page, for hreflang.
    `have` is the set of locale codes that genuinely have this page. Listing a
    locale that 404s is an error Google reports, and it is worse than omitting
    the tag, so a locale only appears once its translation exists. */
export function alternates(path, abs, have = new Set()) {
  // default is "English only", so a page that has not been wired up emits no
  // hreflang at all rather than advertising URLs that do not exist
  const codes = LOCALES.filter((l) => l.code === DEFAULT_LOCALE || have.has(l.code));
  if (codes.length < 2) return [];            // nothing to cross-reference
  const list = codes.map((l) => ({ hreflang: l.hreflang, href: abs(localePath(path, l.code)) }));
  list.push({ hreflang: 'x-default', href: abs(localePath(path, DEFAULT_LOCALE)) });
  return list;
}

/** UI strings. Only what the shell needs; article bodies are translated whole. */
export const UI = {
  en: { guide:'guide', guides:'Guides', updated:'Updated', minRead:'min read', sources:'sources',
        openApp:'Open', readGuides:'Read the guides', seeApps:'See the apps',
        language:'Language', byAuthor:'By', onTheAppStore:'On the App Store',
        commonQuestions:'Common questions',
        translatedNote:'' },
  de: { guide:'Ratgeber', guides:'Ratgeber', updated:'Aktualisiert', minRead:'Min. Lesezeit', sources:'Quellen',
        openApp:'Öffnen', readGuides:'Ratgeber lesen', seeApps:'Apps ansehen',
        language:'Sprache', byAuthor:'Von', onTheAppStore:'Im App Store',
        commonQuestions:'Häufige Fragen',
        translatedNote:'Aus dem Englischen übersetzt. Die Quellen sind englischsprachig.' },
  fr: { guide:'guide', guides:'Guides', updated:'Mis à jour', minRead:'min de lecture', sources:'sources',
        openApp:'Ouvrir', readGuides:'Lire les guides', seeApps:'Voir les apps',
        language:'Langue', byAuthor:'Par', onTheAppStore:'Sur l’App Store',
        commonQuestions:'Questions fréquentes',
        translatedNote:'Traduit de l’anglais. Les sources citées sont en anglais.' },
  ja: { guide:'ガイド', guides:'ガイド', updated:'更新日', minRead:'分で読めます', sources:'出典',
        openApp:'開く', readGuides:'ガイドを読む', seeApps:'アプリを見る',
        language:'言語', byAuthor:'著者', onTheAppStore:'App Store で',
        commonQuestions:'よくある質問',
        translatedNote:'英語からの翻訳です。出典は英語のままです。' },
  id: { guide:'panduan', guides:'Panduan', updated:'Diperbarui', minRead:'menit baca', sources:'sumber',
        openApp:'Buka', readGuides:'Baca panduan', seeApps:'Lihat aplikasi',
        language:'Bahasa', byAuthor:'Oleh', onTheAppStore:'Di App Store',
        commonQuestions:'Pertanyaan umum',
        translatedNote:'Diterjemahkan dari bahasa Inggris. Sumber yang dikutip berbahasa Inggris.' },
};

export const t = (code, key) => (UI[code] && UI[code][key]) ?? UI[DEFAULT_LOCALE][key] ?? '';
