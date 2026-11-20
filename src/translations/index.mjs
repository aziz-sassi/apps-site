/* Translated guides, one module per locale.
   A locale only needs the guides that have actually been translated — the
   build falls back to English for anything missing, rather than emitting a
   German URL with an English body, which would be worse than no page. */
import de from './de.mjs';
import fr from './fr.mjs';
import ja from './ja.mjs';
import id from './id.mjs';

export const translations = { de, fr, ja, id };

/** The translated record for a guide, or null if this locale does not have it. */
export function tArticle(locale, slug) {
  const set = translations[locale];
  return (set && set[slug]) || null;
}
