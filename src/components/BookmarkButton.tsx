"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";
import { isBookmarked, addBookmark, removeBookmark, Bookmark as BookmarkType } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  content: BookmarkType;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({ content, variant = "outline", size = "default" }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarked(isBookmarked(content.type, content.id));
  }, [content.type, content.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarked) {
      removeBookmark(content.type, content.id);
      setBookmarked(false);
    } else {
      addBookmark(content);
      setBookmarked(true);
    }
  };

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled>
        <Bookmark className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">Bookmark</span>}
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleToggle}
      className={bookmarked ? "border-violet-500 text-violet-400" : ""}
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">Bookmarked</span>}
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">Bookmark</span>}
        </>
      )}
    </Button>
  );
}
