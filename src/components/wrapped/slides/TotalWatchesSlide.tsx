"use client";

import { motion } from "framer-motion";
import { SlideProps } from "@/types/episode";
import { staggerContainer, staggerItem, numberReveal } from "../animations";

export default function TotalWatchesSlide({ insights }: SlideProps) {
  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center px-6 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl text-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.p variants={staggerItem} className="text-sm uppercase tracking-widest opacity-80">
          Your Netflix history
        </motion.p>

        <motion.p variants={numberReveal} className="text-7xl font-black tabular-nums">
          {insights.totalWatches.toLocaleString()}
        </motion.p>

        <motion.p variants={staggerItem} className="text-xl font-medium">
          total watches
        </motion.p>

        <motion.div variants={staggerItem} className="flex gap-6 text-sm opacity-80">
          <span>{insights.totalTVEpisodes} TV episodes</span>
          <span>&middot;</span>
          <span>{insights.totalMovies} movies</span>
        </motion.div>

        <motion.p variants={staggerItem} className="text-xs opacity-60 mt-4">
          {insights.dateRange.start} &ndash; {insights.dateRange.end}
        </motion.p>
      </motion.div>
    </div>
  );
}
