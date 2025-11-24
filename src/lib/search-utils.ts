import { TMDBMovie, TMDB_GENRES } from "./tmdb";

export interface SearchSuggestion {
  id: number;
  title: string;
  type: "movie" | "tv" | "anime" | "genre" | "year";
  category: string;
  metadata?: {
    year?: string;
    rating?: number;
    poster_path?: string | null;
  };
}

/**
 * Fuzzy match search - calculates similarity score
 */
export function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  
  // Exact match
  if (t === q) return 1;
  
  // Starts with query
  if (t.startsWith(q)) return 0.9;
  
  // Contains query
  if (t.includes(q)) return 0.7;
  
  // Fuzzy matching using Levenshtein-like approach
  let score = 0;
  let qIndex = 0;
  
  for (let i = 0; i < t.length && qIndex < q.length; i++) {
    if (t[i] === q[qIndex]) {
      score++;
      qIndex++;
    }
  }
  
  return score / Math.max(q.length, t.length) * 0.5;
}

/**
 * Generate search suggestions from TMDB results
 */
export function generateSuggestions(results: TMDBMovie[], query: string): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const seenIds = new Set<string>();
  
  // Add content suggestions (movies, TV, anime)
  results.forEach(item => {
    const title = item.title || item.name || "";
    const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0];
    const isAnime = item.genre_ids?.includes(16); // Animation genre
    const itemType = item.media_type || "movie";
    
    // Determine category
    let category = "Movie";
    let type: SearchSuggestion["type"] = "movie";
    
    if (itemType === "tv") {
      if (isAnime) {
        category = "Anime";
        type = "anime";
      } else {
        category = "TV Show";
        type = "tv";
      }
    } else if (isAnime) {
      category = "Movie";
      type = "movie";
    }
    
    const key = `${type}-${item.id}`;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      suggestions.push({
        id: item.id,
        title,
        type,
        category,
        metadata: {
          year,
          rating: item.vote_average,
          poster_path: item.poster_path,
        },
      });
    }
  });
  
  // Add genre suggestions
  const allGenres = [...TMDB_GENRES.movie, ...TMDB_GENRES.tv];
  allGenres.forEach(genre => {
    const score = fuzzyMatch(query, genre.name);
    if (score > 0.3) {
      const key = `genre-${genre.id}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        suggestions.push({
          id: genre.id,
          title: genre.name,
          type: "genre",
          category: "Genre",
        });
      }
    }
  });
  
  // Add year suggestions if query is numeric
  if (/^\d{4}$/.test(query)) {
    const year = parseInt(query);
    if (year >= 1900 && year <= new Date().getFullYear() + 2) {
      suggestions.push({
        id: year,
        title: year.toString(),
        type: "year",
        category: "Year",
      });
    }
  }
  
  return suggestions.slice(0, 20); // Limit suggestions
}

/**
 * Group suggestions by category
 */
export function groupSuggestions(suggestions: SearchSuggestion[]): Record<string, SearchSuggestion[]> {
  const grouped: Record<string, SearchSuggestion[]> = {};
  
  suggestions.forEach(suggestion => {
    if (!grouped[suggestion.category]) {
      grouped[suggestion.category] = [];
    }
    grouped[suggestion.category].push(suggestion);
  });
  
  return grouped;
}
