import Brand from "../shared/Brand.jsx";
import { MainNavigation } from "../shared/SiteHeader.jsx";
import "./DownloadHeader.css";

export default function DownloadHeader({ animeId }) {
  const backHref = animeId ? `detail.html?anilist=${encodeURIComponent(animeId)}` : "index.html";
  return (
    <header className="watch-header">
      <Brand />
      <MainNavigation />
      <a className="back-link" id="watch-back" href={backHref}><span aria-hidden="true">←</span> Back to anime</a>
    </header>
  );
}
