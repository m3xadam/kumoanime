const anime = [
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    year: 2024,
    uploadedAt: "2026-10-10",
    genre: "Action · Fantasy",
    rating: "9.0",
    seasons: [12, 13],
    studio: "A-1 Pictures",
    palette: ["#193c70", "#23b4d8", "#ffe66d"],
    description: "A low-ranked hunter gains a mysterious power that lets him grow stronger with every battle.",
    group: "featured",
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    year: 2020,
    uploadedAt: "2026-10-10",
    genre: "Action · Supernatural",
    rating: "8.8",
    seasons: [24, 23],
    studio: "MAPPA",
    palette: ["#34155b", "#c63365", "#61d9e8"],
    description: "A high school student enters the hidden world of cursed spirits after a dangerous encounter.",
    group: "trending",
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    year: 2023,
    uploadedAt: "2026-10-09",
    genre: "Fantasy · Adventure",
    rating: "9.3",
    seasons: [28],
    studio: "Madhouse",
    palette: ["#a65b35", "#edb94e", "#fff0a5"],
    description: "After the great quest ends, an elven mage sets out to understand the people and memories she left behind.",
    group: "trending",
  },
  {
    id: "dandadan",
    title: "DAN DA DAN",
    year: 2024,
    uploadedAt: "2026-10-09",
    genre: "Action · Supernatural",
    rating: "8.7",
    seasons: [12, 12],
    studio: "Science SARU",
    palette: ["#631a45", "#fa4e83", "#ffcc66"],
    description: "Two classmates investigate aliens and ghosts, discovering strange powers and an even stranger friendship.",
    group: "trending",
  },
  {
    id: "demon-slayer",
    title: "Demon Slayer: Kimetsu no Yaiba",
    year: 2019,
    uploadedAt: "2026-10-08",
    genre: "Action · Fantasy",
    rating: "8.7",
    seasons: [26, 7, 11, 11, 8],
    studio: "ufotable",
    palette: ["#47205f", "#fc5656", "#ffcf70"],
    description: "A kind-hearted boy joins the Demon Slayer Corps to protect others and find a cure for his sister.",
    group: "trending",
  },
  {
    id: "spy-family",
    title: "SPY x FAMILY",
    year: 2022,
    uploadedAt: "2026-10-08",
    genre: "Action · Comedy",
    rating: "8.5",
    seasons: [25, 12, 13],
    studio: "WIT Studio · CloverWorks",
    palette: ["#195573", "#28b8c9", "#f3e86d"],
    description: "A spy, an assassin, and a telepath build an unlikely family while each hides their real identity.",
    group: "trending",
  },
  {
    id: "kaiju-no-8",
    title: "Kaiju No. 8",
    year: 2024,
    uploadedAt: "2026-10-07",
    genre: "Action · Sci-Fi",
    rating: "8.4",
    seasons: [12, 11],
    studio: "Production I.G",
    palette: ["#34528b", "#70c8dc", "#f4d9a3"],
    description: "A cleanup worker gains the power to become a kaiju and pursues his dream of joining the defense force.",
    group: "trending",
  },
  {
    id: "chainsaw-man",
    title: "Chainsaw Man",
    year: 2022,
    uploadedAt: "2026-10-07",
    genre: "Action · Supernatural",
    rating: "8.5",
    seasons: [12],
    studio: "MAPPA",
    palette: ["#102a68", "#5381fa", "#77efff"],
    description: "A young devil hunter merges with his loyal chainsaw devil and is pulled into a dangerous new life.",
    group: "recommended",
  },
  {
    id: "blue-lock",
    title: "BLUE LOCK",
    year: 2022,
    uploadedAt: "2026-10-06",
    genre: "Sports · Drama",
    rating: "8.2",
    seasons: [24, 14],
    studio: "8bit",
    palette: ["#2a5272", "#55afc2", "#d2f0d5"],
    description: "Young strikers compete in an intense training program designed to create Japan's ultimate goal scorer.",
    group: "recommended",
  },
  {
    id: "oshi-no-ko",
    title: "Oshi no Ko",
    year: 2023,
    uploadedAt: "2026-10-06",
    genre: "Drama · Mystery",
    rating: "8.7",
    seasons: [11, 13, 11],
    studio: "Doga Kobo",
    palette: ["#542046", "#e55a72", "#ffca88"],
    description: "A doctor's unexpected new life in the entertainment world reveals the bright and complicated side of fame.",
    group: "recommended",
  },
  {
    id: "my-hero-academia",
    title: "My Hero Academia",
    year: 2016,
    uploadedAt: "2026-10-05",
    genre: "Action · Superhero",
    rating: "8.3",
    seasons: [13, 25, 25, 25, 25, 25, 21, 11],
    studio: "Bones Film",
    palette: ["#284627", "#76a747", "#e2d58b"],
    description: "A determined student works toward becoming a hero in a world where extraordinary powers are commonplace.",
    group: "recommended",
  },
  {
    id: "delicious-in-dungeon",
    title: "Delicious in Dungeon",
    year: 2024,
    uploadedAt: "2026-10-05",
    genre: "Fantasy · Comedy",
    rating: "8.6",
    seasons: [24],
    studio: "Trigger",
    palette: ["#541c32", "#ed465a", "#ffbf6e"],
    description: "A band of adventurers explores a monster-filled dungeon, turning their unusual meals into survival.",
    group: "recommended",
  },
  {
    id: "the-apothecary-diaries",
    title: "The Apothecary Diaries",
    year: 2023,
    uploadedAt: "2026-10-04",
    genre: "Drama · Mystery",
    rating: "9.0",
    seasons: [24, 24],
    studio: "TOHO animation · OLM",
    palette: ["#28355f", "#7a77d8", "#eddc91"],
    description: "A sharp-witted apothecary solves medical mysteries and court intrigues inside the imperial palace.",
    group: "recommended",
  },
  {
    id: "blue-box",
    title: "Blue Box",
    year: 2024,
    uploadedAt: "2026-10-04",
    genre: "Romance · Sports",
    rating: "8.2",
    seasons: [25],
    studio: "Telecom Animation Film",
    palette: ["#315b79", "#5fc8cc", "#f3a8c8"],
    description: "A badminton player and a basketball star share a gym, a home, and the quiet determination to reach their dreams.",
    group: "recommended",
  },
];

for (const title of anime) {
  title.image = window.createAnimeCover(title);
  title.backdrop = window.createAnimeBackdrop(title);
  title.downloads = {};
}

window.KUMO_ANIME = anime;

if (document.body.dataset.page === "catalog") {
const featuredAnime = anime.find((title) => title.group === "featured");
document.querySelector(".hero-backdrop").style.backgroundImage = `url("${featuredAnime.backdrop}")`;
document.querySelector(".continue-image img").src = anime.find((title) => title.id === "jujutsu-kaisen").image;
const searchInput = document.querySelector("#search-input");
const toast = document.querySelector("#toast");
let selectedGenre = "All";
let searchTerm = "";
let toastTimer;

function visibleAnime(group) {
  return anime.filter((title) => {
    const matchesGroup = title.group === group;
    const matchesGenre = selectedGenre === "All" || title.genre.split(" · ").includes(selectedGenre);
    const matchesSearch = `${title.title} ${title.genre} ${title.year} ${title.studio}`.toLowerCase().includes(searchTerm);
    return matchesGroup && matchesGenre && matchesSearch;
  });
}

function animeCard(title) {
  const card = document.createElement("a");
  card.className = "movie-card anime-card";
  card.href = `detail.html?id=${encodeURIComponent(title.id)}`;
  card.setAttribute("aria-label", `View ${title.title} details`);
  card.innerHTML = `
    <div class="poster-wrap">
      <img src="${title.image}" alt="Original illustrated cover for ${title.title}" loading="lazy" />
      <span class="poster-rating"><span aria-hidden="true">★</span> ${title.rating}</span>
      <span class="card-open-hint" aria-hidden="true">VIEW ANIME <span>↗</span></span>
    </div>
    <div class="card-info">
      <h3 class="card-title">${title.title}</h3>
      <div class="card-meta"><span>${groupDate(title.uploadedAt)}</span><span>${title.genre}</span></div>
    </div>`;

  return card;
}

function groupDate(date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

function renderRows() {
  document.querySelector("#trending-row").replaceChildren();
  document.querySelector("#recommended-row").replaceChildren();

  for (const group of ["trending", "recommended"]) {
    const row = document.querySelector(`#${group}-row`);
    const items = visibleAnime(group);
    if (items.length === 0) {
      const message = document.createElement("p");
      message.className = "empty-state";
      message.textContent = "No anime matches your search. Try another title or genre.";
      row.append(message);
      continue;
    }
    row.append(...items.map(animeCard));
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function openAnime(title) {
  window.location.href = `detail.html?id=${encodeURIComponent(title.id)}`;
}

function playTitle(title, requestedSeason = "1", requestedEpisode = "1") {
  const animeTitle = anime.find((item) => item.title === title);
  if (!animeTitle) {
    showToast(`"${title}" is not available in the anime catalog.`);
    return;
  }
  const season = Number.parseInt(requestedSeason, 10) || 1;
  const episode = Number.parseInt(requestedEpisode, 10) || 1;
  window.location.href = `watch.html?id=${encodeURIComponent(animeTitle.id)}&season=${season}&episode=${episode}`;
}

document.querySelectorAll(".genre-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    selectedGenre = chip.dataset.genre;
    document.querySelectorAll(".genre-chip").forEach((item) => {
      const isSelected = item === chip;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    renderRows();
  });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderRows();
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
  document.querySelector("#trending-row").scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#hero-play").addEventListener("click", () => playTitle("Solo Leveling"));
document.querySelector("#hero-info").addEventListener("click", () => openAnime(anime.find((title) => title.id === "solo-leveling")));
document.querySelector(".continue-play").addEventListener("click", (event) => {
  event.stopPropagation();
  const { play, season, episode } = event.currentTarget.dataset;
  playTitle(play, season, episode);
});
renderRows();
}
