interface VideoPlayerProps {
  type: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  color?: string;
  autoplay?: boolean;
  muted?: boolean;
}

export const VideoPlayer = ({
  type,
  tmdbId,
  season,
  episode,
  color = "fbc9ff",
  autoplay = false,
  muted = false,
}: VideoPlayerProps) => {
  // Build URL based on type
  let url = "";
  const queryParams = new URLSearchParams({
    color,
    autoplay: autoplay ? "true" : "false",
    muted: muted ? "true" : "false",
  });

  if (type === "movie") {
    url = `https://vidora.su/embed/movie/${tmdbId}?${queryParams.toString()}`;
  } else if (type === "tv") {
    if (!season || !episode) {
      console.error("VideoPlayer: Season and episode are required for TV shows");
      return (
        <div className="relative w-full bg-muted/20 rounded-xl flex items-center justify-center" style={{ paddingBottom: "56.25%" }}>
          <p className="absolute text-sm text-muted-foreground">Season and episode required for TV shows</p>
        </div>
      );
    }
    url = `https://vidora.su/embed/tv/${tmdbId}/${season}/${episode}?${queryParams.toString()}`;
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={url}
        className="absolute top-0 left-0 w-full h-full rounded-xl shadow-lg"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
      />
    </div>
  );
};