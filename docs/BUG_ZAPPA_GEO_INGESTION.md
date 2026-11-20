# Bug: Cloudflare geo-ingest endpoint stops portfolio analytics

## Symptoms

After changing the portfolio analytics endpoint to the `zappa-geo-ingest` Cloudflare Worker, new page events stopped appearing in the live dashboard. Existing analytics remain visible, but are historical.

## Evidence

- The Render API health check reports the database, client IP forwarding, Cloudflare geo forwarding, GeoLite database, and auto-update as enabled.
- Render logs show successful event requests through the legacy `/internal/events` path, but no requests through `/internal/events/geo` after switching the portfolio endpoint.
- Cloudflare Worker observability showed no invocations during the inspected period.

## Current workaround

Restore the previously working Vercel proxy configuration in `src/app/layout.tsx`: read `NEXT_PUBLIC_ZAPPA_ORIGIN` and pass `${origin}/api/events` to the analytics SDK. Configure the production origin variable and redeploy.

## Follow-up

When revisiting the Cloudflare Worker integration, verify the production build uses the configured endpoint, then confirm a browser event reaches the Worker, is forwarded to Render with a 2xx response, and appears as a new event with location data. Do not expect historical null locations to be backfilled.
