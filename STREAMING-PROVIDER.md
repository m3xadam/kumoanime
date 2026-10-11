# Licensed streaming provider integration

The player has a same-origin adapter in `licensed-streaming.js`. It does not call a third-party stream aggregator and does not contain provider credentials. Until a licensed backend is implemented, the streaming section reports that the provider is not configured. The player does not provide local-file playback.

## Backend contract

Implement these routes on the site's backend:

### `GET /api/licensed-streaming/anime/{anilistId}/episodes`

Map the AniList ID to the provider's catalog using an authorized provider API, then return:

```json
{
  "episodes": [
    { "id": "provider-episode-id", "number": 1, "title": "Episode title" }
  ]
}
```

`episodes` must be an array. Each episode needs a string or numeric `id` and either a string `title` or numeric `number`.

### `GET /api/licensed-streaming/episodes/{episodeId}/playback`

Authorize the current user and obtain a playback URL from the licensed provider on the server. Return:

```json
{
  "url": "https://licensed-provider.example/path/to/authorized-video.mp4",
  "mimeType": "video/mp4"
}
```

The URL must be an HTTPS media URL supported by the browser. The frontend rejects insecure external URLs. Use short-lived provider URLs where available.

## Security and deployment

- Keep provider API keys, signing secrets, and entitlement checks on the backend. Never add them to HTML, JavaScript, or frontend environment variables.
- Enforce the provider's license, geographic restrictions, user entitlements, rate limits, and terms on the server.
- Validate and encode route parameters; return only episodes the user is authorized to play.
- Serve these endpoints from the same origin as the site. The frontend uses same-origin credentials and expects JSON.
- Return `404` or `501` until the backend adapter is configured. The UI treats either status as “not configured.”
- This repository currently serves static HTML and JavaScript, so a backend/API service must be added or deployed separately before licensed streaming can work.
