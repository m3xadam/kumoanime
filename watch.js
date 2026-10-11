const params = new URLSearchParams(window.location.search);
const animeId = params.get("anilist");
const player = document.querySelector("#video-player");
const playerEmpty = document.querySelector("#player-empty");
const streamingEpisodeList = document.querySelector("#streaming-episode-list");
const streamingStatus = document.querySelector("#streaming-status");
let streamingEpisodes = [];
let currentEpisodeUrl = "";
let activePlaybackKind = "";

function renderStreamingEpisodes(items) {
  streamingEpisodes = items
    .map((episode, index) => ({ ...episode, sourceIndex: index }))
    .sort((left, right) => {
      const leftNumber = Number(left.number);
      const rightNumber = Number(right.number);
      const hasLeftNumber = Number.isFinite(leftNumber) && leftNumber > 0;
      const hasRightNumber = Number.isFinite(rightNumber) && rightNumber > 0;
      if (hasLeftNumber && hasRightNumber) return leftNumber - rightNumber || left.sourceIndex - right.sourceIndex;
      if (hasLeftNumber) return -1;
      if (hasRightNumber) return 1;
      return left.sourceIndex - right.sourceIndex;
    });
  streamingEpisodeList.replaceChildren();

  for (const [index, episode] of streamingEpisodes.entries()) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const number = document.createElement("span");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    const playLabel = document.createElement("span");

    button.type = "button";
    button.className = "episode-card local-episode-button";
    button.addEventListener("click", () => playStreamingEpisode(index));
    number.className = "episode-number";
    number.textContent = String(episode.number || index + 1).padStart(2, "0");
    copy.className = "episode-card-copy";
    title.textContent = episode.title || `Episode ${episode.number || index + 1}`;
    playLabel.className = "episode-card-play";
    playLabel.setAttribute("aria-hidden", "true");
    playLabel.textContent = "▶";
    copy.append(title);
    button.append(number, copy, playLabel);
    item.append(button);
    streamingEpisodeList.append(item);
  }
  streamingEpisodeList.hidden = streamingEpisodes.length === 0;
}

function setStreamingUnavailable(message) {
  player.pause();
  player.removeAttribute("src");
  player.load();
  player.hidden = true;
  playerEmpty.hidden = false;
  document.querySelector("#player-empty-title").textContent = "Licensed playback unavailable";
  document.querySelector("#player-empty-message").textContent = message;
  document.querySelector("#watch-episode-meta").hidden = true;
  currentEpisodeUrl = "";
  activePlaybackKind = "";
}

async function playStreamingEpisode(index) {
  const episode = streamingEpisodes[index];
  if (!episode) return;

  streamingStatus.textContent = "Preparing licensed playback…";
  for (const button of streamingEpisodeList.querySelectorAll("button")) {
    button.disabled = true;
  }
  try {
    const playback = await window.LicensedStreaming.getPlayback(episode.id);
    player.pause();
    player.src = playback.url;
    player.hidden = false;
    playerEmpty.hidden = true;
    player.load();
    currentEpisodeUrl = playback.url;
    activePlaybackKind = "streaming";
    const episodeMeta = document.querySelector("#watch-episode-meta");
    episodeMeta.textContent = `Now selected: Episode ${episode.number || index + 1} · ${episode.title || `Episode ${index + 1}`}`;
    episodeMeta.hidden = false;
    for (const [episodeIndex, button] of [...streamingEpisodeList.querySelectorAll("button")].entries()) {
      if (episodeIndex === index) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    }
    streamingStatus.textContent = "Playback source provided by your configured licensed provider.";
  } catch (error) {
    streamingStatus.textContent = error.message;
    setStreamingUnavailable(error.message);
  } finally {
    for (const button of streamingEpisodeList.querySelectorAll("button")) {
      button.disabled = false;
    }
  }
}

async function loadStreamingEpisodes() {
  if (!/^\d+$/.test(animeId || "")) {
    streamingStatus.textContent = "Open a title from the AniList catalog to check provider availability.";
    return;
  }
  try {
    const items = await window.LicensedStreaming.getEpisodes(animeId);
    renderStreamingEpisodes(items);
    streamingStatus.textContent = items.length
      ? `${items.length} episodes available from the configured licensed provider.`
      : "The licensed provider has no episodes available for this title.";
  } catch (error) {
    streamingStatus.textContent = error.message;
  }
}

async function loadAnime() {
  document.querySelector("#watch-title").textContent = "Your videos";
  document.querySelector("#watch-meta").textContent = "Choose authorized video files from your device.";
  document.querySelector("#watch-details").hidden = !/^\d+$/.test(animeId || "");
  if (!/^\d+$/.test(animeId || "")) {
    loadStreamingEpisodes();
    return;
  }
  loadStreamingEpisodes();

  try {
    const anime = await window.AniList.animeDetails(animeId);
    if (!anime) throw new Error("AniList did not return an anime record.");

    const title = anime.title?.english || anime.title?.romaji || anime.title?.native || "Untitled anime";
    const image = anime.coverImage?.extraLarge || anime.coverImage?.large;
    document.title = `Video player: ${title} — Kumo Anime`;
    document.querySelector("#watch-title").textContent = title;
    document.querySelector("#watch-meta").textContent = [
      anime.seasonYear || anime.startDate?.year,
      anime.format?.replaceAll("_", " "),
      anime.episodes ? `${anime.episodes} episodes` : "Episode count unknown",
      (anime.genres || []).join(" · "),
      anime.averageScore ? `★ ${(anime.averageScore / 10).toFixed(1)}` : "Not rated",
    ].filter(Boolean).join(" · ");
    if (image) player.poster = image;
    const detailsUrl = `detail.html?anilist=${encodeURIComponent(anime.id)}`;
    document.querySelector("#watch-back").href = detailsUrl;
    document.querySelector("#watch-details").href = detailsUrl;
  } catch (error) {
    document.querySelector("#watch-meta").textContent = `AniList information could not be loaded. ${error.message}`;
    console.error("AniList watch page request failed:", error);
  }
}

player.addEventListener("error", () => {
  if (!currentEpisodeUrl) return;
  if (activePlaybackKind === "streaming") {
    streamingStatus.textContent = "The licensed provider’s video could not be played in this browser.";
    setStreamingUnavailable("The licensed provider’s video could not be played in this browser.");
    return;
  }
});

loadAnime();
