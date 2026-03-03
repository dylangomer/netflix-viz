"use client";

import { motion } from "framer-motion";
import { SlideProps } from "@/types/episode";
import { staggerContainer, staggerItem, numberReveal } from "../animations";

export default function FavoriteGenreSlide({ insights }: SlideProps) {
  const topGenres = insights.genreBreakdown.slice(0, 4);
  if (topGenres.length === 0) return null;

  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center px-6 bg-gradient-to-br from-amber-500 to-rose-500 rounded-xl text-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-6 text-center w-full max-w-xs"
      >
        <motion.p variants={staggerItem} className="text-sm uppercase tracking-widest opacity-80">
          Your favorite genre
        </motion.p>

        <motion.p variants={numberReveal} className="text-4xl font-black">
          {insights.favoriteGenre}
        </motion.p>

        <motion.p variants={staggerItem} className="text-xl">
          {insights.favoriteGenrePercent}% of your watching
        </motion.p>

        <motion.div variants={staggerItem} className="w-full space-y-3 mt-4">
          {topGenres.map((g) => (
            <div key={g.genre} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{g.genre}</span>
                <span>{g.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-white/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
