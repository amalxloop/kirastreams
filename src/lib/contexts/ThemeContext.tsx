"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ContentTheme {
  id: number;
  contentId: string;
  contentType: string;
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string | null;
  gradientTo: string | null;
  createdAt: number;
}

interface ThemeContextType {
  currentTheme: ContentTheme | null;
  applyTheme: (contentId: string, contentType: string) => Promise<void>;
  resetTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ContentTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const applyTheme = async (contentId: string, contentType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/content-themes?contentId=${encodeURIComponent(contentId)}&contentType=${encodeURIComponent(contentType)}`
      );

      if (response.ok) {
        const theme = await response.json();
        setCurrentTheme(theme);
        
        // Apply theme colors to CSS variables
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          root.style.setProperty("--theme-primary", theme.primaryColor);
          root.style.setProperty("--theme-secondary", theme.secondaryColor);
          root.style.setProperty("--theme-accent", theme.accentColor);
          
          if (theme.gradientFrom && theme.gradientTo) {
            root.style.setProperty("--theme-gradient-from", theme.gradientFrom);
            root.style.setProperty("--theme-gradient-to", theme.gradientTo);
          }
        }
      } else {
        // Theme not found, reset to default
        resetTheme();
      }
    } catch (error) {
      console.error("Failed to apply theme:", error);
      resetTheme();
    } finally {
      setIsLoading(false);
    }
  };

  const resetTheme = () => {
    setCurrentTheme(null);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.removeProperty("--theme-primary");
      root.style.removeProperty("--theme-secondary");
      root.style.removeProperty("--theme-accent");
      root.style.removeProperty("--theme-gradient-from");
      root.style.removeProperty("--theme-gradient-to");
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, applyTheme, resetTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useContentTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useContentTheme must be used within a ThemeProvider");
  }
  return context;
}
