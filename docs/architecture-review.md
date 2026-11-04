# Portfolio application review

## Summary

Admin reads and writes already use a server-side admin check, mutation routes check the origin, article Markdown is sanitized, CMS updates retain revisions, and PDFs use private R2 storage. This pass removes a placeholder CORS policy, adds baseline browser security headers, completes a first admin media workspace for public images and private PDFs, and adds reviewable project technology suggestions.

## Security findings

### Fixed — S1: Placeholder CORS policy was applied globally

`next.config.ts` sent a fake production origin and globally advertised write methods. That configuration could confuse browser integrations and did not represent the deployed domain. The global CORS headers are removed; admin mutation routes enforce same-origin requests. If a real cross-origin client is added later, configure its exact origin at that route.

### Fixed — S2: Baseline browser response headers were missing

The app now sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive `Permissions-Policy`. Content Security Policy is still not configured. Add a report-only CSP after checking the deployed page’s script, style, image, and analytics sources.

### Review — S3: Development dependency advisories remain

The full `npm audit` reported 19 advisories in development dependencies (8 low, 2 moderate, 8 high, 1 critical). `npm audit --omit=dev` reported zero production advisories. Compatible updates did not clear the full report; no forced major upgrades were applied because they could change the test/build toolchain. Revisit the development toolchain separately.

### Mitigated — S4: Media deletion can break published image references

The media page now scans the initial loaded CMS snapshot for each asset’s public ID and lists matching posts, projects, settings, or journey data in the delete confirmation. The confirmation warns that public references will break. Cloudinary display-name rename keeps the delivery URL unchanged. The reference scan is best effort: it covers the initially loaded 50 image assets and string matches in the current admin snapshot, not external code or content beyond the provider page.

### Fixed — S5: PDF storage had no admin lifecycle UI

PDFs now have an admin-only list, upload, short-lived preview link, rename, and delete flow. The R2 object stays private; each route is bound to an authorized request. A new migration grants update/delete on the metadata table only to `service_role`. Upload size is capped at 4 MB to fit the Vercel Function 4.5 MB request-body limit, including multipart overhead.

### Investigate — S6: A blog post fails metadata validation during prerender

The successful production build logged `Invalid blog post metadata` twice from `src/app/blog/[slug]/page.tsx`. The route catches that error and calls `notFound()`, so at least one prerendered article may become a 404. The build log did not include the slug; identify the CMS record and repair its metadata before deployment.

## Admin and authoring improvements

- The media page separates **Public images** from **Private PDFs**. It supports search, upload, copy URL, preview, stable-URL image display-name rename, reference-aware confirmation, PDF rename, and PDF deletion confirmation.
- The project editor suggests technology names from overview, features, challenges, learnings, and process text. Suggestions are editable before saving.
- The default technology groups match the requested Technologies, Development Tools, and Design Tools lists.
- Existing optimistic revision tokens and article sanitization remain important safety controls. Good next admin improvements are autosave/recovery, revision compare/restore, media folders/tags, drag-and-drop upload progress, and keyboard/narrow-screen review.

## Homepage and SEO recommendations

- Keep project ordering explicit: pinned projects first, then project date. Keep `updatedAt` separate and show it only in admin.
- Add homepage controls for section visibility/order, titles, copy, and project count if they are not already represented in site settings.
- Expand SEO checks to cover canonical URLs, duplicate titles/slugs, image alt text, structured data, and social previews. Show these as editorial checks, not ranking promises.
- Surface failed revalidation after a successful save so admins can distinguish saved content from refreshed public pages.

## Developer icon source

The supplied catalog page is a searchable browse UI; its documentation points React apps to the `developer-icons` npm package rather than a separate search API. The app now uses that package’s local SVG components for catalog matches, including Next.js, React, TypeScript, Python, FastAPI, PostgreSQL, Supabase, Git, GitHub, Docker, Playwright, and Figma. Names without a catalog entry (for example Milvus, Pytest, Vector Search, and AI Agents) keep a text badge. The package declares MIT; brand and trademark use still follows each owner’s rules.

## Verification

- `npm run typecheck` passes.
- `npm run lint` passes with 4 existing warnings: two raw `<img>` warnings and two unused underscore parameters in a document test helper.
- `npm audit --omit=dev` reports 0 production advisories; full audit still reports development-tool advisories.
- `npm run build` passes after allowing Google Fonts network access; it still reports the blog metadata errors in S6.
