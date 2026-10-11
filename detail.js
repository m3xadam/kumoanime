const params = new URLSearchParams(window.location.search);
const animeId = params.get("anilist");
const detailMain = document.querySelector("#detail-main");
const detailError = document.querySelector("#detail-error");

function animeTitle(item) {
  return item.title?.english || item.title?.romaji || item.title?.native || "Untitled anime";
}

function addDetailField(label, value, { wide = false, href = "" } = {}) {
  if (value === null || value === undefined || value === "") return;
  const field = document.createElement("div");
  if (wide) field.dataset.wide = "";
  const heading = document.createElement("span");
  heading.textContent = label.toUpperCase();
  const content = href ? document.createElement("a") : document.createElement("strong");
  content.textContent = value;
  if (href) {
    content.href = href;
    content.target = "_blank";
    content.rel = "noopener noreferrer";
  }
  field.append(heading, content);
  document.querySelector("#anime-extra").append(field);
}

function setText(selector, value, fallback = "Not listed") {
  document.querySelector(selector).textContent = value || fallback;
}

function validExternalUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderRecommendations(recommendations, currentId) {
  const grid = document.querySelector("#related-movies");
  grid.replaceChildren();
  const items = recommendations
    .map((recommendation) => recommendation.mediaRecommendation)
    .filter((item) => item && item.id !== currentId)
    .slice(0, 8);

  if (!items.length) {
    grid.textContent = "No AniList recommendations are available for this anime.";
    return;
  }

  for (const item of items) {
    const link = document.createElement("a");
    link.className = "related-card";
    link.href = `detail.html?anilist=${encodeURIComponent(item.id)}`;
    const image = document.createElement("img");
    image.alt = `Cover of ${animeTitle(item)}`;
    image.loading = "lazy";
    const imageUrl = item.coverImage?.large;
    if (imageUrl) image.src = imageUrl;
    image.onerror = () => image.removeAttribute("src");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = animeTitle(item);
    const subtitle = document.createElement("small");
    subtitle.textContent = (item.genres || []).join(" · ") || "Anime recommendation from AniList";
    copy.append(title, subtitle);
    link.append(image, copy);
    grid.append(link);
  }
}

async function loadAnimeDetails() {
  if (!/^\d+$/.test(animeId || "")) {
    detailMain.hidden = true;
    detailError.hidden = false;
    detailError.textContent = "This AniList anime ID is invalid. Return to the catalog and choose an anime.";
    return;
  }

  detailMain.hidden = true;
  detailError.hidden = false;
  detailError.textContent = "Loading anime information from AniList…";
  try {
    const item = await window.AniList.animeDetails(animeId);
    if (!item) throw new Error("AniList did not return an anime record.");

    const title = animeTitle(item);
    const studioNames = item.studios?.nodes?.map((studio) => studio.name) || [];
    const genres = (item.genres || []).join(" · ");
    const year = item.seasonYear || item.startDate?.year;
    const imageUrl = item.bannerImage || item.coverImage?.extraLarge || item.coverImage?.large;
    const posterUrl = item.coverImage?.extraLarge || item.coverImage?.large;

    document.title = `${title} — Kumo Anime`;
    setText("#detail-title", title);
    setText("#detail-kicker", [item.format?.replaceAll("_", " "), item.status?.replaceAll("_", " ")]
      .filter(Boolean).join(" · ").toUpperCase());
    const description = item.description || "No synopsis is available for this anime.";
    setText("#detail-description", description);
    const descriptionElement = document.querySelector("#detail-description");
    const descriptionToggle = document.querySelector("#detail-description-toggle");
    descriptionElement.classList.add("is-collapsed");
    descriptionToggle.hidden = description.length < 240;
    descriptionToggle.textContent = "Read more";
    descriptionToggle.setAttribute("aria-expanded", "false");
    const metadata = document.querySelector("#detail-meta");
    metadata.replaceChildren();
    for (const value of [
      item.averageScore ? `★ ${(item.averageScore / 10).toFixed(1)}` : "Not rated",
      year,
      item.format?.replaceAll("_", " "),
      item.episodes ? `${item.episodes} episodes` : "Episode count unknown",
      item.status?.replaceAll("_", " "),
    ].filter(Boolean)) {
      const span = document.createElement("span");
      span.textContent = value;
      metadata.append(span);
    }
    const safeImageUrl = validExternalUrl(imageUrl);
    if (safeImageUrl) document.querySelector("#detail-backdrop").style.backgroundImage = `url("${safeImageUrl}")`;
    const poster = document.querySelector("#detail-poster");
    const safePosterUrl = validExternalUrl(posterUrl);
    poster.hidden = !safePosterUrl;
    poster.alt = `Cover of ${title}`;
    poster.onerror = () => {
      poster.hidden = true;
      poster.removeAttribute("src");
    };
    if (safePosterUrl) poster.src = safePosterUrl;

    setText("#detail-genre", genres);
    setText("#detail-year", year);
    setText("#detail-studio", studioNames.join(" · "));
    setText("#detail-length", item.episodes ? `${item.episodes} episodes` : "Unknown");
    const watchUrl = `watch.html?anilist=${encodeURIComponent(item.id)}`;
    document.querySelector("#detail-play").href = watchUrl;
    document.querySelector("#detail-play").setAttribute("aria-label", `Open your video player for ${title}`);
    document.querySelector(".detail-note").textContent = "Anime information from AniList.";
    document.querySelector(".episodes-section").hidden = true;

    const extra = document.querySelector("#anime-extra");
    extra.replaceChildren();
    addDetailField("Japanese title", item.title?.native);
    addDetailField("Format", item.format?.replaceAll("_", " "));
    addDetailField("Status", item.status?.replaceAll("_", " "));
    addDetailField("Release date", [item.startDate?.year, item.startDate?.month, item.startDate?.day].filter(Boolean).join("-"));
    addDetailField("End date", [item.endDate?.year, item.endDate?.month, item.endDate?.day].filter(Boolean).join("-"));
    addDetailField("Season", item.season && item.seasonYear
      ? `${item.season.charAt(0)}${item.season.slice(1).toLowerCase()} ${item.seasonYear}`
      : "");
    addDetailField("Source", item.source?.replaceAll("_", " "));
    addDetailField("Tags", (item.tags || []).map((tag) => tag.name).join(" · "), { wide: true });
    addDetailField("Episode duration", item.duration ? `${item.duration} minutes` : "");
    addDetailField("Country of origin", item.countryOfOrigin);
    addDetailField("Mean score", item.meanScore ? `${(item.meanScore / 10).toFixed(1)} / 10` : "");
    addDetailField("Popularity", item.popularity?.toLocaleString());
    addDetailField("Favorites", item.favourites?.toLocaleString());
    addDetailField("Studios", studioNames.join(" · "));
    addDetailField("AniList page", "Open anime on AniList ↗", { href: validExternalUrl(item.siteUrl) });
    const trailerUrl = item.trailer?.site?.toLowerCase() === "youtube" && item.trailer.id
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(item.trailer.id)}`
      : "";
    addDetailField("Trailer", "Watch trailer ↗", { href: validExternalUrl(trailerUrl) });
    const rank = item.rankings?.find((ranking) => ranking.type === "RATED");
    addDetailField("Rank", rank ? `#${rank.rank} ${rank.context}` : "");
    const popularityRank = item.rankings?.find((ranking) => ranking.type === "POPULAR");
    addDetailField("Popularity ranking", popularityRank ? `#${popularityRank.rank} ${popularityRank.context}` : "");
    extra.hidden = false;
    detailMain.hidden = false;
    detailError.hidden = true;
    renderRecommendations(item.recommendations?.nodes || [], item.id);
  } catch (error) {
    detailMain.hidden = true;
    detailError.hidden = false;
    detailError.textContent = `Could not load this anime from AniList. ${error.message}`;
    console.error("AniList anime detail request failed:", error);
  }
}

document.querySelector("#detail-description-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const description = document.querySelector("#detail-description");
  const expanded = button.getAttribute("aria-expanded") === "true";
  description.classList.toggle("is-collapsed", expanded);
  button.setAttribute("aria-expanded", String(!expanded));
  button.textContent = expanded ? "Read more" : "Show less";
});

loadAnimeDetails();
