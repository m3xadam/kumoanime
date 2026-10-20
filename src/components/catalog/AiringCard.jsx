import { animeTitle } from "../../api/anilist.js";
import "./AiringCard.css";

function formatReleaseTime(airingAt) {
  const releasedAt = airingAt * 1000;
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - releasedAt) / 60000));
  if (elapsedMinutes < 60) return elapsedMinutes <= 5 ? "Just released" : `${elapsedMinutes} min ago`;
  if (elapsedMinutes < 1440) {
    const hours = Math.floor(elapsedMinutes / 60);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  return new Date(releasedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AiringCard({ schedule }) {
  const { media, episode, airingAt } = schedule;
  const title = animeTitle(media);
  const imageUrl = media.coverImage?.extraLarge || media.coverImage?.large;
  const episodeText = `Episode ${episode}`;
  const releasedAt = new Date(airingAt * 1000);
  const fullReleaseTime = releasedAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article className="latest-card">
      <a className="latest-card-link" href={`detail.html?anilist=${encodeURIComponent(media.id)}`} aria-label={`View ${title}, ${episodeText}`}>
        <div className="latest-poster">
          {imageUrl && <img alt={`Cover of ${title}`} loading="lazy" src={imageUrl} />}
          <span className="latest-upload-badge"><span className="live-dot" /> EP {episode}</span>
          <time className="latest-rating" dateTime={releasedAt.toISOString()} title={fullReleaseTime}>{formatReleaseTime(airingAt)}</time>
        </div>
        <div className="latest-card-info">
          <div className="latest-upload-date">{episodeText}</div>
          <h3>{title}</h3>
          <p>{[media.format?.replaceAll("_", " "), media.seasonYear || media.startDate?.year].filter(Boolean).join(" · ") || "Anime episode release"}</p>
          <span className="latest-open-link">View anime ↗</span>
        </div>
      </a>
    </article>
  );
}
