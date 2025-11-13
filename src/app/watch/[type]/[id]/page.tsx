"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Star, Clock, Calendar, PlayCircle, Loader2, SkipForward } from "lucide-react";
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
import { BookmarkButton } from "@/components/BookmarkButton";
import { Bookmark } from "@/lib/bookmarks";
import { EpisodeThumbnails } from "@/components/EpisodeThumbnails";
import { useWatchProgress } from "@/lib/hooks/useWatchProgress";
import { useSkipTimestamps } from "@/lib/hooks/useSkipTimestamps";
import { useContentTheme } from "@/lib/contexts/ThemeContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { getCurrentUserId } from "@/lib/guestUser";

type PlayerType = "vidfast" | "vidzy" | "2embed";

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const type = params.type as "movie" | "tv";
  const id = Number(params.id);
  const contentId = String(id);

  // Get user ID - either authenticated or guest
  const userId = getCurrentUserId(user?.id);

  const [movieDetails, setMovieDetails] = useState<TMDBMovieDetail | null>(null);
  const [tvDetails, setTVDetails] = useState<TMDBTVDetail | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState<TMDBSeason | null>(null);
  const [recommendations, setRecommendations] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [player, setPlayer] = useState<PlayerType>("vidfast");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  // Hooks for watch progress and skip timestamps - now using userId (authenticated or guest)
  const { progress, saveProgress, addToHistory } = useWatchProgress(
    userId,
    contentId,
    type
  );
  const { timestamps } = useSkipTimestamps(contentId, type);
  const { applyTheme, resetTheme } = useContentTheme();

  // Apply theme when content loads
  useEffect(() => {
    if (contentId && type) {
      applyTheme(contentId, type);
    }
    return () => resetTheme();
  }, [contentId, type, applyTheme, resetTheme]);

  // Listen for player progress messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from trusted domains
      const trustedDomains = ['vidfast.pro', 'vidzy.luna.tattoo', '2embed.cc'];
      const origin = new URL(event.origin);
      
      if (!trustedDomains.some(domain => origin.hostname.includes(domain))) {
        return;
      }

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        
        if (data.timestamp !== undefined && data.duration !== undefined) {
          const progressSeconds = Math.floor(data.timestamp);
          const totalSeconds = Math.floor(data.duration);
          
          setCurrentTime(progressSeconds);
          setDuration(totalSeconds);
          
          // Save progress every 10 seconds
          if (progressSeconds % 10 === 0 && totalSeconds > 0) {
            saveProgress(progressSeconds, totalSeconds);
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [saveProgress]);

  // Memoize player URL with saved progress
  const playerUrl = useMemo(() => {
    let url = "";
    if (player === "vidfast") {
      if (type === "movie") {
        const startTime = progress?.progressSeconds ? `?progress=${Math.floor(progress.progressSeconds)}` : "";
        const separator = startTime ? "&" : "?";
        url = `https://vidfast.pro/movie/${id}${startTime}${separator}color=8B5CF6&overlay=true`;
      } else if (type === "tv" && tvDetails) {
        const startTime = progress?.progressSeconds ? `?progress=${Math.floor(progress.progressSeconds)}&` : "?";
        url = `https://vidfast.pro/tv/${id}/${selectedSeason}/${selectedEpisode}${startTime}nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=8B5CF6&overlay=true`;
      }
    } else if (player === "vidzy") {
      if (type === "movie") {
        url = `https://vidzy.luna.tattoo/embed/movie/${id}?color=8B5CF6&autoplay=false&muted=false`;
      } else if (type === "tv") {
        url = `https://vidzy.luna.tattoo/embed/tv/${id}/${selectedSeason}/${selectedEpisode}?color=8B5CF6&autoplay=false&muted=false`;
      }
    } else if (player === "2embed") {
      if (type === "movie") {
        url = `https://www.2embed.cc/embed/${id}`;
      } else if (type === "tv") {
        url = `https://www.2embed.cc/embedtv/${id}&s=${selectedSeason}&e=${selectedEpisode}`;
      }
    }
    return url;
  }, [player, type, id, selectedSeason, selectedEpisode, progress?.progressSeconds, tvDetails]);

  // Fetch initial data
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

  // Fetch season data
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

  // Reset player loading
  useEffect(() => {
    setPlayerLoading(true);
    const timeout = setTimeout(() => setPlayerLoading(false), 10000);
    return () => clearTimeout(timeout);
  }, [player, selectedSeason, selectedEpisode]);

  // Check if should show skip buttons
  useEffect(() => {
    if (!timestamps) return;

    // Check intro
    if (timestamps.introStart !== null && timestamps.introEnd !== null) {
      const inIntro = currentTime >= timestamps.introStart && currentTime <= timestamps.introEnd;
      setShowSkipIntro(inIntro);
    }

    // Check outro
    if (timestamps.outroStart !== null && timestamps.outroEnd !== null) {
      const inOutro = currentTime >= timestamps.outroStart && currentTime <= timestamps.outroEnd;
      setShowSkipOutro(inOutro);
    }
  }, [currentTime, timestamps]);

  // Add to watch history when video starts playing - now works for both authenticated and guest users
  useEffect(() => {
    if (currentTime > 30 && duration > 0) {
      const details = type === "movie" ? movieDetails : tvDetails;
      if (details) {
        const title = type === "movie" ? movieDetails?.title : tvDetails?.name;
        if (title) {
          addToHistory(title, details.poster_path, currentTime, duration);
        }
      }
    }
  }, [currentTime, duration, type, movieDetails, tvDetails, addToHistory]);

  // Fallback: Add to watch history after 30 seconds - now works for both authenticated and guest users
  useEffect(() => {
    const timer = setTimeout(() => {
      const details = type === "movie" ? movieDetails : tvDetails;
      if (details) {
        const title = type === "movie" ? movieDetails?.title : tvDetails?.name;
        if (title) {
          // Add to history with estimated values since player might not send updates
          addToHistory(title, details.poster_path, 35, duration || 7200);
          console.log("Watch history added (fallback timer):", title);
        }
      }
    }, 32000); // 32 seconds to ensure it's past the 30-second mark

    return () => clearTimeout(timer);
  }, [type, movieDetails, tvDetails, addToHistory, duration]);

  const handleSkipIntro = () => {
    if (timestamps?.introEnd) {
      // Send message to iframe to skip
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { action: "seek", time: timestamps.introEnd },
          "*"
        );
      }
      setShowSkipIntro(false);
    }
  };

  const handleSkipOutro = () => {
    if (timestamps?.outroEnd) {
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { action: "seek", time: timestamps.outroEnd },
          "*"
        );
      }
      setShowSkipOutro(false);
    }
  };

  const details = type === "movie" ? movieDetails : tvDetails;
  const title = movieDetails?.title || tvDetails?.name || "Loading...";
  const overview = details?.overview || "";
  const rating = details?.vote_average || 0;
  const cast = details?.credits?.cast.slice(0, 6) || [];
  const genres = details?.genres || [];

  const bookmarkData: Bookmark | null = details ? {
    id,
    type,
    title,
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    overview,
    vote_average: rating,
    release_date: type === "movie" ? movieDetails?.release_date : undefined,
    first_air_date: type === "tv" ? tvDetails?.first_air_date : undefined,
    genre_ids: genres.map(g => g.id),
    addedAt: Date.now(),
  } : null;

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
              <SelectItem value="2embed">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>2Embed</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-background/70 backdrop-blur border border-border/50 overflow-hidden relative">
          <div 
            className="relative w-full" 
            style={{ paddingBottom: "56.25%" }}
          >
            {/* Loading Overlay */}
            {playerLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                  <span className="text-sm text-muted-foreground">Loading player...</span>
                </div>
              </div>
            )}

            {/* Skip Intro Button */}
            <AnimatePresence>
              {showSkipIntro && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-6 z-30"
                >
                  <Button
                    onClick={handleSkipIntro}
                    className="bg-violet-600 hover:bg-violet-500 shadow-[0_0_18px_2px_rgba(139,92,246,0.45)] gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip Intro
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skip Outro Button */}
            <AnimatePresence>
              {showSkipOutro && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-6 z-30"
                >
                  <Button
                    onClick={handleSkipOutro}
                    className="bg-sky-600 hover:bg-sky-500 shadow-[0_0_18px_2px_rgba(56,189,248,0.45)] gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip Outro
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <iframe
              key={type === "tv" ? `${player}-tv-${id}-${selectedSeason}-${selectedEpisode}` : `${player}-movie-${id}`}
              src={playerUrl}
              className="absolute top-0 left-0 w-full h-full"
              title={`${title} - Video Player`}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
              referrerPolicy="no-referrer"
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
          </div>
        </Card>

        {/* TV Show Episode Selector */}
        {type === "tv" && tvDetails && seasonData && (
          <Card className="mt-4 bg-background/70 backdrop-blur border border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

              {/* Episode Thumbnails */}
              <EpisodeThumbnails
                seasonData={seasonData}
                selectedEpisode={selectedEpisode}
                onEpisodeSelect={setSelectedEpisode}
              />
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
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
                {bookmarkData && <BookmarkButton content={bookmarkData} variant="outline" size="default" />}
              </div>
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
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40 card-hover-glow">
                    <Image
                      src={getImageUrl(item.poster_path, "w342")}
                      alt={recTitle}
                      fill
                      className="object-cover parallax-scale"
                    />
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