"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { WatchProgress, getAllWatchProgress } from "@/lib/watch-progress";
import { getImageUrl } from "@/lib/tmdb";
import { Play, X } from "lucide-react";
import { Button } from "./ui/button";

export function ContinueWatching() {
  const [progress, setProgress] = useState<WatchProgress[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const watchProgress = getAllWatchProgress();
    setProgress(watchProgress.slice(0, 6)); // Show top 6
  }, []);

  const handleRemove = (item: WatchProgress, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const key = item.type === "movie" 
      ? `watch-progress-movie-${item.id}` 
      : `watch-progress-tv-${item.id}-${item.seasonNumber}-${item.episodeNumber}`;
    
    localStorage.removeItem(key);
    setProgress(prev => prev.filter(p => {
      if (p.type === "movie") {
        return !(p.id === item.id && p.type === item.type);
      }
      return !(p.id === item.id && p.type === item.type && p.seasonNumber === item.seasonNumber && p.episodeNumber === item.episodeNumber);
    }));
  };

  if (!mounted || progress.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Continue Watching</h2>
        <Play className="h-6 w-6 text-violet-400" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {progress.map((item, index) => {
          const url = item.type === "movie" 
            ? `/watch/movie/${item.id}` 
            : `/watch/tv/${item.id}`;
          
          return (
            <motion.div
              key={`${item.type}-${item.id}-${item.seasonNumber}-${item.episodeNumber}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={url} className="group block relative">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40">
                  <Image
                    src={getImageUrl(item.poster_path, "w342")}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                    <div 
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 bg-black/70 hover:bg-black/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleRemove(item, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="absolute inset-0 ring-1 ring-inset ring-violet-500/0 group-hover:ring-violet-500/40 transition-all" />
                </div>
                
                <div className="mt-2">
                  <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(item.progress)}% watched</span>
                    {item.type === "tv" && item.seasonNumber && item.episodeNumber && (
                      <span>S{item.seasonNumber} E{item.episodeNumber}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
