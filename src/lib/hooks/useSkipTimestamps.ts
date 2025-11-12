import { useState, useEffect } from "react";

interface SkipTimestamps {
  id: number;
  contentId: string;
  contentType: string;
  introStart: number | null;
  introEnd: number | null;
  outroStart: number | null;
  outroEnd: number | null;
  createdAt: number;
}

export function useSkipTimestamps(contentId: string, contentType: string) {
  const [timestamps, setTimestamps] = useState<SkipTimestamps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimestamps() {
      try {
        const response = await fetch(
          `/api/skip-timestamps?contentId=${encodeURIComponent(contentId)}&contentType=${encodeURIComponent(contentType)}`
        );

        if (response.ok) {
          const data = await response.json();
          setTimestamps(data);
        } else {
          setTimestamps(null);
        }
      } catch (error) {
        console.error("Failed to fetch skip timestamps:", error);
        setTimestamps(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTimestamps();
  }, [contentId, contentType]);

  return { timestamps, loading };
}
