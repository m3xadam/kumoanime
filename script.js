if (document.body.dataset.page === "catalog") {
  const searchInput = document.querySelector("#search-input");
  const catalog = document.querySelector("#anilist-grid");
  const status = document.querySelector("#anilist-status");
  const count = document.querySelector("#anilist-count");
  const loadMore = document.querySelector("#anilist-load-more");
  const retry = document.querySelector("#anilist-retry");
  const trendingRow = document.querySelector("#trending-row");
  const recommendedRow = document.querySelector("#recommended-row");
  const homeSeasonGrid = document.querySelector("#home-season-grid");
  const homeSeasonStatus = document.querySelector("#home-season-status");
  const homeSeasonRetry = document.querySelector("#home-season-retry");
  let searchTerm = "";
  let selectedGenre = "";
  let page = 1;
  let hasNextPage = false;
  let loading = false;
  let reloadWhenIdle = false;
  let requestId = 0;
  let searchTimer;

  function animeTitle(item) {
    return item.title?.english || item.title?.romaji || item.title?.native || "Untitled anime";
  }

  function animeYear(item) {
    return item.seasonYear || item.startDate?.year || "Year unknown";
  }

  function animeCard(item, compact = false) {
    const title = animeTitle(item);
    const genres = item.genres || [];
    const imageUrl = item.coverImage?.extraLarge || item.coverImage?.large;
    const card = document.createElement("a");
    card.className = compact ? "movie-card" : "anilist-card";
    card.href = `detail.html?anilist=${encodeURIComponent(item.id)}`;
    card.setAttribute("aria-label", `View ${title} details`);
    card.dataset.anilistId = String(item.id);

    const poster = document.createElement("div");
    poster.className = compact ? "poster-wrap" : "anilist-poster";
    const image = document.createElement("img");
    image.alt = `Cover of ${title}`;
    image.loading = "lazy";
    if (imageUrl) image.src = imageUrl;
    image.onerror = () => {
      image.removeAttribute("src");
      image.alt = `No cover available for ${title}`;
    };
    poster.append(image);

    const score = document.createElement("span");
    score.className = compact ? "poster-rating" : "anilist-score";
    score.textContent = item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated";
    poster.append(score);

    const heading = document.createElement("h3");
    heading.textContent = title;
    const metadata = document.createElement("p");
    metadata.className = compact ? "card-meta" : "anilist-card-meta";
    metadata.textContent = [animeYear(item), item.format, item.episodes ? `${item.episodes} eps` : "Episode count unknown"]
      .filter(Boolean)
      .join(" · ");
    const genreLine = document.createElement("p");
    genreLine.className = compact ? "card-meta" : "anilist-card-genres";
    genreLine.textContent = genres.length ? genres.join(" · ") : "Genres unavailable";

    if (compact) {
      heading.className = "card-title";
      const hint = document.createElement("span");
      hint.className = "card-open-hint";
      hint.textContent = "VIEW ANIME ↗";
      poster.append(hint);
      const info = document.createElement("div");
      info.className = "card-info";
      info.append(heading, metadata, genreLine);
      card.append(poster, info);
    } else {
      const summary = document.createElement("p");
      summary.className = "anilist-card-synopsis";
      summary.textContent = item.description || "No synopsis is available for this anime.";
      const info = document.createElement("div");
      info.className = "anilist-card-info";
      info.append(heading, metadata, genreLine, summary);
      card.append(poster, info);
    }
    return card;
  }

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function resetHero(title, description) {
    document.querySelector("#hero-title").textContent = title;
    document.querySelector(".hero-backdrop").style.backgroundImage = "";
    document.querySelector(".hero-meta").replaceChildren();
    document.querySelector(".hero-description").textContent = description;
    document.querySelector(".hero-description").classList.add("is-collapsed");
    document.querySelector("#hero-description-toggle").hidden = true;
    document.querySelector("#hero-info").disabled = true;
  }

  function populateHero(item) {
    const title = animeTitle(item);
    const backdrop = document.querySelector(".hero-backdrop");
    document.querySelector("#hero-title").textContent = title;
    if (item.bannerImage) {
      const bannerUrl = new URL(item.bannerImage);
      if (bannerUrl.protocol === "https:") backdrop.style.backgroundImage = `url("${bannerUrl.href}")`;
    } else if (item.coverImage?.large) {
      const coverUrl = new URL(item.coverImage.large);
      if (coverUrl.protocol === "https:") backdrop.style.backgroundImage = `url("${coverUrl.href}")`;
    }

    const details = document.querySelector(".hero-meta");
    details.replaceChildren();
    for (const value of [
      item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated",
      animeYear(item),
      item.episodes ? `${item.episodes} episodes` : item.status?.replaceAll("_", " "),
    ].filter(Boolean)) {
      const label = document.createElement("span");
      label.textContent = value;
      details.append(label);
    }
    const description = item.description || "No synopsis is available for this anime.";
    const descriptionElement = document.querySelector(".hero-description");
    const descriptionToggle = document.querySelector("#hero-description-toggle");
    descriptionElement.textContent = description;
    descriptionElement.classList.add("is-collapsed");
    descriptionToggle.hidden = description.length < 240;
    descriptionToggle.textContent = "Read more";
    descriptionToggle.setAttribute("aria-expanded", "false");
    document.querySelector("#hero-info").onclick = () => {
      window.location.href = `detail.html?anilist=${encodeURIComponent(item.id)}`;
    };
    document.querySelector("#hero-info").disabled = false;
  }

  document.querySelector("#hero-description-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const description = document.querySelector(".hero-description");
    const expanded = button.getAttribute("aria-expanded") === "true";
    description.classList.toggle("is-collapsed", expanded);
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? "Read more" : "Show less";
  });

  function renderRows(items) {
    trendingRow.replaceChildren(...items.slice(0, 8).map((item) => animeCard(item, true)));
    recommendedRow.replaceChildren(...items.slice(8, 16).map((item) => animeCard(item, true)));
    if (!items.length) {
      for (const row of [trendingRow, recommendedRow]) {
        const message = document.createElement("p");
        message.className = "empty-state";
        message.textContent = "No anime matched. Try another title or genre.";
        row.append(message);
      }
    }
  }

  async function loadHomeSeason() {
    homeSeasonRetry.hidden = true;
    homeSeasonStatus.classList.remove("is-error");
    try {
      const result = await window.AniList.currentSeasonPage({ perPage: 20 });
      const items = result.data || [];
      homeSeasonGrid.replaceChildren(...items.map((item) => animeCard(item, true)));
      homeSeasonStatus.textContent = items.length
        ? `Showing ${items.length} anime currently airing this season.`
        : "No currently airing anime were found for this season.";
    } catch (error) {
      homeSeasonStatus.textContent = `Could not load currently airing anime from AniList. ${error.message}`;
      homeSeasonStatus.classList.add("is-error");
      homeSeasonRetry.hidden = false;
      console.error("AniList homepage season request failed:", error);
    }
  }

  async function loadAnime(nextPage = 1, append = false) {
    if (loading) return;
    if (searchTerm.length > 0 && searchTerm.length < 3) {
      requestId += 1;
      catalog.replaceChildren();
      count.textContent = "";
      loadMore.hidden = true;
      retry.hidden = true;
      trendingRow.replaceChildren();
      recommendedRow.replaceChildren();
      resetHero("Search AniList", "Enter at least 3 characters to search the anime catalog.");
      showStatus("Enter at least 3 characters to search the AniList catalog.");
      return;
    }

    const currentRequest = ++requestId;
    loading = true;
    loadMore.disabled = true;
    if (!append) {
      catalog.replaceChildren();
      trendingRow.replaceChildren();
      recommendedRow.replaceChildren();
      page = 0;
      hasNextPage = false;
      count.textContent = "";
      retry.hidden = true;
      loadMore.hidden = true;
      resetHero("Loading anime…", "Loading anime information from AniList.");
      showStatus("Loading anime from AniList…");
    } else {
      showStatus("Loading more anime from AniList…");
    }

    try {
      const result = await window.AniList.animePage({
        page: nextPage,
        search: searchTerm,
        genre: selectedGenre,
      });
      if (currentRequest !== requestId) return;
      const items = result.data || [];
      catalog.append(...items.map((item) => animeCard(item)));
      if (nextPage === 1) {
        renderRows(items);
        if (items[0]) populateHero(items[0]);
      }
      page = nextPage;
      hasNextPage = result.pagination.hasNextPage;
      count.textContent = result.pagination.total
        ? `${result.pagination.total.toLocaleString()} results`
        : "";
      if (nextPage === 1 && !items.length) resetHero("No anime found", "Try a different title or genre.");
      showStatus(items.length
        ? `Showing ${catalog.children.length.toLocaleString()} anime${hasNextPage ? ". Load more to continue browsing." : "."}`
        : "No anime matched. Try a different title or genre.");
      loadMore.hidden = !hasNextPage;
      retry.hidden = true;
    } catch (error) {
      if (currentRequest !== requestId) return;
      resetHero("AniList unavailable", "Anime information could not be loaded. Please retry.");
      showStatus(`${error.message} The catalog uses AniList as its source and needs a working connection.`, true);
      retry.hidden = false;
      console.error("AniList catalog request failed:", error);
    } finally {
      if (currentRequest === requestId) {
        loading = false;
        loadMore.disabled = false;
      } else {
        loading = false;
        if (reloadWhenIdle) {
          reloadWhenIdle = false;
          loadHomeSeason();
          loadAnime();
        }
      }
    }
  }

  function refreshAnime() {
    if (loading) {
      reloadWhenIdle = true;
      requestId += 1;
      return;
    }
    loadAnime();
  }

  document.querySelectorAll(".genre-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedGenre = chip.dataset.genre === "All" ? "" : chip.dataset.genre;
      document.querySelectorAll(".genre-chip").forEach((item) => {
        const selected = item === chip;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      refreshAnime();
    });
  });

  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refreshAnime, 600);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
  });

  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = document.getElementById(button.dataset.scroll);
      row.scrollBy({ left: Number(button.dataset.direction) * row.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  document.querySelector("#view-all").addEventListener("click", () => {
    document.querySelector("#anime-catalog").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  loadMore.addEventListener("click", () => {
    if (hasNextPage) loadAnime(page + 1, true);
  });
  retry.addEventListener("click", () => loadAnime(page || 1, page > 1));
  homeSeasonRetry.addEventListener("click", loadHomeSeason);

  loadHomeSeason();
  loadAnime();
}
