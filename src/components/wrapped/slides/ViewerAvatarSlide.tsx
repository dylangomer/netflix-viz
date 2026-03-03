"use client";

import { motion } from "framer-motion";
import { SlideProps } from "@/types/episode";
import { staggerContainer, staggerItem, numberReveal } from "../animations";
import { buildTwitterShareUrl } from "@/lib/share";

export default function ViewerAvatarSlide({ insights, avatar }: SlideProps) {
  const shareUrl = buildTwitterShareUrl(avatar, insights);

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-fuchsia-600 to-violet-600 rounded-xl text-white">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-5 text-center"
      >
        <motion.p variants={staggerItem} className="text-sm uppercase tracking-widest opacity-80">
          You are...
        </motion.p>

        <motion.p variants={numberReveal} className="text-6xl">
          {avatar.emoji}
        </motion.p>

        <motion.p variants={numberReveal} className="text-3xl font-black">
          {avatar.archetype}
        </motion.p>

        <motion.p variants={staggerItem} className="text-base opacity-90 max-w-xs">
          {avatar.tagline}
        </motion.p>

        <motion.ul variants={staggerItem} className="space-y-1 text-sm opacity-80">
          {avatar.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </motion.ul>

        <motion.div variants={staggerItem} className="mt-4">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-6 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
