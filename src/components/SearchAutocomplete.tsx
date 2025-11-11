"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Film, Tv, Sparkles, Tag, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { searchMulti, getImageUrl } from "@/lib/tmdb";
import { generateSuggestions, groupSuggestions, SearchSuggestion } from "@/lib/search-utils";

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
}

export function SearchAutocomplete({ onSearch }: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSuggestions() {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const results = await searchMulti(query);
        const filtered = results.filter(r => r.media_type === "movie" || r.media_type === "tv");
        const generated = generateSuggestions(filtered, query);
        setSuggestions(generated);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search failed:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.title);
    }
  };

  const grouped = groupSuggestions(suggestions);
  const categoryOrder = ["Movie", "TV Show", "Anime", "Genre", "Year"];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Movie": return <Film className="h-4 w-4" />;
      case "TV Show": return <Tv className="h-4 w-4" />;
      case "Anime": return <Sparkles className="h-4 w-4" />;
      case "Genre": return <Tag className="h-4 w-4" />;
      case "Year": return <Calendar className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Card className="bg-background/70 backdrop-blur border border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search movies, TV shows, anime, genres..."
              className="bg-background/60"
            />
          </div>
        </CardContent>
      </Card>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[70vh] overflow-y-auto bg-background/95 backdrop-blur border border-border/50 shadow-2xl">
          <CardContent className="p-0">
            {categoryOrder.map(category => {
              const items = grouped[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category}>
                  <div className="sticky top-0 bg-background/95 backdrop-blur px-4 py-2 border-b border-border/40 flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {category}
                    </span>
                  </div>
                  
                  <div className="py-2">
                    {items.slice(0, 5).map((suggestion) => (
                      <Link
                        key={`${suggestion.type}-${suggestion.id}`}
                        href={
                          suggestion.type === "genre" 
                            ? `/?genre=${suggestion.id}`
                            : suggestion.type === "year"
                            ? `/?year=${suggestion.id}`
                            : `/watch/${suggestion.type}/${suggestion.id}`
                        }
                        onClick={() => handleSelect(suggestion)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-secondary/40 transition-colors"
                      >
                        {suggestion.metadata?.poster_path && (
                          <div className="relative h-12 w-8 flex-shrink-0 overflow-hidden rounded border border-border/40">
                            <Image
                              src={getImageUrl(suggestion.metadata.poster_path, "w185")}
                              alt={suggestion.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{suggestion.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {suggestion.metadata?.year && <span>{suggestion.metadata.year}</span>}
                            {suggestion.metadata?.rating && (
                              <>
                                {suggestion.metadata.year && <span>•</span>}
                                <span>⭐ {suggestion.metadata.rating.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {loading && showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-background/95 backdrop-blur border border-border/50">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Searching...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
