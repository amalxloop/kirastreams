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
import { LogIn, Search, UserPlus, Film, Tv, TrendingUp, Sparkles, Twitter, Facebook, Instagram, MessageCircle, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import { getTrending, getPopular, TMDBMovie, getImageUrl, getAnime } from "@/lib/tmdb";
import { ContinueWatching } from "@/components/ContinueWatching";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { DynamicHeroBanner } from "@/components/DynamicHeroBanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WatchHistoryTimeline } from "@/components/WatchHistoryTimeline";
import { getCurrentUserId } from "@/lib/guestUser";

interface PlatformSettings {
  platformName: string;
  logoUrl: string | null;
  primaryColor: string;
  theme: string;
  siteTagline: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  faviconUrl: string | null;
  bannerMessage: string | null;
  bannerEnabled: boolean;
  contactEmail: string | null;
  twitterUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  discordUrl: string | null;
  footerText: string | null;
  enableRegistration: boolean;
  maintenanceMode: boolean;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const userId = getCurrentUserId(user?.id);
  
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "anime">("all");
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [tvShows, setTVShows] = useState<TMDBMovie[]>([]);
  const [anime, setAnime] = useState<TMDBMovie[]>([]);
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: "KiraStreams",
    logoUrl: null,
    primaryColor: "#8b5cf6",
    theme: "dark",
    siteTagline: null,
    seoDescription: null,
    seoKeywords: null,
    faviconUrl: null,
    bannerMessage: null,
    bannerEnabled: false,
    contactEmail: null,
    twitterUrl: null,
    facebookUrl: null,
    instagramUrl: null,
    discordUrl: null,
    footerText: null,
    enableRegistration: true,
    maintenanceMode: false,
  });

  // Fetch platform settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          document.documentElement.style.setProperty('--brand-primary', data.primaryColor);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    }
    fetchSettings();
  }, []);

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

  const logoUrl = settings.logoUrl || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/14c46311-1b67-41f4-8d9e-468e17cd22a3/generated_images/minimalist-letter-k-logo-for-streaming-p-7230a0f4-20250930063641.jpg?";

  const seoDescription = settings.seoDescription || `Watch free online movies and TV shows on ${settings.platformName}, the best ad-free streaming platform. Stream unlimited HD movies and series without subscription. Enjoy free streaming of thousands of movies and TV shows online.`;
  const seoKeywords = settings.seoKeywords || "free online movies, free streaming website, ad free streaming, watch movies online free, free tv shows streaming";

  return (
    <>
      {/* SEO-optimized hidden content */}
      <div className="sr-only">
        <h1>{settings.platformName} - Free Online Movies and TV Shows Streaming Website</h1>
        <p>{seoDescription}</p>
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
        {/* Announcement Banner */}
        {settings.bannerEnabled && settings.bannerMessage && !bannerDismissed && (
          <div className="bg-gradient-to-r from-violet-600 to-sky-600 text-white py-3 px-4 relative">
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
              <p className="text-sm sm:text-base text-center flex-1">{settings.bannerMessage}</p>
              <button 
                onClick={() => setBannerDismissed(true)}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Nav */}
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 h-14 sm:h-16 lg:h-20 flex items-center justify-between gap-1.5 sm:gap-3">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0" aria-label={`${settings.platformName} - Free Streaming Home`}>
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 shrink-0 rounded-md overflow-hidden shadow-[0_0_24px_2px_rgba(167,139,250,0.45)]">
                <Image
                  src={logoUrl}
                  alt={`${settings.platformName} Logo - Free Streaming Platform`}
                  fill
                  sizes="(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 truncate">
                  {settings.platformName}
                </span>
                {settings.siteTagline && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground hidden lg:block truncate">{settings.siteTagline}</span>
                )}
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 shrink-0" aria-label="Main navigation">
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
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              <ThemeToggle />
              {!user ? (
                <AuthButtons enableRegistration={settings.enableRegistration} />
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.6)] cursor-pointer shrink-0">
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

        {/* Dynamic Hero Banner */}
        {!query.trim() && trending.length > 0 && (
          <div>
            <DynamicHeroBanner items={trending.slice(0, 5)} autoScrollInterval={5000} />
          </div>
        )}

        {/* Search Bar */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 pt-8" aria-label="Search movies and TV shows">
          <SearchAutocomplete onSearch={setQuery} />
        </section>

        {/* Continue Watching Section */}
        {!query.trim() && <ContinueWatching userId={userId} />}

        {/* Smart Recommendations */}
        {!query.trim() && <RecommendationsSection />}

        {/* Watch History Timeline */}
        {!query.trim() && <WatchHistoryTimeline userId={userId} days={7} limit={20} />}

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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Social Links */}
            {(settings.twitterUrl || settings.facebookUrl || settings.instagramUrl || settings.discordUrl) && (
              <div className="flex justify-center gap-6 mb-6">
                {settings.twitterUrl && (
                  <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {settings.discordUrl && (
                  <a href={settings.discordUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Discord">
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                {settings.footerText || `© ${new Date().getFullYear()} ${settings.platformName} - Free Online Movies & TV Shows Streaming`}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                {settings.contactEmail && (
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                )}
                <span className="hidden sm:inline">•</span>
                <span>Ad-Free Streaming</span>
                <span className="hidden sm:inline">•</span>
                <span>Powered by TMDB</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}

function AuthButtons({ enableRegistration }: { enableRegistration: boolean }) {
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
      {enableRegistration && (
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
      )}
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