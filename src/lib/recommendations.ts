import { TMDBMovie, getMoviesByGenre, getTVByGenre, getTrending } from "./tmdb";

export interface WatchHistory {
  id: number;
  type: "movie" | "tv";
  title: string;
  genre_ids: number[];
  timestamp: number;
}

export interface RecommendationSource {
  title: string;
  items: TMDBMovie[];
}

/**
 * Get watch history from localStorage
 */
export function getWatchHistory(): WatchHistory[] {
  if (typeof window === "undefined") return [];
  
  try {
    const history = localStorage.getItem("watch-history");
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
}

/**
 * Add item to watch history
 */
export function addToWatchHistory(item: WatchHistory): void {
  if (typeof window === "undefined") return;
  
  const history = getWatchHistory();
  
  // Remove duplicates
  const filtered = history.filter(h => !(h.id === item.id && h.type === item.type));
  
  // Add to beginning and limit to 50 items
  const updated = [item, ...filtered].slice(0, 50);
  
  localStorage.setItem("watch-history", JSON.stringify(updated));
}

/**
 * Get genre-based recommendations from watch history
 */
export async function getRecommendations(): Promise<RecommendationSource[]> {
  const history = getWatchHistory();
  
  if (history.length === 0) {
    // No history - return trending
    const trending = await getTrending("all", "week");
    return [
      {
        title: "Trending Now",
        items: trending.slice(0, 10),
      },
    ];
  }

  const recommendations: RecommendationSource[] = [];
  
  // Get the most recent watch
  const lastWatched = history[0];
  
  // "Because you watched X" - Get similar content by genre
  if (lastWatched.genre_ids.length > 0) {
    const primaryGenre = lastWatched.genre_ids[0];
    
    try {
      const similar = lastWatched.type === "movie" 
        ? await getMoviesByGenre(primaryGenre, 1)
        : await getTVByGenre(primaryGenre, 1);
      
      // Filter out the watched item itself
      const filtered = similar.filter(item => item.id !== lastWatched.id).slice(0, 10);
      
      if (filtered.length > 0) {
        recommendations.push({
          title: `Because you watched ${lastWatched.title}`,
          items: filtered,
        });
      }
    } catch (error) {
      console.error("Failed to fetch genre recommendations:", error);
    }
  }

  // Analyze all genre preferences
  const genreFrequency = new Map<number, number>();
  history.forEach(item => {
    item.genre_ids.forEach(genreId => {
      genreFrequency.set(genreId, (genreFrequency.get(genreId) || 0) + 1);
    });
  });

  // Get top 2 genres
  const topGenres = Array.from(genreFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([genreId]) => genreId);

  // "More like what you watch" - Based on top genres
  for (const genreId of topGenres) {
    try {
      const [movies, tv] = await Promise.all([
        getMoviesByGenre(genreId, 1),
        getTVByGenre(genreId, 1),
      ]);
      
      const combined = [...movies, ...tv]
        .filter(item => !history.some(h => h.id === item.id))
        .slice(0, 10);
      
      if (combined.length > 0) {
        recommendations.push({
          title: "More like what you watch",
          items: combined,
        });
      }
    } catch (error) {
      console.error("Failed to fetch top genre recommendations:", error);
    }
  }

  // Popular picks
  try {
    const trending = await getTrending("all", "week");
    const filtered = trending
      .filter(item => !history.some(h => h.id === item.id))
      .slice(0, 10);
    
    if (filtered.length > 0) {
      recommendations.push({
        title: "Popular on KiraStreams",
        items: filtered,
      });
    }
  } catch (error) {
    console.error("Failed to fetch trending:", error);
  }

  return recommendations;
}
