"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { getImageUrl, TMDBSeason } from "@/lib/tmdb";
import { Play, Clock } from "lucide-react";

interface EpisodeThumbnailsProps {
  seasonData: TMDBSeason;
  selectedEpisode: number;
  onEpisodeSelect: (episodeNumber: number) => void;
}

export function EpisodeThumbnails({ seasonData, selectedEpisode, onEpisodeSelect }: EpisodeThumbnailsProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Pre-load the currently selected episode and surrounding episodes
    const preloadRange = [
      selectedEpisode - 1,
      selectedEpisode,
      selectedEpisode + 1,
      selectedEpisode + 2
    ].filter(num => num > 0 && num <= seasonData.episodes.length);
    
    setLoadedImages(new Set(preloadRange));
  }, [selectedEpisode, seasonData.episodes.length]);

  const handleImageInView = (episodeNumber: number) => {
    setLoadedImages(prev => new Set([...prev, episodeNumber]));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Episodes</h3>
      {seasonData.episodes.map((episode, index) => {
        const isSelected = episode.episode_number === selectedEpisode;
        const shouldLoad = loadedImages.has(episode.episode_number);
        
        return (
          <motion.div
            key={episode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card
              className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:border-violet-500/50 ${
                isSelected ? "border-violet-500 bg-violet-500/10" : "border-border/40"
              }`}
              onClick={() => onEpisodeSelect(episode.episode_number)}
            >
              <CardContent className="p-0">
                <div className="flex gap-3 p-3">
                  {/* Episode Thumbnail */}
                  <div className="relative w-40 h-24 flex-shrink-0 overflow-hidden rounded-md bg-secondary/40">
                    {episode.still_path && shouldLoad ? (
                      <>
                        <Image
                          src={getImageUrl(episode.still_path, "w342")}
                          alt={`Episode ${episode.episode_number}: ${episode.name}`}
                          fill
                          sizes="160px"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                          onLoadingComplete={() => handleImageInView(episode.episode_number)}
                        />
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                          <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <Play className="h-6 w-6" />
                      </div>
                    )}
                    
                    {/* Episode Number Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-xs font-semibold">
                      {episode.episode_number}
                    </div>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {episode.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {episode.overview || "No description available."}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      {episode.air_date && (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
