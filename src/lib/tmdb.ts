const TMDB_API_KEY = "a222e5eda9654d1c6974da834e756c12";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime?: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
    }>;
  };
  number_of_seasons?: number;
  seasons?: Array<{
    id: number;
    season_number: number;
    episode_count: number;
    name: string;
  }>;
}

export interface TMDBTVDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  seasons: Array<{
    id: number;
    season_number: number;
    episode_count: number;
    name: string;
    air_date: string;
  }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

export interface TMDBSeason {
  episodes: Array<{
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    still_path: string | null;
    air_date: string;
  }>;
}

async function tmdbFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "day") {
  const data = await tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
  return data.results as TMDBMovie[];
}

export async function getPopular(mediaType: "movie" | "tv", page = 1) {
  const data = await tmdbFetch(`/${mediaType}/popular`, { page: String(page) });
  return data.results as TMDBMovie[];
}

export async function getTopRated(mediaType: "movie" | "tv", page = 1) {
  const data = await tmdbFetch(`/${mediaType}/top_rated`, { page: String(page) });
  return data.results as TMDBMovie[];
}

export async function getNowPlaying(page = 1) {
  const data = await tmdbFetch("/movie/now_playing", { page: String(page) });
  return data.results as TMDBMovie[];
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetail> {
  return await tmdbFetch(`/movie/${movieId}`, { append_to_response: "credits,videos" });
}

export async function getTVDetails(tvId: number): Promise<TMDBTVDetail> {
  return await tmdbFetch(`/tv/${tvId}`, { append_to_response: "credits" });
}

export async function getTVSeason(tvId: number, seasonNumber: number): Promise<TMDBSeason> {
  return await tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page = 1) {
  const data = await tmdbFetch("/search/multi", { query, page: String(page) });
  return data.results as TMDBMovie[];
}

export async function searchMovies(query: string, page = 1) {
  const data = await tmdbFetch("/search/movie", { query, page: String(page) });
  return data.results as TMDBMovie[];
}

export async function searchTV(query: string, page = 1) {
  const data = await tmdbFetch("/search/tv", { query, page: String(page) });
  return data.results as TMDBMovie[];
}

export async function getMoviesByGenre(genreId: number, page = 1) {
  const data = await tmdbFetch("/discover/movie", {
    with_genres: String(genreId),
    page: String(page),
    sort_by: "popularity.desc",
  });
  return data.results as TMDBMovie[];
}

export async function getTVByGenre(genreId: number, page = 1) {
  const data = await tmdbFetch("/discover/tv", {
    with_genres: String(genreId),
    page: String(page),
    sort_by: "popularity.desc",
  });
  return data.results as TMDBMovie[];
}

export function getImageUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string {
  if (!path) return "https://images.unsplash.com/photo-1542626991-cbc4e32524cc?q=80&w=500&auto=format&fit=crop";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export const TMDB_GENRES = {
  movie: [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 14, name: "Fantasy" },
    { id: "History", name: "History" },
    { id: 27, name: "Horror" },
    { id: 10402, name: "Music" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 10770, name: "TV Movie" },
    { id: 53, name: "Thriller" },
    { id: 10752, name: "War" },
    { id: 37, name: "Western" },
  ],
  tv: [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
  ],
};