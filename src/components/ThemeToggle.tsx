"use client";

import { useEffect, useState } from "react";
import { Moon, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";

type Theme = "dark" | "amoled" | "cyber";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("kira-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("dark", "amoled", "cyber");
    
    // Apply new theme
    root.classList.add(newTheme);
    
    // Always keep dark mode base
    if (newTheme !== "dark") {
      root.classList.add("dark");
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("kira-theme", newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === "amoled" ? (
            <Moon className="h-4 w-4" />
          ) : theme === "cyber" ? (
            <Zap className="h-4 w-4 text-purple-400" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => changeTheme("dark")}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600" />
            <span>Dark {theme === "dark" && "✓"}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("amoled")}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-black border border-slate-800" />
            <span>Pure Black (AMOLED) {theme === "amoled" && "✓"}</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeTheme("cyber")}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-900 to-fuchsia-900 border border-purple-500" />
            <span>Cyber Purple {theme === "cyber" && "✓"}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
