import AnimeCard from "./AnimeCard.jsx";
import "./CarouselSection.css";

export default function CarouselSection({ id, title, kicker, rowId, items = [], emptyMessage }) {
  function scroll(direction) {
    const row = document.getElementById(rowId);
    row?.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="content-section" id={id} aria-labelledby={`${rowId}-title`}>
      <div className="row-heading">
        <div>{kicker && <p className="section-kicker">{kicker}</p>}<h2 id={`${rowId}-title`}>{title}{!kicker && <span className="heading-accent"> ↗</span>}</h2></div>
        <div className="carousel-controls">
          <button className="carousel-button" type="button" aria-label={`Scroll ${title.toLowerCase()} left`} onClick={() => scroll(-1)}>‹</button>
          <button className="carousel-button" type="button" aria-label={`Scroll ${title.toLowerCase()} right`} onClick={() => scroll(1)}>›</button>
        </div>
      </div>
      <div className="movie-row" id={rowId} aria-live="polite">
        {items.length ? items.map((item) => <AnimeCard key={item.id} item={item} compact />) : emptyMessage && <p className="empty-state">{emptyMessage}</p>}
      </div>
    </section>
  );
}
