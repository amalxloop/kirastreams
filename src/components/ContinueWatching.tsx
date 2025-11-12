"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getImageUrl, getMovieDetails, getTVDetails, TMDBMovieDetail, TMDBTVDetail } from "@/lib/tmdb";
import { Play, X } from "lucide-react";
import { Button } from "./ui/button";

interface WatchProgressItem {
  id: number;
  userId: string;
  contentId: string;
  contentType: string;
  progressSeconds: number;
  totalSeconds: number;
  lastWatchedAt: number;
  createdAt: number;
  updatedAt: number;
}

interface EnrichedWatchItem extends WatchProgressItem {
  title: string;
  posterPath: string | null;
}

interface ContinueWatchingProps {
  userId: string | null;
}

export function ContinueWatching({ userId }: ContinueWatchingProps) {
  const [progress, setProgress] = useState<EnrichedWatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/watch-progress?userId=${encodeURIComponent(userId)}&limit=6`);
        
        if (response.ok) {
          const data = await response.json();
          const items = data.progress || [];
          
          // Fetch TMDB data for each item
          const enrichedItems = await Promise.all(
            items.map(async (item: WatchProgressItem) => {
              try {
                const tmdbId = parseInt(item.contentId);
                let title = "Unknown";
                let posterPath = null;

                if (item.contentType === "movie") {
                  const details = await getMovieDetails(tmdbId);
                  title = details.title;
                  posterPath = details.poster_path;
                } else if (item.contentType === "tv") {
                  const details = await getTVDetails(tmdbId);
                  title = details.name;
                  posterPath = details.poster_path;
                }

                return {
                  ...item,
                  title,
                  posterPath,
                } as EnrichedWatchItem;
              } catch (error) {
                console.error(`Failed to fetch TMDB data for ${item.contentType} ${item.contentId}:`, error);
                return {
                  ...item,
                  title: `${item.contentType} ${item.contentId}`,
                  posterPath: null,
                } as EnrichedWatchItem;
              }
            })
          );
          
          setProgress(enrichedItems);
        }
      } catch (error) {
        console.error("Failed to fetch watch progress:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId]);

  const handleRemove = async (itemId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/watch-progress/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProgress(prev => prev.filter(p => p.id !== itemId));
      }
    } catch (error) {
      console.error("Failed to remove progress:", error);
    }
  };

  if (loading || !userId || progress.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Play className="h-5 w-5 text-violet-400" />
        <h2 className="text-2xl sm:text-3xl font-bold">Continue Watching</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {progress.map((item, index) => {
          const progressPercent = Math.round((item.progressSeconds / item.totalSeconds) * 100);
          const url = `/watch/${item.contentType}/${item.contentId}`;
          const timeRemaining = Math.max(0, item.totalSeconds - item.progressSeconds);
          const minutesRemaining = Math.floor(timeRemaining / 60);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={url} className="group block relative">
                <article className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40 card-hover-glow">
                  {item.posterPath ? (
                    <Image
                      src={getImageUrl(item.posterPath, "w342")}
                      alt={`Continue watching ${item.title}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-cover parallax-scale"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  
                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="rounded-full bg-violet-600 p-3 shadow-lg">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-10">
                    <div 
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  
                  {/* Progress Badge */}
                  {minutesRemaining > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/70 backdrop-blur">
                      {minutesRemaining}m left
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 bg-black/70 hover:bg-black/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => handleRemove(item.id, e)}
                    aria-label={`Remove ${item.title} from continue watching`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </article>
                
                <div className="mt-2">
                  <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progressPercent}% watched</span>
                    <span className="capitalize">{item.contentType}</span>
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