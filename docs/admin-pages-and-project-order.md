# Admin pages and project ordering

## Projects

- The existing project editor pin control now pins a published, public project above unpinned projects on both the homepage and `/projects`.
- The Projects admin list includes a Website project order panel. Up/down controls reorder within pinned or unpinned groups; Save order persists the full sequence atomically.
- When an older CMS snapshot has no explicit ordering, projects are initially ordered by project date. New projects begin first in their pin group.
- Ordering and page records live in the existing versioned CMS JSON snapshot. No database table migration is required.

## Pages

- Admin → Pages lists custom pages and links to the existing editors for built-in pages.
- Custom pages support a title, one-segment URL slug, description, rich text and images, draft/published status, public/private visibility, navigation inclusion, SEO title/description, and social image.
- Published public pages are served at `/{slug}`, can appear in the More navigation, and are included in the sitemap.
- Built-in route slugs such as `about`, `projects`, `blog`, `contact`, and `journey` are reserved so a custom page cannot shadow the site’s existing routes.
- Rich text is rendered with the sanitized Markdown renderer used by Journey content.
- Page edits use the existing admin authorization, version history, content validation, and cache revalidation flow.
