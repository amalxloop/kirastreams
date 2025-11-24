"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { getImageUrl, TMDBMovie } from "@/lib/tmdb";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DynamicHeroBannerProps {
  items: TMDBMovie[];
  autoScrollInterval?: number;
}

export function DynamicHeroBanner({ items, autoScrollInterval = 5000 }: DynamicHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 800);
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoScrollInterval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPaused, autoScrollInterval, items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name || "Unknown";
  const mediaType = currentItem.media_type || "movie";

  return (
    <section 
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-6 sm:pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured trending content"
    >
      <div className="relative h-[44vh] sm:h-[56vh] lg:h-[68vh] overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="absolute inset-0"
          >
            <Image
              src={getImageUrl(currentItem.backdrop_path, "original")}
              alt={`${title} - Watch free online on KiraStreams`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-cover opacity-80"
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
          <motion.h2
            key={`title-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
            className="text-2xl sm:text-4xl lg:text-5xl font-bold"
          >
            {title}
          </motion.h2>
          <motion.p
            key={`overview-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
            className="mt-2 max-w-2xl text-sm/relaxed sm:text-base/relaxed text-muted-foreground line-clamp-3"
          >
            {currentItem.overview}
          </motion.p>
          <motion.div
            key={`meta-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
          >
            <span className="px-2 py-1 rounded bg-secondary/40 border border-border/40 capitalize">{mediaType}</span>
            <span>•</span>
            <span>{currentItem.release_date?.split("-")[0] || currentItem.first_air_date?.split("-")[0] || "N/A"}</span>
            <span>•</span>
            <span>⭐ {currentItem.vote_average.toFixed(1)}</span>
          </motion.div>
          <motion.div
            key={`button-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
            className="mt-5 flex gap-3"
          >
            <Button asChild className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_18px_2px_rgba(139,92,246,0.45)]">
              <Link href={`/watch/${mediaType}/${currentItem.id}`}>Watch now</Link>
            </Button>
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur hover:bg-black/70 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-black/50 backdrop-blur hover:bg-black/70 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}