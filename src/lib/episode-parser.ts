// TV episode indicators that appear after a colon in Netflix titles
const TV_KEYWORDS = ["season", "series", "episode", "part", "volume"];

// Country/region suffixes Netflix adds to distinguish versions
const COUNTRY_SUFFIX_REGEX = /\s*\((U\.?S\.?|U\.?K\.?|Australia|Canada|Japan|Korea)\)$/i;

/**
 * Cleans a Netflix title for display or API search.
 * - Strips country suffixes like "(U.S.)", "(UK)", etc.
 * - Only strips colon portion if it looks like TV episode info.
 * - Preserves movie titles with colons (e.g., "Spider-Man: No Way Home").
 */
export function cleanTitle(title?: string): string {
  if (!title) return "";

  // Remove country suffix first
  let cleaned = title.replace(COUNTRY_SUFFIX_REGEX, "").trim();

  const colonIdx = cleaned.indexOf(":");
  if (colonIdx <= 0) return cleaned;

  const afterColon = cleaned.slice(colonIdx + 1).trim().toLowerCase();
  const looksLikeTV = TV_KEYWORDS.some((keyword) => afterColon.startsWith(keyword));

  return looksLikeTV ? cleaned.slice(0, colonIdx).trim() : cleaned;
}

/**
 * @deprecated Use cleanTitle instead. This always strips at colon, breaking movie titles.
 */
export function identifyShow(title?: string): string {
  if (!title) return "";
  const firstColon = title.indexOf(":");
  return (firstColon === -1 ? title : title.slice(0, firstColon)).trim();
}
