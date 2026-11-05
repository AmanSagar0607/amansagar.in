# Admin dashboard redesign (November 2026)

## What changed

- Replaced the seven equal-weight count cards with four primary signals: published posts, projects, journey activities, and drafts. Learning progress remains available as a quieter secondary section.
- Added an interactive publication chart comparing posts with public journey entries. Admins can choose a custom date range with the shadcn Calendar and use 3, 6, or 12-month quick ranges, select a month for its counts, and open an accessible monthly data table; drafts, private records, samples, and future posts are excluded. Because records are grouped monthly, custom date ranges include each month they touch.
- Added a draft work queue with direct edit links and a next scheduled post when one exists.
- Added a responsive recent-work table with content type, status, updated date, and direct edit actions.
- Kept all metrics derived from the existing admin content snapshot. The dashboard does not imply visitor analytics, revenue, or other data the CMS does not collect.

## Design rationale

The page prioritizes a small set of editorial signals and their next actions, then moves less urgent learning counts lower in the hierarchy. This follows a restrained dashboard direction: use charts only for trends, provide context for the numbers, and keep the work list directly actionable. The visual reference is a modular dark admin dashboard composition rather than a wall of matching metric cards.

References:

- [Dribbble: Clean Dark Dashboard UI / Admin Dashboard](https://dribbble.com/shots/27079649-Clean-Dark-Dashboard-UI-Admin-Dashboard)
- [Tableau Research: Understanding dashboard design at scale](https://www.tableau.com/blog/tableau-research-understanding-dashboard-design-at-scale)
- [Dashboard and digital product trends for 2026](https://www.thisisuntapped.com/post/dashboard-and-digital-product-trends-for-2026)

## Implementation

- Dashboard presentation: `src/components/admin/dashboard-overview.tsx`
- Interactive publication chart: `src/components/admin/dashboard-publishing-chart.tsx`
- Snapshot-derived metrics: `src/lib/admin/dashboard.ts`

