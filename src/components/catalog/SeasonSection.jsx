import { useEffect, useState } from "react";
import { currentSeasonPage } from "../../api/anilist.js";
import AnimeCard from "./AnimeCard.jsx";
import "./SeasonSection.css";

export default function SeasonSection() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading this season’s anime from AniList…");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("Loading this season’s anime from AniList…");
    setError(false);
    currentSeasonPage({ perPage: 20 }).then((result) => {
      if (!active) return;
      const anime = result.data || [];
      setItems(anime);
      setStatus(anime.length
        ? `Showing ${anime.length} anime currently airing this season.`
        : "No currently airing anime were found for this season.");
    }).catch((cause) => {
      if (!active) return;
      setItems([]);
      setStatus(`Could not load currently airing anime from AniList. ${cause.message}`);
      setError(true);
      console.error("AniList homepage season request failed:", cause);
    });
    return () => { active = false; };
  }, [retry]);

  return (
    <section className="content-section home-season-section" aria-labelledby="home-season-title">
      <div className="row-heading">
        <div><p className="section-kicker">THIS SEASON · ANILIST</p><h2 id="home-season-title">Currently airing anime</h2></div>
        <a className="text-button" href="recent.html">View more <span aria-hidden="true">↗</span></a>
      </div>
      <p className={`anilist-status${error ? " is-error" : ""}`} id="home-season-status" role="status" aria-live="polite">{status}</p>
      {error && <button className="text-button" id="home-season-retry" type="button" onClick={() => setRetry((value) => value + 1)}>Retry loading this season</button>}
      <div className="home-season-grid" id="home-season-grid">{items.map((item) => <AnimeCard key={item.id} item={item} compact />)}</div>
    </section>
  );
}
