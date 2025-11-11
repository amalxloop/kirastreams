import { TMDBMovie } from "./tmdb";

export interface Bookmark {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  addedAt: number;
}

/**
 * Get all bookmarks
 */
export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  
  try {
    const bookmarks = localStorage.getItem("bookmarks");
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch {
    return [];
  }
}

/**
 * Check if content is bookmarked
 */
export function isBookmarked(type: "movie" | "tv", id: number): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === id && b.type === type);
}

/**
 * Add bookmark
 */
export function addBookmark(bookmark: Bookmark): void {
  if (typeof window === "undefined") return;
  
  const bookmarks = getBookmarks();
  
  // Remove if already exists
  const filtered = bookmarks.filter(b => !(b.id === bookmark.id && b.type === bookmark.type));
  
  // Add to beginning
  const updated = [{ ...bookmark, addedAt: Date.now() }, ...filtered];
  
  localStorage.setItem("bookmarks", JSON.stringify(updated));
  
  // Cache metadata for offline use
  cacheMetadata(bookmark);
}

/**
 * Remove bookmark
 */
export function removeBookmark(type: "movie" | "tv", id: number): void {
  if (typeof window === "undefined") return;
  
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(b => !(b.id === id && b.type === type));
  
  localStorage.setItem("bookmarks", JSON.stringify(filtered));
}

/**
 * Cache metadata for offline browsing
 */
function cacheMetadata(bookmark: Bookmark): void {
  if (typeof window === "undefined") return;
  
  try {
    const key = `cache-${bookmark.type}-${bookmark.id}`;
    localStorage.setItem(key, JSON.stringify(bookmark));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Get cached metadata
 */
export function getCachedMetadata(type: "movie" | "tv", id: number): Bookmark | null {
  if (typeof window === "undefined") return null;
  
  try {
    const key = `cache-${type}-${id}`;
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Get all cached content
 */
export function getAllCachedContent(): Bookmark[] {
  if (typeof window === "undefined") return [];
  
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith("cache-"));
    const cached: Bookmark[] = [];
    
    keys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "");
        cached.push(data);
      } catch {
        // Skip invalid entries
      }
    });
    
    return cached;
  } catch {
    return [];
  }
}
