# Learning Journey: architecture and publishing

## Repository audit

The portfolio uses Next.js 15 App Router, React 19, strict TypeScript and Tailwind 4. The shared layout supplies desktop navigation, a mobile dock, theme support and footer. Geist/Geist Mono/Instrument Serif, semantic color variables, the narrow page shell, section dividers and restrained cards remain the design source of truth. No admin, authentication, CMS or upload service existed. Redis supports auxiliary metrics/cache and is not the content database.

Blog articles remain in `src/content/posts/*.mdx`, read through gray-matter and rendered by the existing MDX pipeline. Projects remain in `src/constants/projects.ts` and `lib/projects.ts`; Journey relationships reference their derived slugs. No database or production dependency was added. Jest's missing jsdom environment was added as a development dependency to run the existing component tests.

## Reused and new components

Reused: PageHeader, Card/CardContent, Button, Skeleton, ShareMenu, CodeBlock, existing typography utilities and design tokens, Lucide icons, desktop navbar, mobile dock and command menu. No installed Badge/Input/Tabs primitives exist, so semantic native controls and the existing stack-chip pattern cover those roles.

New: ActivityCard, LearningTrackCard, LearningMilestones, TrackStatus, ActivityMarkdown, JourneySection, JourneyBreadcrumbs, AchievementGrid, ActivityEditor, JourneyEditor and milestone controls. Server components render public content; client components are limited to the editor, error recovery and existing interactive primitives.

## Content model and relationships

`src/content/journey/journey.json` stores activities, tracks, challenges, configurable badge rules and historical awards. Runtime validation runs on reads and writes; TypeScript types live in `src/lib/journey/types.ts`. Activities carry publication/visibility/sample flags, Markdown, timestamps, completion state, track/project relationships, technologies, tags, references, attachments, URLs and SEO fields. Attachments are external HTTP(S) links; there is no upload backend.

Track progress is derived from completed milestones. Completed milestones must link a real published activity. Tracks can be planned, active, paused, on-break or completed. Active uses a green pulsing dot, paused red and on-break orange, with visible text and reduced-motion support. Multiple active tracks are supported.

Public activity reads exclude drafts, private entries, samples and future publication dates. They also remove private track links. The existing blog is projected into Journey as article activities without copying post content. Optional article relationship records link an existing blog slug; its original title/body/date remain authoritative. Track and project pages derive reverse relationships from the same slugs. Blog frontmatter may supply `trackSlugs`, `projectSlugs`, `technologies` and `tags` arrays, or the Journey editor can add an article link.

## Routes

- `/journey`: overview, active focus, learning tracks, timeline filters, optional challenges.
- `/journey/[slug]`: track progress, milestones, activities and existing projects.
- `/journey/activity/[slug]`: public activity detail, safe Markdown, references and sharing. Linked articles redirect to their original blog URL.
- `/achievements`: earned and locked badges with requirements and progress.
- `/admin/journey`: local publishing UI; private content is loaded only through authenticated API calls.
- `/api/admin/journey`: protected development-only GET/PUT file persistence.

Research uses the unified activity route, avoiding a duplicate research/blog system. Existing routes remain intact.

## Local publishing

1. In `.env.local`, set `JOURNEY_ADMIN_TOKEN` to a random secret of at least 32 characters. Never prefix it with NEXT_PUBLIC or commit it.
2. Run `npm run dev` and open `/admin/journey`.
3. Enter that token in the password field and load the editor. It is held only in component memory.
4. Create an update, select its track/project, write Markdown and preview. New activities default to private drafts. For sample drafts, replace the outline with actual findings and clear Sample before publishing.
5. Choose published + public, then save. Advanced fields expose references, attachments, GitHub/demo URLs, evidence and SEO. Short updates need only the main fields.
6. Track milestone controls select supporting activities and completion dates. Track status has its own selector. Track/challenge/badge-rule definitions are also editable as validated JSON arrays; apply JSON changes before saving.
7. Review the changed JSON file in git, commit it and deploy through the site's existing workflow. Saving locally does not deploy the website.

Long-form articles continue to be written in `src/content/posts/*.mdx`; the editor selects an existing published article rather than creating a second Markdown article system. Blog visibility now respects `status: draft`, `published: false`, `visibility: private`, `sample: true` and future dates in both listings and direct routes.

The API is disabled outside development or with a missing/short token. It uses constant-time token comparison, same-origin checks, a 1 MB streaming request limit and no-store responses. All writes pass server validation. The file writer serializes local mutations and uses atomic replacement. Submitted award arrays cannot grant badges: the server preserves prior award records and calculates new awards.

## Challenges and achievements

Challenges are optional; completion requires an actual date plus a published activity or an HTTP(S) evidence link. There is no streak requirement. The eight initial badge rules cover five learning posts, five research posts, five completed builds, the first existing blog article, seven distinct publication days, a verified open-source milestone, a shipped existing project and a completed track. Tags do not grant awards. Awards have stable badge IDs and earned dates, with duplicate prevention. Qualification is calculated from public content; newly earned records persist on an editor save. Existing blog articles may legitimately qualify for First Article; the sample OCR drafts do not earn anything.

Open-source verification is the owner's attestation through a dedicated milestone kind and evidence URL; the site does not query GitHub to verify merged status. Historical awards are retained when content is later edited. Review evidence before recording completed milestones.

## SEO and accessibility

Canonical, Open Graph and Twitter metadata accompany public routes. Technical activity and blog detail pages include escaped TechArticle JSON-LD. Breadcrumbs and bidirectional internal links aid discovery. Empty tracks and short activity pages are noindex; draft/private/sample activities return 404. Sitemap entries include only substantial public activities and populated public tracks. Admin routes are noindex and disallowed in robots.

Markdown remains inert through react-markdown/GFM; it does not execute editor-supplied MDX. It reuses article typography and CodeBlock with scroll-contained tables/code. Controls have visible labels, keyboard focus, textual status indicators, native progress and loading/empty/error states.

## Verification and limits

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Lint retains two pre-existing img optimization warnings in mdx-components and work-experience. The existing React component suite and Journey publication/evidence/badge/admin authorization suites run through Jest.

For an isolated build while a dev server is open, set `NEXT_OUTPUT_DIR=.next-verification` before `npm run build`. Output directories `.next-*` are ignored. The existing next/font setup needs Google Fonts access at build time.

The editor intentionally operates locally: there is no hosted admin login, cloud media uploader or live serverless filesystem persistence. Changes require redeployment. Track cover images are omitted as unnecessary for the existing visual design. Challenge/rule creation uses validated JSON management; activity publishing and milestone/status changes have dedicated controls.
## Verification results (2026-10-30)

- Production build: passed; all 25 static generation tasks completed, existing blog/project pages included.
- TypeScript: `npm run typecheck` passed.
- ESLint: passed with zero errors and the two pre-existing image optimization warnings noted above.
- Jest: all 28 tests across four suites passed, including existing TechStack tests, publication/evidence/badge rules, local admin authorization and file persistence/blog integration.
- Route checks: existing home/about/projects/project detail/blog/article/contact and new Journey/track/achievements/admin pages render. The production admin API returns 403. Private sample activity renders the not-found UI with noindex and never exposes its body; Next.js streamed not-found responses may carry HTTP 200.
- Browser: production dark-theme captures at 1440px and 390px; no horizontal overflow at either viewport. Activity filters and the empty Learning category were verified. Screenshots are local ignored files `docs/journey-desktop.png` and `docs/journey-mobile.png`.
- All six sample updates remain private drafts. OCR milestones remain 0/8. The existing published blog articles are included honestly in the public timeline and may qualify for First Article.
