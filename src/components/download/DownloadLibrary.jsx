import { getDownloadUrl } from "../../api/licensedDownloads.js";
import "./DownloadLibrary.css";

export default function DownloadLibrary({ episodes, status }) {
  return (
    <section className="download-library" aria-labelledby="download-title">
      <div className="download-heading">
        <div><p className="section-kicker">AVAILABLE EPISODES</p><h2 id="download-title">Download episodes</h2></div>
      </div>
      <p className="download-help">Choose an episode to download it from S3.</p>
      <p className="download-status" id="download-status" role="status" aria-live="polite">{status}</p>
      <ol className="download-episode-list" id="download-episode-list" hidden={!episodes.length}>
        {episodes.map((episode, index) => {
          const number = Number(episode.number) || index + 1;
          return <li key={episode.id}><div className="download-episode">
            <span className="episode-number">{String(number).padStart(2, "0")}</span>
            <span className="episode-card-copy"><strong>{episode.title || `Episode ${number}`}</strong></span>
            <a className="button button-secondary download-episode-link" href={getDownloadUrl(episode.id)} download aria-label={`Download episode ${number}`}>Download</a>
          </div></li>;
        })}
      </ol>
    </section>
  );
}
