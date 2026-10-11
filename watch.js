
"use strict";

(() => {
  const params = new URLSearchParams(window.location.search);
  const animeId = params.get("anilist");

  const player = document.querySelector("#video-player");
  const playerEmpty = document.querySelector("#player-empty");
  const streamingEpisodeList = document.querySelector("#streaming-episode-list");
  const streamingStatus = document.querySelector("#streaming-status");
  const nextEpisodePanel = document.querySelector("#next-episode-panel");
  const nextEpisodeTitle = document.querySelector("#next-episode-title");
  const nextEpisodeMeta = document.querySelector("#next-episode-meta");
  const nextEpisodeButton = document.querySelector("#next-episode-button");

  let streamingEpisodes = [];
  let currentEpisodeUrl = "";
  let activePlaybackKind = "";
  let currentEpisodeIndex = -1;
  let playbackRequest = 0;

  function getText(item) {
    return (
      item?.title?.english ||
      item?.title?.romaji ||
      item?.title?.native ||
      "Untitled anime"
    );
  }

  function setStatus(message) {
    streamingStatus.textContent = message;
  }

  function setStreamingUnavailable(message) {
    playbackRequest++;

    player.pause();
    player.removeAttribute("src");
    player.load();
    player.hidden = true;

    playerEmpty.hidden = false;

    document.querySelector("#player-empty-title").textContent =
      "Licensed playback unavailable";

    document.querySelector("#player-empty-message").textContent = message;
    document.querySelector("#watch-episode-meta").hidden = true;

    currentEpisodeUrl = "";
    activePlaybackKind = "";
  }

  function getEpisodeDetails(episode, fallbackIndex) {
    const number = Number(episode?.number) || fallbackIndex + 1;
    const title = episode?.title || `Episode ${number}`;
    return { number, title };
  }

  function updateNextEpisodeDetails() {
    if (!nextEpisodePanel || !nextEpisodeTitle || !nextEpisodeMeta) return;

    if (!streamingEpisodes.length) {
      nextEpisodePanel.hidden = true;
      return;
    }

    const nextIndex = currentEpisodeIndex >= 0 ? currentEpisodeIndex + 1 : 0;
    const nextEpisode = streamingEpisodes[nextIndex];

    if (!nextEpisode) {
      nextEpisodePanel.hidden = true;
      return;
    }

    const { number, title } = getEpisodeDetails(nextEpisode, nextIndex);
    const episodeLabel = `Episode ${number}`;

    nextEpisodeTitle.textContent = title;
    nextEpisodeMeta.textContent = currentEpisodeIndex >= 0
      ? `Up next after episode ${currentEpisodeIndex + 1}`
      : `Up next • ${episodeLabel}`;

    nextEpisodePanel.hidden = false;
    nextEpisodeButton.disabled = false;
    nextEpisodeButton.onclick = () => playStreamingEpisode(nextIndex);
  }

  function renderStreamingEpisodes(items) {
    streamingEpisodes = items
      .map((episode, index) => ({
        ...episode,
        sourceIndex: index
      }))
      .sort((left, right) => {
        const a = Number(left.number);
        const b = Number(right.number);

        const hasA = Number.isFinite(a) && a > 0;
        const hasB = Number.isFinite(b) && b > 0;

        if (hasA && hasB) {
          return a - b || left.sourceIndex - right.sourceIndex;
        }

        if (hasA) return -1;
        if (hasB) return 1;

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

      button.addEventListener("click", () => {
        playStreamingEpisode(index);
      });

      number.className = "episode-number";
      number.textContent = String(episode.number || index + 1).padStart(2, "0");

      copy.className = "episode-card-copy";

      title.textContent =
        episode.title || `Episode ${episode.number || index + 1}`;

      playLabel.className = "episode-card-play";
      playLabel.setAttribute("aria-hidden", "true");
      playLabel.textContent = "▶";

      copy.append(title);
      button.append(number, copy, playLabel);
      item.append(button);
      streamingEpisodeList.append(item);
    }

    streamingEpisodeList.hidden = streamingEpisodes.length === 0;
    updateNextEpisodeDetails();
  }

  async function playStreamingEpisode(index) {
    const episode = streamingEpisodes[index];

    if (!episode) return;

    if (!window.LicensedStreaming) {
      setStatus("The licensed streaming service has not loaded.");
      return;
    }

    const requestId = ++playbackRequest;

    setStatus("Checking playback authorization…");

    const buttons = [
      ...streamingEpisodeList.querySelectorAll("button")
    ];

    buttons.forEach(button => {
      button.disabled = true;
    });

    try {
      // The server must authorize this episode before returning its URL.
      const playback = await window.LicensedStreaming.getPlayback(
        String(episode.id)
      );

      // Ignore a stale response if another playback request has started.
      if (requestId !== playbackRequest) return;

      const url = new URL(playback.url);

      if (
        url.protocol !== "https:" ||
        playback.mimeType !== "video/mp4"
      ) {
        throw new Error("The provider returned an unsupported video format.");
      }

      player.pause();
      player.src = url.href;
      player.hidden = false;
      playerEmpty.hidden = true;
      player.load();

      currentEpisodeUrl = url.href;
      activePlaybackKind = "streaming";

      const episodeNumber = episode.number || index + 1;
      const episodeTitle = episode.title || `Episode ${episodeNumber}`;

      const episodeMeta = document.querySelector("#watch-episode-meta");

      episodeMeta.textContent =
        `Now selected: Episode ${episodeNumber} · ${episodeTitle}`;

      episodeMeta.hidden = false;

      currentEpisodeIndex = index;

      buttons.forEach((button, buttonIndex) => {
        if (buttonIndex === index) {
          button.setAttribute("aria-current", "true");
        } else {
          button.removeAttribute("aria-current");
        }
      });

      updateNextEpisodeDetails();
      setStatus("Authorized episode loaded. Press Play to begin.");
    } catch (error) {
      if (requestId !== playbackRequest) return;

      setStreamingUnavailable(
        error.message || "Could not authorize this episode."
      );

      setStatus(error.message || "Playback is unavailable.");
    } finally {
      buttons.forEach(button => {
        button.disabled = false;
      });
    }
  }

  async function loadStreamingEpisodes() {
    if (!/^\d+$/.test(animeId || "")) {
      setStatus("Open an anime from the catalog to check episode availability.");
      return;
    }

    if (!window.LicensedStreaming) {
      setStatus("The streaming module has not loaded. Check your script tags.");
      return;
    }

    setStatus("Checking authorized episode availability…");

    try {
      const items = await window.LicensedStreaming.getEpisodes(animeId);

      renderStreamingEpisodes(items);

      if (items.length) {
        setStatus(`${items.length} authorized episodes available.`);
      } else {
        setStatus("No authorized episodes are available for this title.");
      }
    } catch (error) {
      streamingEpisodeList.replaceChildren();
      streamingEpisodeList.hidden = true;

      setStatus(error.message || "Could not load authorized episodes.");
    }
  }

  async function loadAnime() {
    document.querySelector("#watch-title").textContent = "Loading anime…";

    document.querySelector("#watch-meta").textContent =
      "Loading anime information…";

    document.querySelector("#watch-details").hidden =
      !/^\d+$/.test(animeId || "");

    if (!/^\d+$/.test(animeId || "")) {
      document.querySelector("#watch-title").textContent = "Your videos";

      document.querySelector("#watch-meta").textContent =
        "Choose an anime from the catalog to check authorized episodes.";

      await loadStreamingEpisodes();
      return;
    }

    // Load authorization-gated episodes independently of AniList metadata.
    loadStreamingEpisodes();

    try {
      if (!window.AniList) {
        throw new Error("The AniList module has not loaded.");
      }

      const anime = await window.AniList.animeDetails(animeId);

      if (!anime) {
        throw new Error("AniList did not return an anime record.");
      }

      const title = getText(anime);
      const image = anime.coverImage?.extraLarge || anime.coverImage?.large;

      document.title = `Video player: ${title} — Kumo Anime`;

      document.querySelector("#watch-title").textContent = title;

      document.querySelector("#watch-meta").textContent = [
        anime.seasonYear || anime.startDate?.year,
        anime.format?.replaceAll("_", " "),
        anime.episodes ? `${anime.episodes} episodes` : "Episode count unknown",
        (anime.genres || []).join(" · "),
        anime.averageScore
          ? `★ ${(anime.averageScore / 10).toFixed(1)}`
          : "Not rated"
      ].filter(Boolean).join(" · ");

      if (image) {
        player.poster = image;
      }

      const detailsUrl =
        `detail.html?anilist=${encodeURIComponent(anime.id)}`;

      document.querySelector("#watch-back").href = detailsUrl;
      document.querySelector("#watch-details").href = detailsUrl;
    } catch (error) {
      document.querySelector("#watch-meta").textContent =
        `AniList information could not be loaded. ${error.message}`;

      console.error("AniList watch page request failed:", error);
    }
  }

  player.addEventListener("error", () => {
    if (!currentEpisodeUrl || activePlaybackKind !== "streaming") return;

    setStreamingUnavailable(
      "The authorized video could not be played. The provider may not support this browser or video format."
    );

    setStatus("Video playback failed.");
  });

  loadAnime();
})();
