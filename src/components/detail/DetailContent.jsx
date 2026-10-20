import { animeTitle } from "../../api/anilist.js";
import "./DetailContent.css";

function validExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function DetailField({ label, value, wide = false, href = "" }) {
  if (value === null || value === undefined || value === "") return null;
  const safeHref = href ? validExternalUrl(href) : "";
  return (
    <div data-wide={wide ? "" : undefined}>
      <span>{label.toUpperCase()}</span>
      {safeHref
        ? <a href={safeHref} target="_blank" rel="noopener noreferrer">{value}</a>
        : <strong>{value}</strong>}
    </div>
  );
}

function AnimeFacts({ item }) {
  const studios = item.studios?.nodes?.map((studio) => studio.name) || [];
  return (
    <div className="detail-facts">
      <div><span>GENRE</span><strong>{(item.genres || []).join(" · ") || "Not listed"}</strong></div>
      <div><span>RELEASED</span><strong>{item.seasonYear || item.startDate?.year || "Not listed"}</strong></div>
      <div><span>STUDIO</span><strong>{studios.join(" · ") || "Not listed"}</strong></div>
      <div><span>EPISODES</span><strong>{item.episodes ? `${item.episodes} episodes` : "Unknown"}</strong></div>
    </div>
  );
}

function AnimeExtras({ item }) {
  const studios = item.studios?.nodes?.map((studio) => studio.name) || [];
  const releaseDate = [item.startDate?.year, item.startDate?.month, item.startDate?.day].filter(Boolean).join("-");
  const endDate = [item.endDate?.year, item.endDate?.month, item.endDate?.day].filter(Boolean).join("-");
  const trailerUrl = item.trailer?.site?.toLowerCase() === "youtube" && item.trailer.id
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(item.trailer.id)}`
    : "";
  const rated = item.rankings?.find((ranking) => ranking.type === "RATED");
  const popular = item.rankings?.find((ranking) => ranking.type === "POPULAR");
  return (
    <div className="anime-extra" id="anime-extra">
      <DetailField label="Japanese title" value={item.title?.native} />
      <DetailField label="Format" value={item.format?.replaceAll("_", " ")} />
      <DetailField label="Status" value={item.status?.replaceAll("_", " ")} />
      <DetailField label="Release date" value={releaseDate} />
      <DetailField label="End date" value={endDate} />
      <DetailField label="Season" value={item.season && item.seasonYear ? `${item.season.charAt(0)}${item.season.slice(1).toLowerCase()} ${item.seasonYear}` : ""} />
      <DetailField label="Source" value={item.source?.replaceAll("_", " ")} />
      <DetailField label="Tags" value={(item.tags || []).map((tag) => tag.name).join(" · ")} wide />
      <DetailField label="Episode duration" value={item.duration ? `${item.duration} minutes` : ""} />
      <DetailField label="Country of origin" value={item.countryOfOrigin} />
      <DetailField label="Mean score" value={item.meanScore ? `${(item.meanScore / 10).toFixed(1)} / 10` : ""} />
      <DetailField label="Popularity" value={item.popularity?.toLocaleString()} />
      <DetailField label="Favorites" value={item.favourites?.toLocaleString()} />
      <DetailField label="Studios" value={studios.join(" · ")} />
      <DetailField label="AniList page" value="Open anime on AniList ↗" href={item.siteUrl} />
      <DetailField label="Trailer" value="Watch trailer ↗" href={trailerUrl} />
      <DetailField label="Rank" value={rated ? `#${rated.rank} ${rated.context}` : ""} />
      <DetailField label="Popularity ranking" value={popular ? `#${popular.rank} ${popular.context}` : ""} />
    </div>
  );
}

function Recommendations({ item }) {
  const items = (item.recommendations?.nodes || [])
    .map((recommendation) => recommendation.mediaRecommendation)
    .filter((media) => media && media.id !== item.id)
    .slice(0, 8);
  return (
    <section className="related-section" aria-labelledby="related-title">
      <div className="row-heading"><h2 id="related-title">More to discover</h2></div>
      <div className="related-grid" id="related-movies">
        {items.length ? items.map((media) => (
          <a key={media.id} className="related-card" href={`detail.html?anilist=${encodeURIComponent(media.id)}`}>
            {media.coverImage?.large && <img src={media.coverImage.large} alt={`Cover of ${animeTitle(media)}`} loading="lazy" />}
            <span><strong>{animeTitle(media)}</strong><small>{(media.genres || []).join(" · ") || "Anime recommendation from AniList"}</small></span>
          </a>
        )) : "No AniList recommendations are available for this anime."}
      </div>
    </section>
  );
}

export default function DetailContent({ item }) {
  return (
    <section className="detail-lower">
      <AnimeFacts item={item} />
      <AnimeExtras item={item} />
      <section className="episodes-section" aria-labelledby="episodes-title" hidden>
        <div className="row-heading">
          <div><p className="section-kicker">CHOOSE YOUR NEXT EPISODE</p><h2 id="episodes-title">Episodes</h2></div>
          <label className="season-select-label" htmlFor="season-select">SEASON <select id="season-select" /></label>
        </div>
        <div className="episode-grid" id="episode-list" />
      </section>
      <Recommendations item={item} />
    </section>
  );
}
