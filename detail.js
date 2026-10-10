const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const title = window.KUMO_ANIME.find((item) => item.id === animeId);
const detailMain = document.querySelector("#detail-main");
const detailError = document.querySelector("#detail-error");

if (!title) {
  detailMain.hidden = true;
  detailError.hidden = false;
  detailError.textContent = "We couldn't find that anime. Browse the catalog to choose another series.";
} else {
  const totalEpisodes = title.seasons.reduce((sum, count) => sum + count, 0);
  const requestedSeason = Number.parseInt(params.get("season") || "1", 10);
  const initialSeason = Number.isInteger(requestedSeason) && requestedSeason >= 1 && requestedSeason <= title.seasons.length
    ? requestedSeason
    : 1;
  document.title = `${title.title} — Kumo Anime`;
  document.querySelector("#detail-title").textContent = title.title;
  document.querySelector("#detail-kicker").textContent = title.group === "featured" ? "KUMO ORIGINAL ANIME" : `${title.genre.toUpperCase()} ANIME`;
  document.querySelector("#detail-description").textContent = title.description;
  document.querySelector("#detail-meta").innerHTML = `<span class="detail-rating">★ ${title.rating}</span><span>${title.year}</span><span>${title.seasons.length} season${title.seasons.length === 1 ? "" : "s"} · ${totalEpisodes} episodes</span><span class="quality-badge">SUB · DUB</span>`;
  document.querySelector("#detail-backdrop").style.backgroundImage = `url("${title.backdrop}")`;
  document.querySelector("#detail-play").href = `watch.html?id=${encodeURIComponent(title.id)}&season=${initialSeason}&episode=1`;
  document.querySelector("#detail-genre").textContent = `${title.genre} anime`;
  document.querySelector("#detail-year").textContent = title.year;
  document.querySelector("#detail-studio").textContent = title.studio;
  document.querySelector("#detail-length").textContent = `${totalEpisodes} episodes`;

  const seasonSelect = document.querySelector("#season-select");
  const episodeList = document.querySelector("#episode-list");

  title.seasons.forEach((episodeCount, index) => {
    const seasonNumber = index + 1;
    const option = document.createElement("option");
    option.value = String(seasonNumber);
    option.textContent = `Season ${seasonNumber}`;
    seasonSelect.append(option);
  });
  seasonSelect.value = String(initialSeason);

  function renderEpisodes(seasonNumber) {
    const episodeCount = title.seasons[seasonNumber - 1];
    episodeList.replaceChildren();
    for (let episode = 1; episode <= episodeCount; episode += 1) {
      const link = document.createElement("a");
      link.className = "episode-card";
      link.href = `watch.html?id=${encodeURIComponent(title.id)}&season=${seasonNumber}&episode=${episode}`;
      link.innerHTML = `<span class="episode-number">${String(episode).padStart(2, "0")}</span><span class="episode-card-copy"><strong>Episode ${episode}</strong><small>Season ${seasonNumber} · Sample preview</small></span><span class="episode-card-play" aria-hidden="true">▶</span>`;
      episodeList.append(link);
    }
  }

  seasonSelect.addEventListener("change", () => renderEpisodes(Number(seasonSelect.value)));
  renderEpisodes(initialSeason);

  const genres = title.genre.split(" · ");
  const relatedMovies = window.KUMO_ANIME
    .filter((item) => item.id !== title.id && item.genre.split(" · ").some((genre) => genres.includes(genre)))
    .slice(0, 4);
  const relatedGrid = document.querySelector("#related-movies");
  if (relatedMovies.length === 0) {
    relatedGrid.textContent = "More anime coming soon.";
  } else {
    for (const related of relatedMovies) {
      const link = document.createElement("a");
      link.className = "related-card";
      link.href = `detail.html?id=${encodeURIComponent(related.id)}`;
      link.innerHTML = `<img src="${related.image}" alt="Original illustrated cover for ${related.title}" loading="lazy"><span><strong>${related.title}</strong><small>${related.year} · ${related.genre}</small></span>`;
      relatedGrid.append(link);
    }
  }
}
