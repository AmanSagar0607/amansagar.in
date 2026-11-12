# Dynamic Apps Catalog and Admin Content

Date: 2026-11-12

## What changed

- Added an Apps content section in admin with app listings, publication status, visibility, feature promotion, and sort order.
- App records include name, slug, pitch, directory description, category, platform, technology tags, icon, cover image, screenshots, launch URL, source URL, and SEO fields.
- Added app-owned content pages, including nested paths such as `/apps/example/docs` and `/apps/example/legal/privacy`. Each page has rich content, its own draft/public visibility, SEO fields, and a social preview image.
- Added public `/apps`, app detail, and nested content routes. Featured apps appear first in the directory; other listings follow the configured order.
- Added public metadata, canonical URLs, SoftwareApplication structured data, sitemap routes, and cache revalidation for app edits.
- App and page revisions use the existing versioned CMS snapshot. Public readers receive only published, public records; revision history remains admin-only.

## Intended use

Use Admin → Apps to create a listing for an app, even if its interactive product is hosted elsewhere. Add the launch URL to point visitors to the deployed application. The CMS manages the listing and related editorial pages; it does not generate or host the product's interactive application code.

To put a listing ahead of other apps, publish it, set visibility to public, turn on “Feature this app at the top of /apps,” and adjust Directory order as needed. To add documentation or policy content, use “Add page” on that app and publish the child page independently.

Use Admin → Settings → Navigation to add `/apps` to the desired desktop, tablet, and mobile navigation placements. Existing saved navigation preferences remain intact.

## Routes

- `/apps` — public app directory
- `/apps/[app-slug]` — app listing and landing page
- `/apps/[app-slug]/[...page-slug]` — app-owned content, including nested page paths

## Operational notes

- App identifiers are stable after creation so existing URLs and child pages do not silently break.
- Hiding `/apps` in page visibility hides the directory and all app routes.
- Deleting an app also deletes its embedded child pages; the admin confirmation names this behavior.
- Existing snapshots without an `apps` field remain valid and are normalized to an empty list.
