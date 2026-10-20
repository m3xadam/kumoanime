export function normalizeS3Prefix(prefix = "") {
  const normalized = prefix.trim().replace(/^\/+|\/+$/g, "");
  return normalized ? `${normalized}/` : "";
}

export function isValidAnimeId(value) {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value)) return false;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2_147_483_647;
}

export function episodePrefix(animeId, prefix) {
  if (!isValidAnimeId(animeId)) {
    throw new Error("Invalid AniList anime ID.");
  }
  return `${normalizeS3Prefix(prefix)}${animeId}/`;
}

export function parseEpisodeObject(key, requestedPrefix) {
  if (typeof key !== "string" || !key.startsWith(requestedPrefix)) return null;
  const filename = key.slice(requestedPrefix.length);
  const match = /^episode-([1-9]\d*)\.mp4$/.exec(filename);
  if (!match) return null;

  const number = Number(match[1]);
  if (!Number.isSafeInteger(number)) return null;
  return number;
}

export function parseEpisodeId(episodeId) {
  if (typeof episodeId !== "string") return null;
  const match = /^([1-9]\d{0,9})_([1-9]\d*)$/.exec(episodeId);
  if (!match || !isValidAnimeId(match[1])) return null;

  const number = Number(match[2]);
  return Number.isSafeInteger(number)
    ? { animeId: match[1], number }
    : null;
}
