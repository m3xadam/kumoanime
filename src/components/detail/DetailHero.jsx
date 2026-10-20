import { useEffect, useState } from "react";
import { animeRelations, animeTitle } from "../../api/anilist.js";
import "./DetailHero.css";

const RELATION_LABELS = {
  PREQUEL: "Prequel",
  SEQUEL: "Sequel",
  SIDE_STORY: "Side story",
  SPIN_OFF: "Spin-off",
  ALTERNATIVE: "Alternative",
  SUMMARY: "Summary",
  COMPILATION: "Compilation",
  PARENT: "Related series",
};
const RELATION_TYPES = new Set(Object.keys(RELATION_LABELS));

async function getRelatedAnime(item) {
  const related = new Map();
  const visited = new Set([item.id]);
  const frontier = [];
  const addRelation = (relation) => {
    const media = relation?.node;
    if (!RELATION_TYPES.has(relation?.relationType) || media?.type !== "ANIME" || media.id === item.id) return;
    let entry = related.get(media.id);
    if (!entry) {
      entry = { media, relationTypes: new Set() };
      related.set(media.id, entry);
    }
    entry.relationTypes.add(relation.relationType);
    if (!visited.has(media.id)) {
      visited.add(media.id);
      frontier.push(media.id);
    }
  };

  for (const relation of item.relations?.edges || []) addRelation(relation);
  while (frontier.length) {
    const batch = frontier.splice(0, 50);
    const series = await animeRelations(batch);
    for (const anime of series) {
      for (const relation of anime.relations?.edges || []) addRelation(relation);
    }
  }
  return [...related.values()].sort((left, right) => {
    const yearDifference = (left.media.startDate?.year || Infinity) - (right.media.startDate?.year || Infinity);
    return yearDifference || animeTitle(left.media).localeCompare(animeTitle(right.media));
  });
}

function Countdown({ airingAt, episode, totalEpisodes }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const remaining = Math.max(0, airingAt - Math.floor(now / 1000));
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const time = days ? `${days}d ${hours}h` : hours ? `${hours}h ${minutes}m` : minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
  return <span className="hero-next-episode">Next ep {episode}{totalEpisodes ? `/${totalEpisodes}` : ""}{remaining ? ` · ${time}` : ""}</span>;
}

export default function DetailHero({ item }) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [relatedExpanded, setRelatedExpanded] = useState(false);
  const [related, setRelated] = useState([]);
  const [relatedStatus, setRelatedStatus] = useState("");
  const [relatedLoading, setRelatedLoading] = useState(false);
  const title = animeTitle(item);
  const description = item.description || "No synopsis is available for this anime.";
  const year = item.seasonYear || item.startDate?.year;
  const imageUrl = item.bannerImage || item.coverImage?.extraLarge || item.coverImage?.large;
  const hasRelated = (item.relations?.edges || []).some((relation) =>
    RELATION_TYPES.has(relation?.relationType) && relation.node?.type === "ANIME"
  );

  async function toggleRelated() {
    const expanded = !relatedExpanded;
    setRelatedExpanded(expanded);
    if (!expanded || related.length || relatedLoading) return;
    setRelatedLoading(true);
    setRelatedStatus("Finding related anime…");
    try {
      const result = await getRelatedAnime(item);
      setRelated(result);
      setRelatedStatus(result.length ? `${result.length} related anime found.` : "No related anime were found on AniList.");
    } catch (error) {
      setRelatedStatus(`Could not load related anime. ${error.message}`);
      console.error("AniList related anime request failed:", error);
    } finally {
      setRelatedLoading(false);
    }
  }

  return (
    <section className="detail-hero" aria-labelledby="detail-title">
      <div className="detail-backdrop" id="detail-backdrop" style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined} />
      <div className="detail-shade" />
      {item.coverImage?.extraLarge || item.coverImage?.large
        ? <img className="detail-poster" id="detail-poster" src={item.coverImage.extraLarge || item.coverImage.large} alt={`Cover of ${title}`} />
        : null}
      <div className="detail-copy">
        <p className="section-kicker" id="detail-kicker">{[item.format?.replaceAll("_", " "), item.status?.replaceAll("_", " ")].filter(Boolean).join(" · ").toUpperCase()}</p>
        <h1 id="detail-title">{title}</h1>
        <div className="detail-meta" id="detail-meta">
          {[item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated", year, item.format?.replaceAll("_", " "), item.episodes ? `${item.episodes} episodes` : "Episode count unknown", item.status?.replaceAll("_", " ")].filter(Boolean).map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}
          {item.nextAiringEpisode?.airingAt && <Countdown airingAt={item.nextAiringEpisode.airingAt} episode={item.nextAiringEpisode.episode} totalEpisodes={item.episodes} />}
        </div>
        <p className={`detail-description${descriptionExpanded ? "" : " is-collapsed"}`} id="detail-description">{description}</p>
        {description.length >= 240 && <button className="description-toggle" id="detail-description-toggle" type="button" aria-expanded={descriptionExpanded} onClick={() => setDescriptionExpanded((value) => !value)}>{descriptionExpanded ? "Show less" : "Read more"}</button>}
        {hasRelated && <div className="story-order-picker" id="story-order-picker">
          <button className="story-order-button" id="story-order-toggle" type="button" aria-expanded={relatedExpanded} aria-controls="story-order-panel" onClick={toggleRelated}>Show all related anime</button>
          <div className="story-order-panel" id="story-order-panel" hidden={!relatedExpanded}>
            <p className="story-order-status" id="story-order-status" role="status" aria-live="polite">{relatedStatus}</p>
            <div className="story-order-items" id="anime-related">
              {related.map(({ media, relationTypes }) => <a key={media.id} href={`detail.html?anilist=${encodeURIComponent(media.id)}`} className="story-order-link"><span className="story-order-copy"><strong>{animeTitle(media)}</strong><small>{[...relationTypes].map((type) => RELATION_LABELS[type]).join(" · ")}</small></span></a>)}
            </div>
          </div>
        </div>}
        <div className="detail-actions">
          <a className="button button-primary" id="detail-play" href={`watch.html?anilist=${encodeURIComponent(item.id)}`} aria-label={`Download episodes of ${title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20h14v-2H5v2zm14-11h-4V3H9v6H5l7 7 7-7z" /></svg>
            Download episodes
          </a>
        </div>
        <p className="detail-note">Anime information from AniList.</p>
      </div>
    </section>
  );
}
