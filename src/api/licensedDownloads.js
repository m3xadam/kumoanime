const API_ROOT = "/api/licensed-streaming";

const validEpisodeId = (episodeId) =>
  (typeof episodeId === "string" || typeof episodeId === "number") &&
  /^[A-Za-z0-9_-]{1,128}$/.test(String(episodeId));

async function request(path) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the download service. Check your connection.");
  }

  if (response.status === 403) throw new Error("Downloads are not authorized for this anime.");
  if (response.status === 404) throw new Error("The requested anime or episode was not found.");
  if (response.status === 503) throw new Error("The S3 download service is not configured.");
  if (response.status === 501) throw new Error("The download service is not configured yet.");
  if (!response.ok) throw new Error(`Download service request failed (${response.status}).`);

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The download service returned an invalid response.");
  }
  if (!result || typeof result !== "object") {
    throw new Error("The download service returned an unexpected response.");
  }
  return result;
}

export async function getEpisodes(animeId) {
  if (animeId === undefined || animeId === null || !/^\d+$/.test(String(animeId))) {
    throw new Error("Invalid anime ID.");
  }
  const result = await request(`/anime/${encodeURIComponent(String(animeId))}/episodes`);
  if (!Array.isArray(result.episodes)) {
    throw new Error("The download service returned an invalid episode list.");
  }
  return result.episodes.filter((episode) =>
    episode && validEpisodeId(episode.id) &&
    (typeof episode.title === "string" || typeof episode.number === "number")
  );
}

export function getDownloadUrl(episodeId) {
  if (!validEpisodeId(episodeId)) throw new Error("Invalid episode ID.");
  return `${API_ROOT}/episodes/${encodeURIComponent(String(episodeId))}/download`;
}
