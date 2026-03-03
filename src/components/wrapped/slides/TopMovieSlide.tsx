"use client";

import { SlideProps } from "@/types/episode";
import TopTitleSlide from "./TopTitleSlide";

export default function TopMovieSlide({ insights }: SlideProps) {
  const movie = insights.topMovie;
  if (!movie) return null;

  return (
    <TopTitleSlide
      label="Your top movie"
      gradient="from-emerald-600 to-teal-500"
      title={movie}
    />
  );
}
