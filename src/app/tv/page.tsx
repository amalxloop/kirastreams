"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tv } from "lucide-react";
import { getPopular, getTopRated, getTVByGenre, getImageUrl, TMDBMovie, TMDB_GENRES } from "@/lib/tmdb";

export default function TVPage() {
  const [shows, setShows] = useState<TMDBMovie[]>([]);
  const [filter, setFilter] = useState<"popular" | "top_rated">("popular");
  const [selectedGenre, setSelectedGenre] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShows() {
      setLoading(true);
      try {
        let data: TMDBMovie[];
        if (selectedGenre !== "all") {
          data = await getTVByGenre(selectedGenre);
        } else {
          data = filter === "top_rated" ? await getTopRated("tv") : await getPopular("tv");
        }
        setShows(data);
      } catch (error) {
        console.error("Failed to fetch TV shows:", error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeout = setTimeout(fetchShows, 100);
    return () => clearTimeout(timeout);
  }, [filter, selectedGenre]);

  const memoizedShows = useMemo(() => shows, [shows]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(124,58,237,0.25),transparent),radial-gradient(1200px_600px_at_80%_10%,rgba(59,130,246,0.2),transparent)]">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-md overflow-hidden shadow-[0_0_24px_2px_rgba(167,139,250,0.45)]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"
                alt="KiraStreams Logo"
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <span className="text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300">
              KiraStreams
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/movies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Movies
            </Link>
            <Link href="/tv" className="text-sm text-foreground font-medium">
              TV Shows
            </Link>
          </nav>
          <div className="w-20" />
        </div>
      </header>

      {/* Page Header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Tv className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">TV Shows</h1>
            <p className="text-sm text-muted-foreground">Explore popular series and episodes</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-background/70 backdrop-blur border border-border/50 mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="top_rated">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">Genre</label>
                <Select value={String(selectedGenre)} onValueChange={(v) => setSelectedGenre(v === "all" ? "all" : Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {TMDB_GENRES.tv.map((genre) => (
                      <SelectItem key={genre.id} value={String(genre.id)}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TV Shows Grid */}
        {loading && <p className="text-sm text-muted-foreground">Loading TV shows...</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {memoizedShows.map((show) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Link href={`/watch/tv/${show.id}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40">
                  <Image
                    src={getImageUrl(show.poster_path, "w500")}
                    alt={show.name || "TV Show"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-violet-500/0 group-hover:ring-violet-500/40 transition-all duration-300" />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-black/70 backdrop-blur">
                    ⭐ {show.vote_average.toFixed(1)}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium line-clamp-1">{show.name}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{show.first_air_date?.split("-")[0] || "N/A"}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} KiraStreams • Powered by TMDB</p>
        </div>
      </footer>
    </div>
  );
}