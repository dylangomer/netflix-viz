// TV episode indicators that appear after a colon in Netflix titles
const TV_KEYWORDS = ["season", "series", "episode", "part", "volume", "chapter", "limited series"];

// Country/region suffixes Netflix adds to distinguish versions
const COUNTRY_SUFFIX_REGEX = /\s*\((U\.?S\.?|U\.?K\.?|Australia|Canada|Japan|Korea)\)$/i;

/**
 * Finds the index of the earliest colon whose trailing text starts with
 * a TV keyword. Returns -1 if no such colon exists.
 *
 * Scanning all colons handles multi-part show names like
 * "Narcos: Mexico: Season 1: Episode 4" where the TV keyword
 * appears after the second colon, not the first.
 */
function findTVColonIndex(text: string): number {
  let idx = -1;
  while ((idx = text.indexOf(":", idx + 1)) !== -1) {
    if (idx === 0) continue; // skip leading colon
    const after = text.slice(idx + 1).trim().toLowerCase();
    if (TV_KEYWORDS.some((kw) => after.startsWith(kw))) return idx;
  }
  return -1;
}

/**
 * Returns true if the raw Netflix title contains TV episode markers
 * anywhere in its colon-separated segments.
 */
export function hasEpisodeMarkers(title?: string): boolean {
  if (!title) return false;
  const cleaned = title.replace(COUNTRY_SUFFIX_REGEX, "").trim();
  return findTVColonIndex(cleaned) !== -1;
}

/**
 * Cleans a Netflix title for display or API search.
 * - Strips country suffixes like "(U.S.)", "(UK)", etc.
 * - Strips everything from the first TV-keyword colon onward.
 * - Scans all colons so "Narcos: Mexico: Season 1: Ep 4" → "Narcos: Mexico".
 * - Preserves movie titles with colons (e.g., "Spider-Man: No Way Home").
 */
export function cleanTitle(title?: string): string {
  if (!title) return "";

  const cleaned = title.replace(COUNTRY_SUFFIX_REGEX, "").trim();
  const tvColon = findTVColonIndex(cleaned);

  return tvColon > 0 ? cleaned.slice(0, tvColon).trim() : cleaned;
}
