import { TMDBMovie } from "./tmdb";

export interface WatchProgress {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  timestamp: number;
  duration: number;
  progress: number; // 0-100
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
  lastWatched: number; // timestamp
}

/**
 * Get all watch progress
 */
export function getAllWatchProgress(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith("watch-progress-"));
    const progress: WatchProgress[] = [];
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "");
        if (data.timestamp && data.duration) {
          progress.push(data);
        }
      } catch {
        // Skip invalid entries
      }
    });
    
    // Sort by last watched (most recent first)
    return progress.sort((a, b) => b.lastWatched - a.lastWatched);
  } catch {
    return [];
  }
}

/**
 * Get watch progress for specific content
 */
export function getWatchProgress(type: "movie" | "tv", id: number, season?: number, episode?: number): WatchProgress | null {
  if (typeof window === "undefined") return null;
  
  const key = type === "movie" ? `movie-${id}` : `tv-${id}-${season}-${episode}`;
  const stored = localStorage.getItem(`watch-progress-${key}`);
  
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save watch progress
 */
export function saveWatchProgress(progress: WatchProgress): void {
  if (typeof window === "undefined") return;
  
  const key = progress.type === "movie" 
    ? `movie-${progress.id}` 
    : `tv-${progress.id}-${progress.seasonNumber}-${progress.episodeNumber}`;
  
  const data = {
    ...progress,
    lastWatched: Date.now(),
    progress: Math.round((progress.timestamp / progress.duration) * 100),
  };
  
  localStorage.setItem(`watch-progress-${key}`, JSON.stringify(data));
}

/**
 * Clear watch progress for specific content
 */
export function clearWatchProgress(type: "movie" | "tv", id: number, season?: number, episode?: number): void {
  if (typeof window === "undefined") return;
  
  const key = type === "movie" ? `movie-${id}` : `tv-${id}-${season}-${episode}`;
  localStorage.removeItem(`watch-progress-${key}`);
}
