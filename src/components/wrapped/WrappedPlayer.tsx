"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WrappedInsights, ViewerAvatar, SlideConfig } from "@/types/episode";
import { slideVariants } from "./animations";
import ProgressBar from "./ProgressBar";

type WrappedPlayerProps = {
  insights: WrappedInsights;
  avatar: ViewerAvatar;
  slides: SlideConfig[];
  onClose?: () => void;
};

export default function WrappedPlayer({ insights, avatar, slides, onClose }: WrappedPlayerProps) {
  const visibleSlides = slides.filter((s) => s.shouldShow(insights));
  const [[rawIndex, direction], setSlide] = useState([0, 0]);

  // Clamp index if visible slides shrink (e.g. TopMovieSlide removed)
  const slideIndex = Math.min(rawIndex, visibleSlides.length - 1);

  const goNext = useCallback(() => {
    setSlide(([i]) => (i < visibleSlides.length - 1 ? [i + 1, 1] : [i, 0]));
  }, [visibleSlides.length]);

  const goPrev = useCallback(() => {
    setSlide(([i]) => (i > 0 ? [i - 1, -1] : [i, 0]));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  if (visibleSlides.length === 0) return null;

  const current = visibleSlides[slideIndex];
  const SlideComponent = current.component;

  return (
    <div className="fixed inset-0 z-50 flex flex-col select-none bg-black">
      <ProgressBar total={visibleSlides.length} current={slideIndex} />

      {/* Close button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-4 z-20 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
          aria-label="Exit wrapped"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Back button */}
      {slideIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute top-3 left-4 z-20 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Tap to advance */}
      <div className="flex-1 cursor-pointer overflow-hidden" onClick={goNext}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            <SlideComponent
              insights={insights}
              avatar={avatar}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide counter */}
      <div className="text-center text-xs text-white/50 py-2">
        {slideIndex + 1} / {visibleSlides.length} &middot; tap to continue
      </div>
    </div>
  );
}
