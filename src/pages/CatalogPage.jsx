import Footer from "../components/shared/Footer.jsx";
import SiteHeader from "../components/shared/SiteHeader.jsx";
import BrowseSection from "../components/catalog/BrowseSection.jsx";
import CarouselSection from "../components/catalog/CarouselSection.jsx";
import CatalogSection from "../components/catalog/CatalogSection.jsx";
import HeroSection from "../components/catalog/HeroSection.jsx";
import SeasonSection from "../components/catalog/SeasonSection.jsx";
import { useEffect, useRef, useState } from "react";
import { animePage } from "../api/anilist.js";

export default function CatalogPage() {
  const [activePage, setActivePage] = useState(() => {
    if (window.location.hash === "#anime-catalog") return "discover";
    if (window.location.hash === "#series") return "series";
    return "home";
  });
  const [genre, setGenre] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading anime from AniList…");
  const [error, setError] = useState(false);
  const [count, setCount] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    function updateActivePage() {
      if (window.location.hash === "#anime-catalog") setActivePage("discover");
      else if (window.location.hash === "#series") setActivePage("series");
      else setActivePage("home");
    }
    window.addEventListener("hashchange", updateActivePage);
    return () => window.removeEventListener("hashchange", updateActivePage);
  }, []);

  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;
    setItems([]);
    setPage(1);
    setHasNextPage(false);
    setCount("");
    setError(false);
    setLoading(true);
    setStatus("Loading anime from AniList…");
    animePage({ page: 1, genre }).then((result) => {
      if (!active || currentRequest !== requestId.current) return;
      const anime = result.data || [];
      setItems(anime);
      setHasNextPage(result.pagination.hasNextPage);
      setCount(result.pagination.total ? `${result.pagination.total.toLocaleString()} results` : "");
      setStatus(anime.length
        ? `Showing ${anime.length.toLocaleString()} anime${result.pagination.hasNextPage ? ". Load more to continue browsing." : "."}`
        : "No anime matched. Try a different title or genre.");
      setError(false);
    }).catch((cause) => {
      if (!active || currentRequest !== requestId.current) return;
      setStatus(`${cause.message} The catalog uses AniList as its source and needs a working connection.`);
      setError(true);
      console.error("AniList catalog request failed:", cause);
    }).finally(() => {
      if (active && currentRequest === requestId.current) setLoading(false);
    });
    return () => { active = false; };
  }, [genre, retryCount]);

  async function loadMore() {
    if (loading || !hasNextPage) return;
    const currentRequest = ++requestId.current;
    const nextPage = page + 1;
    setLoading(true);
    setStatus("Loading more anime from AniList…");
    try {
      const result = await animePage({ page: nextPage, genre });
      if (currentRequest !== requestId.current) return;
      const anime = result.data || [];
      setItems((current) => [...current, ...anime]);
      setPage(nextPage);
      setHasNextPage(result.pagination.hasNextPage);
      setStatus(anime.length
        ? `Showing ${(items.length + anime.length).toLocaleString()} anime${result.pagination.hasNextPage ? ". Load more to continue browsing." : "."}`
        : "No anime matched. Try a different title or genre.");
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      setStatus(`Could not load more anime from AniList. ${cause.message}`);
      setError(true);
      console.error("AniList catalog pagination request failed:", cause);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  function scrollToCatalog() {
    document.querySelector("#anime-catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <SiteHeader activePage={activePage} />
      <main id="home">
        <HeroSection item={items[0]} />
        <BrowseSection selectedGenre={genre} onSelectGenre={setGenre} onViewAll={scrollToCatalog} />
        <SeasonSection />
        <CatalogSection
          items={items}
          status={status}
          count={count}
          error={error}
          hasNextPage={hasNextPage}
          loading={loading}
          onRetry={() => setRetryCount((value) => value + 1)}
          onLoadMore={loadMore}
        />
        <CarouselSection
          title="Most popular anime"
          rowId="trending-row"
          items={items.slice(0, 8)}
          emptyMessage={!loading && !items.length ? "No anime matched. Try another title or genre." : ""}
        />
        <CarouselSection
          id="series"
          title="More popular anime"
          kicker="MORE TO EXPLORE"
          rowId="recommended-row"
          items={items.slice(8, 16)}
          emptyMessage={!loading && !items.length ? "No anime matched. Try another title or genre." : ""}
        />
      </main>
      <Footer />
      <div className="toast" id="toast" role="status" aria-live="polite" />
    </>
  );
}
