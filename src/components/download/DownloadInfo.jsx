import "./DownloadInfo.css";

export default function DownloadInfo({ anime, error, animeId }) {
  const title = anime?.title?.english || anime?.title?.romaji || anime?.title?.native || "";
  const detailsUrl = animeId ? `detail.html?anilist=${encodeURIComponent(animeId)}` : "#";
  const metadata = anime ? [
    anime.seasonYear || anime.startDate?.year,
    anime.format?.replaceAll("_", " "),
    anime.episodes ? `${anime.episodes} episodes` : "Episode count unknown",
    (anime.genres || []).join(" · "),
    anime.averageScore ? `★ ${(anime.averageScore / 10).toFixed(1)}` : "Not rated",
  ].filter(Boolean).join(" · ") : error || (animeId ? "Loading anime information…" : "Select a show from the catalog to find authorized episode downloads.");

  return (
    <section className="watch-info">
      <div>
        <p className="section-kicker">AUTHORIZED DOWNLOADS</p>
        <h1 id="watch-title">{anime ? title : animeId ? "Loading anime…" : "Choose an anime"}</h1>
        <p id="watch-meta" className="watch-meta">{metadata}</p>
      </div>
      {animeId && <a className="button button-secondary" id="watch-details" href={detailsUrl}>Anime details</a>}
    </section>
  );
}
