"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { getRecommendations, RecommendationSource } from "@/lib/recommendations";
import { getImageUrl } from "@/lib/tmdb";
import { Sparkles } from "lucide-react";

export function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState<RecommendationSource[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadRecommendations() {
      const recs = await getRecommendations();
      setRecommendations(recs);
    }
    loadRecommendations();
  }, []);

  if (!mounted || recommendations.length === 0) return null;

  return (
    <>
      {recommendations.map((source, sourceIndex) => (
        <section key={sourceIndex} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-violet-400" />
            <h2 className="text-2xl sm:text-3xl font-bold">{source.title}</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {source.items.map((item, index) => {
              const title = item.title || item.name || "Unknown";
              const mediaType = item.media_type || "movie";
              const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
              
              return (
                <motion.div
                  key={`${mediaType}-${item.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/watch/${mediaType}/${item.id}`} className="group block">
                    <article className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40">
                      <Image
                        src={getImageUrl(item.poster_path, "w342")}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-violet-500/0 group-hover:ring-violet-500/40 transition-all duration-300" />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-black/70 backdrop-blur">
                        ⭐ {item.vote_average.toFixed(1)}
                      </div>
                    </article>
                    <div className="mt-2">
                      <p className="text-sm font-medium line-clamp-1">{title}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{year}</span>
                        <span className="capitalize">{mediaType}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
