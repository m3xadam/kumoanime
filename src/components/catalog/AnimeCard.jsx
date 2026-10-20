import { useEffect, useState } from "react";
import { animeTitle } from "../../api/anilist.js";
import "./AnimeCard.css";

function formatCountdown(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remaining = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function useNextEpisodeText(item) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!item.nextAiringEpisode?.airingAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [item.nextAiringEpisode?.airingAt]);

  const episode = Number(item.nextAiringEpisode?.episode);
  if (!Number.isFinite(episode)) return "";
  const total = Number(item.episodes);
  const airingAt = Number(item.nextAiringEpisode?.airingAt);
  const remaining = Number.isFinite(airingAt)
    ? Math.max(0, airingAt - Math.floor(now / 1000))
    : Number(item.nextAiringEpisode?.timeUntilAiring) || 0;
  const label = total > 0 ? `Next ep ${episode}/${total}` : `Next ep ${episode}`;
  return remaining > 0 ? `${label} · ${formatCountdown(remaining)}` : label;
}

export default function AnimeCard({ item, compact = false }) {
  const title = animeTitle(item);
  const genres = item.genres || [];
  const imageUrl = item.coverImage?.extraLarge || item.coverImage?.large;
  const nextEpisode = useNextEpisodeText(item);
  const year = item.seasonYear || item.startDate?.year || "Year unknown";

  return (
    <a className={compact ? "movie-card" : "anilist-card"} href={`detail.html?anilist=${encodeURIComponent(item.id)}`} aria-label={`View ${title} details`} data-anilist-id={item.id}>
      <div className={compact ? "poster-wrap" : "anilist-poster"}>
        {imageUrl && <img alt={`Cover of ${title}`} loading="lazy" src={imageUrl} />}
        <span className={compact ? "poster-rating" : "anilist-score"}>{item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated"}</span>
        {nextEpisode && <span className={compact ? "card-next-episode" : "anilist-next-episode"}>{nextEpisode}</span>}
      </div>
      <div className={compact ? "card-info" : "anilist-card-info"}>
        <h3 className={compact ? "card-title" : undefined}>{title}</h3>
        <p className={compact ? "card-meta" : "anilist-card-meta"}>{[year, item.format, item.episodes ? `${item.episodes} eps` : "Episode count unknown"].filter(Boolean).join(" · ")}</p>
        <p className={compact ? "card-meta" : "anilist-card-genres"}>{genres.length ? genres.join(" · ") : "Genres unavailable"}</p>
        {!compact && <p className="anilist-card-synopsis">{item.description || "No synopsis is available for this anime."}</p>}
      </div>
    </a>
  );
}
