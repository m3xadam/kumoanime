# S3 episode downloads

The React download page calls a same-origin API. The Node API lists and downloads MP4 objects matching:

```text
{S3_PREFIX}/{anilistId}/episode-{number}.mp4
```

For example, with `S3_PREFIX=anime`, AniList ID `1234`, and episode `5`, the object key is `anime/1234/episode-5.mp4`.

## Configure

1. Copy `.env.example` to `.env` and set `S3_BUCKET`, `S3_PREFIX`, and `AWS_REGION`. For a container deployment, set `API_HOST=0.0.0.0`; the local default only listens on loopback.
2. Configure AWS credentials for the server using the standard AWS SDK credential chain (prefer an IAM role in deployment). Do not put AWS keys in React code or commit them to `.env`.
3. Grant the server identity `s3:ListBucket` on the bucket, restricted with the `s3:prefix` condition to the configured prefix, and `s3:GetObject` on `{prefix}/*`.
4. Start the API and Vite in separate terminals with `npm run api` and `npm run dev`. Vite proxies `/api` to the local API at port 3001.

## API

- `GET /api/licensed-streaming/anime/{anilistId}/episodes` lists matching objects and returns episode numbers in ascending order.
- `GET /api/licensed-streaming/episodes/{anilistId}_{episodeNumber}/download` redirects to a presigned S3 download URL. Presigned URLs expire after `S3_DOWNLOAD_EXPIRY_SECONDS` (60–3600 seconds; default 300).

The bucket can remain private. The API validates IDs, only lists the requested anime prefix, ignores keys that do not exactly match the episode filename pattern, and sets a safe attachment filename on the signed response.

## Access control

There is no user authentication in this project. Anyone who can reach the API can request episode lists and short-lived download URLs for known AniList IDs. If downloads should be restricted to signed-in users, add authentication and entitlement checks to the API before deploying it publicly. Never expose AWS credentials in client-side code.
