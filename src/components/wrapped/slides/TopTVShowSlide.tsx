"use client";

import { SlideProps } from "@/types/episode";
import TopTitleSlide from "./TopTitleSlide";

export default function TopTVShowSlide({ insights }: SlideProps) {
  const show = insights.topTVShow;
  if (!show) return null;

  return (
    <TopTitleSlide
      label="Your top TV show"
      gradient="from-purple-700 to-indigo-600"
      title={show}
      showEpisodeCount
    />
  );
}
