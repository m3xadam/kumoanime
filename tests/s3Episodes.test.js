import test from "node:test";
import assert from "node:assert/strict";
import {
  episodePrefix,
  isValidAnimeId,
  normalizeS3Prefix,
  parseEpisodeId,
  parseEpisodeObject,
} from "../server/s3Episodes.js";

test("normalizes configured S3 prefixes", () => {
  assert.equal(normalizeS3Prefix(" /series/anime/ "), "series/anime/");
  assert.equal(normalizeS3Prefix(""), "");
});

test("builds a safe prefix for a valid AniList ID", () => {
  assert.equal(episodePrefix("1234", "series/"), "series/1234/");
  assert.throws(() => episodePrefix("../1234", "series/"), /Invalid AniList anime ID/);
});

test("validates numeric AniList IDs", () => {
  assert.equal(isValidAnimeId("1234"), true);
  assert.equal(isValidAnimeId("0"), false);
  assert.equal(isValidAnimeId("2147483648"), false);
  assert.equal(isValidAnimeId("123/episode-1.mp4"), false);
});

test("accepts only episode MP4 files under the requested anime prefix", () => {
  const prefix = "series/1234/";
  assert.equal(parseEpisodeObject("series/1234/episode-12.mp4", prefix), 12);
  assert.equal(parseEpisodeObject("series/1234/episode-12.mkv", prefix), null);
  assert.equal(parseEpisodeObject("series/1234/episode-12.MP4", prefix), null);
  assert.equal(parseEpisodeObject("series/1234/cover.jpg", prefix), null);
  assert.equal(parseEpisodeObject("series/12345/episode-12.mp4", prefix), null);
  assert.equal(parseEpisodeObject("series/1234/../episode-12.mp4", prefix), null);
});

test("parses download IDs without allowing unexpected path values", () => {
  assert.deepEqual(parseEpisodeId("1234_12"), { animeId: "1234", number: 12 });
  assert.equal(parseEpisodeId("../1234_12"), null);
  assert.equal(parseEpisodeId("0_1"), null);
  assert.equal(parseEpisodeId("1234_0"), null);
});
