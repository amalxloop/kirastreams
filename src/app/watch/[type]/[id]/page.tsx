"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Star, Clock, Calendar, PlayCircle, Loader2 } from "lucide-react";
import {
  getMovieDetails,
  getTVDetails,
  getTVSeason,
  getPopular,
  getImageUrl,
  TMDBMovieDetail,
  TMDBTVDetail,
  TMDBSeason,
  TMDBMovie,
} from "@/lib/tmdb";

type PlayerType = "vidfast" | "vidluna" | "vidora" | "player4u";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as "movie" | "tv";
  const id = Number(params.id);

  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetail | null>(null);
  const [tvDetails, setTVDetails] = useState<TMDBTVDetail | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [watchProgress, setWatchProgress] = useState<any>(null);
  const [player, setPlayer] = useState<PlayerType>("vidfast");
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);

  // Memoize player URL to prevent unnecessary recalculations
  const playerUrl = useMemo(() => {
    let url = "";
    if (player === "vidfast") {
      if (type === "movie") {
        const startTime = watchProgress?.timestamp ? `?progress=${Math.floor(watchProgress.timestamp)}` : "";
        const separator = startTime ? "&" : "?";
        url = `https://vidfast.pro/movie/${id}${startTime}${separator}color=8B5CF6&overlay=true`;
      } else if (type === "tv" && tvDetails) {
        const startTime = watchProgress?.timestamp ? `?progress=${Math.floor(watchProgress.timestamp)}&` : "?";
        url = `https://vidfast.pro/tv/${id}/${selectedSeason}/${selectedEpisode}${startTime}nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=8B5CF6&overlay=true`;
      }
    } else if (player === "vidzy") {
      if (type === "movie") {
        url = `https://vidzy.luna.tattoo/embed/movie/${id}?color=8B5CF6&autoplay=false&muted=false`;
      } else if (type === "tv") {
        url = `https://vidzy.luna.tattoo/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6&autoplay=false&muted=false`;
      }
    } else if (player === "vidora") {
      if (type === "movie") {
        url = `https://vidora.su/movie/${id}?autoplay=true&colour=8B5CF6`;
      } else if (type === "tv") {
        url = `https://vidora.su/tv/${id}/${selectedSeason}/${selectedEpisode}?autoplay=true&colour=8B5CF6&autonextepisode=true`;
      }
    } else if (player === "player4u") {
      if (type === "movie") {
        url = `https://player4u.xyz/embed/movie/${id}?color=8B5CF6`;
      } else if (type === "tv") {
        url = `https://player4u.xyz/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6`;
      }
    }
    return url;
  }, [player, type, id, selectedSeason, selectedEpisode, watchProgress?.timestamp, tvDetails]);

  // Fetch initial data (only when type or id changes)
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (type === "movie") {
          const details = await getMovieDetails(id);
          setMovieDetails(details);
          const recs = await getPopular("movie");
          setRecommendations(recs.slice(0, 6));
        } else if (type === "tv") {
          const details = await getTVDetails(id);
          setTVDetails(details);
          const recs = await getPopular("tv");
          setRecommendations(recs.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch content:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, id]);

  // Fetch season data separately (only when season changes for TV shows)
  useEffect(() => {
    async function fetchSeasonData() {
      if (type === "tv" && tvDetails) {
        try {
          const season = await getTVSeason(id, selectedSeason);
          setSeasonData(season);
        } catch (error) {
          console.error("Failed to fetch season:", error);
        }
      }
    }
    fetchSeasonData();
  }, [type, id, selectedSeason, tvDetails]);

  // Reset player loading when player changes
  useEffect(() => {
    setPlayerLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setPlayerLoading(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [player, selectedSeason, selectedEpisode]);

  // Watch progress tracking
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data.progress !== undefined) {
          setWatchProgress(data);
          // Save to localStorage
          const key = type === "movie" ? `movie-${id}` : `tv-${id}-${selectedSeason}-${selectedEpisode}`;
          localStorage.setItem(`watch-progress-${key}`, JSON.stringify(data));
        }
      } catch (error) {
        // Ignore parse errors
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [type, id, selectedSeason, selectedEpisode]);

  // Load saved progress
  useEffect(() => {
    const key = type === "movie" ? `movie-${id}` : `tv-${id}-${selectedSeason}-${selectedEpisode}`;
    const saved = localStorage.getItem(`watch-progress-${key}`);
    if (saved) {
      try {
        setWatchProgress(JSON.parse(saved));
      } catch (error) {
        // Ignore
      }
    }
  }, [type, id, selectedSeason, selectedEpisode]);

  const details = type === "movie" ? movieDetails : tvDetails;
  const title = movieDetails?.title || tvDetails?.name || "Loading...";
  const overview = details?.overview || "";
  const rating = details?.vote_average || 0;
  const cast = details?.credits?.cast.slice(0, 6) || [];
  const genres = details?.genres || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-md overflow-hidden shadow-[0_0_24px_2px_rgba(167,139,250,0.45)]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"
                alt="KiraStreams Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300">
              KiraStreams
            </span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      {/* Video Player */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Player Switcher */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-violet-400" />
            <span className="text-sm text-muted-foreground">Video Player</span>
          </div>
          <Select value={player} onValueChange={(v) => setPlayer(v as PlayerType)}>
            <SelectTrigger className="w-[180px] bg-background/70 backdrop-blur border-border/50 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vidfast">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                  <span>Vidfast (Primary)</span>
                </div>
              </SelectItem>
              <SelectItem value="vidzy">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fuchsia-500" />
                  <span>Vidzy</span>
                </div>
              </SelectItem>
              <SelectItem value="vidora">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sky-500" />
                  <span>Vidora</span>
                </div>
              </SelectItem>
              <SelectItem value="player4u">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Player4u</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-background/70 backdrop-blur border border-border/50 overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {/* Loading Overlay */}
            {playerLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                  <span className="text-sm text-muted-foreground">Loading player...</span>
                </div>
              </div>
            )}
            <iframe
              key={type === "tv" ? `${player}-tv-${id}-${selectedSeason}-${selectedEpisode}` : `${player}-movie-${id}`}
              src={playerUrl}
              className="absolute top-0 left-0 w-full h-full"
              title={`${title} - Video Player`}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
              loading="eager"
              onLoad={() => setPlayerLoading(false)}
              onError={() => {
                setPlayerLoading(false);
                console.error("Video player failed to load");
              }}
              style={{
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: "translate3d(0, 0, 0)",
              }}
            />
            {/* Watermark Overlay */}
            {watermarkEnabled && (
              <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 backdrop-blur-md rounded-lg border border-white/5 shadow-lg">
                  <div className="relative h-5 w-5 rounded overflow-hidden">
                    <Image
                      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"
                      alt="KiraStreams"
                      fill
                      className="object-cover opacity-25"
                    />
                  </div>
                  <span className="text-xs font-medium text-white/30 tracking-wide">KiraStreams</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* TV Show Episode Selector */}
        {type === "tv" && tvDetails && seasonData && (
          <Card className="mt-4 bg-background/70 backdrop-blur border border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">Season</label>
                  <Select
                    value={String(selectedSeason)}
                    onValueChange={(v) => {
                      setSelectedSeason(Number(v));
                      setSelectedEpisode(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tvDetails.seasons
                        .filter((s) => s.season_number > 0)
                        .map((season) => (
                          <SelectItem key={season.id} value={String(season.season_number)}>
                            {season.name} ({season.episode_count} episodes)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground mb-2 block">Episode</label>
                  <Select value={String(selectedEpisode)} onValueChange={(v) => setSelectedEpisode(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasonData.episodes.map((ep) => (
                        <SelectItem key={ep.id} value={String(ep.episode_number)}>
                          Episode {ep.episode_number}: {ep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Current Episode Info */}
              {seasonData.episodes[selectedEpisode - 1] && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <h3 className="font-semibold mb-2">{seasonData.episodes[selectedEpisode - 1].name}</h3>
                  <p className="text-sm text-muted-foreground">{seasonData.episodes[selectedEpisode - 1].overview}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Content Details */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
                {type === "movie" && movieDetails?.runtime && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{movieDetails.runtime} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {type === "movie"
                      ? movieDetails?.release_date?.split("-")[0]
                      : tvDetails?.first_air_date?.split("-")[0]}
                  </span>
                </div>
                {genres.slice(0, 3).map((genre) => (
                  <span key={genre.id} className="px-2 py-1 rounded bg-secondary/40 border border-border/40">
                    {genre.name}
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">{overview}</p>

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {cast.map((actor) => (
                      <div key={actor.id} className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getImageUrl(actor.profile_path, "w185")} />
                          <AvatarFallback>{actor.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{actor.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar - Poster */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden bg-background/70 backdrop-blur border border-border/50">
              <div className="relative aspect-[2/3]">
                <Image
                  src={getImageUrl(
                    type === "movie" ? movieDetails?.poster_path || null : tvDetails?.poster_path || null,
                    "w500"
                  )}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-6">You might also like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((item) => {
            const recTitle = item.title || item.name || "Unknown";
            const recType = item.media_type || type;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Link href={`/watch/${recType}/${item.id}`} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40">
                    <Image
                      src={getImageUrl(item.poster_path, "w342")}
                      alt={recTitle}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-violet-500/0 group-hover:ring-violet-500/40 transition-all" />
                  </div>
                  <p className="mt-2 text-sm font-medium line-clamp-2">{recTitle}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} KiraStreams • Powered by TMDB & Vidfast</p>
        </div>
      </footer>
    </div>
  );
}