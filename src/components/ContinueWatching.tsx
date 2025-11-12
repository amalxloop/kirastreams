"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/tmdb";
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

interface ContinueWatchingProps {
  userId: string | null;
}

export function ContinueWatching({ userId }: ContinueWatchingProps) {
  const [progress, setProgress] = useState<WatchProgressItem[]>([]);
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
          setProgress(data.progress || []);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">Continue Watching</h2>
        <Play className="h-6 w-6 text-violet-400" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {progress.map((item, index) => {
          const progressPercent = Math.round((item.progressSeconds / item.totalSeconds) * 100);
          const url = `/watch/${item.contentType}/${item.contentId}`;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={url} className="group block relative">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40">
                  <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 z-10">
                    <div 
                      className="h-full bg-violet-500 transition-all"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 bg-black/70 hover:bg-black/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => handleRemove(item.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  
                  <div className="absolute inset-0 ring-1 ring-inset ring-violet-500/0 group-hover:ring-violet-500/40 transition-all" />
                </div>
                
                <div className="mt-2">
                  <p className="text-sm font-medium line-clamp-1">{item.contentId}</p>
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