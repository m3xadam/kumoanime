const API_URL = "https://graphql.anilist.co";
const CACHE_PREFIX = "kumo:anilist:";
const CACHE_DURATION = 10 * 60 * 1000;
const MIN_REQUEST_GAP = 700;
const RATE_LIMIT_KEY = "kumo:anilist:next-request-at";
let nextRequestAt = 0;
let requestQueue = Promise.resolve();
const inFlight = new Map();

const CARD_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { large extraLarge }
  bannerImage
  description(asHtml: false)
  startDate { year month day }
  seasonYear
  episodes
  status
  format
  averageScore
  genres
  nextAiringEpisode { airingAt episode timeUntilAiring }
`;

const ANIME_FIELDS = `
  ${CARD_FIELDS}
  endDate { year month day }
  season
  duration
  source
  countryOfOrigin
  meanScore
  popularity
  favourites
  tags { name }
  studios(isMain: true) { nodes { name } }
  siteUrl
  trailer { id site thumbnail }
`;

try {
  nextRequestAt = Number(sessionStorage.getItem(RATE_LIMIT_KEY)) || 0;
} catch (error) {
  console.warn("Could not read the AniList request schedule.", error);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function cacheKey(query, variables) {
  return `${CACHE_PREFIX}${query}${JSON.stringify(variables)}`;
}

function readCache(key) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key));
    if (cached && Date.now() - cached.savedAt < CACHE_DURATION) return cached.value;
  } catch (error) {
    console.warn("Could not read the AniList cache.", error);
  }
  return null;
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }));
  } catch (error) {
    console.warn("Could not save the AniList cache.", error);
  }
}

async function send(query, variables, attempt = 0) {
  const delay = Math.max(0, nextRequestAt - Date.now());
  if (delay) await wait(delay);
  nextRequestAt = Date.now() + MIN_REQUEST_GAP;
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, String(nextRequestAt));
  } catch (error) {
    console.warn("Could not save the AniList request schedule.", error);
  }

  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    if (attempt < 2) {
      await wait(1000 * (attempt + 1));
      return send(query, variables, attempt + 1);
    }
    throw new Error("Could not reach AniList. Check your connection and try again.", { cause: error });
  }

  if (!response.ok) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1));
      return send(query, variables, attempt + 1);
    }
    throw new Error(`AniList request failed (${response.status} ${response.statusText}).`);
  }

  const result = await response.json();
  if (result.errors?.length) {
    const message = result.errors.map((error) => error.message).filter(Boolean).join(" ");
    throw new Error(message || "AniList returned a GraphQL error.");
  }
  if (!result.data) throw new Error("AniList returned an empty response.");
  return result.data;
}

function queuedSend(query, variables) {
  const pending = requestQueue.then(() => send(query, variables));
  requestQueue = pending.then(() => undefined, () => undefined);
  return pending;
}

function query(document, variables = {}) {
  const key = cacheKey(document, variables);
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  if (inFlight.has(key)) return inFlight.get(key);

  const pending = queuedSend(document, variables)
    .then((value) => {
      writeCache(key, value);
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, pending);
  return pending;
}

const pageQuery = `query AnimeCatalog($page: Int!, $perPage: Int!, $search: String, $genre: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage hasNextPage total }
    media(type: ANIME, search: $search, genre: $genre, sort: POPULARITY_DESC, isAdult: false) {
      ${CARD_FIELDS}
    }
  }
}`;

const seasonQuery = `query CurrentAnime($page: Int!, $perPage: Int!, $season: MediaSeason!, $seasonYear: Int!, $search: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage hasNextPage total }
    media(type: ANIME, season: $season, seasonYear: $seasonYear, status: RELEASING, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      ${CARD_FIELDS}
    }
  }
}`;

const detailQuery = `query AnimeDetails($id: Int!) {
  Media(id: $id, type: ANIME) {
    ${ANIME_FIELDS}
    rankings { rank type context year season }
    relations {
      edges {
        relationType(version: 2)
        node { id type title { romaji english native } coverImage { large } format startDate { year } }
      }
    }
    recommendations(sort: [RATING_DESC], perPage: 8) {
      nodes {
        mediaRecommendation {
          id idMal title { romaji english } coverImage { large } genres averageScore
        }
      }
    }
  }
}`;

const relationsQuery = `query AnimeRelations($ids: [Int!]!, $perPage: Int!) {
  Page(perPage: $perPage) {
    media(id_in: $ids, type: ANIME) {
      id
      relations {
        edges {
          relationType(version: 2)
          node { id type title { romaji english native } coverImage { large } format startDate { year } }
        }
      }
    }
  }
}`;

const recentlyAiredQuery = `query RecentlyAiredEpisodes($page: Int!, $perPage: Int!, $from: Int!, $to: Int!) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage hasNextPage total }
    airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME_DESC) {
      id
      airingAt
      episode
      media {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        format
        seasonYear
        startDate { year }
      }
    }
  }
}`;

function pageResult(data) {
  return {
    data: data.Page.media,
    pagination: {
      hasNextPage: data.Page.pageInfo.hasNextPage,
      total: data.Page.pageInfo.total,
    },
  };
}

export function animeTitle(item) {
  return item.title?.english || item.title?.romaji || item.title?.native || "Untitled anime";
}

export async function animePage({ page = 1, perPage = 24, search = "", genre = "" } = {}) {
  const data = await query(pageQuery, { page, perPage, search: search || null, genre: genre || null });
  return pageResult(data);
}

export async function currentSeasonPage({ page = 1, perPage = 24, search = "" } = {}) {
  const date = new Date();
  const month = date.getMonth();
  const season = month < 3 ? "WINTER" : month < 6 ? "SPRING" : month < 9 ? "SUMMER" : "FALL";
  const data = await query(seasonQuery, {
    page,
    perPage,
    season,
    seasonYear: date.getFullYear(),
    search: search || null,
  });
  return pageResult(data);
}

export async function animeDetails(id) {
  const data = await query(detailQuery, { id: Number(id) });
  return data.Media;
}

export async function animeRelations(ids) {
  if (!ids.length) return [];
  const data = await query(relationsQuery, { ids, perPage: ids.length });
  return data.Page.media;
}

export async function recentlyAiredEpisodes({ page = 1, perPage = 30, from, to } = {}) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from >= to) {
    throw new Error("A valid episode release date range is required.");
  }
  const data = await query(recentlyAiredQuery, { page, perPage, from, to });
  return {
    data: data.Page.airingSchedules,
    pagination: {
      hasNextPage: data.Page.pageInfo.hasNextPage,
      total: data.Page.pageInfo.total,
    },
  };
}
