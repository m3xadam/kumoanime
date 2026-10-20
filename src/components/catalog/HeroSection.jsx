import { useState } from "react";
import "./HeroSection.css";

export default function HeroSection({ item }) {
  const title = item?.title?.english || item?.title?.romaji || item?.title?.native || "Loading anime…";
  const [expanded, setExpanded] = useState(false);
  const description = item?.description || "Loading anime information from AniList.";
  const image = item?.bannerImage || item?.coverImage?.large;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-backdrop" style={image ? { backgroundImage: `url("${image}")` } : undefined} />
      <div className="hero-content">
        <div className="eyebrow"><span className="eyebrow-line" /> POWERED BY ANILIST</div>
        <h1 id="hero-title">{title}</h1>
        <div className="hero-meta">
          {item && [item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated", item.seasonYear || item.startDate?.year, item.episodes ? `${item.episodes} episodes` : item.status?.replaceAll("_", " ")].filter(Boolean).map((value) => <span key={value}>{value}</span>)}
        </div>
        <p className={`hero-description${expanded ? "" : " is-collapsed"}`}>{description}</p>
        {item && description.length >= 240 && <button className="description-toggle" id="hero-description-toggle" type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Show less" : "Read more"}</button>}
        <div className="hero-actions">
          <button className="button button-secondary" id="hero-info" type="button" disabled={!item} onClick={() => { if (item) window.location.href = `detail.html?anilist=${encodeURIComponent(item.id)}`; }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>
            More info
          </button>
        </div>
      </div>
      <div className="hero-caption"><span /> POPULAR ON ANILIST</div>
      <div className="hero-shade" />
    </section>
  );
}
