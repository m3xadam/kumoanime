import "dotenv/config";
import { createServer } from "node:http";
import {
  HeadObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  episodePrefix,
  normalizeS3Prefix,
  parseEpisodeId,
  parseEpisodeObject,
  isValidAnimeId,
} from "./s3Episodes.js";

const port = Number(process.env.API_PORT || 3001);
const host = process.env.API_HOST || "127.0.0.1";
const bucket = process.env.S3_BUCKET?.trim();
const region = process.env.AWS_REGION?.trim();
const rootPrefix = normalizeS3Prefix(process.env.S3_PREFIX || "");
const downloadExpirySeconds = Number(process.env.S3_DOWNLOAD_EXPIRY_SECONDS || 300);
const s3 = region ? new S3Client({ region }) : null;

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

function isConfigurationReady() {
  return Boolean(
    bucket &&
    region &&
    s3 &&
    Number.isInteger(downloadExpirySeconds) &&
    downloadExpirySeconds >= 60 &&
    downloadExpirySeconds <= 3600
  );
}

async function listEpisodes(animeId) {
  const prefix = episodePrefix(animeId, rootPrefix);
  const episodes = [];
  let continuationToken;

  do {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }));
    for (const object of result.Contents || []) {
      const number = parseEpisodeObject(object.Key, prefix);
      if (number !== null) {
        episodes.push({
          id: `${animeId}_${number}`,
          number,
          title: `Episode ${number}`,
        });
      }
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (continuationToken);

  episodes.sort((left, right) => left.number - right.number);
  return episodes;
}

async function createDownloadUrl(animeId, episodeNumber) {
  const key = `${episodePrefix(animeId, rootPrefix)}episode-${episodeNumber}.mp4`;
  const safeFilename = `anime-${animeId}-episode-${episodeNumber}.mp4`;
  await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentType: "video/mp4",
      ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
    }),
    { expiresIn: downloadExpirySeconds }
  );
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const listMatch = /^\/api\/licensed-streaming\/anime\/([^/]+)\/episodes$/.exec(url.pathname);
  const downloadMatch = /^\/api\/licensed-streaming\/episodes\/([^/]+)\/download$/.exec(url.pathname);

  if (request.method !== "GET" || (!listMatch && !downloadMatch)) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  if (listMatch && !isValidAnimeId(listMatch[1])) {
    sendJson(response, 400, { error: "Invalid AniList anime ID." });
    return;
  }
  if (downloadMatch && !parseEpisodeId(downloadMatch[1])) {
    sendJson(response, 400, { error: "Invalid episode ID." });
    return;
  }
  if (!isConfigurationReady()) {
    sendJson(response, 503, { error: "The S3 download service is not configured." });
    return;
  }

  try {
    if (listMatch) {
      const animeId = listMatch[1];
      const episodes = await listEpisodes(animeId);
      sendJson(response, 200, { episodes });
      return;
    }

    const episodeId = downloadMatch[1];
    const parsed = parseEpisodeId(episodeId);
    if (!parsed) {
      sendJson(response, 400, { error: "Invalid episode ID." });
      return;
    }
    const location = await createDownloadUrl(parsed.animeId, parsed.number);
    response.writeHead(302, {
      Location: location,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    });
    response.end();
  } catch (error) {
    if (error.name === "NoSuchKey" || error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      sendJson(response, 404, { error: "The requested episode was not found." });
      return;
    }
    console.error("S3 episode API request failed:", error);
    sendJson(response, 502, { error: "The S3 episode request failed." });
  }
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error("S3 API request handler failed:", error);
    if (!response.headersSent) {
      sendJson(response, 500, { error: "The S3 download request failed." });
    } else {
      response.destroy();
    }
  });
});

server.listen(port, host, () => {
  console.log(`S3 episode API listening at http://${host}:${port}`);
  if (!isConfigurationReady()) {
    console.warn("Configure S3_BUCKET, AWS_REGION, and S3_DOWNLOAD_EXPIRY_SECONDS to enable downloads.");
  }
});
