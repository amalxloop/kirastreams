"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogIn, Search, UserPlus, Film, Tv, TrendingUp, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTrending, getPopular, TMDBMovie, getImageUrl, getAnime } from "@/lib/tmdb";
import { ContinueWatching } from "@/components/ContinueWatching";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { DynamicHeroBanner } from "@/components/DynamicHeroBanner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "anime">("all");
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [tvShows, setTVShows] = useState<TMDBMovie[]>([]);
  const [anime, setAnime] = useState<TMDBMovie[]>([]);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      try {
        const [trendingData, moviesData, tvData, animeData] = await Promise.all([
          getTrending("all", "week"),
          getPopular("movie"),
          getPopular("tv"),
          getAnime(),
        ]);
        setTrending(trendingData.slice(0, 10));
        setMovies(moviesData);
        setTVShows(tvData);
        setAnime(animeData);
      } catch (error) {
        console.error("Failed to fetch TMDB data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const { searchMulti } = await import("@/lib/tmdb");
        const results = await searchMulti(query);
        setSearchResults(results.filter((r) => r.media_type === "movie" || r.media_type === "tv"));
      } catch (error) {
        console.error("Search failed:", error);
      }
    }
    const debounce = setTimeout(performSearch, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const displayContent = useMemo(() => {
    return query.trim() ? searchResults : activeTab === "all" ? trending : activeTab === "movie" ? movies : activeTab === "tv" ? tvShows : anime;
  }, [query, searchResults, activeTab, trending, movies, tvShows, anime]);

  return (
    <>
      {/* SEO-optimized hidden content for search engines */}
      <div className="sr-only">
        <h1>KiraStreams - Free Online Movies and TV Shows Streaming Website</h1>
        <p>Watch free online movies and TV shows on KiraStreams, the best ad-free streaming platform. Stream unlimited HD movies and series without subscription. Enjoy free streaming of thousands of movies and TV shows online.</p>
        <h2>Free Streaming Website Features</h2>
        <ul>
          <li>Ad-free streaming experience</li>
          <li>Unlimited free online movies</li>
          <li>HD quality TV shows streaming</li>
          <li>No subscription required</li>
          <li>Watch movies online free instantly</li>
          <li>Free entertainment streaming platform</li>
        </ul>
      </div>
      
      <main className="min-h-screen bg-[radial-gradient(800px_400px_at_20%_-10%,rgba(124,58,237,0.25),transparent),radial-gradient(800px_400px_at_80%_10%,rgba(59,130,246,0.2),transparent)]">
        {/* Nav */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="KiraStreams - Free Streaming Home">
              <div className="relative h-8 w-8 rounded-md overflow-hidden shadow-[0_0_24px_2px_rgba(167,139,250,0.45)]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?"
                  alt="KiraStreams Logo - Free Streaming Platform"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300">KiraStreams</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <Link href="/movies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Movies
              </Link>
              <Link href="/tv" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                TV Shows
              </Link>
              <Link href="/#anime" onClick={(e) => { e.preventDefault(); setActiveTab("anime"); }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Anime
              </Link>
            </nav>
            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              {!user ? (
                <AuthButtons />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 ring-2 ring-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.6)] cursor-pointer">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name?.slice(0,2).toUpperCase() || "KS"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Hero Banner with Auto-scroll */}
        {!query.trim() && trending.length > 0 && (
          <div className="pt-16">
            <DynamicHeroBanner items={trending.slice(0, 5)} autoScrollInterval={5000} />
          </div>
        )}

        {/* Search Bar with Autocomplete */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 pt-20" aria-label="Search movies and TV shows">
          <SearchAutocomplete onSearch={setQuery} />
        </section>

        {/* Continue Watching Section */}
        {!query.trim() && <ContinueWatching />}

        {/* Smart Recommendations */}
        {!query.trim() && <RecommendationsSection />}

        {/* Tabs & Content Grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" aria-label="Browse content">
          {!query.trim() && (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                {activeTab === "all" && "Trending This Week"}
                {activeTab === "movie" && "Popular Movies"}
                {activeTab === "tv" && "Popular TV Shows"}
                {activeTab === "anime" && "Popular Anime"}
              </h2>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                  <TabsTrigger value="all" className="flex items-center justify-center gap-1.5 px-1 sm:px-3 text-[11px] sm:text-sm">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline-block" aria-hidden="true" />
                    <span>Trending</span>
                  </TabsTrigger>
                  <TabsTrigger value="movie" className="flex items-center justify-center gap-1.5 px-1 sm:px-3 text-[11px] sm:text-sm">
                    <Film className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline-block" aria-hidden="true" />
                    <span>Movies</span>
                  </TabsTrigger>
                  <TabsTrigger value="tv" className="flex items-center justify-center gap-1.5 px-1 sm:px-3 text-[11px] sm:text-sm">
                    <Tv className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline-block" aria-hidden="true" />
                    <span>TV Shows</span>
                  </TabsTrigger>
                  <TabsTrigger value="anime" className="flex items-center justify-center gap-1.5 px-1 sm:px-3 text-[11px] sm:text-sm">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:inline-block" aria-hidden="true" />
                    <span>Anime</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </>
          )}

          {query.trim() && (
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Search Results for "{query}"
            </h2>
          )}

          {loading && <p className="text-sm text-muted-foreground">Loading content...</p>}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayContent.map((item) => {
              const title = item.title || item.name || "Unknown";
              const mediaType = item.media_type || (activeTab === "tv" || activeTab === "anime" ? "tv" : "movie");
              const year = item.release_date?.split("-")[0] || item.first_air_date?.split("-")[0] || "N/A";
              
              return (
                <motion.div 
                  key={`${mediaType}-${item.id}`} 
                  initial={{ opacity: 0, y: 10 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true, margin: "100px" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Link href={`/watch/${mediaType}/${item.id}`} className="group block">
                    <article className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border/40 card-hover-glow">
                      <Image
                        src={getImageUrl(item.poster_path, "w500")}
                        alt={`Watch ${title} free online - ${mediaType} ${year}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover parallax-scale"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-black/70 backdrop-blur">
                        ⭐ {item.vote_average.toFixed(1)}
                      </div>
                    </article>
                    <div className="mt-2">
                      <p className="text-sm font-medium line-clamp-1">{title}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{year}</span>
                        <span className="capitalize">{activeTab === "anime" ? "anime" : mediaType}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {displayContent.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">No results found.</p>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-10 mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} KiraStreams - Free Online Movies & TV Shows Streaming</p>
            <p className="text-xs text-muted-foreground">Ad-Free Streaming • Powered by TMDB • Built with Next.js</p>
          </div>
        </footer>
      </main>
    </>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-violet-300 hover:text-violet-200 text-xs sm:text-sm px-2 sm:px-4">
            <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Log in</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome back</DialogTitle>
          </DialogHeader>
          <AuthForm mode="login" />
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-sky-600 hover:bg-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.35)] text-xs sm:text-sm px-2 sm:px-4">
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Sign up</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your account</DialogTitle>
          </DialogHeader>
          <AuthForm mode="signup" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "login") await login(email, password);
    else await signup(email, password, name);
  }
  return (
    <form className="grid gap-3" onSubmit={onSubmit}>
      <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="bg-background/60" required />
      <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="bg-background/60" required />
      {mode === "signup" && (
        <Input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Display name" className="bg-background/60" />
      )}
      <Button type="submit" className="mt-1 bg-violet-600 hover:bg-violet-500">{mode === "login" ? "Log in" : "Create account"}</Button>
      <p className="text-xs text-muted-foreground">Demo auth for UI preview</p>
    </form>
  );
}