"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, Calendar } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";

interface WatchHistoryItem {
  id: number;
  userId: string;
  contentId: string;
  contentType: string;
  title: string;
  posterPath: string | null;
  watchedAt: number;
  progressSeconds: number;
  totalSeconds: number;
}

interface WatchHistoryTimelineProps {
  userId: string;
  days?: number;
  limit?: number;
}

export function WatchHistoryTimeline({ userId, days = 7, limit = 20 }: WatchHistoryTimelineProps) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `/api/watch-history?userId=${encodeURIComponent(userId)}&days=${days}&limit=${limit}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Failed to fetch watch history:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [userId, days, limit]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-violet-400" />
          <h2 className="text-2xl font-bold">Watch History</h2>
        </div>
        <p className="text-sm text-muted-foreground">Loading your watch history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-violet-400" />
          <h2 className="text-2xl font-bold">Watch History</h2>
        </div>
        <p className="text-sm text-muted-foreground">No watch history in the last {days} days.</p>
      </div>
    );
  }

  // Group by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = new Date(item.watchedAt * 1000);
    const dateKey = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, WatchHistoryItem[]>);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="h-5 w-5 text-violet-400" />
        <h2 className="text-2xl font-bold">Watch History</h2>
        <span className="text-sm text-muted-foreground ml-2">Last {days} days</span>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedHistory).map(([date, items], groupIndex) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4 sticky top-16 bg-background/95 backdrop-blur py-2 z-10">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {items.map((item, index) => {
                const progressPercent = Math.round((item.progressSeconds / item.totalSeconds) * 100);
                const watchTime = new Date(item.watchedAt * 1000).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/watch/${item.contentType}/${item.contentId}`} className="group block">
                      <article className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40 card-hover-glow">
                        {item.posterPath ? (
                          <Image
                            src={getImageUrl(item.posterPath, "w342")}
                            alt={item.title}
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

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                          <div
                            className="h-full bg-violet-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Watch time badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-black/70 backdrop-blur">
                          {watchTime}
                        </div>
                      </article>

                      <div className="mt-2">
                        <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.contentType}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
