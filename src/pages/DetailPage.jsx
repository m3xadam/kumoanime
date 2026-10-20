import { useEffect, useState } from "react";
import { animeDetails, animeTitle } from "../api/anilist.js";
import Brand from "../components/shared/Brand.jsx";
import { MainNavigation } from "../components/shared/SiteHeader.jsx";
import DetailContent from "../components/detail/DetailContent.jsx";
import DetailHero from "../components/detail/DetailHero.jsx";

function DetailHeader() {
  return (
    <header className="page-header">
      <Brand />
      <MainNavigation />
      <a className="back-link" href="index.html#anime-catalog"><span aria-hidden="true">←</span> Browse anime</a>
    </header>
  );
}

export default function DetailPage() {
  const animeId = new URLSearchParams(window.location.search).get("anilist");
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!/^\d+$/.test(animeId || "")) {
      setError("This AniList anime ID is invalid. Return to the catalog and choose an anime.");
      return () => { active = false; };
    }

    setError("");
    animeDetails(animeId).then((anime) => {
      if (!active) return;
      if (!anime) throw new Error("AniList did not return an anime record.");
      setItem(anime);
      document.title = `${animeTitle(anime)} — Kumo Anime`;
    }).catch((cause) => {
      if (!active) return;
      setError(`Could not load this anime from AniList. ${cause.message}`);
      console.error("AniList anime detail request failed:", cause);
    });
    return () => { active = false; };
  }, [animeId]);

  return (
    <>
      <DetailHeader />
      {item
        ? <main id="detail-main" className="detail-main"><DetailHero item={item} /><DetailContent item={item} /></main>
        : <p className="detail-error" id="detail-error" role="status" aria-live="polite">{error || "Loading anime information from AniList…"}</p>}
    </>
  );
}
