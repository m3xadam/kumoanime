import { useEffect, useRef, useState } from "react";
import { recentlyAiredEpisodes } from "../api/anilist.js";
import AiringCard from "../components/catalog/AiringCard.jsx";
import Footer from "../components/shared/Footer.jsx";
import SiteHeader from "../components/shared/SiteHeader.jsx";
import "./RecentPage.css";

const RELEASE_WINDOW_SECONDS = 7 * 24 * 60 * 60;
const PAGE_SIZE = 30;

function makeReleaseWindow() {
  const to = Math.floor(Date.now() / 1000);
  return { from: to - RELEASE_WINDOW_SECONDS, to };
}

function RecentIntro({ count, newestRelease }) {
  return (
    <section className="latest-intro">
      <p className="section-kicker">LATEST AIRINGS · VIA ANILIST</p>
      <h1>New episodes</h1>
      <p>See the latest anime episodes that have aired, newest releases first.</p>
      <div className="latest-summary">
        <span className="live-dot" />
        <span>{count ? `${count.toLocaleString()} releases in the last 7 days` : "Episodes released in the last 7 days"}</span>
      </div>
      {newestRelease && <p className="newest-release-note">Most recent release: {newestRelease}</p>}
    </section>
  );
}

function EpisodeListing({ items, status, error, loading, hasNextPage, onRetry, onLoadMore, onRefresh }) {
  return (
    <section className="latest-listing" aria-labelledby="latest-list-title">
      <div className="latest-listing-heading">
        <div>
          <h2 id="latest-list-title">Recently released</h2>
          <span className="latest-listing-note">SORTED NEWEST FIRST</span>
        </div>
        <button className="text-button refresh-episodes-button" type="button" onClick={onRefresh} disabled={loading}>
          {loading ? "Updating…" : "Refresh"}
        </button>
      </div>
      <p className={`anilist-status${error ? " is-error" : ""}`} id="latest-status" role="status" aria-live="polite">{status}</p>
      <div className="latest-grid" id="latest-grid" aria-live="polite">
        {items.map((schedule) => <AiringCard key={schedule.id} schedule={schedule} />)}
      </div>
      <div className="anilist-pagination">
        {error && <button className="button button-secondary" id="latest-retry" type="button" onClick={onRetry}>Retry</button>}
        {hasNextPage && <button className="button button-secondary" id="latest-load-more" type="button" disabled={loading} onClick={onLoadMore}>{loading ? "Loading…" : "Load more episodes"}</button>}
      </div>
    </section>
  );
}

export default function RecentPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("Checking AniList for recently released episodes…");
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [releaseWindow, setReleaseWindow] = useState(makeReleaseWindow);
  const [refreshCount, setRefreshCount] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;
    setItems([]);
    setTotal(0);
    setPage(1);
    setHasNextPage(false);
    setStatus("Checking AniList for recently released episodes…");
    setError(false);
    setLoading(true);

    recentlyAiredEpisodes({ page: 1, perPage: PAGE_SIZE, ...releaseWindow }).then((result) => {
      if (!active || currentRequest !== requestId.current) return;
      const episodes = result.data || [];
      setItems(episodes);
      setTotal(result.pagination.total || episodes.length);
      setHasNextPage(result.pagination.hasNextPage);
      setStatus(episodes.length
        ? `Showing the ${episodes.length} most recently released episodes.`
        : "No anime episode releases were found in the last 7 days.");
    }).catch((cause) => {
      if (!active || currentRequest !== requestId.current) return;
      setStatus(`Could not load recently released episodes from AniList. ${cause.message}`);
      setError(true);
      console.error("AniList recent episode schedule request failed:", cause);
    }).finally(() => {
      if (active && currentRequest === requestId.current) setLoading(false);
    });

    return () => { active = false; };
  }, [releaseWindow, refreshCount]);

  async function loadMore() {
    if (loading || !hasNextPage) return;
    const currentRequest = ++requestId.current;
    const nextPage = page + 1;
    setLoading(true);
    setError(false);
    setStatus("Loading more recent episode releases…");
    try {
      const result = await recentlyAiredEpisodes({
        page: nextPage,
        perPage: PAGE_SIZE,
        ...releaseWindow,
      });
      if (currentRequest !== requestId.current) return;
      const episodes = result.data || [];
      setItems((current) => [...current, ...episodes]);
      setPage(nextPage);
      setHasNextPage(result.pagination.hasNextPage);
      setTotal(result.pagination.total || items.length + episodes.length);
      setStatus(`Showing ${items.length + episodes.length} most recently released episodes.`);
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      setStatus(`Could not load more episodes from AniList. ${cause.message}`);
      setError(true);
      console.error("AniList recent episode pagination request failed:", cause);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  function refresh() {
    setReleaseWindow(makeReleaseWindow());
    setRefreshCount((count) => count + 1);
  }

  const newestRelease = items[0]
    ? new Date(items[0].airingAt * 1000).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    : "";

  return (
    <>
      <SiteHeader activePage="new-episodes" />
      <main className="latest-page">
        <RecentIntro count={total} newestRelease={newestRelease} />
        <EpisodeListing
          items={items}
          status={status}
          error={error}
          loading={loading}
          hasNextPage={hasNextPage}
          onRetry={refresh}
          onLoadMore={loadMore}
          onRefresh={refresh}
        />
      </main>
      <Footer />
    </>
  );
}
