const search = document.querySelector("#latest-search");
const grid = document.querySelector("#latest-grid");
const count = document.querySelector("#latest-count");
const status = document.querySelector("#latest-status");
const moreButton = document.querySelector("#latest-load-more");
const retryButton = document.querySelector("#latest-retry");
let searchQuery = "";
let page = 1;
let hasNextPage = false;
let loading = false;
let reloadWhenIdle = false;
let requestId = 0;
let debounceTimer;

function animeTitle(item) {
  return item.title?.english || item.title?.romaji || item.title?.native || "Untitled anime";
}

function createLatestCard(item) {
  const title = animeTitle(item);
  const genres = (item.genres || []).join(" · ") || "Genres unavailable";
  const episodes = item.episodes ? `${item.episodes} episodes` : "Episode count unknown";
  const imageUrl = item.coverImage?.extraLarge || item.coverImage?.large;
  const card = document.createElement("a");
  card.className = "latest-card";
  card.href = `detail.html?anilist=${encodeURIComponent(item.id)}`;
  card.setAttribute("aria-label", `View ${title} details`);

  const poster = document.createElement("div");
  poster.className = "latest-poster";
  const image = document.createElement("img");
  image.alt = `Cover of ${title}`;
  image.loading = "lazy";
  if (imageUrl) image.src = imageUrl;
  image.onerror = () => {
    image.removeAttribute("src");
    image.alt = `No cover available for ${title}`;
  };
  const score = document.createElement("span");
  score.className = "latest-rating";
  score.textContent = item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated";
  poster.append(image, score);

  const info = document.createElement("div");
  info.className = "latest-card-info";
  const airDate = document.createElement("div");
  airDate.className = "latest-upload-date";
  airDate.textContent = item.startDate?.year
    ? [item.startDate.year, item.startDate.month, item.startDate.day].filter(Boolean).join("-")
    : item.seasonYear || "Currently airing";
  const heading = document.createElement("h3");
  heading.textContent = title;
  const metadata = document.createElement("p");
  metadata.textContent = `${genres} · ${episodes}`;
  const linkText = document.createElement("span");
  linkText.className = "latest-open-link";
  linkText.textContent = "View anime ↗";
  info.append(airDate, heading, metadata, linkText);
  card.append(poster, info);
  return card;
}

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

async function loadAiringAnime(nextPage = 1, append = false) {
  if (loading) return;
  if (searchQuery && searchQuery.length < 3) {
    requestId += 1;
    grid.replaceChildren();
    count.textContent = "";
    hasNextPage = false;
    moreButton.hidden = true;
    retryButton.hidden = true;
    showStatus("Enter at least 3 characters to search the current AniList season.");
    return;
  }

  const currentRequest = ++requestId;
  loading = true;
  moreButton.disabled = true;
  if (!append) {
    grid.replaceChildren();
    page = 0;
    hasNextPage = false;
    count.textContent = "";
    retryButton.hidden = true;
    moreButton.hidden = true;
  }
  showStatus("Loading currently airing anime from AniList…");

  try {
    const result = await window.AniList.currentSeasonPage({ page: nextPage, search: searchQuery });
    if (currentRequest !== requestId) return;
    const items = result.data || [];
    grid.append(...items.map(createLatestCard));
    page = nextPage;
    hasNextPage = result.pagination.hasNextPage;
    count.textContent = result.pagination.total
      ? `${result.pagination.total.toLocaleString()} anime`
      : "";
    showStatus(items.length
      ? `Showing ${grid.children.length.toLocaleString()} anime from the current AniList season.`
      : "No currently airing anime matched your search.");
    moreButton.hidden = !hasNextPage;
    retryButton.hidden = true;
  } catch (error) {
    if (currentRequest !== requestId) return;
    showStatus(`Could not load anime from AniList. ${error.message}`, true);
    retryButton.hidden = false;
    console.error("AniList current season request failed:", error);
  } finally {
    if (currentRequest === requestId) {
      loading = false;
      moreButton.disabled = false;
    } else {
      loading = false;
      if (reloadWhenIdle) {
        reloadWhenIdle = false;
        loadAiringAnime();
      }
    }
  }
}

function refreshAiringAnime() {
  if (loading) {
    reloadWhenIdle = true;
    requestId += 1;
    return;
  }
  loadAiringAnime();
}

search.addEventListener("input", () => {
  searchQuery = search.value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(refreshAiringAnime, 600);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    search.focus();
  }
});

moreButton.addEventListener("click", () => {
  if (hasNextPage) loadAiringAnime(page + 1, true);
});
retryButton.addEventListener("click", () => loadAiringAnime(page || 1, page > 1));

loadAiringAnime();
