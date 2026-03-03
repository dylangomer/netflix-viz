import { ViewerAvatar, WrappedInsights } from "@/types/episode";

export function buildTwitterShareUrl(avatar: ViewerAvatar, insights: WrappedInsights): string {
  const lines = [
    `My Netflix Wrapped ${avatar.emoji}`,
    ``,
    `I'm a "${avatar.archetype}"`,
    `${insights.totalWatches.toLocaleString()} total watches`,
    insights.topTVShow ? `Top show: ${insights.topTVShow.title}` : null,
    insights.favoriteGenre ? `Fav genre: ${insights.favoriteGenre}` : null,
    ``,
    `Find yours at netflix-wrapped.vercel.app`,
  ];

  const text = lines.filter(Boolean).join("\n");
  const params = new URLSearchParams({ text });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}
