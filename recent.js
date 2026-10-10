const search = document.querySelector("#latest-search");
const grid = document.querySelector("#latest-grid");
const count = document.querySelector("#latest-count");
let searchQuery = "";

function formatUploadDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function renderLatestUpdates() {
  const latestAnime = window.KUMO_ANIME
    .filter((title) => `${title.title} ${title.genre} ${title.studio}`.toLowerCase().includes(searchQuery))
    .sort((first, second) => second.uploadedAt.localeCompare(first.uploadedAt) || first.title.localeCompare(second.title));

  grid.replaceChildren();
  count.textContent = `${latestAnime.length} ${latestAnime.length === 1 ? "title" : "titles"} in the library`;

  if (latestAnime.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state latest-empty";
    empty.textContent = "No anime matches your search. Try another title, genre, or studio.";
    grid.append(empty);
    return;
  }

  for (const title of latestAnime) {
    const card = document.createElement("a");
    card.className = "latest-card";
    card.href = `detail.html?id=${encodeURIComponent(title.id)}`;
    card.setAttribute("aria-label", `View ${title.title}, uploaded ${formatUploadDate(title.uploadedAt)}`);
    card.innerHTML = `
      <div class="latest-poster">
        <img src="${title.image}" alt="Original illustrated cover for ${title.title}" loading="lazy" />
        <span class="latest-upload-badge"><span class="live-dot"></span> NEW</span>
        <span class="latest-rating">★ ${title.rating}</span>
      </div>
      <div class="latest-card-info">
        <div class="latest-upload-date">${formatUploadDate(title.uploadedAt)}</div>
        <h3>${title.title}</h3>
        <p>${title.genre} <span>·</span> ${title.seasons.reduce((total, episodes) => total + episodes, 0)} episodes</p>
        <span class="latest-open-link">View anime <span aria-hidden="true">↗</span></span>
      </div>`;
    grid.append(card);
  }
}

search.addEventListener("input", () => {
  searchQuery = search.value.trim().toLowerCase();
  renderLatestUpdates();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    search.focus();
  }
});

renderLatestUpdates();
