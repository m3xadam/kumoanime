import AnimeCard from "./AnimeCard.jsx";
import "./CatalogSection.css";

export default function CatalogSection({ items, status, count, error, hasNextPage, loading, onRetry, onLoadMore }) {
  return (
    <section className="anilist-catalog content-section" id="anime-catalog" aria-labelledby="anilist-title">
      <div className="row-heading">
        <div><p className="section-kicker">POWERED BY ANILIST</p><h2 id="anilist-title">All anime</h2></div>
        <p className="anilist-count" id="anilist-count">{count}</p>
      </div>
      <p className={`anilist-status${error ? " is-error" : ""}`} id="anilist-status" role="status" aria-live="polite">{status}</p>
      <div className="anilist-grid" id="anilist-grid">{items.map((item) => <AnimeCard key={item.id} item={item} />)}</div>
      <div className="anilist-pagination">
        {error && <button className="button button-secondary" id="anilist-retry" type="button" onClick={onRetry}>Retry</button>}
        {hasNextPage && <button className="button button-secondary" id="anilist-load-more" type="button" disabled={loading} onClick={onLoadMore}>{loading ? "Loading…" : "Load more anime"}</button>}
      </div>
    </section>
  );
}
