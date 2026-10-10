const params = new URLSearchParams(window.location.search);
const animeId = params.get("id");
const title = window.KUMO_ANIME.find((item) => item.id === animeId);
const player = document.querySelector("#video-player");
const playerError = document.querySelector("#player-error");

if (!title) {
  document.querySelector("#watch-title").textContent = "Anime not found";
  document.querySelector("#watch-meta").textContent = "Choose an anime from the Kumo catalog to start watching.";
  document.querySelector("#watch-details").hidden = true;
  player.hidden = true;
  playerError.hidden = false;
  playerError.textContent = "This anime isn't in the demo catalog.";
} else {
  const parsedSeason = Number.parseInt(params.get("season") || "1", 10);
  const season = Number.isInteger(parsedSeason) && parsedSeason >= 1 && parsedSeason <= title.seasons.length
    ? parsedSeason
    : 1;
  const parsedEpisode = Number.parseInt(params.get("episode") || "1", 10);
  let episode = Number.isInteger(parsedEpisode) && parsedEpisode >= 1 && parsedEpisode <= title.seasons[season - 1]
    ? parsedEpisode
    : 1;
  let audio = "Japanese";
  const seasonSelect = document.querySelector("#watch-season-select");
  const episodeSelect = document.querySelector("#episode-select");
  const downloadNote = document.querySelector("#download-note");

  document.title = `Now playing: ${title.title} — Kumo Anime`;
  document.querySelector("#watch-title").textContent = title.title;
  document.querySelector("#watch-meta").textContent = `${title.year} · Season ${season}, Episode ${episode} · ${title.genre} · ★ ${title.rating}`;
  document.querySelector("#watch-back").href = `detail.html?id=${encodeURIComponent(title.id)}&season=${season}`;
  document.querySelector("#watch-details").href = `detail.html?id=${encodeURIComponent(title.id)}&season=${season}`;
  player.poster = title.image;

  title.seasons.forEach((_, index) => {
    const seasonNumber = index + 1;
    const option = document.createElement("option");
    option.value = String(seasonNumber);
    option.textContent = `Season ${seasonNumber}`;
    seasonSelect.append(option);
  });
  seasonSelect.value = String(season);

  function syncRoute() {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set("id", title.id);
    nextParams.set("season", String(seasonSelect.value));
    nextParams.set("episode", String(episode));
    window.history.replaceState(null, "", `${window.location.pathname}?${nextParams.toString()}`);
    document.querySelector("#watch-meta").textContent = `${title.year} · Season ${seasonSelect.value}, Episode ${episode} · ${title.genre} · ★ ${title.rating}`;
    document.querySelector(".watch-info .section-kicker").textContent = `EPISODE ${episode} · SAMPLE PREVIEW`;
    document.querySelector("#watch-back").href = `detail.html?id=${encodeURIComponent(title.id)}&season=${seasonSelect.value}`;
    document.querySelector("#watch-details").href = `detail.html?id=${encodeURIComponent(title.id)}&season=${seasonSelect.value}`;
    updateDownloadOptions();
  }

  function updateEpisodes(selectedEpisode) {
    const episodeCount = title.seasons[Number(seasonSelect.value) - 1];
    episodeSelect.replaceChildren();
    for (let number = 1; number <= episodeCount; number += 1) {
      const option = document.createElement("option");
      option.value = String(number);
      option.textContent = `Episode ${String(number).padStart(2, "0")}`;
      episodeSelect.append(option);
    }
    episode = Math.min(selectedEpisode, episodeCount);
    episodeSelect.value = String(episode);
  }

  function updateDownloadOptions() {
    const key = `${seasonSelect.value}-${episode}`;
    for (const button of document.querySelectorAll("[data-download-audio]")) {
      const language = button.dataset.downloadAudio;
      const url = title.downloads[`${key}-${language}`];
      button.disabled = !url;
      button.onclick = null;
      button.removeAttribute("aria-label");
      if (!url) {
        button.setAttribute("aria-label", `No licensed ${language} download configured for this episode`);
        continue;
      }
      button.setAttribute("aria-label", `Download episode ${episode}, ${language} audio`);
      button.onclick = () => {
        try {
          const downloadUrl = new URL(url, window.location.href);
          if (!["http:", "https:", "file:"].includes(downloadUrl.protocol) || downloadUrl.origin !== window.location.origin) {
            throw new Error("Downloads must be configured with a same-origin licensed media file.");
          }
          const anchor = document.createElement("a");
          anchor.href = downloadUrl.href;
          const extension = downloadUrl.pathname.match(/\.[a-z0-9]+$/i)?.[0] || ".mp4";
          anchor.download = `${title.id}-s${seasonSelect.value}e${String(episode).padStart(2, "0")}-${language.toLowerCase()}${extension}`;
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
          downloadNote.textContent = "Your licensed episode download has started.";
        } catch (error) {
          console.error("Could not download the configured episode.", error);
          downloadNote.textContent = "The authorized download failed. Check the configured file and try again.";
        }
      };
    }
    downloadNote.textContent = "Downloads are enabled only for episodes with a configured licensed file.";
  }

  seasonSelect.addEventListener("change", () => {
    player.pause();
    player.currentTime = 0;
    updateEpisodes(1);
    syncRoute();
  });
  episodeSelect.addEventListener("change", () => {
    player.pause();
    player.currentTime = 0;
    episode = Number(episodeSelect.value);
    syncRoute();
  });
  document.querySelectorAll(".audio-option").forEach((button) => {
    button.addEventListener("click", () => {
      audio = button.dataset.audio;
      document.querySelectorAll(".audio-option").forEach((option) => {
        const selected = option === button;
        option.classList.toggle("selected", selected);
        option.setAttribute("aria-pressed", String(selected));
      });
      updateDownloadOptions();
    });
  });
  player.addEventListener("error", () => {
    playerError.hidden = false;
  });

  updateEpisodes(episode);
  syncRoute();
  updateDownloadOptions();
}
