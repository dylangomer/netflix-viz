"use client";

import { motion } from "framer-motion";
import { EnrichedTitlePoint } from "@/types/episode";
import { staggerContainer, staggerItem, numberReveal, imageReveal } from "../animations";

type Props = {
  label: string;
  gradient: string;
  title: EnrichedTitlePoint;
  showEpisodeCount?: boolean;
};

export default function TopTitleSlide({ label, gradient, title, showEpisodeCount }: Props) {
  return (
    <div className={`relative flex h-full min-h-[80vh] flex-col items-center justify-center px-6 bg-gradient-to-br ${gradient} rounded-xl text-white overflow-hidden`}>
      {title.backdropUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${title.backdropUrl})` }}
        />
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center gap-5 text-center"
      >
        <motion.p variants={staggerItem} className="text-sm uppercase tracking-widest opacity-80">
          {label}
        </motion.p>

        {title.posterUrl && (
          <motion.img
            variants={imageReveal}
            src={title.posterUrl}
            alt={title.title}
            className="w-32 rounded-lg shadow-2xl"
          />
        )}

        <motion.p variants={staggerItem} className="text-2xl font-bold">
          {title.title}
        </motion.p>

        {showEpisodeCount && (
          <>
            <motion.p variants={numberReveal} className="text-5xl font-black tabular-nums">
              {title.watched}
            </motion.p>
            <motion.p variants={staggerItem} className="text-lg -mt-3">
              episodes watched
            </motion.p>
          </>
        )}

        {!showEpisodeCount && title.rating != null && title.rating > 0 && (
          <motion.p variants={staggerItem} className="text-lg opacity-80">
            {title.rating.toFixed(1)} / 10 on TMDB
          </motion.p>
        )}

        {title.genres && title.genres.length > 0 && (
          <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-2 mt-2">
            {title.genres.slice(0, 4).map((g) => (
              <span key={g} className="rounded-full bg-white/20 px-3 py-1 text-xs">
                {g}
              </span>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
