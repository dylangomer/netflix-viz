/**
 * Extracts the show name from a Netflix title by removing episode information.
 * Netflix titles are formatted as "Show Name: Season X: Episode Y" or "Show Name: Episode Title".
 * This function returns just the show name portion.
 *
 * @param title - The full title from Netflix CSV
 * @returns The show name only, or empty string if no title provided
 *
 * @example
 * identifyShow("Breaking Bad: Season 1: Pilot")
 * // "Breaking Bad"
 *
 * identifyShow("Stranger Things: The Vanishing of Will Byers")
 * // "Stranger Things"
 *
 * identifyShow("Inception")
 * // "Inception"
 */
export function identifyShow(title?: string) {
  if (!title) return "";
  const firstColon = title.indexOf(":");
  return (firstColon === -1 ? title : title.slice(0, firstColon)).trim();
}