import { useEffect, useState } from "react";
import { animeDetails } from "../api/anilist.js";
import { getEpisodes } from "../api/licensedDownloads.js";
import DownloadHeader from "../components/download/DownloadHeader.jsx";
import DownloadInfo from "../components/download/DownloadInfo.jsx";
import DownloadLibrary from "../components/download/DownloadLibrary.jsx";

export default function DownloadPage() {
  const animeId = new URLSearchParams(window.location.search).get("anilist");
  const validId = /^\d+$/.test(animeId || "");
  const [anime, setAnime] = useState(null);
  const [animeError, setAnimeError] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("Checking for available episodes…");

  useEffect(() => {
    let active = true;
    if (!validId) {
      setDownloadStatus("Choose an anime from the catalog to check authorized downloads.");
      return () => { active = false; };
    }
    setDownloadStatus("Checking authorized episode availability…");
    setAnimeError("");

    animeDetails(animeId).then((result) => {
      if (!active) return;
      if (!result) throw new Error("AniList did not return an anime record.");
      setAnime(result);
      const title = result.title?.english || result.title?.romaji || result.title?.native || "Untitled anime";
      document.title = `Download ${title} — Kumo Anime`;
    }).catch((error) => {
      if (!active) return;
      setAnimeError(`AniList information could not be loaded. ${error.message}`);
      console.error("AniList download page request failed:", error);
    });

    getEpisodes(animeId).then((result) => {
      if (!active) return;
      setEpisodes(result);
      setDownloadStatus(result.length
        ? `${result.length} authorized episodes available.`
        : "No authorized downloads are available for this title.");
    }).catch((error) => {
      if (!active) return;
      setEpisodes([]);
      setDownloadStatus(`Could not load S3 episodes. ${error.message}`);
      console.error("Authorized download episode request failed:", error);
    });
    return () => { active = false; };
  }, [animeId, validId]);

  return (
    <>
      <DownloadHeader animeId={validId ? animeId : ""} />
      <main className="watch-main">
        <DownloadInfo anime={anime} error={animeError} animeId={validId ? animeId : ""} />
        <DownloadLibrary episodes={episodes} status={downloadStatus} />
        <p className="sample-notice">Anime information comes from AniList. Episode downloads are supplied by your private S3 bucket through short-lived download links.</p>
      </main>
    </>
  );
}
