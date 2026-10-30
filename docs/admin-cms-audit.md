# Portfolio admin and CMS integration audit

The existing portfolio uses Next.js 15 App Router, React 19, Tailwind 4, Radix/shadcn primitives, MDX files for blog posts, TypeScript project records, and a JSON file for Journey. There is no production admin authentication or database-backed CMS. The existing Journey editor is development-only, accepts a local token, writes to disk, and cannot be used as a deployed CMS. The previous local-only assumptions must be replaced with persistent server-side storage and authenticated authorization before publishing the admin dashboard.

The requested reference, `arhamkhnz/next-shadcn-admin-dashboard`, was cloned and inspected. It is MIT licensed, uses a grouped collapsible sidebar, inset content area, compact toolbar, cards, tables, and accessible dialogs. Its current branch uses Next.js 16, newer React, and a substantially larger dependency set, so the integration will adapt its patterns using the portfolio's existing Card, Button, Dialog, DropdownMenu, theme, and Lucide components instead of copying its app or demo data. The reference project also provides a Next.js 15 archive branch.

## Integration sequence

1. Isolate the admin shell from public navigation while keeping public routes unchanged.
2. Add real server-verified admin sessions and authorization, with no public registration. Protect all admin pages and all mutations; do not reuse the current development bearer token as a hosted authentication system.
3. Connect one durable data layer; migrate existing posts, projects, and Journey records without losing their slugs or public URLs. Treat draft/private content as private at the database and rendering boundaries. Keep public pages online during migration.
4. Add reusable management forms, confirmed deletion, search/filter/sort/pagination, and real overview metrics. Preserve Journey milestone and achievement validation; add media storage only with authenticated uploads and public/private access rules.
5. Verify authenticated/unauthenticated access, lifecycle operations, publishing visibility, data persistence, public routes, responsive layouts, tests and production build.

The connected Supabase account currently contains a project called Aevora, which has not been established as belonging to this portfolio. Database selection and any changes to a live project remain pending the user's choice. No changes have been made to that project.

## Work prepared while database selection is pending

The reusable admin shell, overview, searchable/filterable/sortable/paginated content table, post and project editors, track editor, challenge editor, migration snapshot and server-side post/project validators are present under `src/components/admin` and `src/lib/admin`. They are deliberately not mounted as a live CMS yet: authentication, persistence, route handlers, media storage, content migration and public rendering integration are still required. The existing local Journey editor remains unchanged. The existing post and project source files remain authoritative until migration is completed.

Latest checks: TypeScript and targeted ESLint pass; all 36 existing and new tests pass. No production database, hosting environment, auth setting or registration setting has been changed.

## Follow-up work

A provider-neutral transactional content service now validates and protects post, project, activity, track, challenge and badge-rule operations. Every service call requires a server-side admin verifier, duplicate IDs and unsafe renames are rejected, deletions refuse records with links, and awards are derived from public records. The service defines a transaction contract but has no production repository or session verifier connected yet.

Public project and blog readers now use shared server-side access boundaries while continuing to read the existing local source. CMS-written article content has an inert Markdown rendering path; the existing trusted file MDX rendering remains intact. A public projection removes private/draft records, private relationships and unapproved metadata. Content invalidation targets are defined for the future persistence adapter. Dashboard components now include real-data metrics, a monthly activity chart, quick actions, and editable achievement rules; these components remain unmounted pending authentication and storage integration.

Follow-up verification: production build succeeds; TypeScript and ESLint pass (the two pre-existing image warnings remain); all 58 tests pass. Production checks returned 200 for home, project list/detail, blog list/detail, Journey and sitemap. A mobile browser check of the blog detail showed the expected article heading and no horizontal overflow.

## Media library preparation

The connected Cloudinary account owns the `Aman-Portfolio` folder used by existing project image URLs. `src/lib/admin/media-service.ts` provides an unmounted, server-only Cloudinary adapter that requires the same injected admin verifier as content operations, scopes listing and uploads to that folder, enforces an 4 MB image limit, checks JPEG/PNG/WebP/GIF/AVIF signatures, rejects untrusted URLs, and does not expose API credentials to the browser. `src/components/admin/media-library.tsx` implements asset search, cursor pagination, validated upload feedback, URL copying, viewing and optional selection.

The adapter expects `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the server. No credentials are stored in the repository, no Cloudinary files have been created or deleted, and no media route has been mounted until the real admin authorization is available. Uploaded images are publicly accessible; private attachments and authenticated deletion are not implemented yet. A route that receives uploads must enforce a request-size limit before parsing multipart bodies.

Cloudinary's official [Admin API reference](https://cloudinary.com/documentation/admin_api) describes server-side Basic authentication and its [upload authentication guide](https://cloudinary.com/documentation/authentication_signatures) documents authenticated server-side uploads. The integration is isolated to the existing account and portfolio folder; actual credential configuration and live upload verification remain outstanding.

Current checks: TypeScript and targeted ESLint pass; all 64 tests pass, including mocked provider authorization, image validation, media pagination, and upload failure handling.

## Request and media integration preparation

The connected Cloudinary account was confirmed read-only to own the `Aman-Portfolio` folder used by the site's existing images. A server-only media provider and reusable media-library UI are prepared; they operate only on that folder and require an injected admin verifier. Uploads are public images, limited to 4 MB to stay within hosted serverless request limits; file signatures and returned media URLs are validated. Private attachments, media deletion, live credentials and live upload verification remain outstanding. No Cloudinary assets were changed.

Provider-neutral HTTP handler factories and a browser request client now cover authenticated content CRUD, admin-only content reads, media listing/uploads, same-origin writes, bounded request bodies, consistent errors, no-store caching and public route invalidation. They are not mounted at public routes until a real database repository and verified admin session are available. Request and provider tests use local test doubles only and do not create production records.

Current checks: TypeScript, targeted ESLint and all 76 tests pass. The repository still needs a database selection, durable persistence, authenticated route bindings, initial data migration, hosted settings, and a live end-to-end verification before the CMS can be considered complete.

## Transaction and request handling preparation

The content adapter now has a provider-neutral versioned repository contract with explicit admin-authorized initialization and compare-and-swap retries. It rejects duplicate seed identifiers and prevents concurrent edits from silently discarding one another. A future database adapter must supply real atomic insert and compare-and-swap operations; the in-memory store in tests is not a production data layer.

Prepared content and media HTTP handler factories enforce admin authorization before reading or writing data, bounded request bodies, same-origin mutations and no-store responses. They map validation and conflict errors without exposing database failures. They are not mounted until a production authentication and storage implementation exists. Cloudinary image uploads are capped at 4 MB; public images only. Blog sample records have an explicit sample flag and remain hidden until the owner clears it.

Latest checks: TypeScript and targeted ESLint pass; 81 tests pass, including concurrent updates, idempotent initialization, unauthorized requests, body limits and media uploads using test doubles. A previously completed production build and public-route checks cover the public reader changes; production authentication, database persistence, hosted media credentials and end-to-end admin flows remain unverified and incomplete.

## Authentication preparation

Provider-neutral sign-in and sign-out handlers are prepared but not mounted. They require a verified identity provider, an immutable admin subject allowlist, and a durable shared login rate limiter. They enforce same-origin requests, bounded sign-in bodies, no-store responses, and protected session cookies. The provider must revoke sessions and verify identities; the test doubles do not provide production authentication. The selected database and identity provider, hosted configuration, migration, route wiring, and live end-to-end verification remain outstanding.

Latest checks: TypeScript and targeted ESLint pass; all 110 tests pass across 32 suites. No production database or authentication settings were changed.
