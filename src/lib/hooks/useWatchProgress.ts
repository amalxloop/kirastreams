import { useState, useEffect, useCallback } from "react";

interface WatchProgressData {
  id: number;
  userId: string;
  contentId: string;
  contentType: string;
  progressSeconds: number;
  totalSeconds: number;
  lastWatchedAt: number;
  createdAt: number;
  updatedAt: number;
}

export function useWatchProgress(userId: string | null, contentId: string, contentType: string) {
  const [progress, setProgress] = useState<WatchProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing progress
  useEffect(() => {
    async function fetchProgress() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/watch-progress?userId=${encodeURIComponent(userId)}&contentId=${encodeURIComponent(contentId)}&contentType=${encodeURIComponent(contentType)}`
        );

        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId, contentId, contentType]);

  // Save progress
  const saveProgress = useCallback(
    async (progressSeconds: number, totalSeconds: number) => {
      if (!userId) return;

      setSaving(true);
      try {
        const response = await fetch("/api/watch-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            contentId,
            contentType,
            progressSeconds: Math.floor(progressSeconds),
            totalSeconds: Math.floor(totalSeconds),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
      } finally {
        setSaving(false);
      }
    },
    [userId, contentId, contentType]
  );

  // Add to watch history
  const addToHistory = useCallback(
    async (title: string, posterPath: string | null, progressSeconds: number, totalSeconds: number) => {
      if (!userId) return;

      try {
        await fetch("/api/watch-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            contentId,
            contentType,
            title,
            posterPath,
            watchedAt: Math.floor(Date.now() / 1000),
            progressSeconds: Math.floor(progressSeconds),
            totalSeconds: Math.floor(totalSeconds),
          }),
        });
      } catch (error) {
        console.error("Failed to add to history:", error);
      }
    },
    [userId, contentId, contentType]
  );

  return {
    progress,
    loading,
    saving,
    saveProgress,
    addToHistory,
  };
}
