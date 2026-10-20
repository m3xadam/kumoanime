import "./BrowseSection.css";

const genres = ["All", "Action", "Fantasy", "Romance", "Sci-Fi", "Supernatural", "Sports", "Drama", "Mystery", "Comedy"];

export default function BrowseSection({ selectedGenre, onSelectGenre, onViewAll }) {
  return (
    <section className="browse-section" id="movies">
      <div className="section-heading">
        <div><p className="section-kicker">ANIME FROM ANILIST</p><h2>Find your next favorite anime</h2></div>
        <button className="text-button" id="view-all" type="button" onClick={onViewAll}>View catalog <span aria-hidden="true">↗</span></button>
      </div>
      <div className="genre-list" role="group" aria-label="Filter by anime genre">
        {genres.map((genre) => (
          <button key={genre} className={`genre-chip${(genre === "All" ? "" : genre) === selectedGenre ? " selected" : ""}`} type="button" data-genre={genre} aria-pressed={(genre === "All" ? "" : genre) === selectedGenre} onClick={() => onSelectGenre(genre === "All" ? "" : genre)}>
            {genre === "All" ? "For you" : genre}
          </button>
        ))}
      </div>
    </section>
  );
}
