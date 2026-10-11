(() => {
  const apiRoot = "/api/licensed-streaming";

  async function request(path) {
    const response = await fetch(`${apiRoot}${path}`, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (!response.ok) {
      if (response.status === 404 || response.status === 501) {
        throw new Error("Licensed streaming is not configured on this site yet.");
      }
      throw new Error(`Streaming service request failed (${response.status}).`);
    }
    return response.json();
  }

  async function getEpisodes(animeId) {
    const result = await request(`/anime/${encodeURIComponent(animeId)}/episodes`);
    if (!Array.isArray(result.episodes)) {
      throw new Error("The streaming service returned an invalid episode list.");
    }
    return result.episodes.filter((episode) =>
      episode && (typeof episode.id === "string" || typeof episode.id === "number")
      && String(episode.id).length > 0
      && (typeof episode.title === "string" || typeof episode.number === "number"));
  }

  async function getPlayback(episodeId) {
    const result = await request(`/episodes/${encodeURIComponent(episodeId)}/playback`);
    if (typeof result.url !== "string") {
      throw new Error("The streaming service did not return a playback URL.");
    }

    const url = new URL(result.url, window.location.href);
    const isLocalHttp = url.protocol === "http:" && url.origin === window.location.origin;
    if (url.protocol !== "https:" && !isLocalHttp) {
      throw new Error("The streaming service returned an insecure playback URL.");
    }
    return { url: url.href, mimeType: typeof result.mimeType === "string" ? result.mimeType : "" };
  }

  window.LicensedStreaming = { getEpisodes, getPlayback };
})();
