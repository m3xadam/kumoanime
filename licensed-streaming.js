
(() => {
  "use strict";

  // Cloudflare Pages Functions API.
  // The leading slash keeps requests on your current domain.
  const apiRoot = "/api/licensed-streaming";

  /**
   * Make a request to your backend.
   */
  async function request(path) {
    let response;

    try {
      response = await fetch(`${apiRoot}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        credentials: "same-origin",
        cache: "no-store"
      });
    } catch {
      throw new Error(
        "Unable to connect to the streaming service. Check your connection."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "Streaming is not authorized for this anime."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "The requested anime or episode was not found."
      );
    }

    if (response.status === 501) {
      throw new Error(
        "The streaming service is not configured yet."
      );
    }

    if (!response.ok) {
      throw new Error(
        `Streaming service request failed (${response.status}).`
      );
    }

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "The streaming service returned an invalid response."
      );
    }

    if (!result || typeof result !== "object") {
      throw new Error(
        "The streaming service returned an unexpected response."
      );
    }

    return result;
  }

  /**
   * Retrieve authorized episodes for an anime.
   *
   * Expected backend response:
   * {
   *   episodes: [
   *     { id: "119-1", number: 1, title: "Episode 1" }
   *   ]
   * }
   */
  async function getEpisodes(animeId) {
    if (
      animeId === undefined ||
      animeId === null ||
      !/^\d+$/.test(String(animeId))
    ) {
      throw new Error("Invalid anime ID.");
    }

    const result = await request(
      `/anime/${encodeURIComponent(String(animeId))}/episodes`
    );

    if (!Array.isArray(result.episodes)) {
      throw new Error(
        "The streaming service returned an invalid episode list."
      );
    }

    return result.episodes.filter((episode) => {
      return (
        episode &&
        (typeof episode.id === "string" ||
          typeof episode.id === "number") &&
        String(episode.id).length > 0 &&
        (typeof episode.title === "string" ||
          typeof episode.number === "number")
      );
    });
  }

  /**
   * Retrieve an authorized playback URL.
   *
   * Expected backend response:
   * {
   *   url: "https://authorized-provider.example/episode.mp4",
   *   mimeType: "video/mp4"
   * }
   *
   * This frontend accepts direct HTTPS MP4 URLs only.
   */
  async function getPlayback(episodeId) {
    if (
      episodeId === undefined ||
      episodeId === null ||
      !/^\d+-\d+$/.test(String(episodeId))
    ) {
      throw new Error("Invalid episode ID.");
    }

    const result = await request(
      `/episodes/${encodeURIComponent(String(episodeId))}/playback`
    );

    if (
      typeof result.url !== "string" ||
      result.mimeType !== "video/mp4"
    ) {
      throw new Error(
        "No authorized MP4 playback is available."
      );
    }

    let url;

    try {
      url = new URL(result.url);
    } catch {
      throw new Error(
        "The streaming service returned an invalid playback URL."
      );
    }

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !url.pathname.toLowerCase().endsWith(".mp4")
    ) {
      throw new Error(
        "The streaming service returned an unsupported playback URL."
      );
    }

    return {
      url: url.href,
      mimeType: result.mimeType
    };
  }

  /**
   * Optional helper to play an episode using your HTML video element.
   *
   * Usage:
   * LicensedStreaming.playEpisode("119-1", "#anime-player");
   */
  async function playEpisode(episodeId, selector = "#anime-player") {
    const video = document.querySelector(selector);

    if (!(video instanceof HTMLVideoElement)) {
      throw new Error("The HTML video player was not found.");
    }

    const playback = await getPlayback(episodeId);

    video.pause();
    video.src = playback.url;
    video.load();

    try {
      await video.play();
    } catch {
      // Autoplay may be blocked. The user can press Play manually.
    }

    return playback;
  }

  // Public interface used by the rest of your website.
  window.LicensedStreaming = Object.freeze({
    getEpisodes,
    getPlayback,
    playEpisode
  });
})();
